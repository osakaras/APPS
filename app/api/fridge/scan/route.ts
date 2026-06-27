import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { analyzeFridge, type FridgeAnalysis } from "@/lib/ai/vision";
import { mockFridgeAnalysis } from "@/lib/ai/mockFridge";
import { resolveIngredientId } from "@/lib/ingredients";
import type { MeasureUnit } from "@/lib/types";

const UNITS: MeasureUnit[] = ["g", "kg", "ml", "l", "pcs", "tbsp", "tsp", "cup", "pinch"];
const coerceUnit = (u: string | null | undefined): MeasureUnit =>
  u && (UNITS as string[]).includes(u) ? (u as MeasureUnit) : "pcs";

function rawBase64(image: string): string {
  const comma = image.indexOf(",");
  return image.startsWith("data:") && comma >= 0 ? image.slice(comma + 1) : image;
}

/**
 * POST /api/fridge/scan — AI Fridge Inspector.
 *   1. Vision-detect the fridge contents (Claude or labeled mock).
 *   2. Resolve to canonical ingredients and upsert fridge_items.
 *   3. The fridge write fires the Bio-Link trigger → System Sync returns to 100%.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    image?: string;
    mediaType?: string;
  };

  let analysis: FridgeAnalysis;
  if (process.env.ANTHROPIC_API_KEY && body.image) {
    try {
      analysis = await analyzeFridge(rawBase64(body.image), body.mediaType ?? "image/jpeg");
    } catch {
      analysis = mockFridgeAnalysis();
    }
  } else {
    analysis = mockFridgeAnalysis();
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ items: analysis.items, persisted: false });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: analysis.items, persisted: false });

  const catalog = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;

  // Resolve + upsert each detected item. Keyed by ingredient so re-scans
  // refresh quantities rather than duplicating the inventory.
  const rows = await Promise.all(
    analysis.items.map(async (item) => ({
      user_id: user.id,
      ingredient_id: await resolveIngredientId(catalog, item.label),
      label: item.label,
      quantity: item.quantity,
      unit: coerceUnit(item.unit),
      source: "scan" as const,
    })),
  );

  // De-dupe against existing inventory by ingredient_id (manual, since some
  // rows may have a null ingredient_id which can't use ON CONFLICT cleanly).
  const withIng = rows.filter((r) => r.ingredient_id);
  const withoutIng = rows.filter((r) => !r.ingredient_id);

  if (withIng.length) {
    const ids = withIng.map((r) => r.ingredient_id as string);
    await supabase
      .from("fridge_items")
      .delete()
      .eq("user_id", user.id)
      .in("ingredient_id", ids);
  }
  if (rows.length) await supabase.from("fridge_items").insert([...withIng, ...withoutIng]);

  return NextResponse.json({ items: analysis.items, persisted: true });
}
