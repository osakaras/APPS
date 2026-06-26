# Pl8 — AI Nutrition & Meal Discovery

A premium, Apple-HIG-styled nutrition app: scan your plate for macros, let AI
read your fridge, and find the **cheapest, closest store** for whatever a
recipe is missing.

## Stack

| Layer      | Choice                                              |
| ---------- | --------------------------------------------------- |
| Frontend   | Next.js 14 (App Router), React 18, Tailwind         |
| Backend    | Supabase (Postgres + PostGIS + RLS + RPCs)          |
| AI Vision  | Anthropic Claude vision (plate + fridge analysis)   |
| Geo/Price  | PostGIS nearest-store + cached per-store price rows  |

## Core features

1. **AI Plate Scanner** — photo → macros, holistic health rating, taste memory.
2. **AI Fridge Inspector** — photo → inventory, cross-referenced to taste graph.
3. **Price & Geo-Matching Engine** — for a chosen recipe, computes missing
   ingredients, prices them across Lidl / Maxima / Iki / Rimi near the user, and
   surfaces the cheapest+closest store. See `app/api/match/route.ts` and
   `lib/engine/priceMatch.ts`.
4. **Taste & Health Matrix** — a dynamic preference graph (`taste_preferences`).

## Getting started

```bash
cp .env.example .env.local      # fill in Supabase + Anthropic keys
npm install
# Apply the schema to your Supabase project:
#   supabase db push   (or paste supabase/migrations/0001_init.sql in the SQL editor)
npm run dev
```

## Project map

```
app/
  layout.tsx            App shell + viewport
  page.tsx              "Today" bento dashboard
  api/match/route.ts    Price/geo matching engine endpoint
components/ui/          Bento card, macro ring, store-match card, tab bar
lib/
  engine/geo.ts         Haversine + distance formatting
  engine/priceMatch.ts  Missing-ingredient diff + store ranking (pure)
  ai/vision.ts          Claude vision adapters
  supabase/             Browser + server + admin clients
  types.ts              Shared domain types (mirror the schema)
supabase/migrations/
  0001_init.sql         Full schema: taste matrix, fridge, recipes, store prices
```

## The engine in one breath

`recipe_ingredients − fridge_items → missing[]`, priced via `basket_prices(...)`
across `nearby_stores(lat,lng,radius)`, ranked by
`total_cost + 0.35 €/km × distance`, persisted to `grocery_matches`.
