import type { BmiTierKey } from "@/lib/i18n/dictionary";

// Clinical BMI cut-points (WHO). We keep the medical boundaries for accuracy
// but surface them through supportive, reframed tier names in the UI.
export const BMI_BOUNDS = { under: 18.5, normal: 25, over: 30 } as const;

// The gauge maps BMI onto a fixed visual scale so the thumb position is stable.
export const GAUGE_MIN = 12;
export const GAUGE_MAX = 40;

export interface BmiResult {
  bmi: number; // rounded to 1 decimal
  tier: BmiTierKey;
  /** 0..1 position of the value along the gauge (clamped). */
  position: number;
  /** Accent color for the active tier. */
  color: string;
}

// Desaturated instrument palette — reads like telemetry, never childish.
const TIER_COLOR: Record<BmiTierKey, string> = {
  lean_light: "#6E8CA8", // steel blue
  optimal_balance: "#4E9E82", // muted jade
  solid_built: "#B08A52", // bronze
  focus_zone: "#8A77A8", // slate violet (never alarmist red)
};

export function tierForBmi(bmi: number): BmiTierKey {
  if (bmi < BMI_BOUNDS.under) return "lean_light";
  if (bmi < BMI_BOUNDS.normal) return "optimal_balance";
  if (bmi < BMI_BOUNDS.over) return "solid_built";
  return "focus_zone";
}

/**
 * Real-time BMI from metric inputs. Returns null until both values are valid,
 * so the UI can show its empty/prompt state cleanly.
 */
export function computeBmi(weightKg: number, heightCm: number): BmiResult | null {
  if (!weightKg || !heightCm || heightCm < 50 || weightKg < 10) return null;

  const meters = heightCm / 100;
  const raw = weightKg / (meters * meters);
  const bmi = Math.round(raw * 10) / 10;
  const tier = tierForBmi(bmi);

  const clamped = Math.max(GAUGE_MIN, Math.min(GAUGE_MAX, bmi));
  const position = (clamped - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN);

  return { bmi, tier, position, color: TIER_COLOR[tier] };
}

/** Zone boundaries as 0..1 gauge fractions, for drawing the colored track. */
export function gaugeStops() {
  const f = (v: number) => (v - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN);
  return {
    lean_light: f(BMI_BOUNDS.under),
    optimal_balance: f(BMI_BOUNDS.normal),
    solid_built: f(BMI_BOUNDS.over),
  };
}

export { TIER_COLOR };
