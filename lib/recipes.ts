// Smart recipe matching: rank recipes by how well the current fridge covers
// them, weighted by the user's taste profile. The output drives the Fridge
// Inspector's suggestions and feeds the price/geo engine for missing items.

export interface RecipeRow {
  id: string;
  title: string;
  summary: string | null;
  tags: string[];
  prep_minutes: number | null;
  kcal_per_serving: number | null;
  protein_per_serving_g: number | null;
  ingredientIds: string[];
}

export interface RecipeSuggestion {
  id: string;
  title: string;
  summary: string | null;
  tags: string[];
  prep_minutes: number | null;
  kcal_per_serving: number | null;
  protein_per_serving_g: number | null;
  total: number;
  have: number;
  missing: number;
  coverage: number; // 0..1
  tasteScore: number; // -1..1
  rank: number; // composite, higher is better
}

/**
 * Rank recipes. Coverage (how much is already in the fridge) dominates; the
 * user's taste affinity for the recipe's ingredients breaks ties and nudges
 * preferred cuisines up. Pure + deterministic.
 */
export function rankSuggestions(
  recipes: RecipeRow[],
  fridgeIngredientIds: Set<string>,
  tasteByIngredient: Map<string, number>,
): RecipeSuggestion[] {
  return recipes
    .map((r) => {
      const total = r.ingredientIds.length || 1;
      const have = r.ingredientIds.filter((id) => fridgeIngredientIds.has(id)).length;
      const coverage = have / total;

      const tasteScores = r.ingredientIds
        .map((id) => tasteByIngredient.get(id))
        .filter((s): s is number => typeof s === "number");
      const tasteScore =
        tasteScores.length > 0
          ? tasteScores.reduce((a, b) => a + b, 0) / tasteScores.length
          : 0;

      // Normalize taste to 0..1 and blend.
      const rank = coverage * 0.7 + ((tasteScore + 1) / 2) * 0.3;

      return {
        id: r.id,
        title: r.title,
        summary: r.summary,
        tags: r.tags,
        prep_minutes: r.prep_minutes,
        kcal_per_serving: r.kcal_per_serving,
        protein_per_serving_g: r.protein_per_serving_g,
        total,
        have,
        missing: total - have,
        coverage,
        tasteScore,
        rank: Number(rank.toFixed(4)),
      };
    })
    .sort((a, b) => b.rank - a.rank);
}
