# BIOLINK OS — Metabolic Telemetry Deck

A single-file, production-style prototype of a premium nutrition & bio-telemetry OS.
Apple-HIG-inspired design: pure black canvas, graphite panels (`#1c1c1e`), glassmorphism,
jade/amber telemetry accents, monospaced data metrics, zero emojis.

## Run it

Open `index.html` in any modern browser — the file is fully self-contained
(React 18, ReactDOM and the Tailwind engine are inlined; the app code is
precompiled JSX), so it works offline with zero external dependencies. Or serve it:

```sh
cd nutrition-os && python3 -m http.server 8080
# → http://localhost:8080
```

## Editing

The authored JSX lives in `src/app.jsx`. To rebuild after changes, compile it and
replace the application `<script>` block in `index.html`:

```sh
npx babel --presets @babel/preset-react src/app.jsx   # runtime: classic
```

## Architecture

| Layer | Implementation |
|---|---|
| Frontend | React 18 + Tailwind (inlined, self-contained), Lucide-style thin-line SVG icon layer |
| Backend | Supabase PostgreSQL schema (profiles, taste_matrix, fridge_inventory, meal_logs) with RLS — full SQL embedded in the file and viewable in-app under **System → Supabase Schema** |
| Persistence | `createSupabaseMock()` — supabase-js call-shape backed by localStorage (swap in `createClient()` for production) |
| AI Vision | `analyzePlateImage()` — real Anthropic Messages API multimodal call when `window.ANTHROPIC_API_KEY` is set; deterministic on-device inference simulator otherwise |

## The 5 Engines

- **A · Onboarding Telemetry** — language → metric input → live BMI gauge mapping tiers to biological advantages → "Calibration Complete" with haptic pulse
- **B · Bio-Link Stability Index** — sync ring (100% STABLE ↔ 72% DEGRADATION RISK) with degradation simulator toggle
- **C · AI Plate Scanner** — optical-sensor UI, scan phases, macro extraction, Metabolic Load Rating, Taste Matrix commit
- **D · Fridge Inspector & Predictive Matcher** — cold-chain inventory + 3 recipes ranked by live Match % (taste-matrix weighted)
- **E · Geo-Price Matching Matrix** — 4-store basket comparison (Lidl / Maxima / Iki / Rimi) ranked by price + distance; out-of-stock items demote a store to rank #4

## Live API mode

```html
<script>window.ANTHROPIC_API_KEY = 'sk-ant-…';</script>
```

before the app script enables real Claude vision inference on plate scans.
