const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ================================================================== *
 *  SUPABASE — POSTGRESQL SCHEMA (defined before UI, per directive)   *
 * ================================================================== */
const SUPABASE_SCHEMA_SQL = `-- BIOLINK OS · Supabase PostgreSQL schema
-- Auth is handled by supabase auth.users; all tables enforce RLS.

create table public.profiles (
  user_id                   uuid primary key references auth.users(id) on delete cascade,
  language                  text not null default 'en'
                            check (language in ('en','lt','de')),
  weight_kg                 numeric(5,2) not null check (weight_kg between 25 and 400),
  height_cm                 numeric(5,2) not null check (height_cm between 90 and 260),
  bmi_tier                  text not null check (bmi_tier in
                            ('lean_substrate','homeostatic_optimal',
                             'strength_reserve','anabolic_maximal')),
  bio_link_sync_percentage  numeric(5,2) not null default 100.00
                            check (bio_link_sync_percentage between 0 and 100),
  last_sync_at              timestamptz not null default now(),
  created_at                timestamptz not null default now()
);

create table public.taste_matrix (
  user_id                   uuid primary key references auth.users(id) on delete cascade,
  spice_tolerance           smallint not null default 50 check (spice_tolerance between 0 and 100),
  sweet_affinity            smallint not null default 50 check (sweet_affinity between 0 and 100),
  caloric_density_baseline  smallint not null default 50 check (caloric_density_baseline between 0 and 100),
  updated_at                timestamptz not null default now()
);

create table public.fridge_inventory (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  item_name     text not null,
  canonical_id  text not null,          -- normalized SKU key, e.g. 'greek_yogurt'
  quantity      numeric(8,2) not null default 1 check (quantity >= 0),
  added_at      timestamptz not null default now(),
  unique (user_id, canonical_id)
);

create table public.meal_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  meal_name       text not null,
  metabolic_load  numeric(4,1) not null check (metabolic_load between 0 and 10),
  logged_at       timestamptz not null default now()
);

-- ---------- ROW LEVEL SECURITY ----------
alter table public.profiles         enable row level security;
alter table public.taste_matrix     enable row level security;
alter table public.fridge_inventory enable row level security;
alter table public.meal_logs        enable row level security;

create policy "own profile"   on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own matrix"    on public.taste_matrix
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own inventory" on public.fridge_inventory
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own logs"      on public.meal_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index meal_logs_user_time_idx on public.meal_logs (user_id, logged_at desc);
create index fridge_user_idx         on public.fridge_inventory (user_id);`;

/* ================================================================== *
 *  MOCK SUPABASE CLIENT — same call-shape as supabase-js, persisted  *
 *  to localStorage. Swap createClient() in for production.           *
 * ================================================================== */
function createSupabaseMock(storageKey = 'biolink_os_db_v1') {
  const load = () => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
    catch { return {}; }
  };
  const save = (db) => localStorage.setItem(storageKey, JSON.stringify(db));
  const uid = 'usr_local_demo';

  return {
    auth: { getUser: () => ({ data: { user: { id: uid } } }) },
    from(table) {
      return {
        select() {
          const db = load();
          return { data: (db[table] || []).filter(r => r.user_id === uid), error: null };
        },
        upsert(row) {
          const db = load();
          const rows = db[table] || [];
          const key = row.canonical_id !== undefined ? 'canonical_id' : 'user_id';
          const idx = rows.findIndex(r => r.user_id === uid && r[key] === row[key]);
          const next = { ...row, user_id: uid };
          if (idx >= 0) rows[idx] = { ...rows[idx], ...next }; else rows.push(next);
          db[table] = rows; save(db);
          return { data: next, error: null };
        },
        insert(row) {
          const db = load();
          const next = { id: crypto.randomUUID(), user_id: uid, ...row };
          db[table] = [...(db[table] || []), next]; save(db);
          return { data: next, error: null };
        },
        deleteWhere(pred) {
          const db = load();
          db[table] = (db[table] || []).filter(r => !(r.user_id === uid && pred(r)));
          save(db);
          return { error: null };
        },
        truncate() { const db = load(); db[table] = []; save(db); return { error: null }; },
      };
    },
    reset() { localStorage.removeItem(storageKey); },
  };
}
const supabase = createSupabaseMock();

/* ================================================================== *
 *  ANTHROPIC VISION — plate analysis integration                     *
 *  With window.ANTHROPIC_API_KEY set, this performs a live           *
 *  multimodal call; otherwise it falls back to the on-device         *
 *  inference simulator so the full flow is testable offline.         *
 * ================================================================== */
const VISION_SYSTEM_PROMPT =
  'You are a clinical sports-nutrition vision engine. Given a meal photo, return STRICT JSON: ' +
  '{"meal_name":string,"kcal":number,"protein_g":number,"carbs_g":number,"fat_g":number,' +
  '"metabolic_load":number(0-10),"load_class":"LOW GLYCEMIC"|"MODERATE"|"HIGH GLYCEMIC",' +
  '"confidence":number(0-100),"texture_profile":string,"seasoning_profile":string,' +
  '"taste_vector_delta":{"spice":int,"sweet":int,"density":int}}. No prose.';

const INFERENCE_LIBRARY = [
  { meal_name:'Grilled Salmon · Asparagus · Wild Rice', kcal:642, protein_g:46, carbs_g:38, fat_g:31,
    metabolic_load:4.2, load_class:'LOW GLYCEMIC', confidence:97.4,
    texture_profile:'Flaky / Char-Seared', seasoning_profile:'Dill · Cracked Pepper · Citrus Zest',
    taste_vector_delta:{ spice:+2, sweet:-1, density:+1 } },
  { meal_name:'Chicken Quinoa Bowl · Harissa Emulsion', kcal:588, protein_g:52, carbs_g:47, fat_g:19,
    metabolic_load:3.6, load_class:'LOW GLYCEMIC', confidence:95.8,
    texture_profile:'Granular / Fibrous', seasoning_profile:'Harissa · Smoked Paprika · Lime',
    taste_vector_delta:{ spice:+4, sweet:0, density:-1 } },
  { meal_name:'Buttermilk Pancake Stack · Maple Glaze', kcal:910, protein_g:18, carbs_g:118, fat_g:38,
    metabolic_load:8.6, load_class:'HIGH GLYCEMIC', confidence:96.1,
    texture_profile:'Aerated / Viscous Coat', seasoning_profile:'Maple · Vanilla · Brown Butter',
    taste_vector_delta:{ spice:-1, sweet:+5, density:+4 } },
  { meal_name:'Greek Yogurt · Berry Compote · Almond', kcal:412, protein_g:28, carbs_g:41, fat_g:14,
    metabolic_load:5.1, load_class:'MODERATE', confidence:94.3,
    texture_profile:'Dense Cream / Crunch Inclusion', seasoning_profile:'Berry Acid · Toasted Almond',
    taste_vector_delta:{ spice:0, sweet:+2, density:-2 } },
];

async function analyzePlateImage(imageBase64, scanIndex) {
  const key = window.ANTHROPIC_API_KEY;
  if (key && imageBase64) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1024,
        system: VISION_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: 'Analyze this plate.' },
        ]}],
      }),
    });
    const data = await res.json();
    return JSON.parse(data.content[0].text);
  }
  // On-device inference simulator (deterministic rotation, realistic latency handled by caller)
  return INFERENCE_LIBRARY[scanIndex % INFERENCE_LIBRARY.length];
}

/* ================================================================== *
 *  DOMAIN DATA                                                       *
 * ================================================================== */
