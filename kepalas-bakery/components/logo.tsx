import { cn } from "@/lib/utils";

/** Line-art bread loaf from the original KEPALAS Bakery logo. */
export function LoafIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 44"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M6 30 C 10 15, 32 7, 52 7 C 73 7, 91 15, 94 25 C 95.5 30, 91 35.5, 83 37.5 C 63 41.5, 25 41.5, 12 37 C 7.5 35.4, 5 33, 6 30 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M35 14 q 7 6.5 5 14.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M50 11.5 q 7 6.5 5 15"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M65 12 q 7 6.5 5 14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Original KEPALAS Bakery lockup — loaf mark plus letterspaced wordmark.
 * Inherits its color from the parent (dark text on sand, sand on brown).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LoafIcon className="h-8 w-auto shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-[0.95rem] font-semibold uppercase tracking-[0.32em]">
          Kepalas
        </span>
        <span className="mt-1.5 text-[0.55rem] font-medium uppercase tracking-[0.52em] opacity-80">
          Bakery
        </span>
      </span>
    </span>
  );
}
