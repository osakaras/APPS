"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the element animates in. */
  delay?: number;
  /** Initial vertical offset in px (positive = rises up into place). */
  y?: number;
  /** Animate immediately on mount instead of waiting for scroll. */
  onLoad?: boolean;
}

/** Fade-and-rise reveal, triggered on scroll into view (or on load). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  onLoad = false,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  const initial = reduceMotion ? { opacity: 0 } : { opacity: 0, y };
  const visible = {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.21, 0.65, 0.35, 1] as const },
  };

  return (
    <motion.div
      className={className}
      initial={initial}
      {...(onLoad
        ? { animate: visible }
        : { whileInView: visible, viewport: { once: true, margin: "-80px" } })}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.21, 0.65, 0.35, 1] },
  },
};

/** Parent that staggers its <StaggerItem> children as they scroll into view. */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}
