# Pl8 — AI Nutrition & Meal Discovery

A premium, ultra-high-tech "sports-medicine telemetry" nutrition app. Scan your
plate for full macro telemetry, let AI read your fridge, get recipe suggestions
ranked by what you have and what you like, and find the **cheapest, closest
store** for whatever's missing — across Lidl, Maxima, Iki, and Rimi.

Every screen reads and writes real per-user data under Row Level Security. The
app runs **end-to-end without any keys** (deterministic mocks + demo data), and
goes fully live the moment you add Supabase + Anthropic credentials.

---

## Table of contents

1. [Stack](#stack)
2. [Prerequisites](#prerequisites)
3. [Quick start (5 minutes)](#quick-start)
4. [Supabase setup](#supabase-setup)
5. [Database migrations](#database-migrations)
6. [Anthropic (AI vision) setup](#anthropic-setup)
7. [Environment variables reference](#environment-variables)
8. [Running the app](#running-the-app)
9. [How it works (the data loop)](#how-it-works)
10. [Project map](#project-map)
11. [Preview mode vs. live mode](#preview-vs-live)
12. [Troubleshooting](#troubleshooting)

---

## Stack

| Layer      | Choice                                                         |
| ---------- | -------------------------------------------------------------- |
| Frontend   | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS    |
| Backend    | Supabase — Postgres + PostGIS + Row Level Security + RPCs      |
| Auth       | Supabase anonymous auth (upgradeable to email/OAuth)           |
| AI vision  | Anthropic Claude (plate + fridge analysis), with a local mock  |
| Geo/price  | Browser geolocation + PostGIS nearest-store + cached prices    |
| i18n       | Live in-app locale switching, 8 languages                      |

---

## Prerequisites

- **Node.js 18.18+** (20 or 22 recommended) and npm
- A free **Supabase** account → <https://supabase.com>
- An **Anthropic** API key (optional but recommended) → <https://console.anthropic.com>

---

## Quick start

For a first look **without any accounts or keys** — the app renders every
screen with representative demo data:

```bash
npm install
cp .env.example .env.local   # leave the values as-is for preview mode
npm run dev                  # http://localhost:3000
```

Visit `/onboarding` to walk the full flow, or `/` for the dashboard. To run it
**live** with real data, follow the sections below.

---

## Supabase setup

1. Create a new project at <https://supabase.com/dashboard> (pick a region near
   you; the free tier is plenty).
2. Once it's provisioned, go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret)
3. Enable anonymous sign-in: **Authentication → Sign In / Providers →
   Anonymous Sign-ins → Enable**. This is what lets a visitor get a real
   `auth.users` row (and therefore a `profiles` row + RLS) with zero friction.
   You can later add email/OAuth and link identities without data loss.

> PostGIS (used for store geo-matching) ships with Supabase — migration `0001`
> enables it with `create extension if not exists postgis`.

---

## Database migrations

Four ordered SQL files in [`supabase/migrations/`](supabase/migrations/) build
the entire schema. **Run them in order** (`0001` → `0004`).

| File                       | What it creates                                                            |
| -------------------------- | -------------------------------------------------------------------------- |
| `0001_init.sql`            | Core schema: profiles, taste matrix, meals, fridge, recipes, stores, store prices, RLS policies, and the engine RPCs (`nearby_stores`, `basket_prices`). |
| `0002_onboarding.sql`      | Profile metrics + a generated `calculated_bmi` column and trigger-synced `bmi_status` enum. |
| `0003_bio_link.sql`        | `profiles.last_sync_at` + triggers that bump it on every meal/fridge write (the Bio-Link Stability Index). |
| `0004_seed_catalog.sql`    | Seed data: ingredients, 3 recipes, 4 Vilnius stores (with coordinates), and a per-chain price matrix so the engine returns real results. |

### Option A — Supabase SQL Editor (simplest)

1. Open your project → **SQL Editor → New query**.
2. Paste the contents of `0001_init.sql`, click **Run**.
3. Repeat for `0002`, `0003`, `0004` in order.

### Option B — Supabase CLI (reproducible)

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>   # ref is in your project URL
supabase db push                                  # applies everything in supabase/migrations
```

### Verify it worked

In the SQL Editor:

```sql
select count(*) from public.ingredients;   -- expect 13
select count(*) from public.stores;        -- expect 4
select count(*) from public.recipes;       -- expect 3
```

---

## Anthropic setup

The Plate Scanner and Fridge Inspector use Claude vision.

1. Get a key at <https://console.anthropic.com> → **API Keys**.
2. Set `ANTHROPIC_API_KEY` in `.env.local`.
3. (Optional) Override the model with `ANTHROPIC_VISION_MODEL` (defaults to
   `claude-opus-4-8`).

**No key?** Both scanners fall back to a deterministic, clearly-labeled mock
(`ai_model = "mock"`), so the capture → analyze → log → taste-matrix loop still
works end to end — handy for UI work and demos.

---

## Environment variables

Create `.env.local` (from `.env.example`). `.env.local` is gitignored.

| Variable                         | Required?   | Purpose                                                                 |
| -------------------------------- | ----------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | **Yes**     | Supabase project URL (browser + server).                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | **Yes**     | Supabase anon key; all access still constrained by RLS.                 |
| `SUPABASE_SERVICE_ROLE_KEY`      | Recommended | Server-only. Lets scanners/manual entry create new canonical ingredients. Without it, unknown foods store a null ingredient_id. |
| `ANTHROPIC_API_KEY`              | Recommended | Real AI vision. Without it → labeled mock analysis.                     |
| `ANTHROPIC_VISION_MODEL`         | No          | Override the vision model id.                                           |

> If `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` are absent, the app runs in
> **preview mode**: no auth, no persistence, demo data everywhere. This is by
> design (see `lib/supabase/env.ts → hasSupabaseEnv()`).

---

## Running the app

```bash
npm install        # install dependencies
npm run dev        # dev server with HMR → http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

First live run: open `http://localhost:3000`. With no profile yet you'll be
routed to `/onboarding`. Complete it (Language → Metrics → Composition →
Calibration) and you'll land on the Today dashboard with your real data.

---

## How it works

The core loop, and how the pieces feed each other:

```
Onboarding ──► profiles (metrics, language, BMI, bmi_status)
     │
     ▼
Today dashboard ──reads──► targets (Mifflin–St Jeor), today's meals, Bio-Link sync
     │
     ├─► Plate Scanner  ──► meals + meal_items ──► taste_preferences (rolling score)
     │                              │
     │                              └──► trigger bumps last_sync_at → System Sync = 100%
     │
     ├─► Fridge Inspector ──► fridge_items ──► recipe suggestions (coverage × taste)
     │                              │
     │                              └──► Price/Geo engine: nearby_stores × basket_prices
     │                                   ranked by cost + distance → cheapest, closest store
     │
     └─► Taste & Health Matrix ──► view/edit taste graph + goal protocols
```

- **Bio-Link Stability Index** — every scan/fridge write refreshes
  `last_sync_at`; the dashboard computes a live-degrading "System Sync" %
  (`lib/syncStability.ts`). Logging data keeps the telemetry core synced.
- **Price/geo engine** — `app/api/match` resolves a recipe's missing
  ingredients (recipe − fridge), prices them per store via the `basket_prices`
  RPC across `nearby_stores`, ranks by `cost + 0.35 €/km × distance`, and
  applies a completeness penalty so a cheaper-but-incomplete store can't win.

---

## Project map

```
app/
  layout.tsx                 App shell
  page.tsx                   Today dashboard (Bio-Link, energy + macro telemetry)
  onboarding/                Language → Metrics → BMI telemetry → Calibration
  scan/                      AI Plate Scanner
  fridge/                    AI Fridge Inspector (inventory edit + suggestions)
  taste/                     Taste & Health Matrix (editable)
  profile/                   Settings (metrics, language, taste link)
  api/
    onboarding/              Persist onboarding
    scan/  scan/sentiment/   Analyze plate, log palate → taste matrix
    fridge/scan  /suggest  /items[/id]   Inspect, rank recipes, manual CRUD
    match/                   Price/geo matching engine
    taste/goals  /pref       Goal protocols, manual taste prefs
    profile/                 Edit metrics + language
components/                  ui/, onboarding/, scan/, fridge/, recipe/, taste/, profile/, auth/
lib/
  supabase/                  Browser + server + admin clients, middleware, env guard
  engine/                    geo (haversine), priceMatch (pure ranking)
  ai/                        vision adapters + mocks
  i18n/                      8-locale dictionary + LocaleProvider
  bmi.ts nutrition.ts syncStability.ts recipes.ts taste.ts ingredients.ts
supabase/migrations/         0001 → 0004
middleware.ts                Refreshes the Supabase session per request
```

---

## Preview vs. live

| Capability            | Preview (no keys)            | Live (Supabase + Anthropic)             |
| --------------------- | ---------------------------- | --------------------------------------- |
| All screens render    | ✅ (demo data)               | ✅ (your data)                          |
| Auth + persistence    | ❌                           | ✅ anonymous session, RLS               |
| AI vision             | Labeled mock                 | ✅ Claude                               |
| Recipe match / prices | Demo store quotes            | ✅ live engine over seeded stores       |
| Taste graph / goals   | Demo + local-only edits      | ✅ persisted                            |

---

## Troubleshooting

- **Redirected to `/onboarding` every time** — you haven't completed
  onboarding (no `onboarded_at`), or anonymous sign-in isn't enabled in
  Supabase. Enable it under Authentication → Providers.
- **Scans always return the same "Grilled chicken & quinoa bowl"** — that's the
  mock; set `ANTHROPIC_API_KEY` for real analysis.
- **A scanned food doesn't show up in recipe matching** — it didn't resolve to
  a canonical ingredient. Add `SUPABASE_SERVICE_ROLE_KEY` so the catalog can
  grow new ingredients.
- **`store match` returns nothing** — confirm migration `0004` ran
  (`select count(*) from stores;` should be 4) and that you allowed location
  access (it falls back to Vilnius centre otherwise).
- **PostGIS / `geography` errors on migrate** — run `0001` first; it enables the
  extension before any geo columns are created.

---

Built as a single coherent system: scan your plate, read your fridge, and let
the engine find the cheapest, closest place to make up the difference.