const BMI_TIERS = [
  { id:'lean_substrate',      max:18.5, code:'TIER I',   name:'LEAN SUBSTRATE',
    advantage:'High Metabolic Plasticity',
    detail:'Elevated insulin sensitivity and rapid nutrient partitioning. Caloric surplus protocols convert to lean mass with minimal adipose spillover.' },
  { id:'homeostatic_optimal', max:25,   code:'TIER II',  name:'HOMEOSTATIC OPTIMAL',
    advantage:'Peak Homeostatic Efficiency',
    detail:'Hormonal axis operating at reference range. Maximal protocol flexibility — recomposition, performance and longevity tracks all available.' },
  { id:'strength_reserve',    max:30,   code:'TIER III', name:'STRENGTH RESERVE',
    advantage:'Massive Strength Potential',
    detail:'Elevated leverage mass and glycogen storage capacity. Progressive-overload protocols yield top-percentile absolute strength output.' },
  { id:'anabolic_maximal',    max:99,   code:'TIER IV',  name:'ANABOLIC MAXIMAL',
    advantage:'Maximal Anabolic Reserve',
    detail:'Deep substrate reserves support aggressive recomposition. Deficit protocols preserve lean tissue at rates lean subjects cannot match.' },
];
const tierForBmi = (bmi) => BMI_TIERS.find(t => bmi < t.max) || BMI_TIERS[BMI_TIERS.length - 1];

const DEFAULT_TASTE   = { spice_tolerance:62, sweet_affinity:38, caloric_density_baseline:55 };
const DEFAULT_FRIDGE  = [
  { canonical_id:'chicken_breast', item_name:'Chicken Breast',    quantity:2 },
  { canonical_id:'quinoa',         item_name:'Quinoa',            quantity:1 },
  { canonical_id:'spinach',        item_name:'Baby Spinach',      quantity:1 },
  { canonical_id:'greek_yogurt',   item_name:'Greek Yogurt 10%',  quantity:3 },
  { canonical_id:'eggs',           item_name:'Free-Range Eggs',   quantity:8 },
  { canonical_id:'cherry_tomato',  item_name:'Cherry Tomatoes',   quantity:1 },
];

const INGREDIENT_PRICES = { // base EUR
  feta:2.49, kalamata_olives:3.19, chili_flakes:1.29, lemon:0.59,
  walnuts:3.89, blueberries:2.99,
};
const INGREDIENT_NAMES = {
  chicken_breast:'Chicken Breast', quinoa:'Quinoa', spinach:'Baby Spinach',
  greek_yogurt:'Greek Yogurt', eggs:'Eggs', cherry_tomato:'Cherry Tomatoes',
  feta:'Feta PDO', kalamata_olives:'Kalamata Olives', chili_flakes:'Chili Flakes',
  lemon:'Lemon', walnuts:'Walnuts', blueberries:'Blueberries',
};

const RECIPES = [
  { id:'r1', name:'Thermogenic Quinoa Power Bowl',
    ingredients:['chicken_breast','quinoa','spinach','chili_flakes','lemon'],
    spice:70, sweet:20, density:52, metabolic_load:3.6, kcal:588, protein_g:52 },
  { id:'r2', name:'Mediterranean Protein Plate',
    ingredients:['eggs','cherry_tomato','feta','kalamata_olives'],
    spice:35, sweet:25, density:60, metabolic_load:4.4, kcal:512, protein_g:34 },
  { id:'r3', name:'Casein-Loaded Night Parfait',
    ingredients:['greek_yogurt','walnuts','blueberries'],
    spice:5, sweet:60, density:48, metabolic_load:5.1, kcal:412, protein_g:28 },
];

const STORES = [
  { id:'lidl',   name:'Lidl',   distance_km:0.8, priceIndex:0.82, outOfStock:[] },
  { id:'maxima', name:'Maxima', distance_km:1.2, priceIndex:0.95, outOfStock:[] },
  { id:'iki',    name:'Iki',    distance_km:0.6, priceIndex:1.06, outOfStock:['feta'] },
  { id:'rimi',   name:'Rimi',   distance_km:2.1, priceIndex:1.00, outOfStock:[] },
];

function computeMatch(recipe, taste, inventory) {
  const owned = recipe.ingredients.filter(id =>
    inventory.some(f => f.canonical_id === id && f.quantity > 0)).length;
  const coverage = owned / recipe.ingredients.length;
  const spiceFit = 1 - Math.abs(recipe.spice   - taste.spice_tolerance) / 100;
  const sweetFit = 1 - Math.abs(recipe.sweet   - taste.sweet_affinity) / 100;
  const densFit  = 1 - Math.abs(recipe.density - taste.caloric_density_baseline) / 100;
  const raw = coverage*0.45 + spiceFit*0.25 + sweetFit*0.15 + densFit*0.15;
  return Math.round(40 + raw * 60); // rescaled: full-fit ≈ 100, weak-fit floors near 40
}

function priceBasket(recipe, inventory) {
  const missing = recipe.ingredients.filter(id =>
    !inventory.some(f => f.canonical_id === id && f.quantity > 0));
  const quotes = STORES.map(store => {
    const lines = missing.map(id => ({
      id, name: INGREDIENT_NAMES[id],
      inStock: !store.outOfStock.includes(id),
      price: +(INGREDIENT_PRICES[id] * store.priceIndex).toFixed(2),
    }));
    const complete = lines.every(l => l.inStock);
    const total = +lines.filter(l => l.inStock).reduce((s,l) => s + l.price, 0).toFixed(2);
    return { store, lines, complete, total };
  });
  quotes.sort((a,b) => (a.complete !== b.complete) ? (a.complete ? -1 : 1)
    : (a.total !== b.total) ? a.total - b.total
    : a.store.distance_km - b.store.distance_km);
  return { missing, quotes };
}

/* ================================================================== *
 *  I18N                                                              *
 * ================================================================== */
const LANGS = [
  { code:'en', label:'English',  region:'International' },
  { code:'lt', label:'Lietuvių', region:'Lietuva' },
  { code:'de', label:'Deutsch',  region:'Deutschland' },
];
const I18N = {
  en: { dashboard:'Telemetry', scanner:'Scanner', fridge:'Fridge', settings:'System',
        systemSync:'SYSTEM SYNC', stable:'STABLE', weight:'Body Mass', height:'Stature',
        continue:'Continue', selectLanguage:'Select interface language',
        initialize:'Initialize Protocol', metabolicLoad:'Metabolic Load',
        recentLogs:'Biometric Log Stream', inventory:'Cold-Chain Inventory',
        matcher:'Predictive Matcher', scan:'Initiate Plate Scan' },
  lt: { dashboard:'Telemetrija', scanner:'Skeneris', fridge:'Šaldytuvas', settings:'Sistema',
        systemSync:'SISTEMOS SINCH.', stable:'STABILU', weight:'Kūno masė', height:'Ūgis',
        continue:'Tęsti', selectLanguage:'Pasirinkite sąsajos kalbą',
        initialize:'Inicijuoti protokolą', metabolicLoad:'Metabolinė apkrova',
        recentLogs:'Biometrinių įrašų srautas', inventory:'Šaldymo grandinės atsargos',
        matcher:'Prognozinis parinkėjas', scan:'Pradėti lėkštės skenavimą' },
  de: { dashboard:'Telemetrie', scanner:'Scanner', fridge:'Kühlschrank', settings:'System',
        systemSync:'SYSTEM-SYNC', stable:'STABIL', weight:'Körpermasse', height:'Körpergröße',
        continue:'Weiter', selectLanguage:'Sprache der Oberfläche wählen',
        initialize:'Protokoll initialisieren', metabolicLoad:'Metabolische Last',
        recentLogs:'Biometrischer Log-Stream', inventory:'Kühlketten-Inventar',
        matcher:'Prädiktiver Matcher', scan:'Teller-Scan starten' },
};

/* ================================================================== *
 *  ICON LAYER — lucide path data rendered as thin-line React SVGs    *
 * ================================================================== */
