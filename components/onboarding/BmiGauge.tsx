"use client";

import { gaugeStops } from "@/lib/bmi";
import type { BmiResult } from "@/lib/bmi";

const stops = gaugeStops();
const TICKS = [
  { v: 12, at: 0 },
  { v: 18.5, at: stops.lean_light },
  { v: 25, at: stops.optimal_balance },
  { v: 30, at: stops.solid_built },
  { v: 40, at: 1 },
];

/**
 * A minimalist telemetry gauge: a hairline baseline, thin boundary ticks, and
 * a precise needle that glides to the live BMI position. Designed to sit on a
 * dark instrument panel — no fills, no color blocks, just a measured readout.
 */
export function BmiGauge({ result }: { result: BmiResult | null }) {
  const position = result?.position ?? 0.5;

  return (
    <div className="select-none">
      <div className="relative h-8">
        {/* Baseline */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/15" />

        {/* Boundary ticks */}
        {[stops.lean_light, stops.optimal_balance, stops.solid_built].map((s, i) => (
          <div
            key={i}
            className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-white/20"
            style={{ left: `${s * 100}%` }}
          />
        ))}

        {/* Needle */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-[800ms] ease-ios"
          style={{ left: `${position * 100}%`, opacity: result ? 1 : 0.3 }}
        >
          <div
            className="h-7 w-[2px] rounded-full"
            style={{ backgroundColor: result?.color ?? "#FFFFFF" }}
          />
        </div>
      </div>

      {/* Monospace scale */}
      <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-white/35">
        {TICKS.map((t) => (
          <span key={t.v}>{t.v}</span>
        ))}
      </div>
    </div>
  );
}
