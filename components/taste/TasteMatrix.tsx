"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { TabBar } from "@/components/ui/TabBar";
import { haptic, HAPTIC } from "@/lib/haptics";
import { clsx } from "@/lib/cn";

export interface TasteEntry {
  label: string;
  score: number; // -1..1
  samples: number;
}

// Goal protocols — labels stay English mono (technical readouts).
const GOALS: { kind: string; label: string }[] = [
  { kind: "lose_weight", label: "Fat Loss" },
  { kind: "maintain", label: "Maintain" },
  { kind: "gain_muscle", label: "Muscle Gain" },
  { kind: "high_protein", label: "High Protein" },
  { kind: "low_carb", label: "Low Carb" },
  { kind: "low_sugar", label: "Low Sugar" },
  { kind: "heart_health", label: "Heart Health" },
  { kind: "gut_health", label: "Gut Health" },
];

export function TasteMatrix({
  classification,
  affinities,
  aversions,
  activeGoals,
}: {
  classification: string | null;
  affinities: TasteEntry[];
  aversions: TasteEntry[];
  activeGoals: string[];
}) {
  const { d } = useLocale();
  const [active, setActive] = useState<Set<string>>(new Set(activeGoals));

  async function toggleGoal(kind: string) {
    const next = new Set(active);
    const willActivate = !next.has(kind);
    willActivate ? next.add(kind) : next.delete(kind);
    setActive(next);
    haptic(HAPTIC.tick);
    try {
      await fetch("/api/taste/goals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, active: willActivate }),
      });
    } catch {
      /* optimistic — local state already reflects intent */
    }
  }

  const hasTaste = affinities.length > 0 || aversions.length > 0;

  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-12">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
        <span>Pl8 · Matrix</span>
        {classification && <span style={{ color: "#3DA37A" }}>{classification}</span>}
      </div>

      <h1 className="mb-6 mt-3 text-3xl font-semibold tracking-tight">{d.taste.title}</h1>

      {!hasTaste ? (
        <p className="rounded-3xl border border-hairline bg-surface p-5 font-mono text-[12px] uppercase leading-relaxed tracking-[0.1em] text-ink-3">
          {d.taste.noTaste}
        </p>
      ) : (
        <>
          {affinities.length > 0 && (
            <Section title={d.taste.affinities}>
              {affinities.map((e) => (
                <TasteRow key={e.label} entry={e} samplesLabel={d.taste.samples} positive />
              ))}
            </Section>
          )}
          {aversions.length > 0 && (
            <Section title={d.taste.aversions}>
              {aversions.map((e) => (
                <TasteRow key={e.label} entry={e} samplesLabel={d.taste.samples} positive={false} />
              ))}
            </Section>
          )}
        </>
      )}

      {/* Active protocols */}
      <p className="mb-3 mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
        {d.taste.goals}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {GOALS.map((g) => {
          const on = active.has(g.kind);
          return (
            <button
              key={g.kind}
              onClick={() => toggleGoal(g.kind)}
              className={clsx(
                "flex items-center justify-between rounded-2xl border px-4 py-3.5 font-mono text-[11px] uppercase tracking-[0.1em] transition active:scale-[0.97] ease-ios",
                on
                  ? "border-transparent bg-[#0C0D12] text-white"
                  : "border-hairline bg-surface text-ink-2",
              )}
            >
              {g.label}
              <span
                className="h-2 w-2 rounded-full transition-colors"
                style={{ backgroundColor: on ? "#3DF5A0" : "rgba(60,60,67,0.2)" }}
              />
            </button>
          );
        })}
      </div>

      <TabBar active="taste" />
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">{title}</p>
      <div className="space-y-2.5 rounded-3xl border border-hairline bg-surface p-4">{children}</div>
    </div>
  );
}

function TasteRow({
  entry,
  samplesLabel,
  positive,
}: {
  entry: TasteEntry;
  samplesLabel: string;
  positive: boolean;
}) {
  const color = positive ? "#4E9E82" : "#C77A6E";
  const magnitude = Math.min(1, Math.abs(entry.score));
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-sm font-medium capitalize">{entry.label}</span>

      {/* Bipolar bar */}
      <div className="relative h-1.5 flex-1 rounded-full bg-hairline">
        <div className="absolute left-1/2 top-0 h-full w-px bg-ink-3/30" />
        <div
          className="absolute top-0 h-full rounded-full"
          style={
            positive
              ? { left: "50%", width: `${magnitude * 50}%`, backgroundColor: color }
              : { right: "50%", width: `${magnitude * 50}%`, backgroundColor: color }
          }
        />
      </div>

      <span className="w-12 shrink-0 text-right font-mono text-[11px] tabular-nums" style={{ color }}>
        {entry.score > 0 ? "+" : ""}
        {entry.score.toFixed(2)}
      </span>
    </div>
  );
}
