"use client";

import { useState } from "react";
import { clsx } from "@/lib/cn";

interface MetricFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
  /** Max sensible value — keeps the live BMI from absurd inputs. */
  max?: number;
}

/**
 * A large, minimal numeric field with a trailing unit and an iOS-style focus
 * ring. Accepts only digits + one decimal so the BMI math never sees garbage.
 */
export function MetricField({
  label,
  value,
  onChange,
  unit,
  placeholder = "0",
  max = 999,
}: MetricFieldProps) {
  const [focused, setFocused] = useState(false);

  function handle(raw: string) {
    const cleaned = raw.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    if (cleaned === "") return onChange("");
    if (Number(cleaned) > max) return;
    onChange(cleaned);
  }

  return (
    <label className="block">
      <span className="mb-2 block px-1 text-sm font-medium text-ink-2">{label}</span>
      <div
        className={clsx(
          "flex items-center rounded-3xl border bg-surface px-5 py-4 transition duration-300 ease-ios",
          focused
            ? "border-accent/60 shadow-[0_0_0_4px_rgba(10,132,255,0.12)]"
            : "border-hairline shadow-card",
        )}
      >
        <input
          value={value}
          onChange={(e) => handle(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputMode="decimal"
          placeholder={placeholder}
          className="w-full bg-transparent text-3xl font-semibold tracking-tight
                     tabular-nums outline-none placeholder:text-ink-3"
        />
        {unit && (
          <span className="ml-2 shrink-0 text-base font-medium text-ink-2">{unit}</span>
        )}
      </div>
    </label>
  );
}
