import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { resolveIngredientId } from "@/lib/ingredients";
import type { MeasureUnit } from "@/lib/types";

const UNITS: MeasureUnit[] = ["g", "kg", "ml", "l", "pcs", "tbsp", "tsp", "cup", "pinch"];
const coerceUnit = (u: unknown): MeasureUnit =>
  typeof u === "string" && (UNITS as string[]).includes(u) ? (u as MeasureUnit) : "pcs";

/**
 * POST /api/fridge/items — manually add an inventory item. Resolves the label
 * to a canonical ingredient (so suggestions + price matching see it) and marks
 * the row source = "manual". The insert bumps Bio-Link sync.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    label?: string;
    quantity?: number | null;
    unit?: string;
  };

  const label = (body.label ?? "").trim();
  if (!label) return NextResponse.json({ error: "label required" }, { status: 400 });
  const unit = coerceUnit(body.unit);
  const quantity = body.quantity != null ? Number(body.quantity) : null;

  // Preview: echo a synthetic item so the optimistic UI resolves cleanly.
  if (!hasSupabaseEnv()) {
    return NextResponse.json({
      item: { id: `local-${Date.now()}`, label, quantity, unit },
      persisted: false,
    });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const catalog = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;
  const ingredientId = await resolveIngredientId(catalog, label);

  const { data, error } = await supabase
    .from("fridge_items")
    .insert({
      user_id: user.id,
      ingredient_id: ingredientId,
      label: label.toLowerCase(),
      quantity,
      unit,
      source: "manual",
    })
    .select("id, label, quantity, unit")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 });
  }
  return NextResponse.json({ item: data, persisted: true });
}
