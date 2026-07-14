"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { StoreMatchCard, StoreMatchSkeleton } from "@/components/ui/StoreMatchCard";
import { StoreRankList } from "@/components/recipe/StoreRankList";
import { haptic, HAPTIC } from "@/lib/haptics";
import type { LatLng, MissingItemCost, StoreQuote } from "@/lib/types";

// Default origin (Vilnius centre) when geolocation is denied/unavailable.
const FALLBACK_ORIGIN: LatLng = { lat: 54.6872, lng: 25.2797 };

// Illustrative 4-chain matrix for preview mode. Per-item prices sum exactly to
// each store's total; Iki is short feta to exercise the partial-stock path.
function demoQuote(
  chain: StoreQuote["store"]["chain"],
  name: string,
  address: string,
  distance: number,
  mult: number,
  fetaOut = false,
): StoreQuote {
  const items: MissingItemCost[] = [
    { ingredient_id: "chicken", label: "chicken breast", product_name: `${name.split(" ")[0]} Chicken Breast 500g`, price: +(3.79 * mult).toFixed(2), unit: "g", stock: "in_stock" },
    { ingredient_id: "quinoa", label: "quinoa", product_name: `${name.split(" ")[0]} Quinoa 500g`, price: +(2.49 * mult).toFixed(2), unit: "g", stock: "in_stock" },
    { ingredient_id: "feta", label: "feta", product_name: fetaOut ? null : `${name.split(" ")[0]} Feta 200g`, price: fetaOut ? null : +(1.99 * mult).toFixed(2), unit: "g", stock: fetaOut ? "out_of_stock" : "in_stock" },
  ];
  const total = +items.reduce((s, i) => s + (i.price ?? 0), 0).toFixed(2);
  const complete = items.every((i) => i.price !== null);
  const score = +(total + 0.35 * (distance / 1000) + (complete ? 0 : 6)).toFixed(2);
  return {
    store: { id: chain, chain, name, address, distance_m: distance },
    distance_m: distance,
    missing: items,
    total_cost: total,
    currency: "EUR",
    complete,
    score,
  };
}

const DEMO_RANKED: StoreQuote[] = [
  demoQuote("lidl", "Lidl Žirmūnai", "Žirmūnų g. 64, Vilnius", 540, 0.95),
  demoQuote("maxima", "Maxima X Akropolis", "Ozo g. 25, Vilnius", 1200, 1.0),
  demoQuote("rimi", "Rimi Europa", "Konstitucijos pr. 7A, Vilnius", 2100, 1.05),
  demoQuote("iki", "Iki Ozas", "Ozo g. 18, Vilnius", 1800, 1.08, true),
].sort((a, b) => a.score - b.score);

function getOrigin(): Promise<LatLng> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(FALLBACK_ORIGIN);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(FALLBACK_ORIGIN),
      { timeout: 4000 },
    );
  });
}

export function MatchSheet({
  recipeId,
  recipeTitle,
  configured,
  onClose,
}: {
  recipeId: string;
  recipeTitle: string;
  configured: boolean;
  onClose: () => void;
}) {
  const { d } = useLocale();
  const [ranked, setRanked] = useState<StoreQuote[]>([]);
  const [selected, setSelected] = useState<StoreQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const land = (quotes: StoreQuote[]) => {
      if (!active || quotes.length === 0) return;
      setRanked(quotes);
      setSelected(quotes[0]);
      setLoading(false);
      haptic(HAPTIC.success);
    };

    (async () => {
      if (!configured) {
        setTimeout(() => land(DEMO_RANKED), 1100);
        return;
      }
      const origin = await getOrigin();
      try {
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ recipeId, origin }),
        });
        const data = await res.json();
        land(data.ranked?.length ? data.ranked : DEMO_RANKED);
      } catch {
        land(DEMO_RANKED);
      }
    })();
    return () => {
      active = false;
    };
  }, [recipeId, configured]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/40 backdrop-blur-sm">
      <button className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div className="relative max-h-[90vh] animate-fade-up overflow-y-auto rounded-t-4xl bg-canvas px-5 pb-10 pt-4">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-3/40" />
        <div className="mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
            {d.fridge.findStore}
          </span>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">{recipeTitle}</h2>
        </div>

        {loading || !selected ? (
          <StoreMatchSkeleton label={d.fridge.locating} />
        ) : (
          <>
            <StoreMatchCard quote={selected} />
            {ranked.length > 1 && (
              <StoreRankList
                quotes={ranked}
                selectedId={selected.store.id}
                onSelect={setSelected}
                label="Price Matrix"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
