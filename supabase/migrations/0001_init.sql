-- ============================================================================
-- Pl8 — Core schema
-- Supports: Taste & Health Matrix, AI Plate Scanner, Fridge Inventory,
--           dynamic Recipe Matching, and the Local Store Price/Distance matrix.
-- Postgres 15 (Supabase). Geospatial via PostGIS. Row Level Security throughout.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "postgis";
create extension if not exists "pg_trgm";   -- fuzzy ingredient name matching

-- ─── Enumerated types ───────────────────────────────────────────────────────
create type health_rating as enum ('poor', 'fair', 'good', 'great', 'excellent');
create type sentiment      as enum ('loved', 'liked', 'neutral', 'disliked', 'hated');
create type goal_kind      as enum (
  'lose_weight', 'maintain', 'gain_muscle', 'high_protein',
  'low_carb', 'low_sugar', 'heart_health', 'gut_health', 'custom'
);
create type measure_unit   as enum ('g', 'kg', 'ml', 'l', 'pcs', 'tbsp', 'tsp', 'cup', 'pinch');
create type retail_chain   as enum ('lidl', 'maxima', 'iki', 'rimi', 'other');
create type stock_state    as enum ('in_stock', 'low_stock', 'out_of_stock', 'unknown');

-- ============================================================================
-- 1. PROFILES  (1:1 with auth.users)
-- ============================================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  -- Live location for geo-matching (updated opportunistically by the client).
  last_location geography(point, 4326),
  locale        text not null default 'en',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================================
-- 2. TASTE & HEALTH MATRIX
-- ============================================================================
-- Health goals — a user can hold several active goals at once.
create table public.health_goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        goal_kind not null,
  -- Optional numeric targets, all nullable so the UI can stay minimal.
  target_kcal       int,
  target_protein_g  int,
  target_carbs_g    int,
  target_fat_g      int,
  notes       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index health_goals_user_idx on public.health_goals(user_id) where is_active;

-- Canonical, deduplicated ingredient catalog. Recipes, fridge items, scanned
-- meals and store products all resolve to a row here so matching is exact.
create table public.ingredients (
  id            uuid primary key default uuid_generate_v4(),
  canonical_name text not null unique,         -- e.g. "chicken breast"
  category      text,                          -- "protein", "dairy", "produce"...
  default_unit  measure_unit not null default 'g',
  -- Per-100g reference macros for quick recipe estimation.
  kcal_per_100  numeric(7,2),
  protein_per_100 numeric(6,2),
  carbs_per_100   numeric(6,2),
  fat_per_100     numeric(6,2),
  created_at    timestamptz not null default now()
);
create index ingredients_name_trgm on public.ingredients using gin (canonical_name gin_trgm_ops);

-- Aliases so AI vision output ("grilled chicken") maps to a canonical ingredient.
create table public.ingredient_aliases (
  alias         text primary key,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade
);
create index ingredient_aliases_ing_idx on public.ingredient_aliases(ingredient_id);

-- The dynamic taste graph: how a user feels about a given ingredient/tag.
-- Score is a rolling [-1.0 .. 1.0]. Updated every time a meal is rated.
create table public.taste_preferences (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id) on delete cascade,
  tag           text,                          -- free tag, e.g. "spicy", "thai"
  score         numeric(3,2) not null default 0 check (score between -1 and 1),
  samples       int not null default 0,        -- evidence count for confidence
  updated_at    timestamptz not null default now(),
  -- A preference is keyed by either an ingredient or a tag, not both null.
  constraint taste_target check (ingredient_id is not null or tag is not null),
  unique (user_id, ingredient_id, tag)
);
create index taste_pref_user_idx on public.taste_preferences(user_id);

