"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { haptic, HAPTIC } from "@/lib/haptics";
import { clsx } from "@/lib/cn";

const LINE_INTERVAL = 520; // ms between boot lines
const SETTLE = 360; // ms after last line before "complete"

/**
 * The closing telemetry moment. A full graphite console boots through a short
 * sequence, locks in with a haptic pulse + an on-screen pulse ring, then
 * reveals "Calibration Complete / Protocol Initialized" and the entry CTA.
 * No confetti — this reads like an instrument coming online.
 */
export function CalibrationComplete({ onEnter }: { onEnter: () => void }) {
  const { d } = useLocale();
  const lines = d.success.booting;
  const [revealed, setRevealed] = useState(0); // count of completed boot lines
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setRevealed(lines.length);
      setDone(true);
      haptic(HAPTIC.success);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setRevealed(i + 1);
          haptic(HAPTIC.tick);
        }, LINE_INTERVAL * (i + 1)),
      );
    });
    timers.push(
      setTimeout(() => {
        setDone(true);
        haptic(HAPTIC.success);
      }, LINE_INTERVAL * lines.length + SETTLE),
    );

    return () => timers.forEach(clearTimeout);
  }, [lines]);

  const progress = done ? 100 : Math.round((revealed / lines.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0C0D12] px-6 text-white">
      {/* Top status rail */}
      <div className="flex items-center justify-between pt-14 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
        <span>Pl8 · Telemetry</span>
        <span className="tabular-nums">{String(progress).padStart(3, "0")}%</span>
      </div>

      {/* Center console */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* Pulse emblem */}
        <div className="relative mb-10 grid h-24 w-24 place-items-center">
          {done && (
            <>
              <span className="absolute inset-0 rounded-full bg-[#4E9E82]/30 animate-pulse-ring" />
              <span
                className="absolute inset-0 rounded-full bg-[#4E9E82]/20 animate-pulse-ring"
                style={{ animationDelay: "180ms" }}
              />
            </>
          )}
          <div
            className={clsx(
              "grid h-24 w-24 place-items-center rounded-full border transition-all duration-700 ease-ios",
              done ? "border-[#4E9E82]/60 scale-100" : "border-white/15 scale-95",
            )}
          >
            <div
              className={clsx(
                "h-3 w-3 rounded-full transition-all duration-500",
                done ? "bg-[#4E9E82] shadow-[0_0_22px_4px_rgba(78,158,130,0.7)]" : "bg-white/30",
              )}
            />
          </div>
        </div>

        {/* Boot sequence */}
        <div className="w-full max-w-[300px] space-y-2.5">
          {lines.map((line, i) => {
            const complete = i < revealed;
            return (
              <div
                key={i}
                className={clsx(
                  "flex items-center justify-between font-mono text-[12px] tracking-wide transition-opacity duration-500",
                  complete ? "opacity-100" : "opacity-35",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-white/30">{">"}</span>
                  <span className="text-white/80">{line}</span>
                </span>
                <span
                  className={clsx(
                    "text-[10px] uppercase tracking-[0.15em] transition-colors duration-300",
                    complete ? "text-[#4E9E82]" : "text-white/25",
                  )}
                >
                  {complete ? "OK" : "···"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress hairline */}
        <div className="mt-7 h-px w-full max-w-[300px] overflow-hidden bg-white/10">
          <div
            className="h-full bg-[#4E9E82] transition-all duration-500 ease-ios"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Verdict */}
        {done && (
          <div className="mt-9 text-center animate-fade-up">
            <h1 className="text-[1.7rem] font-semibold tracking-tight">
              {d.success.complete}
            </h1>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#4E9E82]">
              {d.success.initialized}
            </p>
          </div>
        )}
      </div>

      {/* Entry CTA */}
      <div className="pb-10">
        <button
          onClick={onEnter}
          disabled={!done}
          className={clsx(
            "w-full rounded-3xl py-4 text-base font-semibold transition-all duration-500 ease-ios",
            done
              ? "bg-white text-[#0C0D12] animate-fade-up active:scale-[0.97]"
              : "cursor-default bg-white/10 text-white/30",
          )}
        >
          {d.success.enter}
        </button>
      </div>
    </div>
  );
}
