"use client";

import { LOCALES, type LocaleCode } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { clsx } from "@/lib/cn";

/**
 * Step 1 — a bento grid of language cards. Tapping one switches the app's
 * locale instantly (every screen re-renders), and visibly selects the card.
 */
export function LanguageStep() {
  const { locale, setLocale, d } = useLocale();

  return (
    <div className="animate-pop-in">
      <h1 className="text-3xl font-semibold tracking-tight">{d.lang.title}</h1>
      <p className="mt-2 text-ink-2">{d.lang.subtitle}</p>

      <div className="mt-7 grid grid-cols-2 gap-3">
        {LOCALES.map((l) => {
          const active = l.code === (locale as LocaleCode);
          return (
            <button
              key={l.code}
              onClick={() => setLocale(l.code)}
              className={clsx(
                "flex items-center gap-3 rounded-3xl border bg-surface p-4 text-left",
                "transition duration-300 ease-ios active:scale-[0.97]",
                active
                  ? "border-accent/70 shadow-[0_0_0_4px_rgba(10,132,255,0.12)]"
                  : "border-hairline shadow-card hover:-translate-y-0.5 hover:shadow-card-hover",
              )}
            >
              <span className="text-3xl leading-none">{l.flag}</span>
              <span className="flex-1">
                <span className="block font-semibold leading-tight">{l.native}</span>
                <span className="text-xs uppercase tracking-wide text-ink-3">
                  {l.code}
                </span>
              </span>
              <span
                className={clsx(
                  "grid h-6 w-6 place-items-center rounded-full text-white transition duration-300",
                  active ? "bg-accent scale-100" : "scale-0",
                )}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
