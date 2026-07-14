"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DICTIONARIES, type Dict, type LocaleCode } from "@/lib/i18n/dictionary";

interface LocaleContextValue {
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => void;
  d: Dict;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Holds the active locale and exposes the matching dictionary. Switching the
 * locale instantly re-renders every consumer — that's what makes the language
 * picker feel live.
 */
export function LocaleProvider({
  initial = "en",
  children,
}: {
  initial?: LocaleCode;
  children: ReactNode;
}) {
  const [locale, setLocale] = useState<LocaleCode>(initial);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, d: DICTIONARIES[locale] }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
