"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { computeBmi } from "@/lib/bmi";
import { BmiGauge } from "@/components/onboarding/BmiGauge";
import type { Metrics } from "@/components/onboarding/MetricsStep";

/**
 * Step 3 — the live BMI dashboard. Recomputes on every keystroke from Step 2's
 * metrics, reframes the result into a supportive tier, and reveals the user's
 * biological advantages as a confidence-building retention hook.
 */
export function BmiDashboard({ metrics }: { metrics: Metrics }) {
  const { d } = useLocale();
  const result = computeBmi(Number(metrics.weight), Number(metrics.height));
  const tier = result ? d.bmi.tiers[result.tier] : null;

  return (
    <div className="animate-pop-in">
      <h1 className="text-3xl font-semibold tracking-tight">{d.bmi.title}</h1>
      <p className="mt-2 text-ink-2">{d.bmi.subtitle}</p>

      {/* Result card — continuous-curvature squircle */}
      <div className="mt-7 rounded-4xl border border-hairline bg-surface p-6 shadow-card">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-ink-2">{d.bmi.label}</p>
            <p
              className="text-5xl font-bold tracking-tight tabular-nums transition-colors duration-500"
              style={{ color: result?.color ?? "#C7C7CC" }}
            >
              {result ? result.bmi.toFixed(1) : "—"}
            </p>
          </div>
          {tier && (
            <span
              className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-500"
              style={{
                color: result!.color,
                backgroundColor: `${result!.color}1A`, // 10% tint
              }}
            >
              {tier.name}
            </span>
          )}
        </div>

        <div className="mt-8">
          <BmiGauge result={result} />
        </div>
      </div>

      {/* Motivational message + biological advantages */}
      {tier ? (
        <div className="mt-5 rounded-4xl border border-hairline bg-surface p-6 shadow-card">
          <p className="text-[15px] leading-relaxed text-ink">{tier.message}</p>

          <div className="mt-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden>⚡️</span>
              {d.bmi.advantagesTitle}
            </p>
            <ul className="space-y-2.5">
              {tier.advantages.map((adv, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-2xl bg-canvas p-3 text-sm
                             animate-pop-in"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <span
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] text-white"
                    style={{ backgroundColor: result!.color }}
                  >
                    ✓
                  </span>
                  <span className="leading-snug text-ink">{adv}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="mt-5 px-1 text-sm text-ink-2">{d.bmi.enterMetrics}</p>
      )}
    </div>
  );
}
