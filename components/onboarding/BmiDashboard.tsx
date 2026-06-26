"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { computeBmi } from "@/lib/bmi";
import { BmiGauge } from "@/components/onboarding/BmiGauge";
import type { Metrics } from "@/components/onboarding/MetricsStep";

/**
 * Step 3 — composition telemetry. A graphite instrument panel reports the BMI
 * index and classification; below it, the biological leverage points are laid
 * out as precise micro-cards. Monospaced metrics, hairline borders, desaturated
 * indicators — an elite lab report, not a friendly checklist.
 */
export function BmiDashboard({ metrics }: { metrics: Metrics }) {
  const { d } = useLocale();
  const result = computeBmi(Number(metrics.weight), Number(metrics.height));
  const tier = result ? d.bmi.tiers[result.tier] : null;

  return (
    <div className="animate-pop-in">
      {/* Eyebrow */}
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3">
        {d.bmi.title}
      </p>

      {/* Instrument panel */}
      <div className="mt-3 rounded-4xl bg-[#0C0D12] p-6 text-white shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              {d.bmi.label} · Index
            </p>
            <p className="mt-1.5 font-mono text-[3.25rem] font-semibold leading-none tabular-nums">
              {result ? result.bmi.toFixed(1) : "—.—"}
            </p>
          </div>

          {tier && (
            <span
              className="mt-1 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-500"
              style={{ color: result!.color, borderColor: `${result!.color}55` }}
            >
              {tier.name}
            </span>
          )}
        </div>

        <div className="mt-7">
          <BmiGauge result={result} />
        </div>
      </div>

      {/* Status + leverage points */}
      {tier ? (
        <>
          <div className="mt-7">
            <h2 className="text-xl font-semibold tracking-tight">{tier.headline}</h2>
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
              {d.bmi.analysisComplete}
            </p>
          </div>

          <p className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3">
            {d.bmi.leverageTitle}
          </p>

          <div className="space-y-2.5">
            {tier.leverage.map((point, i) => (
              <div
                key={i}
                className="flex items-stretch gap-4 rounded-3xl border border-hairline bg-surface p-4 animate-pop-in"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {/* Desaturated indicator bar */}
                <div
                  className="w-[3px] shrink-0 rounded-full"
                  style={{ backgroundColor: result!.color }}
                />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[15px] font-semibold tracking-tight">{point.metric}</p>
                    <span className="font-mono text-[10px] tabular-nums text-ink-3">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-ink-2">{point.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-6 px-1 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-3">
          {d.bmi.enterMetrics}
        </p>
      )}
    </div>
  );
}
