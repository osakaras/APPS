"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { t } from "@/lib/i18n/dictionary";
import { computeBmi } from "@/lib/bmi";
import { clsx } from "@/lib/cn";
import { LanguageStep } from "@/components/onboarding/LanguageStep";
import { MetricsStep, type Metrics } from "@/components/onboarding/MetricsStep";
import { BmiDashboard } from "@/components/onboarding/BmiDashboard";

const TOTAL_STEPS = 3;

export function OnboardingFlow({
  initialMetrics = { age: "", weight: "", height: "" },
}: {
  initialMetrics?: Metrics;
}) {
  const { locale, d } = useLocale();
  const { ready, configured } = useAuth();
  const [step, setStep] = useState(1);
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const result = computeBmi(Number(metrics.weight), Number(metrics.height));
  const canAdvance = step === 1 || (step === 2 ? Boolean(result) : true);

  async function finish() {
    setSaving(true);
    setError(false);
    try {
      // If Supabase isn't configured (design-preview), skip the network and
      // just advance — nothing to persist.
      if (configured) {
        const res = await fetch("/api/onboarding", {
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
        if (!res.ok) throw new Error(await res.text());
      }
      window.location.assign("/");
    } catch {
      // Surface the failure instead of silently dropping the user's data.
      setError(true);
      setSaving(false);
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

      {/* On the final step we wait for the session to resolve before enabling
          save, so the POST always carries a valid auth cookie. */}
      {(() => {
        const waitingForAuth = step === TOTAL_STEPS && configured && !ready;
        const disabled = !canAdvance || saving || waitingForAuth;
        return (
          <div className="mt-8">
            {error && (
              <p className="mb-3 text-center text-sm font-medium text-coral">
                Couldn't save just now — please try again.
              </p>
            )}
            <div className="flex items-center gap-3">
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
                disabled={disabled}
                onClick={() => (step < TOTAL_STEPS ? setStep((s) => s + 1) : finish())}
                className={clsx(
                  "flex-1 rounded-3xl py-4 text-base font-semibold text-white shadow-float",
                  "transition duration-300 ease-ios active:scale-[0.97]",
                  disabled ? "cursor-not-allowed bg-ink-3 shadow-none" : "bg-accent",
                )}
              >
                {saving || waitingForAuth ? "…" : step < TOTAL_STEPS ? d.continue : d.getStarted}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
