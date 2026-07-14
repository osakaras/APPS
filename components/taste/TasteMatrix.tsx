"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { TabBar } from "@/components/ui/TabBar";
import { haptic, HAPTIC } from "@/lib/haptics";
import { clsx } from "@/lib/cn";
import type { Sentiment } from "@/lib/types";

export interface TasteEntry {
  ingredientId: string;
  label: string;
  score: number; // -1..1
  samples: number;
}

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
  const { configured } = useAuth();
  const [pos, setPos] = useState<TasteEntry[]>(affinities);
  const [neg, setNeg] = useState<TasteEntry[]>(aversions);
  const [active, setActive] = useState<Set<string>>(new Set(activeGoals));
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  async function toggleGoal(kind: string) {
    const next = new Set(active);
    const willActivate = !next.has(kind);
    willActivate ? next.add(kind) : next.delete(kind);
    setActive(next);
    haptic(HAPTIC.tick);
    fetch("/api/taste/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, active: willActivate }),
    }).catch(() => {});
  }

  function removePref(entry: TasteEntry, positive: boolean) {
    haptic(HAPTIC.pulse);
    (positive ? setPos : setNeg)((xs) => xs.filter((e) => e.ingredientId !== entry.ingredientId));
    fetch("/api/taste/pref", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ingredientId: entry.ingredientId }),
    }).catch(() => {});
  }

  async function addPref(sentiment: Sentiment) {
    const label = draft.trim().toLowerCase();
    if (!label) return;
    haptic(HAPTIC.pulse);
    const positive = sentiment === "loved";
    const entry: TasteEntry = {
      ingredientId: `tmp-${Date.now()}`,
      label,
      score: positive ? 1 : -0.5,
      samples: 1,
    };
    (positive ? setPos : setNeg)((xs) => [entry, ...xs.filter((e) => e.label !== label)]);
    setDraft("");
    setAdding(false);
    try {
      const res = await fetch("/api/taste/pref", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label, sentiment }),
      });
      const data = await res.json();
      if (data.ingredientId) {
        (positive ? setPos : setNeg)((xs) =>
          xs.map((e) => (e.ingredientId === entry.ingredientId ? { ...e, ingredientId: data.ingredientId } : e)),
        );
      }
    } catch {
      /* optimistic entry remains */
    }
  }

  const hasTaste = pos.length > 0 || neg.length > 0;

  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-12">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
        <span>Pl8 · Matrix</span>
        {classification && <span style={{ color: "#3DA37A" }}>{classification}</span>}
      </div>

      <div className="mb-6 mt-3 flex items-end justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{d.taste.title}</h1>
        <button
          onClick={() => setAdding((v) => !v)}
          className={clsx(
            "pb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition",
            adding ? "text-ink-3" : "text-ink",
          )}
        >
          {adding ? "Cancel" : "+ Add"}
        </button>
      </div>

      {/* Add preference */}
      {adding && (
        <div className="mb-5 animate-fade-up rounded-2xl border border-ink/40 bg-surface p-3">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="INGREDIENT"
            className="w-full bg-transparent font-mono text-sm uppercase tracking-[0.08em] outline-none placeholder:text-ink-3"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => addPref("loved")}
              disabled={!draft.trim()}
              className="rounded-xl py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white transition active:scale-95 disabled:opacity-30"
              style={{ backgroundColor: "#3DA37A" }}
            >
              ◆ Affinity
            </button>
            <button
              onClick={() => addPref("disliked")}
              disabled={!draft.trim()}
              className="rounded-xl py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white transition active:scale-95 disabled:opacity-30"
              style={{ backgroundColor: "#C77A6E" }}
            >
              ○ Aversion
            </button>
          </div>
        </div>
      )}

      {!hasTaste ? (
        <p className="rounded-3xl border border-hairline bg-surface p-5 font-mono text-[12px] uppercase leading-relaxed tracking-[0.1em] text-ink-3">
          {d.taste.noTaste}
        </p>
      ) : (
        <>
          {pos.length > 0 && (
            <Section title={d.taste.affinities}>
              {pos.map((e) => (
                <TasteRow key={e.ingredientId} entry={e} positive onRemove={() => removePref(e, true)} />
              ))}
            </Section>
          )}
          {neg.length > 0 && (
            <Section title={d.taste.aversions}>
              {neg.map((e) => (
                <TasteRow key={e.ingredientId} entry={e} positive={false} onRemove={() => removePref(e, false)} />
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
                on ? "border-transparent bg-[#0C0D12] text-white" : "border-hairline bg-surface text-ink-2",
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
  positive,
  onRemove,
}: {
  entry: TasteEntry;
  positive: boolean;
  onRemove: () => void;
}) {
  const color = positive ? "#4E9E82" : "#C77A6E";
  const magnitude = Math.min(1, Math.abs(entry.score));
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 truncate text-sm font-medium capitalize">{entry.label}</span>

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

      <span className="w-11 shrink-0 text-right font-mono text-[11px] tabular-nums" style={{ color }}>
        {entry.score > 0 ? "+" : ""}
        {entry.score.toFixed(2)}
      </span>
      <button
        onClick={onRemove}
        aria-label="Remove"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-3 transition hover:text-coral active:scale-90"
      >
        ✕
      </button>
    </div>
  );
}
