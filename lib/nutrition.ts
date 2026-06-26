import type { HealthRating } from "@/lib/types";
import type { Macros } from "@/lib/types";

export interface DailyTargets {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface ProfileMetrics {
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
}

/**
 * Derive daily energy + macro targets from the persisted profile using the
 * Mifflin–St Jeor equation. Sex isn't captured in onboarding, so we use a
 * sex-neutral constant (the midpoint of the +5 / −161 offsets) and a moderate
 * 1.45 activity factor. Protein/fat are anchored to bodyweight (sports-nutrition
 * standard) and carbohydrate fills the remaining energy.
 */
export function computeTargets(p: ProfileMetrics): DailyTargets | null {
  const kg = Number(p.weight_kg);
  const cm = Number(p.height_cm);
  const age = Number(p.age);
  if (!kg || !cm || !age) return null;

  const bmr = 10 * kg + 6.25 * cm - 5 * age - 78; // sex-neutral
  const kcal = Math.round((bmr * 1.45) / 10) * 10;

  const protein_g = Math.round(1.8 * kg);
  const fat_g = Math.round(0.9 * kg);
  const carbs_g = Math.max(
    0,
    Math.round((kcal - protein_g * 4 - fat_g * 9) / 4),
  );

  return { kcal, protein_g, carbs_g, fat_g };
}

export interface MealRow extends Partial<Macros> {
  health_rating?: HealthRating | null;
}

/** Sum macros across the day's logged meals. */
export function sumIntake(meals: MealRow[]): Macros {
  return meals.reduce<Macros>(
    (acc, m) => ({
      kcal: acc.kcal + (Number(m.kcal) || 0),
      protein_g: acc.protein_g + (Number(m.protein_g) || 0),
      carbs_g: acc.carbs_g + (Number(m.carbs_g) || 0),
      fat_g: acc.fat_g + (Number(m.fat_g) || 0),
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
  );
}

const RATING_SCORE: Record<HealthRating, number> = {
  poor: 42,
  fair: 58,
  good: 72,
  great: 86,
  excellent: 96,
};

/** Composite 0–100 health index from the day's meal ratings, or null if none. */
export function healthIndex(meals: MealRow[]): number | null {
  const scored = meals
    .map((m) => (m.health_rating ? RATING_SCORE[m.health_rating] : null))
    .filter((n): n is number => n !== null);
  if (scored.length === 0) return null;
  return Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
}

/** Start of the current day as an ISO timestamp, for the "today" meal query. */
export function startOfTodayISO(now = new Date()): string {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
