import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { resolveIngredientId } from "@/lib/ingredients";
import { applyTasteFromMeal } from "@/lib/taste";
import type { Sentiment } from "@/lib/types";

const SENTIMENTS: Sentiment[] = ["loved", "liked", "neutral", "disliked", "hated"];

/**
 * POST /api/taste/pref — manually set a taste preference for an ingredient.
 * Body: { label, sentiment }. Folds into the rolling score like a rated meal.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    label?: string;
    sentiment?: Sentiment;
  };
  const label = (body.label ?? "").trim();
  if (!label || !body.sentiment || !SENTIMENTS.includes(body.sentiment)) {
    return NextResponse.json({ error: "label and valid sentiment required" }, { status: 400 });
  }
  if (!hasSupabaseEnv()) return NextResponse.json({ ok: true, persisted: false });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const catalog = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;
  const ingredientId = await resolveIngredientId(catalog, label);
  if (!ingredientId) return NextResponse.json({ error: "could not resolve ingredient" }, { status: 422 });

  await applyTasteFromMeal(supabase, user.id, [ingredientId], body.sentiment);
  return NextResponse.json({ ok: true, ingredientId });
}

/**
 * DELETE /api/taste/pref — forget a preference. Body: { ingredientId }.
 */
export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { ingredientId?: string };
  if (!body.ingredientId) return NextResponse.json({ error: "ingredientId required" }, { status: 400 });
  if (!hasSupabaseEnv()) return NextResponse.json({ ok: true, persisted: false });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("taste_preferences")
    .delete()
    .eq("user_id", user.id)
    .eq("ingredient_id", body.ingredientId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
