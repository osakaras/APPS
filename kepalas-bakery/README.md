# Kepalas Bakery — kepalasbakery.lt

Next.js (App Router) MVP for the Kepalas Bakery website.

## Stack

- **Next.js 15** + React 19 + TypeScript
- **Tailwind CSS** with a strict 3-color warm palette:
  - `sand` (Smėlis) — warm light background base
  - `caramel` (Karamelė) — rich appetizing accent
  - `brown` (Švelni ruda) — dark text & deep contrast
- **Framer Motion** — scroll reveals, staggered grids, floating badges
- **shadcn-style Button** + the mandatory `ButtonColorful` CTA component
  (gradient rewritten from indigo/purple/pink to sand/caramel/brown)

## Pages

- `/` — landing: hero, marquee, product grid, craft values, story teaser, order CTA
- `/istorija` — the bakery's story: drop-cap narrative, pull quote, animated timeline, principles

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```
