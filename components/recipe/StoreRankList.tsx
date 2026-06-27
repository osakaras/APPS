import type { RetailChain, StoreQuote } from "@/lib/types";
import { formatDistance } from "@/lib/engine/geo";
import { clsx } from "@/lib/cn";

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
 * The full price/distance matrix: every candidate chain ranked, not just the
 * winner. Tapping a row focuses that store's breakdown above.
 */
export function StoreRankList({
  quotes,
  selectedId,
  onSelect,
  label,
}: {
  quotes: StoreQuote[];
  selectedId: string;
  onSelect: (q: StoreQuote) => void;
  label: string;
}) {
  return (
    <div className="mt-4">
      <p className="mb-2 px-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
        {label} · {quotes.length}
      </p>
      <div className="space-y-2">
        {quotes.map((q, i) => {
          const selected = q.store.id === selectedId;
          return (
            <button
              key={q.store.id}
              onClick={() => onSelect(q)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.98] ease-ios",
                selected
                  ? "border-ink/70 bg-surface shadow-card"
                  : "border-hairline bg-surface/60",
              )}
            >
              <span className="font-mono text-[11px] tabular-nums text-ink-3">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {CHAIN_LABEL[q.store.chain]}
                  <span className="ml-2 font-normal text-ink-3">
                    {formatDistance(q.distance_m)}
                  </span>
                </p>
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em]">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: q.complete ? "#3DA37A" : "#FFC24B" }}
                  />
                  <span style={{ color: q.complete ? "#3DA37A" : "#B08A52" }}>
                    {q.complete ? "in stock" : "partial"}
                  </span>
                </p>
              </div>

              <span className="font-mono text-base font-semibold tabular-nums">
                {money(q.total_cost, q.currency)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
