// Domain types shared across the app. These mirror the SQL schema in
// supabase/migrations/0001_init.sql so the engine and UI speak one language.

export type HealthRating = "poor" | "fair" | "good" | "great" | "excellent";
export type Sentiment = "loved" | "liked" | "neutral" | "disliked" | "hated";
export type MeasureUnit =
  | "g" | "kg" | "ml" | "l" | "pcs" | "tbsp" | "tsp" | "cup" | "pinch";
export type RetailChain = "lidl" | "maxima" | "iki" | "rimi" | "other";
export type StockState = "in_stock" | "low_stock" | "out_of_stock" | "unknown";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Macros {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Meal extends Partial<Macros> {
  id: string;
  title: string | null;
  image_url: string | null;
  health_rating: HealthRating | null;
  health_notes: string | null;
  sentiment: Sentiment | null;
  eaten_at: string;
}

export interface FridgeItem {
  id: string;
  ingredient_id: string | null;
  label: string;
  quantity: number | null;
  unit: MeasureUnit;
  source: "scan" | "manual";
  expires_on: string | null;
}

export interface Recipe {
  id: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  cuisine: string | null;
  tags: string[];
  servings: number;
  prep_minutes: number | null;
  kcal_per_serving: number | null;
  protein_per_serving_g: number | null;
}

export interface RecipeIngredient {
  ingredient_id: string;
  canonical_name: string;
  quantity: number;
  unit: MeasureUnit;
  is_optional: boolean;
}

export interface Store {
  id: string;
  chain: RetailChain;
  name: string;
  address: string | null;
  distance_m?: number;
}

// ─── Price / geo engine result shapes ───────────────────────────────────────

export interface MissingItemCost {
  ingredient_id: string;
  label: string;
  product_name: string | null;
  price: number | null; // null = store does not carry / out of stock
  unit: MeasureUnit | null;
  stock: StockState;
}

export interface StoreQuote {
  store: Store;
  distance_m: number;
  /** Items the recipe needs that are NOT in the user's fridge. */
  missing: MissingItemCost[];
  /** Sum of available missing-item prices. */
  total_cost: number;
  currency: string;
  /** True only if every missing item is purchasable at this store. */
  complete: boolean;
  /** Composite rank score — lower is better (cost + distance penalty). */
  score: number;
}

export interface GroceryMatch {
  origin: LatLng;
  recipeId: string;
  winner: StoreQuote | null;
  ranked: StoreQuote[];
  currency: string;
}
