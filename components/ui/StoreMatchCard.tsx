import type { RetailChain, StoreQuote } from "@/lib/types";
import { formatDistance } from "@/lib/engine/geo";
import { clsx } from "@/lib/cn";

// Brand-tinted chips per chain — kept muted so the card stays Apple-clean.
const chainStyle: Record<RetailChain, { bg: string; fg: string; label: string }> = {
  lidl: { bg: "bg-[#0050AA]/10", fg: "text-[#0050AA]", label: "Lidl" },
  maxima: { bg: "bg-[#003DA5]/10", fg: "text-[#003DA5]", label: "Maxima" },
  iki: { bg: "bg-[#E2001A]/10", fg: "text-[#C2001A]", label: "Iki" },
  rimi: { bg: "bg-[#A6093D]/10", fg: "text-[#A6093D]", label: "Rimi" },
  other: { bg: "bg-ink/5", fg: "text-ink-2", label: "Store" },
};

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function StoreMatchCard({ quote }: { quote: StoreQuote }) {
  const style = chainStyle[quote.store.chain];
  const purchasable = quote.missing.filter((m) => m.price !== null);
  const unavailable = quote.missing.filter((m) => m.price === null);

  return (
    <div className="bento rounded-4xl p-6 animate-pop-in overflow-hidden">
      {/* Header: cheapest + closest verdict */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={clsx("pill", style.bg, style.fg)}>{style.label}</span>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            {quote.store.name}
          </h3>
          <p className="text-sm text-ink-2">{quote.store.address}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {money(quote.total_cost, quote.currency)}
          </p>
          <p className="text-xs text-ink-2">missing items</p>
        </div>
      </div>

      {/* Verdict ribbon */}
      <div className="mt-4 flex items-center gap-2">
        <span className="pill bg-mint/15 text-mint">
          ● {quote.complete ? "Everything in stock" : "Mostly in stock"}
        </span>
        <span className="pill bg-accent/10 text-accent">
          {formatDistance(quote.distance_m)} away
        </span>
      </div>

      {/* Missing-item breakdown */}
      <div className="mt-5 rounded-3xl bg-canvas p-4">
        <ul className="divide-y divide-hairline">
          {purchasable.map((item) => (
            <li
              key={item.ingredient_id}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium capitalize truncate">{item.label}</p>
                <p className="text-xs text-ink-2 truncate">{item.product_name}</p>
              </div>
              <span className="font-medium tabular-nums">
                {money(item.price ?? 0, quote.currency)}
              </span>
            </li>
          ))}
          {unavailable.map((item) => (
            <li
              key={item.ingredient_id}
              className="flex items-center justify-between py-2.5 text-sm opacity-60"
            >
              <p className="font-medium capitalize">{item.label}</p>
              <span className="pill bg-coral/10 text-coral">not here</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <a
        href={`https://maps.apple.com/?q=${encodeURIComponent(quote.store.name)}`}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex w-full items-center justify-center rounded-2xl
                   bg-accent py-3.5 text-sm font-semibold text-white
                   shadow-float transition active:scale-[0.97] ease-ios"
      >
        Get directions
      </a>
    </div>
  );
}

/** Skeleton shown while live prices + location resolve. */
export function StoreMatchSkeleton() {
  return (
    <div className="bento rounded-4xl p-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-6 w-40" />
        </div>
        <div className="skeleton h-9 w-24" />
      </div>
      <div className="mt-5 space-y-3 rounded-3xl bg-canvas p-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-12" />
          </div>
        ))}
      </div>
      <div className="skeleton mt-5 h-12 w-full" />
    </div>
  );
}
