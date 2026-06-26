import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  computeMissingIngredients,
  rankStores,
  type BasketPriceRow,
} from "@/lib/engine/priceMatch";
import type { LatLng, RecipeIngredient, Store } from "@/lib/types";

/**
 * POST /api/match
 * Body: { recipeId: string, origin: { lat, lng }, radiusM?: number }
 *
 * The critical engine, end to end:
 *   1. Load the recipe's required ingredients.
 *   2. Subtract what's already in the user's fridge.
 *   3. Find nearby stores (PostGIS `nearby_stores` RPC).
 *   4. Pull the cheapest fresh in-stock price per store (`basket_prices` RPC).
 *   5. Rank by cost + distance, persist, and return the winner + breakdown.
 */
export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    recipeId?: string;
    origin?: LatLng;
    radiusM?: number;
  };
  if (!body.recipeId || !body.origin) {
    return NextResponse.json(
      { error: "recipeId and origin are required" },
      { status: 400 },
    );
  }
  const { recipeId, origin, radiusM = 8000 } = body;

  // 1. Required ingredients (joined to canonical names).
  const { data: required, error: reqErr } = await supabase
    .from("recipe_ingredients")
    .select("ingredient_id, quantity, unit, is_optional, ingredients(canonical_name)")
    .eq("recipe_id", recipeId);
  if (reqErr) return NextResponse.json({ error: reqErr.message }, { status: 500 });

  const requiredIngredients: RecipeIngredient[] = (required ?? []).map((r: any) => ({
    ingredient_id: r.ingredient_id,
    canonical_name: r.ingredients?.canonical_name ?? "ingredient",
    quantity: r.quantity,
    unit: r.unit,
    is_optional: r.is_optional,
  }));

  // 2. Current fridge inventory (RLS scopes this to the signed-in user).
  const { data: fridge } = await supabase
    .from("fridge_items")
    .select("id, ingredient_id, label, quantity, unit, source, expires_on");

  const missing = computeMissingIngredients(requiredIngredients, fridge ?? []);
  if (missing.length === 0) {
    return NextResponse.json({ winner: null, ranked: [], note: "Everything is in your fridge." });
  }

  // 3. Nearby stores via PostGIS.
  const { data: stores, error: storeErr } = await supabase.rpc("nearby_stores", {
    lat: origin.lat,
    lng: origin.lng,
    radius_m: radiusM,
    max_results: 20,
  });
  if (storeErr) return NextResponse.json({ error: storeErr.message }, { status: 500 });
  if (!stores?.length) {
    return NextResponse.json({ winner: null, ranked: [], note: "No stores nearby." });
  }

  const storeList: (Store & { distance_m: number })[] = stores.map((s: any) => ({
    id: s.store_id,
    chain: s.chain,
    name: s.name,
    address: null,
    distance_m: s.distance_m,
  }));

  // 4. Cheapest fresh in-stock price per (store, ingredient).
  const { data: prices, error: priceErr } = await supabase.rpc("basket_prices", {
    ingredient_ids: missing.map((m) => m.ingredient_id),
    store_ids: storeList.map((s) => s.id),
  });
  if (priceErr) return NextResponse.json({ error: priceErr.message }, { status: 500 });

  // 5. Rank, pick winner, persist for instant revisit.
  const ranked = rankStores(missing, storeList, (prices ?? []) as BasketPriceRow[]);
  const winner = ranked[0] ?? null;

  await supabase.from("grocery_matches").insert({
    user_id: user.id,
    recipe_id: recipeId,
    origin: `POINT(${origin.lng} ${origin.lat})`,
    winner_store_id: winner?.store.id ?? null,
    total_cost: winner?.total_cost ?? null,
    distance_m: winner?.distance_m ?? null,
    breakdown: ranked,
  });

  return NextResponse.json({ winner, ranked, currency: "EUR" });
}
