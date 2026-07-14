import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { rankSuggestions, type RecipeRow } from "@/lib/recipes";

/**
 * GET /api/fridge/suggest — rank recipes by fridge coverage + taste affinity.
 */
export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ suggestions: [] });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Recipes + their ingredient ids.
  const { data: recipes } = await supabase
    .from("recipes")
    .select(
      "id, title, summary, tags, prep_minutes, kcal_per_serving, protein_per_serving_g, recipe_ingredients(ingredient_id)",
    );

  const rows: RecipeRow[] = (recipes ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    tags: r.tags ?? [],
    prep_minutes: r.prep_minutes,
    kcal_per_serving: r.kcal_per_serving,
    protein_per_serving_g: r.protein_per_serving_g,
    ingredientIds: (r.recipe_ingredients ?? [])
      .map((ri: any) => ri.ingredient_id)
      .filter(Boolean),
  }));

  // Current fridge inventory (RLS-scoped to the user).
  const { data: fridge } = await supabase.from("fridge_items").select("ingredient_id");
  const fridgeIds = new Set(
    (fridge ?? []).map((f) => f.ingredient_id).filter((id): id is string => Boolean(id)),
  );

  // Taste graph.
  const { data: taste } = await supabase
    .from("taste_preferences")
    .select("ingredient_id, score")
    .not("ingredient_id", "is", null);
  const tasteByIngredient = new Map<string, number>(
    (taste ?? []).map((t) => [t.ingredient_id as string, Number(t.score)]),
  );

  const suggestions = rankSuggestions(rows, fridgeIds, tasteByIngredient).slice(0, 5);
  return NextResponse.json({ suggestions });
}
