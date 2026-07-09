import type { Config } from "tailwindcss";

/**
 * Kepalas Bakery — strict 3-color warm palette.
 *
 *  1. Sand (Smėlis)      — warm, light background base
 *  2. Caramel (Karamelė) — rich, appetizing accent
 *  3. Soft Brown (Ruda)  — dark text & deep contrast
 *
 * No cold colors (blue / purple / etc.) anywhere.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#FCF9F3",
          100: "#F8F1E5",
          200: "#F1E4CE",
          300: "#E8D3B2",
          400: "#DCBE92",
          500: "#CEA873",
        },
        caramel: {
          300: "#E3B672",
          400: "#D8A155",
          500: "#C8873B",
          600: "#AC6E2B",
          700: "#8D5822",
        },
        brown: {
          300: "#B2916F",
          400: "#977353",
          500: "#7C5B3E",
          600: "#63462D",
          700: "#503823",
          800: "#3D2A1A",
          900: "#2C1E12",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
      },
      boxShadow: {
        warm: "0 20px 50px -12px rgba(80, 56, 35, 0.25)",
        "warm-lg": "0 32px 80px -16px rgba(80, 56, 35, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
