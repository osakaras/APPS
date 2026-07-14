import { clsx } from "@/lib/cn";
import type { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  /** Adds the hover lift + active press affordance for tappable cards. */
  interactive?: boolean;
  /** Grid span helpers for the bento layout. */
  span?: "1" | "2" | "full";
  as?: "div" | "button" | "a";
  href?: string;
  onClick?: () => void;
}

const spanClass: Record<NonNullable<BentoCardProps["span"]>, string> = {
  "1": "col-span-1",
  "2": "col-span-2",
  full: "col-span-2 sm:col-span-3",
};

export function BentoCard({
  children,
  className,
  interactive,
  span = "1",
  as = "div",
  href,
  onClick,
}: BentoCardProps) {
  const Tag = as as unknown as React.ElementType;
  return (
    <Tag
      {...(as === "a" ? { href } : {})}
      onClick={onClick}
      className={clsx(
        interactive ? "bento-interactive" : "bento",
        spanClass[span],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
