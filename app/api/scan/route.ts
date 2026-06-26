import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { analyzePlate, type PlateAnalysis } from "@/lib/ai/vision";
import { mockPlateAnalysis } from "@/lib/ai/mockPlate";
import { resolveIngredientId } from "@/lib/ingredients";
import type { MeasureUnit } from "@/lib/types";

const UNITS: MeasureUnit[] = ["g", "kg", "ml", "l", "pcs", "tbsp", "tsp", "cup", "pinch"];
const coerceUnit = (u: string | null | undefined): MeasureUnit | null =>
  u && (UNITS as string[]).includes(u) ? (u as MeasureUnit) : null;

/** Strip a data-URL prefix if present, returning raw base64. */
function rawBase64(image: string): string {
  const comma = image.indexOf(",");
  return image.startsWith("data:") && comma >= 0 ? image.slice(comma + 1) : image;
}

/**
 * POST /api/scan — the AI Plate Scanner core.
 *   1. Run vision analysis (Claude, or a labeled mock without a key).
 *   2. Persist the meal + detected items, resolving each to a canonical
 *      ingredient so the taste matrix and price engine can reference it.
 *   3. The meals insert fires the Bio-Link trigger → System Sync returns to 100%.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    image?: string;
    mediaType?: string;
  };

  // 1. Vision analysis.
  let analysis: PlateAnalysis;
  let aiModel = "mock";
  if (process.env.ANTHROPIC_API_KEY && body.image) {
    try {
      analysis = await analyzePlate(rawBase64(body.image), body.mediaType ?? "image/jpeg");
      aiModel = process.env.ANTHROPIC_VISION_MODEL ?? "claude-opus-4-8";
    } catch {
      analysis = mockPlateAnalysis();
    }
  } else {
    analysis = mockPlateAnalysis();
  }

  // Preview / unauthenticated: return the analysis without persisting.
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ mealId: null, analysis, persisted: false });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ mealId: null, analysis, persisted: false });
  }

  // 2. Persist the meal.
  const { data: meal, error: mealErr } = await supabase
    .from("meals")
    .insert({
      user_id: user.id,
      title: analysis.title,
      kcal: Math.round(analysis.kcal),
      protein_g: analysis.protein_g,
      carbs_g: analysis.carbs_g,
      fat_g: analysis.fat_g,
      health_rating: analysis.health_rating,
      health_notes: analysis.health_notes,
      ai_model: aiModel,
      ai_confidence: analysis.confidence,
    })
    .select("id")
    .single();
  if (mealErr || !meal) {
    return NextResponse.json({ error: mealErr?.message ?? "insert failed" }, { status: 500 });
  }

  // 3. Resolve + persist detected items. Catalog writes need the service role;
  //    without it we read-only resolve and store labels with null ids.
  const catalog = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;
  const rows = await Promise.all(
    analysis.items.map(async (item) => ({
      meal_id: meal.id,
      ingredient_id: await resolveIngredientId(catalog, item.label),
      label: item.label,
      quantity: item.quantity,
      unit: coerceUnit(item.unit),
      confidence: item.confidence,
    })),
  );
  if (rows.length) await supabase.from("meal_items").insert(rows);

  return NextResponse.json({ mealId: meal.id, analysis, persisted: true });
}
