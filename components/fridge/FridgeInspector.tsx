"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { TabBar } from "@/components/ui/TabBar";
import { MatchSheet } from "@/components/recipe/MatchSheet";
import { haptic, HAPTIC } from "@/lib/haptics";
import type { RecipeSuggestion } from "@/lib/recipes";

export interface InventoryItem {
  id: string;
  label: string;
  quantity: number | null;
  unit: string;
}

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
  const [analyzing, setAnalyzing] = useState(false);
  const [selected, setSelected] = useState<RecipeSuggestion | null>(null);

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
        <span className="tabular-nums">{inventory.length} ITEMS</span>
      </div>

      {/* Inspect CTA */}
      <button
        onClick={() => fileRef.current?.click()}
        className="mt-4 flex w-full items-center justify-between rounded-3xl bg-[#0C0D12] px-5 py-4 text-white transition active:scale-[0.98] ease-ios"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">❒</span>
          <span className="font-mono text-[12px] uppercase tracking-[0.14em]">
            {d.fridge.inspect}
          </span>
        </span>
        <span className="text-white/40">→</span>
      </button>

      {/* Inventory */}
      <p className="mb-2 mt-7 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
        {d.fridge.inventory} · {inventory.length}
      </p>
      {inventory.length === 0 ? (
        <p className="rounded-3xl border border-hairline bg-surface p-5 font-mono text-[12px] uppercase leading-relaxed tracking-[0.1em] text-ink-3">
          {d.fridge.empty}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {inventory.map((item) => (
            <span
              key={item.id}
              className="rounded-2xl border border-hairline bg-surface px-3 py-2 text-sm font-medium capitalize"
            >
              {item.label}
              {item.quantity ? (
                <span className="ml-1.5 font-mono text-[11px] text-ink-3">
                  {Math.round(item.quantity)}
                  {item.unit}
                </span>
              ) : null}
            </span>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <>
          <p className="mb-3 mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
            {d.fridge.suggestions}
          </p>
          <div className="space-y-3">
            {suggestions.map((s) => (
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

                {/* Coverage bar */}
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

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFile}
        className="hidden"
      />

      <TabBar active="fridge" />
    </main>
  );
}
