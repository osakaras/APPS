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
  { key: "scan", label: "Scan", glyph: "＋", primary: true },
  { key: "fridge", label: "Fridge", glyph: "❄" },
  { key: "taste", label: "Taste", glyph: "♥" },
];

/**
 * Floating iOS-style tab bar with a translucent material background and a
 * prominent center scan action.
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
          <button
            key={t.key}
            aria-label={t.label}
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full
                       bg-accent text-2xl text-white shadow-float
                       transition active:scale-90 ease-ios"
          >
            {t.glyph}
          </button>
        ) : (
          <button
            key={t.key}
            className={clsx(
              "flex min-w-[64px] flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium transition ease-ios",
              active === t.key ? "text-accent" : "text-ink-2",
            )}
          >
            <span className="text-lg leading-none">{t.glyph}</span>
            {t.label}
          </button>
        ),
      )}
    </nav>
  );
}
