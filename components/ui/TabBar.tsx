"use client";

import { clsx } from "@/lib/cn";

interface Tab {
  key: string;
  label: string;
  glyph: string;
  primary?: boolean;
}

const tabs: Tab[] = [
  { key: "today", label: "Today", glyph: "◎" },
  { key: "scan", label: "Scan", glyph: "⌖", primary: true },
  { key: "fridge", label: "Fridge", glyph: "❒" },
  { key: "taste", label: "Taste", glyph: "◆" },
];

/**
 * Floating tab bar with a translucent material background and a graphite
 * center scan action — monospaced labels to match the telemetry system.
 */
export function TabBar({ active = "today" }: { active?: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 mx-auto mb-4 flex w-[min(440px,92%)]
                 items-center justify-around rounded-full border border-hairline
                 bg-surface/80 px-2 py-2 shadow-card backdrop-blur-xl"
    >
      {tabs.map((t) =>
        t.primary ? (
          <a
            key={t.key}
            href="/scan"
            aria-label={t.label}
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full
                       bg-[#0C0D12] text-2xl text-white shadow-card
                       transition active:scale-90 ease-ios"
          >
            {t.glyph}
          </a>
        ) : (
          <button
            key={t.key}
            className={clsx(
              "flex min-w-[64px] flex-col items-center gap-1 rounded-2xl py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition ease-ios",
              active === t.key ? "text-ink" : "text-ink-3",
            )}
          >
            <span className="text-base leading-none">{t.glyph}</span>
            {t.label}
          </button>
        ),
      )}
    </nav>
  );
}
