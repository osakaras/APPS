// Bio-Link Stability Index ("System Sync").
//
// The app treats logged biometric data (plate scans, fridge updates) as the
// feed that keeps a telemetry core synchronized. Fresh data holds the index at
// 100%. After a 24h grace window with no new stream, the index degrades
// dynamically — a retention pressure expressed as system integrity, not a
// gamified streak.

export type SyncStatus = "stable" | "degradation_risk" | "signal_loss";

export interface SyncState {
  percent: number; // 8–100
  status: SyncStatus;
  tag: string; // bracket label, e.g. "STABLE"
  directive: string | null; // corrective instruction when degraded
  color: string; // neon indicator color
  hoursSince: number;
}

// Model constants.
const GRACE_HOURS = 24; // full sync is held for the first 24h
const DECAY_PER_HOUR = 1.15; // % lost per hour after the grace window
const FLOOR = 8; // index never reads as fully dead

const NEON = {
  stable: "#3DF5A0", // neon jade
  degradation_risk: "#FFC24B", // neon amber
  signal_loss: "#FF6B5A", // neon coral (warning, not body-shaming)
} as const;

/**
 * Compute the live sync state from the timestamp of the most recent biometric
 * data event. `now` is injectable for testing.
 */
export function computeSync(lastSyncISO: string | null, now: number = Date.now()): SyncState {
  const last = lastSyncISO ? Date.parse(lastSyncISO) : now;
  const hoursSince = Math.max(0, (now - last) / 3_600_000);

  const percent =
    hoursSince <= GRACE_HOURS
      ? 100
      : Math.max(FLOOR, Math.round(100 - (hoursSince - GRACE_HOURS) * DECAY_PER_HOUR));

  const status: SyncStatus =
    percent >= 90 ? "stable" : percent >= 35 ? "degradation_risk" : "signal_loss";

  const tag =
    status === "stable" ? "STABLE" : status === "degradation_risk" ? "DEGRADATION RISK" : "SIGNAL LOSS";

  const directive = status === "stable" ? null : "LOG BIOMETRIC DATA STREAM";

  return { percent, status, tag, directive, color: NEON[status], hoursSince };
}
