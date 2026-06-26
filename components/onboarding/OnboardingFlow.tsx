"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { t } from "@/lib/i18n/dictionary";
import { computeBmi } from "@/lib/bmi";
import { clsx } from "@/lib/cn";
import { LanguageStep } from "@/components/onboarding/LanguageStep";
import { MetricsStep, type Metrics } from "@/components/onboarding/MetricsStep";
import { BmiDashboard } from "@/components/onboarding/BmiDashboard";

const TOTAL_STEPS = 3;

export function OnboardingFlow() {
  const { locale, d } = useLocale();
  const [step, setStep] = useState(1);
  const [metrics, setMetrics] = useState<Metrics>({ age: "", weight: "", height: "" });
  const [saving, setSaving] = useState(false);

  const result = computeBmi(Number(metrics.weight), Number(metrics.height));
  const canAdvance = step === 1 || (step === 2 ? Boolean(result) : true);

  async function finish() {
    setSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          preferred_language: locale,
          age: Number(metrics.age) || null,
          weight_kg: Number(metrics.weight) || null,
          height_cm: Number(metrics.height) || null,
          bmi_status: result?.tier ?? null,
        }),
      });
    } catch {
      // Non-blocking: onboarding continues even if the network hiccups; the
      // values are kept client-side and retried on the next authenticated load.
    } finally {
      setSaving(false);
      window.location.assign("/");
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-14">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500 ease-ios"
                style={{ width: i < step ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 px-1 text-xs font-medium text-ink-3">
          {t(d.step, { n: step, total: TOTAL_STEPS })}
        </p>
      </div>

      {/* Step body */}
      <div className="flex-1">
        {step === 1 && <LanguageStep />}
        {step === 2 && <MetricsStep metrics={metrics} onChange={setMetrics} />}
        {step === 3 && <BmiDashboard metrics={metrics} />}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="rounded-2xl px-5 py-4 text-sm font-semibold text-ink-2
                       transition active:scale-95 ease-ios"
          >
            {d.back}
          </button>
        )}
        <button
          disabled={!canAdvance || saving}
          onClick={() => (step < TOTAL_STEPS ? setStep((s) => s + 1) : finish())}
          className={clsx(
            "flex-1 rounded-3xl py-4 text-base font-semibold text-white shadow-float",
            "transition duration-300 ease-ios active:scale-[0.97]",
            !canAdvance || saving
              ? "cursor-not-allowed bg-ink-3 shadow-none"
              : "bg-accent",
          )}
        >
          {saving ? "…" : step < TOTAL_STEPS ? d.continue : d.getStarted}
        </button>
      </div>
    </div>
  );
}
