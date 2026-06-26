import type { SyncState } from "@/lib/syncStability";

/**
 * The Bio-Link corner indicator: a thin pulsing neon node + monospaced readout,
 * pinned to the edge of the graphite instrument panel. Pure CSS pulse — no JS.
 */
export function SyncIndicator({ sync }: { sync: SyncState }) {
  return (
    <div className="flex items-center gap-2">
      {/* Pulsing node */}
      <span className="relative grid h-2 w-2 place-items-center">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
          style={{ backgroundColor: sync.color }}
        />
        <span
          className="relative h-2 w-2 rounded-full"
          style={{ backgroundColor: sync.color, boxShadow: `0 0 8px 1px ${sync.color}` }}
        />
      </span>

      <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.14em] text-white/55 tabular-nums">
        System Sync: <span className="text-white/80">{sync.percent}%</span>{" "}
        <span style={{ color: sync.color }}>[{sync.tag}]</span>
      </span>
    </div>
  );
}

/**
 * The corrective directive strip, shown inside the panel only when the stream
 * has degraded. Reads as a system alert feeding the telemetry core.
 */
export function SyncDirective({ sync }: { sync: SyncState }) {
  if (!sync.directive) return null;
  return (
    <div
      className="mt-5 flex items-center gap-2 rounded-2xl border px-3 py-2.5"
      style={{ borderColor: `${sync.color}40`, backgroundColor: `${sync.color}0F` }}
    >
      <span className="font-mono text-[10px]" style={{ color: sync.color }}>
        ▸
      </span>
      <span className="font-mono text-[10px] uppercase leading-none tracking-[0.12em] text-white/70">
        {sync.directive}
      </span>
    </div>
  );
}
