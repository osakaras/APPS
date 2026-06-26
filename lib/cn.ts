/** Tiny className combiner — no dependency, falsy values dropped. */
export function clsx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
