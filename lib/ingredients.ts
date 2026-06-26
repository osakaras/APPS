import type { SupabaseClient } from "@supabase/supabase-js";

/** Normalize a detected label for catalog matching. */
export function normalizeLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Resolve a detected food label to a canonical ingredient id, creating the
 * ingredient (and an alias) when it's new. Requires a privileged client
 * because the catalog tables are service-role-write only.
 *
 * Resolution order: alias → exact canonical name → fuzzy contains → create.
 */
export async function resolveIngredientId(
  admin: SupabaseClient,
  rawLabel: string,
): Promise<string | null> {
  const label = normalizeLabel(rawLabel);
  if (!label) return null;

  // 1. Alias hit.
  const { data: alias } = await admin
    .from("ingredient_aliases")
    .select("ingredient_id")
    .eq("alias", label)
    .maybeSingle();
  if (alias?.ingredient_id) return alias.ingredient_id;

  // 2. Exact canonical name.
  const { data: exact } = await admin
    .from("ingredients")
    .select("id")
    .eq("canonical_name", label)
    .maybeSingle();
  if (exact?.id) {
    await admin.from("ingredient_aliases").upsert({ alias: label, ingredient_id: exact.id });
    return exact.id;
  }

  // 3. Fuzzy contains (pg_trgm index backs the ilike).
  const { data: fuzzy } = await admin
    .from("ingredients")
    .select("id")
    .ilike("canonical_name", `%${label}%`)
    .limit(1)
    .maybeSingle();
  if (fuzzy?.id) {
    await admin.from("ingredient_aliases").upsert({ alias: label, ingredient_id: fuzzy.id });
    return fuzzy.id;
  }

  // 4. Create a new canonical ingredient.
  const { data: created, error } = await admin
    .from("ingredients")
    .insert({ canonical_name: label })
    .select("id")
    .single();
  if (error || !created) return null;
  return created.id;
}
