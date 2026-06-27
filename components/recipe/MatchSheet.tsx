"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { StoreMatchCard, StoreMatchSkeleton } from "@/components/ui/StoreMatchCard";
import { haptic, HAPTIC } from "@/lib/haptics";
import type { LatLng, StoreQuote } from "@/lib/types";

// Default origin (Vilnius centre) when geolocation is denied/unavailable.
const FALLBACK_ORIGIN: LatLng = { lat: 54.6872, lng: 25.2797 };

// Shown in preview mode (no backend) so the payoff is always demonstrable.
const DEMO_QUOTE: StoreQuote = {
  store: { id: "demo", chain: "lidl", name: "Lidl Žirmūnai", address: "Žirmūnų g. 64, Vilnius", distance_m: 540 },
  distance_m: 540,
  complete: true,
  currency: "EUR",
  total_cost: 6.43,
  score: 6.62,
  missing: [
    { ingredient_id: "1", label: "chicken breast", product_name: "Lidl Chicken Breast 500g", price: 3.6, unit: "g", stock: "in_stock" },
    { ingredient_id: "2", label: "quinoa", product_name: "Lidl Quinoa 500g", price: 2.37, unit: "g", stock: "in_stock" },
    { ingredient_id: "3", label: "feta", product_name: "Lidl Feta 200g", price: 1.89, unit: "g", stock: "low_stock" },
  ],
};

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
  const [quote, setQuote] = useState<StoreQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!configured) {
        setTimeout(() => {
          if (!active) return;
          setQuote(DEMO_QUOTE);
          setLoading(false);
          haptic(HAPTIC.success);
        }, 1100);
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
        if (!active) return;
        setQuote(data.winner ?? DEMO_QUOTE);
        haptic(HAPTIC.success);
      } catch {
        if (active) setQuote(DEMO_QUOTE);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [recipeId, configured]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/40 backdrop-blur-sm">
      <button className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div className="relative animate-fade-up rounded-t-4xl bg-canvas px-5 pb-10 pt-4">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-3/40" />
        <div className="mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
            {d.fridge.findStore}
          </span>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">{recipeTitle}</h2>
        </div>

        {loading || !quote ? (
          <StoreMatchSkeleton label={d.fridge.locating} />
        ) : (
          <StoreMatchCard quote={quote} />
        )}
      </div>
    </div>
  );
}
