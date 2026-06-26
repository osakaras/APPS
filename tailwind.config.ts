import type { Config } from "tailwindcss";

/**
 * Design tokens tuned to Apple HIG: a calm neutral surface system, a single
 * vivid system accent, generous continuous-curvature radii, and the soft,
 * layered shadows used across iOS bento layouts.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // System background ramp (light).
        canvas: "#F2F2F7", // iOS systemGroupedBackground
        surface: "#FFFFFF",
        elevated: "#FBFBFD",
        hairline: "rgba(60,60,67,0.12)",
        // Content.
        ink: "#1C1C1E", // label
        "ink-2": "rgba(60,60,67,0.6)", // secondaryLabel
        "ink-3": "rgba(60,60,67,0.3)", // tertiaryLabel
        // Accents (iOS system palette).
        accent: "#0A84FF",
        mint: "#30D158",
        amber: "#FF9F0A",
        coral: "#FF453A",
        grape: "#BF5AF2",
      },
      fontFamily: {
        // SF Pro is the system face on Apple platforms; -apple-system pulls it
        // natively, with Inter as the cross-platform stand-in.
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        // Squircle-scale radii for bento cards.
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
        squircle: "2.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        "card-hover": "0 2px 4px rgba(0,0,0,0.05), 0 16px 40px rgba(0,0,0,0.10)",
        float: "0 12px 48px rgba(10,132,255,0.18)",
      },
      transitionTimingFunction: {
        // The spring-like ease used by UIKit animations.
        ios: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s infinite",
        "pop-in": "pop-in 0.5s cubic-bezier(0.32,0.72,0,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
