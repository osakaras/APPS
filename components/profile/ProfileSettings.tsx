"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALES, type LocaleCode } from "@/lib/i18n/dictionary";
import { computeBmi } from "@/lib/bmi";
import { MetricField } from "@/components/onboarding/MetricField";
import { BmiGauge } from "@/components/onboarding/BmiGauge";
import { haptic, HAPTIC } from "@/lib/haptics";
import { clsx } from "@/lib/cn";

export interface ProfileInit {
  age: string;
  weight: string;
  height: string;
}

export function ProfileSettings({ initial }: { initial: ProfileInit }) {
  const { d, locale, setLocale } = useLocale();
  const [metrics, setMetrics] = useState<ProfileInit>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const result = computeBmi(Number(metrics.weight), Number(metrics.height));
  const tier = result ? d.bmi.tiers[result.tier] : null;

  function setField(k: keyof ProfileInit) {
    return (v: string) => {
      setMetrics((m) => ({ ...m, [k]: v }));
      setSaved(false);
    };
  }

  function pickLanguage(code: LocaleCode) {
    setLocale(code); // live preview
    setSaved(false);
    haptic(HAPTIC.tick);
  }

  async function save() {
    setSaving(true);
    haptic(HAPTIC.pulse);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          age: Number(metrics.age) || null,
          weight_kg: Number(metrics.weight) || null,
          height_cm: Number(metrics.height) || null,
          preferred_language: locale,
        }),
      });
      haptic(HAPTIC.success);
      setSaved(true);
    } catch {
      /* keep editable state */
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-12 pt-12">
      {/* Rail */}
      <div className="flex items-center justify-between">
        <a
          href="/"
          className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-ink-2 transition active:scale-90"
          aria-label={d.settings.back}
        >
          ✕
        </a>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
          Pl8 · Settings
        </span>
        <span className="h-9 w-9" />
      </div>

      <h1 className="mb-6 mt-4 text-3xl font-semibold tracking-tight">{d.settings.title}</h1>

      {/* Live composition panel */}
      <section className="rounded-4xl bg-[#0C0D12] p-6 text-white shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              {d.bmi.label} · Index
            </p>
            <p className="mt-1.5 font-mono text-[2.75rem] font-semibold leading-none tabular-nums">
              {result ? result.bmi.toFixed(1) : "—.—"}
            </p>
          </div>
          {tier && (
            <span
              className="mt-1 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: result!.color, borderColor: `${result!.color}55` }}
            >
              {tier.name}
            </span>
          )}
        </div>
        <div className="mt-6">
          <BmiGauge result={result} />
        </div>
      </section>

      {/* Metrics */}
      <div className="mt-6 space-y-4">
        <MetricField label={d.metrics.age} value={metrics.age} onChange={setField("age")} unit={d.metrics.years} max={120} />
        <MetricField label={d.metrics.weight} value={metrics.weight} onChange={setField("weight")} unit="kg" max={400} />
        <MetricField label={d.metrics.height} value={metrics.height} onChange={setField("height")} unit="cm" max={260} />
      </div>

      {/* Language */}
      <p className="mb-2 mt-8 px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
        {d.settings.language}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {LOCALES.map((l) => {
          const active = l.code === (locale as LocaleCode);
          return (
            <button
              key={l.code}
              onClick={() => pickLanguage(l.code)}
              className={clsx(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.97] ease-ios",
                active ? "border-ink/70 bg-surface shadow-card" : "border-hairline bg-surface/60",
              )}
            >
              <span className="text-2xl leading-none">{l.flag}</span>
              <span className="flex-1">
                <span className="block text-sm font-semibold leading-tight">{l.native}</span>
                <span className="font-mono text-[9px] uppercase tracking-wide text-ink-3">{l.code}</span>
              </span>
              {active && (
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#3DF5A0" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Taste matrix link */}
      <a
        href="/taste"
        className="mt-6 flex items-center justify-between rounded-3xl border border-hairline bg-surface px-5 py-4 transition active:scale-[0.98]"
      >
        <span className="font-mono text-[12px] uppercase tracking-[0.14em]">{d.settings.editTaste}</span>
        <span className="text-ink-3">→</span>
      </a>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className={clsx(
          "mt-6 w-full rounded-3xl py-4 font-mono text-[12px] uppercase tracking-[0.14em] text-white transition active:scale-[0.97] ease-ios",
          saved ? "bg-[#3DA37A]" : "bg-[#0C0D12]",
          saving && "opacity-60",
        )}
      >
        {saving ? "…" : saved ? `✓ ${d.settings.saved}` : d.settings.save}
      </button>
    </main>
  );
}
