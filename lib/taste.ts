import type { SupabaseClient } from "@supabase/supabase-js";
import type { Sentiment } from "@/lib/types";

/**
 * Map a palate response to a signed reinforcement signal in [-1, 1]. This is
 * the delta folded into each implicated ingredient's rolling taste score.
 */
export function sentimentDelta(sentiment: Sentiment): number {
  switch (sentiment) {
    case "loved": return 1;
    case "liked": return 0.5;
    case "neutral": return 0;
    case "disliked": return -0.5;
    case "hated": return -1;
  }
}

const clamp = (n: number) => Math.max(-1, Math.min(1, n));

/**
 * Fold a meal's palate response into the Taste & Health Matrix. Each ingredient
 * the meal contained has its rolling score updated as a confidence-weighted
 * running mean:
 *
 *   score' = clamp( (score · samples + delta) / (samples + 1) )
 *
 * Read-then-write per ingredient because taste_preferences.tag is nullable and
 * NULLs don't participate in the unique constraint, so a blind upsert can't
 * dedupe reliably.
 */
export async function applyTasteFromMeal(
  supabase: SupabaseClient,
  userId: string,
  ingredientIds: string[],
  sentiment: Sentiment,
): Promise<void> {
  const delta = sentimentDelta(sentiment);
  const unique = Array.from(new Set(ingredientIds.filter(Boolean)));

  for (const ingredientId of unique) {
    const { data: existing } = await supabase
      .from("taste_preferences")
      .select("id, score, samples")
      .eq("user_id", userId)
      .eq("ingredient_id", ingredientId)
      .is("tag", null)
      .maybeSingle();

    if (existing) {
      const samples = existing.samples + 1;
      const score = clamp((Number(existing.score) * existing.samples + delta) / samples);
      await supabase
        .from("taste_preferences")
        .update({ score, samples })
        .eq("id", existing.id);
    } else {
      await supabase.from("taste_preferences").insert({
        user_id: userId,
        ingredient_id: ingredientId,
        score: clamp(delta),
        samples: 1,
      });
    }
  }
}
