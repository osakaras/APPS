-- ============================================================================
-- Seed catalog: ingredients, recipes, Vilnius stores, and a price matrix.
-- Makes the recipe matcher and the price/geo engine return real results.
-- ============================================================================

-- ─── Ingredients (per-100 reference macros) ─────────────────────────────────
insert into public.ingredients (canonical_name, category, default_unit, kcal_per_100, protein_per_100, carbs_per_100, fat_per_100) values
  ('chicken breast', 'protein', 'g', 165, 31, 0, 3.6),
  ('quinoa', 'grain', 'g', 120, 4.4, 21, 1.9),
  ('baby spinach', 'produce', 'g', 23, 2.9, 3.6, 0.4),
  ('cherry tomato', 'produce', 'g', 18, 0.9, 3.9, 0.2),
  ('olive oil', 'fat', 'ml', 884, 0, 0, 100),
  ('feta', 'dairy', 'g', 264, 14, 4, 21),
  ('salmon fillet', 'protein', 'g', 208, 20, 0, 13),
  ('broccoli', 'produce', 'g', 34, 2.8, 7, 0.4),
  ('brown rice', 'grain', 'g', 123, 2.7, 26, 1),
  ('garlic', 'produce', 'g', 149, 6, 33, 0.5),
  ('chickpeas', 'protein', 'g', 164, 9, 27, 2.6),
  ('bell pepper', 'produce', 'g', 31, 1, 6, 0.3),
  ('red onion', 'produce', 'g', 40, 1.1, 9, 0.1)
on conflict (canonical_name) do nothing;

-- ─── Recipes ────────────────────────────────────────────────────────────────
insert into public.recipes (title, summary, cuisine, tags, servings, prep_minutes, kcal_per_serving, protein_per_serving_g, carbs_per_serving_g, fat_per_serving_g, steps) values
  ('Chicken & Quinoa Power Bowl', 'Lean protein over quinoa with greens and feta.', 'Mediterranean', '{high_protein,bowl}', 2, 25, 540, 42, 48, 18,
   '[{"step":"Cook quinoa."},{"step":"Sear chicken."},{"step":"Assemble with spinach, tomato, feta, olive oil."}]'),
  ('Salmon & Broccoli Plate', 'Omega-rich salmon with brown rice and roasted broccoli.', 'Nordic', '{high_protein,omega3}', 2, 30, 610, 38, 45, 26,
   '[{"step":"Roast broccoli with garlic."},{"step":"Pan-sear salmon."},{"step":"Serve over brown rice."}]'),
  ('Mediterranean Chickpea Bowl', 'Plant-forward chickpea bowl with peppers and feta.', 'Mediterranean', '{vegetarian,mediterranean}', 2, 20, 470, 18, 52, 19,
   '[{"step":"Warm chickpeas."},{"step":"Chop peppers, tomato, onion."},{"step":"Toss with feta and olive oil."}]')
on conflict do nothing;

-- ─── Recipe ingredients ─────────────────────────────────────────────────────
insert into public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
select r.id, i.id, v.qty, v.unit::measure_unit
from (values
  ('Chicken & Quinoa Power Bowl', 'chicken breast', 150, 'g'),
  ('Chicken & Quinoa Power Bowl', 'quinoa', 120, 'g'),
  ('Chicken & Quinoa Power Bowl', 'baby spinach', 40, 'g'),
  ('Chicken & Quinoa Power Bowl', 'cherry tomato', 60, 'g'),
  ('Chicken & Quinoa Power Bowl', 'feta', 30, 'g'),
  ('Chicken & Quinoa Power Bowl', 'olive oil', 10, 'ml'),
  ('Salmon & Broccoli Plate', 'salmon fillet', 180, 'g'),
  ('Salmon & Broccoli Plate', 'broccoli', 150, 'g'),
  ('Salmon & Broccoli Plate', 'brown rice', 120, 'g'),
  ('Salmon & Broccoli Plate', 'garlic', 5, 'g'),
  ('Salmon & Broccoli Plate', 'olive oil', 10, 'ml'),
  ('Mediterranean Chickpea Bowl', 'chickpeas', 150, 'g'),
  ('Mediterranean Chickpea Bowl', 'bell pepper', 80, 'g'),
  ('Mediterranean Chickpea Bowl', 'cherry tomato', 60, 'g'),
  ('Mediterranean Chickpea Bowl', 'red onion', 30, 'g'),
  ('Mediterranean Chickpea Bowl', 'feta', 30, 'g'),
  ('Mediterranean Chickpea Bowl', 'olive oil', 10, 'ml')
) v(title, cn, qty, unit)
join public.recipes r on r.title = v.title
join public.ingredients i on i.canonical_name = v.cn
on conflict (recipe_id, ingredient_id) do nothing;

-- ─── Stores (Vilnius) ───────────────────────────────────────────────────────
insert into public.stores (chain, name, address, location) values
  ('lidl',   'Lidl Žirmūnai',        'Žirmūnų g. 64, Vilnius',   ST_MakePoint(25.2982, 54.7156)::geography),
  ('maxima', 'Maxima X Akropolis',   'Ozo g. 25, Vilnius',       ST_MakePoint(25.2640, 54.7220)::geography),
  ('iki',    'Iki Ozas',             'Ozo g. 18, Vilnius',       ST_MakePoint(25.2560, 54.7110)::geography),
  ('rimi',   'Rimi Europa',          'Konstitucijos pr. 7A, Vilnius', ST_MakePoint(25.2730, 54.6960)::geography)
on conflict do nothing;

-- ─── Price matrix: every store × ingredient, with per-chain modifiers ───────
with ip(cn, price, unit, pack) as (values
  ('chicken breast', 3.79, 'g', 500),
  ('quinoa', 2.49, 'g', 500),
  ('baby spinach', 1.49, 'g', 200),
  ('cherry tomato', 1.69, 'g', 250),
  ('olive oil', 4.99, 'ml', 500),
  ('feta', 1.99, 'g', 200),
  ('salmon fillet', 6.49, 'g', 400),
  ('broccoli', 1.29, 'g', 500),
  ('brown rice', 1.99, 'g', 1000),
  ('garlic', 0.89, 'g', 100),
  ('chickpeas', 0.99, 'g', 400),
  ('bell pepper', 2.29, 'g', 500),
  ('red onion', 1.19, 'g', 1000)
),
sc(chain, mult) as (values ('lidl', 0.95), ('maxima', 1.00), ('iki', 1.08), ('rimi', 1.05))
insert into public.store_products (store_id, ingredient_id, product_name, pack_size, unit, price, stock)
select s.id, i.id,
       initcap(s.chain::text) || ' ' || initcap(ip.cn) || ' ' || ip.pack || ip.unit,
       ip.pack, ip.unit::measure_unit,
       round((ip.price * sc.mult)::numeric, 2),
       'in_stock'::stock_state
from public.stores s
join sc on sc.chain = s.chain::text
cross join ip
join public.ingredients i on i.canonical_name = ip.cn
on conflict (store_id, ingredient_id, product_name) do nothing;

-- Demonstrate the completeness logic: Iki is out of salmon.
update public.store_products sp
   set stock = 'out_of_stock'
  from public.stores s, public.ingredients i
 where sp.store_id = s.id and s.chain = 'iki'
   and sp.ingredient_id = i.id and i.canonical_name = 'salmon fillet';
