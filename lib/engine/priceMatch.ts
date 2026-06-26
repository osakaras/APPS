import type {
  FridgeItem,
  LatLng,
  MissingItemCost,
  RecipeIngredient,
  Store,
  StoreQuote,
} from "@/lib/types";
import { haversineMeters } from "@/lib/engine/geo";

// A single cheapest-product row as returned by the `basket_prices` RPC.
export interface BasketPriceRow {
  store_id: string;
  ingredient_id: string;
  product_name: string;
  price: number;
  unit: MissingItemCost["unit"];
  stock: MissingItemCost["stock"];
}

export interface MatchConfig {
  /**
   * How many euros of detour a kilometer is "worth". The ranking score is
   *   total_cost + distancePenaltyPerKm * (distance_m / 1000)
   * so a slightly pricier basket can still win if it's much closer. Tunable
   * per user (e.g. car vs. walking) — defaults to a gentle 0.35 €/km.
   */
  distancePenaltyPerKm?: number;
  /** Stores that can't supply ALL missing items are demoted, not dropped. */
  incompletePenalty?: number;
  currency?: string;
}

/**
 * Determine which recipe ingredients the user must still buy, given what's
 * already in their fridge. Matching is by canonical ingredient id; optional
 * recipe ingredients are skipped.
 */
export function computeMissingIngredients(
  required: RecipeIngredient[],
  fridge: FridgeItem[],
): RecipeIngredient[] {
  const onHand = new Set(
    fridge.map((f) => f.ingredient_id).filter((id): id is string => Boolean(id)),
  );
  return required.filter((r) => !r.is_optional && !onHand.has(r.ingredient_id));
}

/**
 * The core engine. Given the missing ingredients, the candidate stores (with
 * geo distance already resolved), and the cheapest price per (store,
 * ingredient), produce a ranked list of store quotes and pick a winner.
 *
 * Pure and deterministic — easy to unit test and safe to run on the server.
 */
export function rankStores(
  missing: RecipeIngredient[],
  stores: (Store & { distance_m: number })[],
  prices: BasketPriceRow[],
  config: MatchConfig = {},
): StoreQuote[] {
  const {
    distancePenaltyPerKm = 0.35,
    incompletePenalty = 6,
    currency = "EUR",
  } = config;

  // Index prices by store -> ingredient for O(1) lookup.
  const byStore = new Map<string, Map<string, BasketPriceRow>>();
  for (const row of prices) {
    if (!byStore.has(row.store_id)) byStore.set(row.store_id, new Map());
    byStore.get(row.store_id)!.set(row.ingredient_id, row);
  }

  const quotes: StoreQuote[] = stores.map((store) => {
    const priceMap = byStore.get(store.id) ?? new Map<string, BasketPriceRow>();

    const items: MissingItemCost[] = missing.map((m) => {
      const hit = priceMap.get(m.ingredient_id);
      return {
        ingredient_id: m.ingredient_id,
        label: m.canonical_name,
        product_name: hit?.product_name ?? null,
        price: hit?.price ?? null,
        unit: hit?.unit ?? null,
        stock: hit?.stock ?? "out_of_stock",
      };
    });

    const total = items.reduce((sum, i) => sum + (i.price ?? 0), 0);
    const complete = items.every((i) => i.price !== null);

    const score =
      total +
      distancePenaltyPerKm * (store.distance_m / 1000) +
      (complete ? 0 : incompletePenalty);

    return {
      store,
      distance_m: store.distance_m,
      missing: items,
      total_cost: Number(total.toFixed(2)),
      currency,
      complete,
      score: Number(score.toFixed(4)),
    };
  });

  // Best first. Complete baskets always beat incomplete ones at equal score
  // because of the incompletePenalty already folded into `score`.
  return quotes.sort((a, b) => a.score - b.score);
}

/** Attach great-circle distance to a set of stores from the user's origin. */
export function withDistance(
  stores: (Store & { lat: number; lng: number })[],
  origin: LatLng,
): (Store & { distance_m: number })[] {
  return stores.map((s) => ({
    ...s,
    distance_m: haversineMeters(origin, { lat: s.lat, lng: s.lng }),
  }));
}
