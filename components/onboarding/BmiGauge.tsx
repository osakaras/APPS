"use client";

import { gaugeStops, GAUGE_MIN, GAUGE_MAX } from "@/lib/bmi";
import type { BmiResult } from "@/lib/bmi";

const stops = gaugeStops();

// The four supportive zones, laid out left→right on the 12–40 BMI scale.
const ZONES = [
  { from: 0, to: stops.lean_light, color: "#0A84FF" },
  { from: stops.lean_light, to: stops.optimal_balance, color: "#30D158" },
  { from: stops.optimal_balance, to: stops.solid_built, color: "#FF9F0A" },
  { from: stops.solid_built, to: 1, color: "#BF5AF2" },
];

/**
 * A smooth, continuous-curvature gauge. The colored track shows every zone;
 * the thumb glides to the live BMI position with a spring ease. When there's
 * no result yet it sits centered and muted.
 */
export function BmiGauge({ result }: { result: BmiResult | null }) {
  const position = result?.position ?? 0.5;

  return (
    <div className="select-none">
      {/* Track */}
      <div className="relative h-5 w-full overflow-hidden rounded-full">
        <div className="absolute inset-0 flex">
          {ZONES.map((z, i) => (
            <div
              key={i}
              style={{
                width: `${(z.to - z.from) * 100}%`,
                backgroundColor: z.color,
                opacity: result ? 1 : 0.35,
              }}
              className="h-full transition-opacity duration-500"
            />
          ))}
        </div>

        {/* Subtle gloss for depth */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/20" />
      </div>

      {/* Thumb */}
      <div className="relative h-0">
        <div
          className="absolute -top-7 grid h-9 w-9 -translate-x-1/2 place-items-center
                     rounded-full border-[3px] border-white bg-white shadow-card-hover
                     transition-all duration-700 ease-ios"
          style={{
            left: `${position * 100}%`,
            transform: `translateX(-50%) scale(${result ? 1 : 0.85})`,
          }}
        >
          <div
            className="h-4 w-4 rounded-full transition-colors duration-500"
            style={{ backgroundColor: result?.color ?? "#C7C7CC" }}
          />
        </div>
      </div>

      {/* Scale ticks */}
      <div className="mt-6 flex justify-between px-0.5 text-[11px] font-medium tabular-nums text-ink-3">
        <span>{GAUGE_MIN}</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>{GAUGE_MAX}</span>
      </div>
    </div>
  );
}
