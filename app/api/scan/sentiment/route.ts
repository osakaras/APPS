import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { applyTasteFromMeal } from "@/lib/taste";
import type { Sentiment } from "@/lib/types";

const SENTIMENTS: Sentiment[] = ["loved", "liked", "neutral", "disliked", "hated"];

/**
 * POST /api/scan/sentiment — record the palate response for a logged meal and
 * fold it into the Taste & Health Matrix. Body: { mealId, sentiment }.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    mealId?: string | null;
    sentiment?: Sentiment;
  };

  if (!body.sentiment || !SENTIMENTS.includes(body.sentiment)) {
    return NextResponse.json({ error: "invalid sentiment" }, { status: 400 });
  }
  // Preview meals aren't persisted — accept the response as a no-op.
  if (!hasSupabaseEnv() || !body.mealId) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Stamp the meal (RLS scopes the update to the owner).
  const { error: updErr } = await supabase
    .from("meals")
    .update({ sentiment: body.sentiment })
    .eq("id", body.mealId)
    .eq("user_id", user.id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  // Pull the meal's resolved ingredients and reinforce the taste graph.
  const { data: items } = await supabase
    .from("meal_items")
    .select("ingredient_id")
    .eq("meal_id", body.mealId);

  const ingredientIds = (items ?? [])
    .map((i) => i.ingredient_id)
    .filter((id): id is string => Boolean(id));

  if (ingredientIds.length) {
    await applyTasteFromMeal(supabase, user.id, ingredientIds, body.sentiment);
  }

  return NextResponse.json({ ok: true, persisted: true });
}
