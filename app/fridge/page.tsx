import { redirect } from "next/navigation";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { FridgeInspector, type InventoryItem } from "@/components/fridge/FridgeInspector";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { rankSuggestions, type RecipeRow, type RecipeSuggestion } from "@/lib/recipes";
import { LOCALES, type LocaleCode } from "@/lib/i18n/dictionary";

const codes = new Set(LOCALES.map((l) => l.code));

// ── Design-preview data (no Supabase keys) ──────────────────────────────────
const DEMO_INVENTORY: InventoryItem[] = [
  { id: "1", label: "chicken breast", quantity: 500, unit: "g" },
  { id: "2", label: "baby spinach", quantity: 200, unit: "g" },
  { id: "3", label: "cherry tomato", quantity: 250, unit: "g" },
  { id: "4", label: "feta", quantity: 200, unit: "g" },
  { id: "5", label: "broccoli", quantity: 1, unit: "pcs" },
  { id: "6", label: "garlic", quantity: 1, unit: "pcs" },
  { id: "7", label: "olive oil", quantity: 500, unit: "ml" },
];
const DEMO_SUGGESTIONS: RecipeSuggestion[] = [
  { id: "r1", title: "Chicken & Quinoa Power Bowl", summary: "Lean protein over quinoa with greens and feta.", tags: ["high_protein"], prep_minutes: 25, kcal_per_serving: 540, protein_per_serving_g: 42, total: 6, have: 5, missing: 1, coverage: 0.83, tasteScore: 0.4, rank: 0.7 },
  { id: "r2", title: "Salmon & Broccoli Plate", summary: "Omega-rich salmon with brown rice and roasted broccoli.", tags: ["omega3"], prep_minutes: 30, kcal_per_serving: 610, protein_per_serving_g: 38, total: 5, have: 3, missing: 2, coverage: 0.6, tasteScore: 0.2, rank: 0.5 },
  { id: "r3", title: "Mediterranean Chickpea Bowl", summary: "Plant-forward chickpea bowl with peppers and feta.", tags: ["vegetarian"], prep_minutes: 20, kcal_per_serving: 470, protein_per_serving_g: 18, total: 6, have: 3, missing: 3, coverage: 0.5, tasteScore: 0.1, rank: 0.42 },
];

export default async function FridgePage() {
  let initialLocale: LocaleCode = "en";
  let inventory = DEMO_INVENTORY;
  let suggestions = DEMO_SUGGESTIONS;

  if (hasSupabaseEnv()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/onboarding");

    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", user.id)
      .maybeSingle();
    const lang = profile?.preferred_language;
    if (lang && codes.has(lang as LocaleCode)) initialLocale = lang as LocaleCode;

    // Inventory.
    const { data: fridge } = await supabase
      .from("fridge_items")
      .select("id, label, quantity, unit, ingredient_id")
      .order("added_at", { ascending: false });
    inventory = (fridge ?? []).map((f) => ({
      id: f.id,
      label: f.label,
      quantity: f.quantity,
      unit: f.unit,
    }));
    const fridgeIds = new Set(
      (fridge ?? []).map((f) => f.ingredient_id).filter((id): id is string => Boolean(id)),
    );

    // Recipes + taste → suggestions.
    const { data: recipes } = await supabase
      .from("recipes")
      .select(
        "id, title, summary, tags, prep_minutes, kcal_per_serving, protein_per_serving_g, recipe_ingredients(ingredient_id)",
      );
    const rows: RecipeRow[] = (recipes ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      tags: r.tags ?? [],
      prep_minutes: r.prep_minutes,
      kcal_per_serving: r.kcal_per_serving,
      protein_per_serving_g: r.protein_per_serving_g,
      ingredientIds: (r.recipe_ingredients ?? []).map((ri: any) => ri.ingredient_id).filter(Boolean),
    }));

    const { data: taste } = await supabase
      .from("taste_preferences")
      .select("ingredient_id, score")
      .not("ingredient_id", "is", null);
    const tasteByIngredient = new Map<string, number>(
      (taste ?? []).map((t) => [t.ingredient_id as string, Number(t.score)]),
    );

    suggestions = rankSuggestions(rows, fridgeIds, tasteByIngredient).slice(0, 5);
  }

  return (
    <AuthProvider>
      <LocaleProvider initial={initialLocale}>
        <FridgeInspector inventory={inventory} suggestions={suggestions} />
      </LocaleProvider>
    </AuthProvider>
  );
}
