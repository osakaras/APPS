import type { RetailChain, StoreQuote } from "@/lib/types";
import { formatDistance } from "@/lib/engine/geo";

const CHAIN_LABEL: Record<RetailChain, string> = {
  lidl: "Lidl",
  maxima: "Maxima",
  iki: "Iki",
  rimi: "Rimi",
  other: "Store",
};

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * The price/geo verdict as a graphite instrument readout: the winning store,
 * total cost of missing items in monospaced figures, distance, and a per-item
 * price breakdown. Matches the telemetry system.
 */
export function StoreMatchCard({ quote }: { quote: StoreQuote }) {
  const purchasable = quote.missing.filter((m) => m.price !== null);
  const unavailable = quote.missing.filter((m) => m.price === null);

  return (
    <div className="animate-pop-in overflow-hidden rounded-4xl bg-[#0C0D12] p-6 text-white shadow-card">
      {/* Verdict header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3DF5A0]">
            Optimal Match · {CHAIN_LABEL[quote.store.chain]}
          </span>
          <h3 className="mt-1.5 text-xl font-semibold tracking-tight">{quote.store.name}</h3>
          <p className="font-mono text-[11px] tracking-wide text-white/40">{quote.store.address}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[2rem] font-semibold leading-none tabular-nums">
            {money(quote.total_cost, quote.currency)}
          </p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">
            Missing cost
          </p>
        </div>
      </div>

      {/* Status row */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className="font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{ color: quote.complete ? "#3DF5A0" : "#FFC24B" }}
        >
          ● {quote.complete ? "All items in stock" : "Partial stock"}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
          · {formatDistance(quote.distance_m)}
        </span>
      </div>

      {/* Item breakdown */}
      <div className="mt-5 rounded-3xl bg-white/[0.04] p-4">
        <ul className="divide-y divide-white/10">
          {purchasable.map((item) => (
            <li key={item.ingredient_id} className="flex items-center justify-between py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium capitalize">{item.label}</p>
                <p className="truncate font-mono text-[10px] text-white/35">{item.product_name}</p>
              </div>
              <span className="font-mono text-sm tabular-nums">
                {money(item.price ?? 0, quote.currency)}
              </span>
            </li>
          ))}
          {unavailable.map((item) => (
            <li
              key={item.ingredient_id}
              className="flex items-center justify-between py-2.5 opacity-60"
            >
              <p className="text-sm font-medium capitalize">{item.label}</p>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#FF6B5A]">
                not here
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <a
        href={`https://maps.apple.com/?q=${encodeURIComponent(quote.store.name)}`}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex w-full items-center justify-center rounded-2xl bg-white py-3.5
                   font-mono text-[12px] uppercase tracking-[0.14em] text-[#0C0D12]
                   transition active:scale-[0.97] ease-ios"
      >
        Get directions →
      </a>
    </div>
  );
}

/** Skeleton shown while live prices + location resolve. */
export function StoreMatchSkeleton({ label }: { label?: string }) {
  return (
    <div className="rounded-4xl bg-[#0C0D12] p-6">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-ping rounded-full bg-[#3DF5A0]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
          {label ?? "Computing optimal match"}…
        </span>
      </div>
      <div className="mt-6 space-y-3 rounded-3xl bg-white/[0.04] p-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="h-4 w-12 rounded bg-white/10" />
          </div>
        ))}
      </div>
      <div className="mt-5 h-12 w-full rounded-2xl bg-white/10" />
    </div>
  );
}
