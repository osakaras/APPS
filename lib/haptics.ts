// Lightweight haptic helper. Uses the Web Vibration API where available
// (Android / Chrome). On platforms without it (notably iOS Safari) the call
// is a silent no-op, and the on-screen pulse animation carries the feedback.

export const HAPTIC = {
  /** A single firm confirmation pulse. */
  pulse: 28,
  /** A crisp two-beat "locked-in" success cadence. */
  success: [14, 36, 22] as number[],
  /** A subtle tick for incremental steps. */
  tick: 8,
} as const;

export function haptic(pattern: number | number[]): void {
  if (typeof navigator === "undefined") return;
  if (!("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw if called outside a user gesture — ignore.
  }
}