-- ============================================================================
-- 3. AI PLATE SCANNER  (scanned meals + detected items + feedback)
-- ============================================================================
create table public.meals (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  image_url     text,
  title         text,                          -- AI-generated label
  kcal          int,
  protein_g     numeric(6,2),
  carbs_g       numeric(6,2),
  fat_g         numeric(6,2),
  health_rating health_rating,
  health_notes  text,                          -- the holistic AI explanation
  -- "Was it delicious?" — drives the taste graph.
  sentiment     sentiment,
  ai_model      text,                          -- provenance of the analysis
  ai_confidence numeric(4,3),
  eaten_at      timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index meals_user_time_idx on public.meals(user_id, eaten_at desc);

create table public.meal_items (
  id            uuid primary key default uuid_generate_v4(),
  meal_id       uuid not null references public.meals(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id) on delete set null,
  label         text not null,                 -- raw detected label
  quantity      numeric(8,2),
  unit          measure_unit,
  confidence    numeric(4,3)
);
create index meal_items_meal_idx on public.meal_items(meal_id);

-- ============================================================================
-- 4. FRIDGE INVENTORY  (AI Fridge Inspector state)
-- ============================================================================
create table public.fridge_items (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id) on delete set null,
  label         text not null,                 -- as detected / entered
  quantity      numeric(8,2),
  unit          measure_unit not null default 'pcs',
  -- Provenance: was this added by a fridge scan or by hand?
  source        text not null default 'scan' check (source in ('scan', 'manual')),
  expires_on    date,
  added_at      timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index fridge_items_user_idx on public.fridge_items(user_id);
create index fridge_items_ing_idx  on public.fridge_items(ingredient_id);

-- ============================================================================
-- 5. RECIPES  &  RECIPE MATCHING
-- ============================================================================
create table public.recipes (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  summary       text,
  image_url     text,
  cuisine       text,
  tags          text[] not null default '{}',
  servings      int not null default 2,
  prep_minutes  int,
  kcal_per_serving      int,
  protein_per_serving_g numeric(6,2),
  carbs_per_serving_g   numeric(6,2),
  fat_per_serving_g     numeric(6,2),
  steps         jsonb not null default '[]',   -- ordered instruction blocks
  -- Null author = global/seed recipe; otherwise user-generated.
  author_id     uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index recipes_tags_idx on public.recipes using gin (tags);

create table public.recipe_ingredients (
  id            uuid primary key default uuid_generate_v4(),
  recipe_id     uuid not null references public.recipes(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  quantity      numeric(8,2) not null,
  unit          measure_unit not null default 'g',
  is_optional   boolean not null default false,
  unique (recipe_id, ingredient_id)
);
create index recipe_ing_recipe_idx on public.recipe_ingredients(recipe_id);
create index recipe_ing_ing_idx    on public.recipe_ingredients(ingredient_id);

-- ============================================================================
-- 6. STORES  &  PRICE / DISTANCE MATRIX  (the critical engine)
-- ============================================================================
-- Physical store locations across the local retail chains.
create table public.stores (
  id            uuid primary key default uuid_generate_v4(),
  chain         retail_chain not null,
  name          text not null,                 -- "Maxima X Akropolis"
  address       text,
  location      geography(point, 4326) not null,
  opening_hours jsonb,                          -- structured weekly hours
  created_at    timestamptz not null default now()
);
-- GiST index makes "nearest stores to me" queries fast.
create index stores_location_gix on public.stores using gist (location);
create index stores_chain_idx    on public.stores(chain);

-- A product as carried by a specific store, linked to a canonical ingredient.
create table public.store_products (
  id            uuid primary key default uuid_generate_v4(),
  store_id      uuid not null references public.stores(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  product_name  text not null,                 -- "Rimi Chicken Breast Fillet 500g"
  pack_size     numeric(8,2),                  -- numeric size in `unit`
  unit          measure_unit not null default 'g',
  price         numeric(10,2) not null,        -- pack price, store currency
  currency      char(3) not null default 'EUR',
  stock         stock_state not null default 'unknown',
  -- Cache freshness: how recently the price/stock was fetched from the provider.
  fetched_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '6 hours'),
  unique (store_id, ingredient_id, product_name)
);
create index store_products_store_idx on public.store_products(store_id);
create index store_products_ing_idx   on public.store_products(ingredient_id);
-- Composite index drives the per-store cheapest-price lookup for a basket.
create index store_products_basket_idx
  on public.store_products(ingredient_id, store_id, price);

-- Persisted result of a price/geo match run (so the gorgeous result card is
-- instant on revisit and we can audit the engine's recommendations).
create table public.grocery_matches (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  recipe_id       uuid references public.recipes(id) on delete set null,
  origin          geography(point, 4326) not null,   -- user location at run time
  -- The winning store and the economics behind the decision.
  winner_store_id uuid references public.stores(id) on delete set null,
  total_cost      numeric(10,2),
  currency        char(3) not null default 'EUR',
  distance_m      numeric(10,1),
  -- Full ranked breakdown of every candidate store + missing-item costs.
  breakdown       jsonb not null default '[]',
  created_at      timestamptz not null default now()
);
create index grocery_matches_user_idx on public.grocery_matches(user_id, created_at desc);

-- ============================================================================
-- 7. TRIGGERS  —  keep updated_at honest
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger profiles_touch      before update on public.profiles      for each row execute function public.touch_updated_at();
create trigger fridge_items_touch  before update on public.fridge_items  for each row execute function public.touch_updated_at();
create trigger taste_pref_touch    before update on public.taste_preferences for each row execute function public.touch_updated_at();

-- Auto-provision a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================================
-- Per-user private tables: owner-only access.
alter table public.profiles          enable row level security;
alter table public.health_goals      enable row level security;
alter table public.taste_preferences enable row level security;
alter table public.meals             enable row level security;
alter table public.meal_items        enable row level security;
alter table public.fridge_items      enable row level security;
alter table public.grocery_matches   enable row level security;

create policy "own profile"        on public.profiles          for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own goals"          on public.health_goals      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own taste"          on public.taste_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own meals"          on public.meals             for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own fridge"         on public.fridge_items      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own matches"        on public.grocery_matches   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- meal_items inherit ownership through their parent meal.
create policy "own meal items" on public.meal_items for all
  using (exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.meals m where m.id = meal_id and m.user_id = auth.uid()));

-- Shared reference tables: readable by any authenticated user, written by
-- service role only (price ingestion + catalog seeding run server-side).
alter table public.ingredients        enable row level security;
alter table public.ingredient_aliases enable row level security;
alter table public.recipes            enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.stores             enable row level security;
alter table public.store_products     enable row level security;

create policy "read ingredients"  on public.ingredients        for select using (auth.role() = 'authenticated');
create policy "read aliases"      on public.ingredient_aliases for select using (auth.role() = 'authenticated');
create policy "read stores"       on public.stores             for select using (auth.role() = 'authenticated');
create policy "read products"     on public.store_products     for select using (auth.role() = 'authenticated');
-- Recipes: everyone reads globals; authors fully control their own.
create policy "read recipes"      on public.recipes for select using (author_id is null or auth.uid() = author_id);
create policy "write own recipes" on public.recipes for all
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "read recipe ings"  on public.recipe_ingredients for select using (true);

-- ============================================================================
-- 9. CORE ENGINE RPCs
-- ============================================================================
-- Nearest stores to a point, used to bound the price-match search radius.
create or replace function public.nearby_stores(
  lat double precision,
  lng double precision,
  radius_m double precision default 8000,
  max_results int default 20
)
returns table (store_id uuid, chain retail_chain, name text, distance_m double precision)
language sql stable as $$
  select s.id, s.chain, s.name,
         st_distance(s.location, st_makepoint(lng, lat)::geography) as distance_m
  from public.stores s
  where st_dwithin(s.location, st_makepoint(lng, lat)::geography, radius_m)
  order by distance_m asc
  limit max_results;
$$;

-- For a basket of ingredient ids, return the cheapest fresh in-stock product
-- per (store, ingredient). The application layer sums these per store and
-- combines with distance to choose the winner.
create or replace function public.basket_prices(
  ingredient_ids uuid[],
  store_ids uuid[]
)
returns table (
  store_id uuid,
  ingredient_id uuid,
  product_name text,
  price numeric,
  unit measure_unit,
  pack_size numeric,
  stock stock_state
)
language sql stable as $$
  select distinct on (sp.store_id, sp.ingredient_id)
         sp.store_id, sp.ingredient_id, sp.product_name,
         sp.price, sp.unit, sp.pack_size, sp.stock
  from public.store_products sp
  where sp.ingredient_id = any(ingredient_ids)
    and sp.store_id = any(store_ids)
    and sp.expires_at > now()
    and sp.stock <> 'out_of_stock'
  order by sp.store_id, sp.ingredient_id, sp.price asc;
$$;
