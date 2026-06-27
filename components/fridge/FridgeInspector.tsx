"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { TabBar } from "@/components/ui/TabBar";
import { MatchSheet } from "@/components/recipe/MatchSheet";
import { haptic, HAPTIC } from "@/lib/haptics";
import { clsx } from "@/lib/cn";
import type { RecipeSuggestion } from "@/lib/recipes";

export interface InventoryItem {
  id: string;
  label: string;
  quantity: number | null;
  unit: string;
}

const UNIT_CYCLE = ["pcs", "g", "kg", "ml", "l"];
const stepFor = (unit: string) => (unit === "g" || unit === "ml" ? 50 : 1);

export function FridgeInspector({
  inventory,
  suggestions,
}: {
  inventory: InventoryItem[];
  suggestions: RecipeSuggestion[];
}) {
  const { d } = useLocale();
  const { configured } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<InventoryItem[]>(inventory);
  const [sugs, setSugs] = useState<RecipeSuggestion[]>(suggestions);
  const [analyzing, setAnalyzing] = useState(false);
  const [selected, setSelected] = useState<RecipeSuggestion | null>(null);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ label: "", quantity: 1, unit: "pcs" });

  // ── Suggestions refresh (coverage shifts as inventory changes) ────────────
  async function refreshSuggestions() {
    if (!configured) return;
    try {
      const res = await fetch("/api/fridge/suggest");
      const data = await res.json();
      if (Array.isArray(data.suggestions)) setSugs(data.suggestions);
    } catch {
      /* keep current suggestions */
    }
  }

  // ── Mutations (optimistic) ────────────────────────────────────────────────
  async function addItem() {
    const label = draft.label.trim();
    if (!label) return;
    haptic(HAPTIC.pulse);
    const temp: InventoryItem = {
      id: `tmp-${Date.now()}`,
      label: label.toLowerCase(),
      quantity: draft.quantity,
      unit: draft.unit,
    };
    setItems((xs) => [temp, ...xs]);
    setDraft({ label: "", quantity: 1, unit: "pcs" });
    setAdding(false);

    try {
      const res = await fetch("/api/fridge/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label, quantity: temp.quantity, unit: temp.unit }),
      });
      const data = await res.json();
      if (data.item) {
        setItems((xs) => xs.map((x) => (x.id === temp.id ? data.item : x)));
      }
      refreshSuggestions();
    } catch {
      setItems((xs) => xs.filter((x) => x.id !== temp.id));
    }
  }

  function adjustQty(id: string, delta: number) {
    haptic(HAPTIC.tick);
    let nextQty: number | null = null;
    setItems((xs) =>
      xs.map((x) => {
        if (x.id !== id) return x;
        nextQty = Math.max(0, Math.round(((x.quantity ?? 0) + delta) * 100) / 100);
        return { ...x, quantity: nextQty };
      }),
    );
    if (!id.startsWith("tmp-")) {
      fetch(`/api/fridge/items/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quantity: nextQty }),
      }).then(refreshSuggestions);
    }
  }

  function cycleUnit(id: string) {
    haptic(HAPTIC.tick);
    let nextUnit = "pcs";
    setItems((xs) =>
      xs.map((x) => {
        if (x.id !== id) return x;
        nextUnit = UNIT_CYCLE[(UNIT_CYCLE.indexOf(x.unit) + 1) % UNIT_CYCLE.length];
        return { ...x, unit: nextUnit };
      }),
    );
    if (!id.startsWith("tmp-")) {
      fetch(`/api/fridge/items/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ unit: nextUnit }),
      });
    }
  }

  function removeItem(id: string) {
    haptic(HAPTIC.pulse);
    setItems((xs) => xs.filter((x) => x.id !== id));
    if (!id.startsWith("tmp-")) {
      fetch(`/api/fridge/items/${id}`, { method: "DELETE" }).then(refreshSuggestions);
    }
  }

  // ── Fridge scan ───────────────────────────────────────────────────────────
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    haptic(HAPTIC.tick);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await fetch("/api/fridge/scan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ image: reader.result, mediaType: "image/jpeg" }),
        });
        haptic(HAPTIC.success);
        window.location.reload();
      } catch {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-12">
      {/* Rail */}
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
        <span>Pl8 · Fridge</span>
        <span className="tabular-nums">{items.length} ITEMS</span>
      </div>

      {/* Inspect CTA */}
      <button
        onClick={() => fileRef.current?.click()}
        className="mt-4 flex w-full items-center justify-between rounded-3xl bg-[#0C0D12] px-5 py-4 text-white transition active:scale-[0.98] ease-ios"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">❒</span>
          <span className="font-mono text-[12px] uppercase tracking-[0.14em]">{d.fridge.inspect}</span>
        </span>
        <span className="text-white/40">→</span>
      </button>

      {/* Inventory header + add toggle */}
      <div className="mb-2 mt-7 flex items-center justify-between px-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
          {d.fridge.inventory} · {items.length}
        </p>
        <button
          onClick={() => setAdding((v) => !v)}
          className={clsx(
            "font-mono text-[10px] uppercase tracking-[0.14em] transition",
            adding ? "text-ink-3" : "text-ink",
          )}
        >
          {adding ? "Cancel" : "+ Add Item"}
        </button>
      </div>

      {/* Add draft row */}
      {adding && (
        <div className="mb-2 animate-fade-up rounded-2xl border border-ink/40 bg-surface p-3">
          <input
            autoFocus
            value={draft.label}
            onChange={(e) => setDraft((dd) => ({ ...dd, label: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="ITEM NAME"
            className="w-full bg-transparent font-mono text-sm uppercase tracking-[0.08em] outline-none placeholder:text-ink-3"
          />
          <div className="mt-3 flex items-center justify-between">
            <Stepper
              quantity={draft.quantity}
              unit={draft.unit}
              onMinus={() => setDraft((dd) => ({ ...dd, quantity: Math.max(0, dd.quantity - stepFor(dd.unit)) }))}
              onPlus={() => setDraft((dd) => ({ ...dd, quantity: dd.quantity + stepFor(dd.unit) }))}
              onUnit={() => setDraft((dd) => ({ ...dd, unit: UNIT_CYCLE[(UNIT_CYCLE.indexOf(dd.unit) + 1) % UNIT_CYCLE.length] }))}
            />
            <button
              onClick={addItem}
              disabled={!draft.label.trim()}
              className="rounded-xl bg-[#0C0D12] px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white transition active:scale-95 disabled:opacity-30"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Inventory list */}
      {items.length === 0 ? (
        <p className="rounded-3xl border border-hairline bg-surface p-5 font-mono text-[12px] uppercase leading-relaxed tracking-[0.1em] text-ink-3">
          {d.fridge.empty}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-2xl border border-hairline bg-surface px-4 py-2.5"
            >
              <span className="flex-1 truncate text-sm font-medium capitalize">{item.label}</span>
              <Stepper
                quantity={item.quantity ?? 0}
                unit={item.unit}
                onMinus={() => adjustQty(item.id, -stepFor(item.unit))}
                onPlus={() => adjustQty(item.id, stepFor(item.unit))}
                onUnit={() => cycleUnit(item.id)}
              />
              <button
                onClick={() => removeItem(item.id)}
                aria-label="Remove"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-3 transition hover:text-coral active:scale-90"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {sugs.length > 0 && (
        <>
          <p className="mb-3 mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
            {d.fridge.suggestions}
          </p>
          <div className="space-y-3">
            {sugs.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className="w-full rounded-4xl border border-hairline bg-surface p-5 text-left transition duration-300 ease-ios hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-0.5 text-[13px] leading-snug text-ink-2">{s.summary}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
                    {s.have}/{s.total}
                  </span>
                </div>
                <div className="mt-3 h-px w-full overflow-hidden bg-hairline">
                  <div
                    className="h-full bg-[#4E9E82] transition-all duration-700 ease-ios"
                    style={{ width: `${Math.round(s.coverage * 100)}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                    {s.kcal_per_serving ?? "—"} kcal · {s.protein_per_serving_g ?? "—"}g P · {s.prep_minutes ?? "—"} min
                  </span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.12em]"
                    style={{ color: s.missing === 0 ? "#3DA37A" : "#B08A52" }}
                  >
                    {s.missing === 0 ? d.fridge.allInStock : `${s.missing} ${d.fridge.missing}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Analyzing overlay */}
      {analyzing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0C0D12]">
          <div className="relative h-40 w-64 overflow-hidden rounded-3xl border border-white/10">
            <div className="absolute inset-x-0 top-0 h-1/2 animate-scanline bg-gradient-to-b from-transparent via-[#3DF5A0]/30 to-[#3DF5A0]/60" />
          </div>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[#3DF5A0]">
            {d.fridge.analyzing}…
          </p>
        </div>
      )}

      {/* Match sheet */}
      {selected && (
        <MatchSheet
          recipeId={selected.id}
          recipeTitle={selected.title}
          configured={configured}
          onClose={() => setSelected(null)}
        />
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />

      <TabBar active="fridge" />
    </main>
  );
}

function Stepper({
  quantity,
  unit,
  onMinus,
  onPlus,
  onUnit,
}: {
  quantity: number;
  unit: string;
  onMinus: () => void;
  onPlus: () => void;
  onUnit: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <StepBtn onClick={onMinus}>−</StepBtn>
      <button
        onClick={onUnit}
        className="min-w-[58px] rounded-lg py-1 text-center font-mono text-[11px] tabular-nums text-ink transition active:scale-95"
      >
        {Math.round(quantity)}
        <span className="text-ink-3">{unit}</span>
      </button>
      <StepBtn onClick={onPlus}>+</StepBtn>
    </div>
  );
}

function StepBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-full border border-hairline font-mono text-sm text-ink-2 transition active:scale-90"
    >
      {children}
    </button>
  );
}