const ICON_PATHS = {
  activity:  [['path',{d:'M22 12h-4l-3 9L9 3l-3 9H2'}]],
  camera:    [['path',{d:'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z'}],['circle',{cx:12,cy:13,r:3}]],
  fridge:    [['path',{d:'M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z'}],['path',{d:'M5 10h14'}],['path',{d:'M15 7v3'}],['path',{d:'M15 13v3'}]],
  sliders:   [['line',{x1:21,x2:14,y1:4,y2:4}],['line',{x1:10,x2:3,y1:4,y2:4}],['line',{x1:21,x2:12,y1:12,y2:12}],['line',{x1:8,x2:3,y1:12,y2:12}],['line',{x1:21,x2:16,y1:20,y2:20}],['line',{x1:12,x2:3,y1:20,y2:20}],['line',{x1:14,x2:14,y1:2,y2:6}],['line',{x1:8,x2:8,y1:10,y2:14}],['line',{x1:16,x2:16,y1:18,y2:22}]],
  chevronR:  [['path',{d:'m9 18 6-6-6-6'}]],
  arrowL:    [['path',{d:'m12 19-7-7 7-7'}],['path',{d:'M19 12H5'}]],
  check:     [['path',{d:'M20 6 9 17l-5-5'}]],
  x:         [['path',{d:'M18 6 6 18'}],['path',{d:'m6 6 12 12'}]],
  plus:      [['path',{d:'M5 12h14'}],['path',{d:'M12 5v14'}]],
  minus:     [['path',{d:'M5 12h14'}]],
  zap:       [['polygon',{points:'13 2 3 14 12 14 11 22 21 10 12 10 13 2'}]],
  flame:     [['path',{d:'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'}]],
  wifi:      [['path',{d:'M12 20h.01'}],['path',{d:'M2 8.82a15 15 0 0 1 20 0'}],['path',{d:'M5 12.859a10 10 0 0 1 14 0'}],['path',{d:'M8.5 16.429a5 5 0 0 1 7 0'}]],
  alert:     [['path',{d:'m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z'}],['path',{d:'M12 9v4'}],['path',{d:'M12 17h.01'}]],
  mapPin:    [['path',{d:'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'}],['circle',{cx:12,cy:10,r:3}]],
  cart:      [['circle',{cx:8,cy:21,r:1}],['circle',{cx:19,cy:21,r:1}],['path',{d:'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12'}]],
  globe:     [['circle',{cx:12,cy:12,r:10}],['path',{d:'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20'}],['path',{d:'M2 12h20'}]],
  scan:      [['path',{d:'M3 7V5a2 2 0 0 1 2-2h2'}],['path',{d:'M17 3h2a2 2 0 0 1 2 2v2'}],['path',{d:'M21 17v2a2 2 0 0 1-2 2h-2'}],['path',{d:'M7 21H5a2 2 0 0 1-2-2v-2'}]],
  cpu:       [['rect',{x:4,y:4,width:16,height:16,rx:2}],['rect',{x:9,y:9,width:6,height:6}],['path',{d:'M15 2v2'}],['path',{d:'M15 20v2'}],['path',{d:'M2 15h2'}],['path',{d:'M2 9h2'}],['path',{d:'M20 15h2'}],['path',{d:'M20 9h2'}],['path',{d:'M9 2v2'}],['path',{d:'M9 20v2'}]],
  database:  [['ellipse',{cx:12,cy:5,rx:9,ry:3}],['path',{d:'M3 5v14a9 3 0 0 0 18 0V5'}],['path',{d:'M3 12a9 3 0 0 0 18 0'}]],
  trend:     [['polyline',{points:'22 7 13.5 15.5 8.5 10.5 2 17'}],['polyline',{points:'16 7 22 7 22 13'}]],
  radio:     [['circle',{cx:12,cy:12,r:2}],['path',{d:'M4.93 19.07a10 10 0 0 1 0-14.14'}],['path',{d:'M7.76 16.24a6 6 0 0 1 0-8.49'}],['path',{d:'M16.24 7.76a6 6 0 0 1 0 8.49'}],['path',{d:'M19.07 4.93a10 10 0 0 1 0 14.14'}]],
  weight:    [['circle',{cx:12,cy:5,r:3}],['path',{d:'M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z'}]],
  ruler:     [['path',{d:'M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.3 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z'}],['path',{d:'m14.5 12.5 2-2'}],['path',{d:'m11.5 9.5 2-2'}],['path',{d:'m8.5 6.5 2-2'}],['path',{d:'m17.5 15.5 2-2'}]],
  utensils:  [['path',{d:'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2'}],['path',{d:'M7 2v20'}],['path',{d:'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'}]],
  gauge:     [['path',{d:'m12 14 4-4'}],['path',{d:'M3.34 19a10 10 0 1 1 17.32 0'}]],
  store:     [['path',{d:'m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7'}],['path',{d:'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8'}],['path',{d:'M2 7h20'}],['path',{d:'M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4'}]],
  nav:       [['polygon',{points:'3 11 22 2 13 21 11 13 3 11'}]],
  clock:     [['circle',{cx:12,cy:12,r:10}],['polyline',{points:'12 6 12 12 16 14'}]],
  refresh:   [['path',{d:'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8'}],['path',{d:'M21 3v5h-5'}],['path',{d:'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16'}],['path',{d:'M8 16H3v5'}]],
};
function Icon({ name, size = 20, strokeWidth = 1.5, className = '' }) {
  const nodes = ICON_PATHS[name] || [];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {nodes.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

/* ================================================================== *
 *  SHARED ATOMS                                                      *
 * ================================================================== */
const Panel = ({ className = '', children, onClick }) => (
  <div onClick={onClick}
       className={`bg-graphite hairline rounded-3xl ${onClick ? 'press cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);
const Mono = ({ className = '', children }) => (
  <span className={`font-mono tabular-nums ${className}`}>{children}</span>
);
const Label = ({ children, className = '' }) => (
  <p className={`text-[10px] font-mono tracking-[0.22em] text-white/40 ${className}`}>{children}</p>
);
const PrimaryBtn = ({ children, onClick, disabled, tone = 'white' }) => (
  <button onClick={onClick} disabled={disabled}
    className={`press w-full rounded-2xl py-4 text-[15px] font-semibold tracking-tight
      ${tone === 'jade' ? 'bg-jade text-black' : 'bg-white text-black'}
      disabled:opacity-30 disabled:pointer-events-none`}>
    {children}
  </button>
);
const GhostBtn = ({ children, onClick }) => (
  <button onClick={onClick}
    className="press w-full rounded-2xl py-4 text-[15px] font-semibold tracking-tight bg-graphite2 text-white hairline">
    {children}
  </button>
);

function haptic(pattern = [12]) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
}

/* Toast bus */
function useToast() {
  const [toast, setToast] = useState(null);
  const push = useCallback((msg, tone = 'jade') => {
    setToast({ msg, tone, key: Date.now() });
    haptic([10, 30, 10]);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  return [toast, push];
}

/* ================================================================== *
 *  GAUGES                                                            *
 * ================================================================== */
function polar(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx, cy, r, a0, a1) {
  const s = polar(cx, cy, r, a1), e = polar(cx, cy, r, a0);
  const large = a1 - a0 <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

/* Semicircular live BMI gauge */
function BmiGauge({ bmi }) {
  const min = 14, max = 40;
  const clamped = Math.min(max, Math.max(min, bmi));
  const frac = (clamped - min) / (max - min);
  const angle = -90 + frac * 180;
  const tier = tierForBmi(bmi);
  const optimal = tier.id === 'homeostatic_optimal';
  const seg = (a, b, cls, w = 10) => (
    <path d={arcPath(110, 110, 88, -90 + ((a-min)/(max-min))*180, -90 + ((b-min)/(max-min))*180)}
          className={cls} strokeWidth={w} fill="none" strokeLinecap="round" />
  );
  return (
    <div className="relative flex flex-col items-center">
      <svg width="220" height="128" viewBox="0 0 220 128">
        {seg(min, max, 'stroke-graphite3')}
        {seg(min, 18.5, 'stroke-amber/70')}
        {seg(18.5, 25, 'stroke-jade')}
        {seg(25, 30, 'stroke-amber/70')}
        {seg(30, max, 'stroke-amberdeep/70')}
        <g className="needle-smooth" style={{ transform:`rotate(${angle}deg)`, transformOrigin:'110px 110px' }}>
          <line x1="110" y1="110" x2="110" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="110" cy="110" r="5" fill="white" />
        </g>
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <Mono className={`text-4xl font-semibold ${optimal ? 'text-jade neon-jade' : 'text-amber neon-amber'}`}>
          {bmi.toFixed(1)}
        </Mono>
        <Label className="mt-1">BODY MASS INDEX</Label>
      </div>
    </div>
  );
}

/* Circular sync ring */
function SyncRing({ pct, degraded }) {
  const r = 84, C = 2 * Math.PI * r;
  const offset = C * (1 - pct / 100);
  return (
    <div className="relative flex items-center justify-center">
      <svg width="216" height="216" viewBox="0 0 216 216" className="-rotate-90">
        <circle cx="108" cy="108" r={r} stroke="#2c2c2e" strokeWidth="10" fill="none" />
        <circle cx="108" cy="108" r={r} strokeWidth="10" fill="none" strokeLinecap="round"
          className={`ring-smooth ${degraded ? 'stroke-amber' : 'stroke-jade'}`}
          strokeDasharray={C} strokeDashoffset={offset}
          style={{ filter: degraded ? 'drop-shadow(0 0 10px rgba(255,214,10,.45))'
                                    : 'drop-shadow(0 0 10px rgba(48,209,88,.45))' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <Mono className={`text-5xl font-semibold ${degraded ? 'text-amber neon-amber' : 'text-jade neon-jade'}`}>
          {pct}%
        </Mono>
        <Mono className={`mt-2 text-[10px] tracking-[0.2em] ${degraded ? 'text-amber' : 'text-jade'}`}>
          {degraded ? '[DEGRADATION RISK]' : '[STABLE]'}
        </Mono>
      </div>
    </div>
  );
}

function Sparkline({ data, degraded }) {
  const w = 280, h = 56, max = Math.max(...data) * 1.15;
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h - (v/max)*h}`).join(' ');
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" strokeWidth="1.5"
        className={degraded ? 'stroke-amber' : 'stroke-jade'} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i/(data.length-1))*w} cy={h - (v/max)*h} r="2.5"
          className={degraded ? 'fill-amber' : 'fill-jade'} />
      ))}
    </svg>
  );
}

/* ================================================================== *
 *  ENGINE A — ONBOARDING TELEMETRY                                   *
 * ================================================================== */
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState('en');
  const [weight, setWeight] = useState(76);
  const [height, setHeight] = useState(178);
  const t = (k) => (I18N[lang] && I18N[lang][k]) || I18N.en[k];
  const bmi = weight / Math.pow(height / 100, 2);
  const tier = tierForBmi(bmi);

  const Stepper = ({ label, unit, value, set, min, max, step: inc, icon }) => (
    <Panel className="p-5">
      <div className="flex items-center gap-2 text-white/40">
        <Icon name={icon} size={15} />
        <Label>{label.toUpperCase()}</Label>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button onClick={() => { set(Math.max(min, +(value - inc).toFixed(1))); haptic(); }}
          className="press w-12 h-12 rounded-2xl bg-graphite2 hairline flex items-center justify-center text-white/80">
          <Icon name="minus" size={18} />
        </button>
        <div className="text-center">
          <Mono className="text-4xl font-semibold text-white">{value}</Mono>
          <Mono className="ml-2 text-sm text-white/35">{unit}</Mono>
        </div>
        <button onClick={() => { set(Math.min(max, +(value + inc).toFixed(1))); haptic(); }}
          className="press w-12 h-12 rounded-2xl bg-graphite2 hairline flex items-center justify-center text-white/80">
          <Icon name="plus" size={18} />
        </button>
      </div>
      <input type="range" min={min} max={max} step={inc} value={value}
        onChange={e => set(+e.target.value)}
        className="mt-5 w-full accent-white h-1" />
    </Panel>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-[430px] mx-auto px-5 pt-14 pb-10">
      {/* progress */}
      <div className="flex items-center gap-3 mb-10">
        {step > 0 && step < 3 && (
          <button onClick={() => setStep(step - 1)} className="press text-white/50"><Icon name="arrowL" size={20}/></button>
        )}
        <div className="flex-1 flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className={`h-[3px] flex-1 rounded-full transition-all duration-500
              ${i <= Math.min(step,2) ? 'bg-jade' : 'bg-graphite2'}`} />
          ))}
        </div>
        <Mono className="text-[10px] text-white/30 tracking-widest">
          {String(Math.min(step,2)+1).padStart(2,'0')}/03
        </Mono>
      </div>

      {step === 0 && (
        <div className="animate-rise flex-1 flex flex-col">
          <Label>ONBOARDING TELEMETRY · 01</Label>
          <h1 className="mt-3 text-3xl font-semibold text-white tracking-tight">{t('selectLanguage')}</h1>
          <p className="mt-2 text-[13px] text-white/40 leading-relaxed">
            Interface locale propagates to all telemetry surfaces and protocol notifications.
          </p>
          <div className="mt-8 space-y-3">
            {LANGS.map(l => (
              <Panel key={l.code} onClick={() => { setLang(l.code); haptic(); }}
                className={`p-5 flex items-center justify-between transition-all duration-300
                  ${lang === l.code ? 'ring-1 ring-jade/70' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-graphite2 flex items-center justify-center text-white/60">
                    <Icon name="globe" size={18} />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-white">{l.label}</p>
                    <Mono className="text-[10px] text-white/35 tracking-widest">{l.region.toUpperCase()}</Mono>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                  ${lang === l.code ? 'bg-jade text-black' : 'bg-graphite2 text-transparent'}`}>
                  <Icon name="check" size={13} strokeWidth={2.5} />
                </div>
              </Panel>
            ))}
          </div>
          <div className="flex-1" />
          <PrimaryBtn onClick={() => { setStep(1); haptic(); }}>{t('continue')}</PrimaryBtn>
        </div>
      )}

      {step === 1 && (
        <div className="animate-rise flex-1 flex flex-col">
          <Label>ONBOARDING TELEMETRY · 02</Label>
          <h1 className="mt-3 text-3xl font-semibold text-white tracking-tight">Metric Input</h1>
          <p className="mt-2 text-[13px] text-white/40 leading-relaxed">
            Anthropometric baseline for metabolic modelling. Values are revisable in System.
          </p>
          <div className="mt-8 space-y-4">
            <Stepper label={t('weight')} unit="kg" value={weight} set={setWeight} min={35} max={220} step={0.5} icon="weight" />
            <Stepper label={t('height')} unit="cm" value={height} set={setHeight} min={120} max={230} step={1} icon="ruler" />
          </div>
          <div className="flex-1" />
          <PrimaryBtn onClick={() => { setStep(2); haptic(); }}>{t('continue')}</PrimaryBtn>
        </div>
      )}

      {step === 2 && (
        <div className="animate-rise flex-1 flex flex-col">
          <Label>ONBOARDING TELEMETRY · 03</Label>
          <h1 className="mt-3 text-3xl font-semibold text-white tracking-tight">Composition Analysis</h1>
          <Panel className="mt-8 p-6 flex flex-col items-center">
            <BmiGauge bmi={bmi} />
            <div className="mt-8 w-full rounded-2xl bg-graphite2 hairline p-5">
              <div className="flex items-center justify-between">
                <Mono className="text-[10px] tracking-[0.2em] text-white/40">{tier.code} · {tier.name}</Mono>
                <Icon name="cpu" size={15} className="text-white/30" />
              </div>
              <p className={`mt-2 text-[17px] font-semibold tracking-tight
                ${tier.id === 'homeostatic_optimal' ? 'text-jade' : 'text-amber'}`}>
                {tier.advantage}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-white/45">{tier.detail}</p>
            </div>
            <div className="mt-4 w-full grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-graphite2 hairline p-4">
                <Label>MASS</Label>
                <Mono className="mt-1 block text-lg text-white">{weight.toFixed(1)} kg</Mono>
              </div>
              <div className="rounded-2xl bg-graphite2 hairline p-4">
                <Label>STATURE</Label>
                <Mono className="mt-1 block text-lg text-white">{height} cm</Mono>
              </div>
            </div>
          </Panel>
          <div className="flex-1 min-h-6" />
          <PrimaryBtn tone="jade" onClick={() => { setStep(3); haptic([20, 60, 20]); }}>
            {t('initialize')}
          </PrimaryBtn>
        </div>
      )}

      {step === 3 && (
        <CalibrationComplete
          onEnter={() => onComplete({ lang, weight, height, bmi: +bmi.toFixed(1), tier })}
          tier={tier} bmi={bmi}
        />
      )}
    </div>
  );
}

function CalibrationComplete({ onEnter, tier, bmi }) {
  useEffect(() => { haptic([15, 40, 15, 40, 30]); }, []);
  return (
    <div className="animate-fadein flex-1 flex flex-col items-center justify-center">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <div className="haptic-ring" />
        <div className="haptic-ring" style={{ animationDelay: '.5s' }} />
        <div className="w-20 h-20 rounded-full bg-jade/10 border border-jade/50 flex items-center justify-center text-jade">
          <Icon name="check" size={34} strokeWidth={2} />
        </div>
      </div>
      <Panel className="mt-10 w-full p-6 text-center animate-rise delay-2">
        <Mono className="text-[11px] tracking-[0.28em] text-jade neon-jade">CALIBRATION COMPLETE</Mono>
        <p className="mt-2 text-2xl font-semibold text-white tracking-tight">Protocol Initialized</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ['BMI', bmi.toFixed(1)],
            ['TIER', tier.code.replace('TIER ','')],
            ['SYNC', '100%'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-graphite2 hairline py-3">
              <Label className="text-center">{k}</Label>
              <Mono className="mt-1 block text-center text-[15px] text-white">{v}</Mono>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] font-mono text-white/30 tracking-wider">
          HAPTIC CONFIRMATION PULSE DISPATCHED
        </p>
      </Panel>
      <div className="w-full mt-8 animate-rise delay-3">
        <PrimaryBtn onClick={onEnter}>Enter Telemetry Deck</PrimaryBtn>
      </div>
    </div>
  );
}

/* ================================================================== *
 *  ENGINE B — BIO-LINK STABILITY INDEX (DASHBOARD)                   *
 * ================================================================== */
function Dashboard({ profile, degraded, setDegraded, mealLogs, t }) {
  const pct = degraded ? 72 : 100;
  const weekLoads = useMemo(() => {
    const base = [4.1, 3.8, 5.2, 4.6, 3.9, 4.4];
    const today = mealLogs.length
      ? +(mealLogs.reduce((s, m) => s + m.metabolic_load, 0) / mealLogs.length).toFixed(1)
      : 4.0;
    return [...base, today];
  }, [mealLogs]);

  return (
    <div className="px-5 pb-32 space-y-4">
      <Panel className="p-6 animate-rise">
        <div className="flex items-center justify-between">
          <Label>{t('systemSync')} · BIO-LINK STABILITY INDEX</Label>
          <span className={`w-2 h-2 rounded-full ${degraded ? 'bg-amber' : 'bg-jade'}`}
                style={{ animation: 'dotpulse 1.6s ease infinite' }} />
        </div>
        <div className="mt-5 flex justify-center"><SyncRing pct={pct} degraded={degraded} /></div>
        <div className={`mt-6 rounded-2xl p-4 hairline flex items-start gap-3 transition-colors duration-500
          ${degraded ? 'bg-amber/10' : 'bg-jade/10'}`}>
          <Icon name={degraded ? 'alert' : 'wifi'} size={17}
                className={degraded ? 'text-amber mt-0.5' : 'text-jade mt-0.5'} />
          <div>
            <Mono className={`text-[11px] tracking-[0.16em] ${degraded ? 'text-amber' : 'text-jade'}`}>
              {degraded ? 'DEGRADATION RISK — LOG BIOMETRIC DATA' : `SYSTEM SYNC: 100% [${t('stable')}]`}
            </Mono>
            <p className="mt-1 text-[12px] text-white/45 leading-relaxed">
              {degraded
                ? 'Meal-log cadence breach detected. Metabolic model confidence is decaying — commit a plate scan to restore full telemetry lock.'
                : 'All biometric channels nominal. Metabolic model operating at full predictive confidence.'}
            </p>
          </div>
        </div>
        {/* degradation simulator */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-graphite2 hairline p-4">
          <div>
            <p className="text-[13px] font-medium text-white">Simulate Missed Log Window</p>
            <Mono className="text-[10px] text-white/35 tracking-widest">TELEMETRY DEGRADATION PREVIEW</Mono>
          </div>
          <button onClick={() => { setDegraded(!degraded); haptic(); }}
            className={`press relative w-[52px] h-8 rounded-full transition-colors duration-300
              ${degraded ? 'bg-amber' : 'bg-graphite3'}`}>
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow
              ${degraded ? 'left-[24px]' : 'left-1'}`} />
          </button>
        </div>
      </Panel>

      <Panel className="p-6 animate-rise delay-1">
        <div className="flex items-center justify-between">
          <Label>{t('metabolicLoad').toUpperCase()} · 7-DAY TREND</Label>
          <Icon name="trend" size={15} className="text-white/30" />
        </div>
        <div className="mt-5"><Sparkline data={weekLoads} degraded={degraded} /></div>
        <div className="mt-4 flex justify-between">
          {['T-6','T-5','T-4','T-3','T-2','T-1','NOW'].map(d => (
            <Mono key={d} className="text-[9px] text-white/25 tracking-wider">{d}</Mono>
          ))}
        </div>
      </Panel>

      <Panel className="p-6 animate-rise delay-2">
        <Label>BIOLOGICAL ADVANTAGE PROFILE</Label>
        <div className="mt-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-graphite2 hairline flex items-center justify-center text-jade">
            <Icon name="zap" size={20} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-white tracking-tight">{profile.tier.advantage}</p>
            <Mono className="text-[10px] text-white/35 tracking-widest">
              {profile.tier.code} · BMI {profile.bmi.toFixed(1)}
            </Mono>
          </div>
        </div>
      </Panel>

      <Panel className="p-6 animate-rise delay-3">
        <Label>{t('recentLogs').toUpperCase()}</Label>
        <div className="mt-4 space-y-3">
          {mealLogs.length === 0 && (
            <p className="text-[13px] text-white/35">No biometric entries this cycle. Commit a plate scan to begin the stream.</p>
          )}
          {mealLogs.slice(-4).reverse().map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-2xl bg-graphite2 hairline p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-graphite3 flex items-center justify-center text-white/50">
                  <Icon name="utensils" size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{m.meal_name}</p>
                  <Mono className="text-[10px] text-white/35">
                    {new Date(m.logged_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                  </Mono>
                </div>
              </div>
              <Mono className={`text-[13px] ${m.metabolic_load > 7 ? 'text-amber' : 'text-jade'}`}>
                ML {m.metabolic_load.toFixed(1)}
              </Mono>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ================================================================== *
 *  ENGINE C — AI PLATE SCANNER                                       *
 * ================================================================== */
const SCAN_PHASES = [
  'CALIBRATING OPTICAL SENSOR…',
  'SEGMENTING PLATE REGIONS…',
  'ESTIMATING VOLUMETRIC DENSITY…',
  'RESOLVING MACRONUTRIENT VECTORS…',
  'CROSS-REFERENCING NUTRIENT DATABASE…',
  'COMPILING METABOLIC LOAD RATING…',
];

function Scanner({ onCommit, scanCount, t }) {
  const [mode, setMode] = useState('idle');       // idle | scanning | result
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [result, setResult] = useState(null);

  const startScan = () => {
    setMode('scanning'); setProgress(0); setPhase(0); haptic();
  };

  useEffect(() => {
    if (mode !== 'scanning') return;
    const prog = setInterval(() => setProgress(p => Math.min(100, p + 2)), 52);
    const ph   = setInterval(() => setPhase(p => (p + 1) % SCAN_PHASES.length), 480);
    const done = setTimeout(async () => {
      const r = await analyzePlateImage(null, scanCount);
      setResult(r); setMode('result'); haptic([15, 40, 15]);
    }, 2800);
    return () => { clearInterval(prog); clearInterval(ph); clearTimeout(done); };
  }, [mode, scanCount]);

  const MacroBar = ({ label, grams, max, tone }) => (
    <div>
      <div className="flex justify-between items-baseline">
        <Label>{label}</Label>
        <Mono className="text-[13px] text-white">{grams} g</Mono>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-graphite3 overflow-hidden">
        <div className={`h-full rounded-full ${tone} transition-all duration-700`}
             style={{ width: `${Math.min(100, (grams/max)*100)}%` }} />
      </div>
    </div>
  );

  return (
    <div className="px-5 pb-32 space-y-4">
      <Panel className="p-3 animate-rise">
        {/* Viewport */}
        <div className="relative rounded-2xl overflow-hidden bg-black gridbg" style={{ aspectRatio: '4/4.4' }}>
          {/* corner brackets */}
          {[['top-4 left-4','border-t border-l'],['top-4 right-4','border-t border-r'],
            ['bottom-4 left-4','border-b border-l'],['bottom-4 right-4','border-b border-r']].map(([pos,b],i)=>(
            <div key={i} className={`absolute ${pos} w-8 h-8 ${b} rounded-sm transition-colors duration-500
              ${mode === 'scanning' ? 'border-jade' : 'border-white/25'}`} />
          ))}

          {mode === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-graphite hairline flex items-center justify-center text-white/50">
                <Icon name="camera" size={26} />
              </div>
              <Mono className="mt-5 text-[10px] tracking-[0.28em] text-white/35">OPTICAL SENSOR STANDBY</Mono>
              <Mono className="mt-1.5 text-[10px] tracking-[0.18em] text-white/20">1200 MP EQUIVALENT · IR DEPTH ARRAY</Mono>
            </div>
          )}

          {mode === 'scanning' && (
            <div className="absolute inset-0">
              <div className="scanline" />
              <div className="absolute inset-x-0 bottom-6 flex flex-col items-center">
                <Mono className="text-[10px] tracking-[0.22em] text-jade neon-jade">{SCAN_PHASES[phase]}</Mono>
                <div className="mt-3 w-40 h-1 rounded-full bg-graphite3 overflow-hidden">
                  <div className="h-full bg-jade transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
                <Mono className="mt-2 text-[11px] text-white/50">{progress}%</Mono>
              </div>
            </div>
          )}

          {mode === 'result' && result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center animate-fadein">
              <div className="w-14 h-14 rounded-full bg-jade/10 border border-jade/50 flex items-center justify-center text-jade">
                <Icon name="check" size={24} strokeWidth={2} />
              </div>
              <Mono className="mt-4 text-[10px] tracking-[0.26em] text-jade">ANALYSIS LOCKED</Mono>
              <Mono className="mt-1 text-[10px] tracking-[0.16em] text-white/30">
                CONFIDENCE {result.confidence.toFixed(1)}%
              </Mono>
            </div>
          )}
        </div>

        {mode !== 'result' && (
          <div className="p-3">
            <PrimaryBtn tone="jade" onClick={startScan} disabled={mode === 'scanning'}>
              {mode === 'scanning' ? 'Acquiring…' : t('scan')}
            </PrimaryBtn>
          </div>
        )}
      </Panel>

      {mode === 'result' && result && (
        <React.Fragment>
          <Panel className="p-6 animate-rise">
            <Label>EXTRACTED SIGNATURE</Label>
            <p className="mt-2 text-[19px] font-semibold text-white tracking-tight leading-snug">{result.meal_name}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-graphite2 hairline p-4">
                <Label>ENERGY</Label>
                <Mono className="mt-1 block text-xl text-white">{result.kcal} <span className="text-[12px] text-white/40">kcal</span></Mono>
              </div>
              <div className={`rounded-2xl hairline p-4 ${result.metabolic_load > 7 ? 'bg-amber/10' : 'bg-jade/10'}`}>
                <Label>METABOLIC LOAD</Label>
                <Mono className={`mt-1 block text-xl ${result.metabolic_load > 7 ? 'text-amber neon-amber' : 'text-jade neon-jade'}`}>
                  {result.metabolic_load.toFixed(1)}<span className="text-[12px] opacity-50"> / 10</span>
                </Mono>
                <Mono className={`text-[9px] tracking-[0.18em] ${result.metabolic_load > 7 ? 'text-amber/70' : 'text-jade/70'}`}>
                  {result.load_class}
                </Mono>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <MacroBar label="PROTEIN" grams={result.protein_g} max={60} tone="bg-jade" />
              <MacroBar label="CARBOHYDRATE" grams={result.carbs_g} max={130} tone="bg-white/70" />
              <MacroBar label="LIPID" grams={result.fat_g} max={50} tone="bg-amber" />
            </div>
          </Panel>

          <Panel className="p-6 animate-rise delay-1">
            <div className="flex items-center gap-2">
              <Icon name="database" size={15} className="text-white/40" />
              <Label>TASTE MATRIX COMMIT REQUEST</Label>
            </div>
            <p className="mt-3 text-[13px] text-white/60 leading-relaxed">
              Commit this texture &amp; seasoning profile to your Taste Matrix? Future recipe
              matching will weight toward this signature.
            </p>
            <div className="mt-4 space-y-2">
              <div className="rounded-2xl bg-graphite2 hairline p-4 flex justify-between items-center">
                <Label>TEXTURE</Label>
                <Mono className="text-[12px] text-white">{result.texture_profile}</Mono>
              </div>
              <div className="rounded-2xl bg-graphite2 hairline p-4 flex justify-between items-center gap-4">
                <Label>SEASONING</Label>
                <Mono className="text-[12px] text-white text-right">{result.seasoning_profile}</Mono>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <GhostBtn onClick={() => { setMode('idle'); setResult(null); haptic(); }}>Discard</GhostBtn>
              <PrimaryBtn tone="jade" onClick={() => { onCommit(result); setMode('idle'); setResult(null); }}>
                Commit to Matrix
              </PrimaryBtn>
            </div>
          </Panel>
        </React.Fragment>
      )}
    </div>
  );
}

/* ================================================================== *
 *  ENGINE D — FRIDGE INSPECTOR & PREDICTIVE MATCHER                  *
 *  ENGINE E — GEO-PRICE MATCHING MATRIX                              *
 * ================================================================== */
function Fridge({ inventory, setQuantity, taste, onProcure, t }) {
  const [selected, setSelected] = useState(null); // recipe for geo-price sheet
  const ranked = useMemo(() =>
    RECIPES.map(r => ({
      recipe: r,
      match: computeMatch(r, taste, inventory),
      missing: r.ingredients.filter(id => !inventory.some(f => f.canonical_id === id && f.quantity > 0)),
    })).sort((a,b) => b.match - a.match),
  [taste, inventory]);

  return (
    <div className="px-5 pb-32 space-y-4">
      <Panel className="p-6 animate-rise">
        <div className="flex items-center justify-between">
          <Label>{t('inventory').toUpperCase()}</Label>
          <Mono className="text-[10px] text-white/30 tracking-widest">
            {inventory.filter(i => i.quantity > 0).length} SKU ACTIVE
          </Mono>
        </div>
        <div className="mt-4 space-y-2">
          {inventory.map(item => (
            <div key={item.canonical_id}
                 className={`flex items-center justify-between rounded-2xl bg-graphite2 hairline p-3.5 transition-opacity
                   ${item.quantity === 0 ? 'opacity-40' : ''}`}>
              <div>
                <p className="text-[13.5px] font-medium text-white">{item.item_name}</p>
                <Mono className="text-[9.5px] text-white/30 tracking-widest">{item.canonical_id.toUpperCase()}</Mono>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { setQuantity(item.canonical_id, Math.max(0, item.quantity - 1)); haptic(); }}
                  className="press w-8 h-8 rounded-xl bg-graphite3 flex items-center justify-center text-white/70">
                  <Icon name="minus" size={14} />
                </button>
                <Mono className="w-7 text-center text-[15px] text-white">{item.quantity}</Mono>
                <button onClick={() => { setQuantity(item.canonical_id, item.quantity + 1); haptic(); }}
                  className="press w-8 h-8 rounded-xl bg-graphite3 flex items-center justify-center text-white/70">
                  <Icon name="plus" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-6 animate-rise delay-1">
        <div className="flex items-center gap-2">
          <Icon name="cpu" size={15} className="text-white/40" />
          <Label>{t('matcher').toUpperCase()} · TASTE MATRIX WEIGHTED</Label>
        </div>
        <div className="mt-4 space-y-3">
          {ranked.map(({ recipe, match, missing }) => (
            <div key={recipe.id}
              onClick={() => { if (missing.length) { setSelected(recipe); haptic(); } }}
              className={`press rounded-2xl bg-graphite2 hairline p-4 ${missing.length ? 'cursor-pointer' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-white tracking-tight leading-snug">{recipe.name}</p>
                  <Mono className="mt-1 block text-[10px] text-white/35 tracking-wider">
                    ML {recipe.metabolic_load.toFixed(1)} · {recipe.kcal} KCAL · {recipe.protein_g}G PROTEIN
                  </Mono>
                </div>
                <div className="text-right shrink-0">
                  <Mono className={`text-[19px] font-semibold ${match >= 88 ? 'text-jade neon-jade' : match >= 75 ? 'text-jade' : 'text-amber'}`}>
                    {match}%
                  </Mono>
                  <Label>MATCH</Label>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {missing.length === 0 ? (
                  <Mono className="text-[10px] tracking-[0.16em] text-jade">FULL STOCK — READY TO EXECUTE</Mono>
                ) : (
                  <Mono className="text-[10px] tracking-[0.16em] text-amber">
                    {missing.length} COMPONENT{missing.length > 1 ? 'S' : ''} MISSING
                  </Mono>
                )}
                {missing.length > 0 && (
                  <span className="flex items-center gap-1 text-white/40">
                    <Mono className="text-[10px] tracking-wider">PRICE MATRIX</Mono>
                    <Icon name="chevronR" size={13} />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {selected && (
        <GeoPriceMatrix
          recipe={selected}
          inventory={inventory}
          onClose={() => setSelected(null)}
          onProcure={(storeName, total) => { onProcure(selected, storeName, total); setSelected(null); }}
        />
      )}
    </div>
  );
}

/* ENGINE E — sheet */
function GeoPriceMatrix({ recipe, inventory, onClose, onProcure }) {
  const { missing, quotes } = useMemo(() => priceBasket(recipe, inventory), [recipe, inventory]);
  const best = quotes[0];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 animate-fadein"
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className="w-full max-w-[430px] max-h-[88vh] overflow-y-auto glass hairline rounded-t-4xl p-6 pb-10 animate-rise">
        <div className="mx-auto w-10 h-1 rounded-full bg-white/20 mb-5" />
        <div className="flex items-start justify-between">
          <div>
            <Label>GEO-PRICE MATCHING MATRIX</Label>
            <p className="mt-1.5 text-[17px] font-semibold text-white tracking-tight">{recipe.name}</p>
            <Mono className="mt-1 block text-[10px] text-white/35 tracking-wider">
              {missing.length} MISSING: {missing.map(m => INGREDIENT_NAMES[m].toUpperCase()).join(' · ')}
            </Mono>
          </div>
          <button onClick={onClose} className="press w-9 h-9 rounded-full bg-graphite2 hairline flex items-center justify-center text-white/60">
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {quotes.map((q, rank) => (
            <div key={q.store.id}
              className={`rounded-3xl p-5 hairline transition-all
                ${rank === 0 && q.complete ? 'bg-jade/[0.07] ring-1 ring-jade/50' : 'bg-graphite'}
                ${!q.complete ? 'opacity-75' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-[13px] font-semibold
                    ${rank === 0 && q.complete ? 'bg-jade text-black' : 'bg-graphite2 text-white/60'}`}>
                    {rank + 1}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">{q.store.name}</p>
                    <div className="flex items-center gap-1 text-white/35">
                      <Icon name="nav" size={10} />
                      <Mono className="text-[10px] tracking-wider">{q.store.distance_km.toFixed(1)} KM</Mono>
                      {rank === 0 && q.complete && (
                        <Mono className="ml-2 text-[9px] tracking-[0.18em] text-jade">OPTIMAL ROUTE</Mono>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Mono className={`text-[19px] font-semibold ${q.complete ? (rank === 0 ? 'text-jade neon-jade' : 'text-white') : 'text-white/50'}`}>
                    €{q.total.toFixed(2)}
                  </Mono>
                  {!q.complete && (
                    <Mono className="block text-[9px] tracking-[0.16em] text-amber">INCOMPLETE BASKET</Mono>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-3">
                {q.lines.map(line => (
                  <div key={line.id} className="flex items-center justify-between">
                    <Mono className={`text-[11.5px] ${line.inStock ? 'text-white/60' : 'text-white/25 line-through'}`}>
                      {line.name}
                    </Mono>
                    {line.inStock ? (
                      <Mono className="text-[11.5px] text-white/80">€{line.price.toFixed(2)}</Mono>
                    ) : (
                      <Mono className="text-[9.5px] tracking-[0.14em] text-amber bg-amber/10 rounded-md px-2 py-0.5">
                        NOT IN STOCK
                      </Mono>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <PrimaryBtn tone="jade" onClick={() => onProcure(best.store.name, best.total)}>
            Route Basket → {best.store.name} · €{best.total.toFixed(2)}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 *  SETTINGS / SYSTEM                                                 *
 * ================================================================== */
function SettingsView({ profile, taste, setTaste, lang, setLang, lastSyncAt, degraded, onRecalibrate }) {
  const [showSchema, setShowSchema] = useState(false);
  const Slider = ({ label, k }) => (
    <div>
      <div className="flex justify-between items-baseline">
        <Label>{label}</Label>
        <Mono className="text-[13px] text-jade">{taste[k]}</Mono>
      </div>
      <input type="range" min="0" max="100" value={taste[k]}
        onChange={e => setTaste({ ...taste, [k]: +e.target.value })}
        className="mt-2 w-full accent-white h-1" />
    </div>
  );
  return (
    <div className="px-5 pb-32 space-y-4">
      <Panel className="p-6 animate-rise">
        <Label>OPERATOR PROFILE</Label>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            ['MASS', `${profile.weight.toFixed(1)} kg`],
            ['STATURE', `${profile.height} cm`],
            ['BMI', profile.bmi.toFixed(1)],
            ['TIER', profile.tier.code],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-graphite2 hairline p-4">
              <Label>{k}</Label>
              <Mono className="mt-1 block text-[16px] text-white">{v}</Mono>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-2xl bg-graphite2 hairline p-4 flex justify-between items-center">
          <Label>BIO-LINK SYNC</Label>
          <Mono className={`text-[14px] ${degraded ? 'text-amber' : 'text-jade'}`}>
            {degraded ? '72.00%' : '100.00%'}
          </Mono>
        </div>
        <div className="mt-3 rounded-2xl bg-graphite2 hairline p-4 flex justify-between items-center">
          <Label>LAST SYNC</Label>
          <Mono className="text-[12px] text-white/70">
            {new Date(lastSyncAt).toLocaleString([], { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short' })}
          </Mono>
        </div>
      </Panel>

      <Panel className="p-6 animate-rise delay-1">
        <div className="flex items-center gap-2">
          <Icon name="sliders" size={15} className="text-white/40" />
          <Label>TASTE MATRIX · LIVE WEIGHTS</Label>
        </div>
        <div className="mt-5 space-y-5">
          <Slider label="SPICE TOLERANCE" k="spice_tolerance" />
          <Slider label="SWEET AFFINITY" k="sweet_affinity" />
          <Slider label="CALORIC DENSITY BASELINE" k="caloric_density_baseline" />
        </div>
        <p className="mt-4 text-[11px] text-white/30 leading-relaxed">
          Weights propagate live into the Predictive Matcher. Committed plate scans adjust these vectors automatically.
        </p>
      </Panel>

      <Panel className="p-6 animate-rise delay-2">
        <Label>INTERFACE LOCALE</Label>
        <div className="mt-4 flex gap-2">
          {LANGS.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); haptic(); }}
              className={`press flex-1 rounded-2xl py-3 font-mono text-[11px] tracking-widest hairline
                ${lang === l.code ? 'bg-white text-black' : 'bg-graphite2 text-white/60'}`}>
              {l.code.toUpperCase()}
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="p-6 animate-rise delay-3">
        <button onClick={() => setShowSchema(s => !s)} className="press w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="database" size={15} className="text-white/40" />
            <Label>SUPABASE SCHEMA · POSTGRESQL + RLS</Label>
          </div>
          <Icon name="chevronR" size={15} className={`text-white/30 transition-transform ${showSchema ? 'rotate-90' : ''}`} />
        </button>
        {showSchema && (
          <pre className="mt-4 rounded-2xl bg-black hairline p-4 overflow-x-auto text-[9.5px] leading-relaxed font-mono text-jade/80 whitespace-pre">
{SUPABASE_SCHEMA_SQL}
          </pre>
        )}
      </Panel>

      <Panel className="p-5 animate-rise delay-4">
        <button onClick={onRecalibrate} className="press w-full flex items-center justify-center gap-2 text-amber">
          <Icon name="refresh" size={15} />
          <Mono className="text-[12px] tracking-[0.18em]">FULL RECALIBRATION — RESET PROTOCOL</Mono>
        </button>
      </Panel>

      <p className="text-center font-mono text-[9px] tracking-[0.24em] text-white/20 pt-2">
        BIOLINK OS v2.4.1 · BUILD 8842 · CLINICAL TELEMETRY CORE
      </p>
    </div>
  );
}

/* ================================================================== *
 *  SHELL — NAVIGATION + APP STATE                                    *
 * ================================================================== */
const TABS = [
  { id:'dashboard', icon:'activity',  tKey:'dashboard' },
  { id:'scanner',   icon:'scan',      tKey:'scanner' },
  { id:'fridge',    icon:'fridge',    tKey:'fridge' },
  { id:'settings',  icon:'sliders',   tKey:'settings' },
];

function App() {
  const [profile, setProfile]   = useState(null);
  const [tab, setTab]           = useState('dashboard');
  const [degraded, setDegraded] = useState(false);
  const [taste, setTasteState]  = useState(DEFAULT_TASTE);
  const [inventory, setInventory] = useState([]);
  const [mealLogs, setMealLogs] = useState([]);
  const [lastSyncAt, setLastSyncAt] = useState(new Date().toISOString());
  const [scanCount, setScanCount] = useState(0);
  const [toast, pushToast] = useToast();

  const lang = profile ? profile.lang : 'en';
  const t = useCallback((k) => (I18N[lang] && I18N[lang][k]) || I18N.en[k], [lang]);

  /* hydrate from mock supabase */
  useEffect(() => {
    const { data: profiles } = supabase.from('profiles').select();
    if (profiles.length) {
      const p = profiles[0];
      setProfile({ lang: p.language, weight: p.weight_kg, height: p.height_cm,
                   bmi: p.bmi_tier_bmi || +(p.weight_kg / Math.pow(p.height_cm/100, 2)).toFixed(1),
                   tier: BMI_TIERS.find(x => x.id === p.bmi_tier) || tierForBmi(p.weight_kg / Math.pow(p.height_cm/100,2)) });
      setLastSyncAt(p.last_sync_at);
    }
    const { data: tm } = supabase.from('taste_matrix').select();
    if (tm.length) setTasteState({
      spice_tolerance: tm[0].spice_tolerance,
      sweet_affinity: tm[0].sweet_affinity,
      caloric_density_baseline: tm[0].caloric_density_baseline,
    });
    const { data: inv } = supabase.from('fridge_inventory').select();
    setInventory(inv.length ? inv : DEFAULT_FRIDGE.map(f => ({ ...f, added_at: new Date().toISOString() })));
    const { data: logs } = supabase.from('meal_logs').select();
    setMealLogs(logs);
  }, []);

  const completeOnboarding = (p) => {
    setProfile(p);
    const now = new Date().toISOString();
    setLastSyncAt(now);
    supabase.from('profiles').upsert({
      language: p.lang, weight_kg: p.weight, height_cm: p.height,
      bmi_tier: p.tier.id, bio_link_sync_percentage: 100, last_sync_at: now,
    });
    supabase.from('taste_matrix').upsert({ ...DEFAULT_TASTE, updated_at: now });
    DEFAULT_FRIDGE.forEach(f => supabase.from('fridge_inventory').upsert({ ...f, added_at: now }));
    setInventory(DEFAULT_FRIDGE.map(f => ({ ...f, added_at: now })));
  };

  const setTaste = (next) => {
    setTasteState(next);
    supabase.from('taste_matrix').upsert({ ...next, updated_at: new Date().toISOString() });
  };

  const setQuantity = (canonical_id, quantity) => {
    setInventory(inv => inv.map(i => i.canonical_id === canonical_id ? { ...i, quantity } : i));
    const item = inventory.find(i => i.canonical_id === canonical_id);
    if (item) supabase.from('fridge_inventory').upsert({ ...item, quantity });
  };

  const commitScan = (result) => {
    const d = result.taste_vector_delta;
    const clamp = v => Math.max(0, Math.min(100, v));
    setTaste({
      spice_tolerance: clamp(taste.spice_tolerance + d.spice),
      sweet_affinity: clamp(taste.sweet_affinity + d.sweet),
      caloric_density_baseline: clamp(taste.caloric_density_baseline + d.density),
    });
    const log = { meal_name: result.meal_name, metabolic_load: result.metabolic_load, logged_at: new Date().toISOString() };
    const { data } = supabase.from('meal_logs').insert(log);
    setMealLogs(m => [...m, data]);
    setDegraded(false);
    setLastSyncAt(new Date().toISOString());
    setScanCount(c => c + 1);
    pushToast('PROFILE VECTOR COMMITTED — SYNC RESTORED 100%');
    setTab('dashboard');
  };

  const procure = (recipe, storeName, total) => {
    pushToast(`BASKET ROUTED → ${storeName.toUpperCase()} · €${total.toFixed(2)}`);
  };

  const recalibrate = () => {
    supabase.reset();
    setProfile(null); setTab('dashboard'); setDegraded(false);
    setTasteState(DEFAULT_TASTE); setMealLogs([]);
    setInventory(DEFAULT_FRIDGE.map(f => ({ ...f, added_at: new Date().toISOString() })));
  };

  if (!profile) return <Onboarding onComplete={completeOnboarding} />;

  return (
    <div className="min-h-screen bg-black max-w-[430px] mx-auto relative">
      {/* Top status bar */}
      <header className="sticky top-0 z-40 glass border-b border-white/[0.06] px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-graphite hairline flex items-center justify-center text-jade">
              <Icon name="radio" size={15} />
            </div>
            <div>
              <Mono className="block text-[12px] font-semibold tracking-[0.22em] text-white">BIOLINK OS</Mono>
              <Mono className="block text-[8.5px] tracking-[0.2em] text-white/30">METABOLIC TELEMETRY DECK</Mono>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 hairline transition-colors duration-500
            ${degraded ? 'bg-amber/10' : 'bg-jade/10'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${degraded ? 'bg-amber' : 'bg-jade'}`}
                  style={{ animation:'dotpulse 1.6s ease infinite' }} />
            <Mono className={`text-[10px] tracking-[0.14em] ${degraded ? 'text-amber' : 'text-jade'}`}>
              {degraded ? 'SYNC 72%' : 'SYNC 100%'}
            </Mono>
          </div>
        </div>
      </header>

      <main className="pt-4">
        {tab === 'dashboard' && (
          <Dashboard profile={profile} degraded={degraded} setDegraded={setDegraded} mealLogs={mealLogs} t={t} />
        )}
        {tab === 'scanner' && <Scanner onCommit={commitScan} scanCount={scanCount} t={t} />}
        {tab === 'fridge' && (
          <Fridge inventory={inventory} setQuantity={setQuantity} taste={taste} onProcure={procure} t={t} />
        )}
        {tab === 'settings' && (
          <SettingsView profile={profile} taste={taste} setTaste={setTaste}
            lang={lang} setLang={(l) => setProfile({ ...profile, lang: l })}
            lastSyncAt={lastSyncAt} degraded={degraded} onRecalibrate={recalibrate} />
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div key={toast.key}
          className="fixed left-1/2 -translate-x-1/2 bottom-28 z-50 animate-rise">
          <div className="glass hairline rounded-full px-5 py-3 flex items-center gap-2.5">
            <Icon name="check" size={14} className="text-jade" strokeWidth={2.5} />
            <Mono className="text-[10.5px] tracking-[0.14em] text-white whitespace-nowrap">{toast.msg}</Mono>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-4 pb-6 pt-2">
        <div className="glass hairline rounded-3xl px-2 py-2 flex justify-around">
          {TABS.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); haptic(); }}
              className={`press flex flex-col items-center gap-1 rounded-2xl px-4 py-2 transition-colors duration-300
                ${tab === item.id ? 'text-jade' : 'text-white/35'}`}>
              <Icon name={item.icon} size={20} strokeWidth={tab === item.id ? 1.9 : 1.5} />
              <span className="text-[9px] font-mono tracking-[0.12em]">{t(item.tKey).toUpperCase()}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);