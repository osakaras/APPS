import { redirect } from "next/navigation";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { TasteMatrix, type TasteEntry } from "@/components/taste/TasteMatrix";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { DICTIONARIES, LOCALES, type LocaleCode, type BmiTierKey } from "@/lib/i18n/dictionary";

const codes = new Set(LOCALES.map((l) => l.code));

// ── Design-preview data ─────────────────────────────────────────────────────
const DEMO_AFFINITY: TasteEntry[] = [
  { ingredientId: "i-chicken", label: "chicken breast", score: 0.82, samples: 6 },
  { ingredientId: "i-quinoa", label: "quinoa", score: 0.64, samples: 4 },
  { ingredientId: "i-spinach", label: "baby spinach", score: 0.5, samples: 5 },
  { ingredientId: "i-feta", label: "feta", score: 0.38, samples: 3 },
];
const DEMO_AVERSION: TasteEntry[] = [
  { ingredientId: "i-oil", label: "olive oil", score: -0.22, samples: 2 },
  { ingredientId: "i-tomato", label: "cherry tomato", score: -0.45, samples: 3 },
];
const DEMO_GOALS = ["high_protein", "gain_muscle"];

export default async function TastePage() {
  let initialLocale: LocaleCode = "en";
  let classification: string | null = "Optimal Balance";
  let affinities = DEMO_AFFINITY;
  let aversions = DEMO_AVERSION;
  let activeGoals = DEMO_GOALS;

  if (hasSupabaseEnv()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/onboarding");

    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language, bmi_status")
      .eq("id", user.id)
      .maybeSingle();

    const lang = profile?.preferred_language;
    if (lang && codes.has(lang as LocaleCode)) initialLocale = lang as LocaleCode;
    const d = DICTIONARIES[initialLocale];
    classification = profile?.bmi_status
      ? d.bmi.tiers[profile.bmi_status as BmiTierKey].name
      : null;

    const { data: taste } = await supabase
      .from("taste_preferences")
      .select("ingredient_id, score, samples, ingredients(canonical_name)")
      .not("ingredient_id", "is", null);

    const entries: TasteEntry[] = (taste ?? [])
      .map((t: any) => ({
        ingredientId: t.ingredient_id as string,
        label: t.ingredients?.canonical_name ?? "ingredient",
        score: Number(t.score),
        samples: t.samples,
      }))
      .filter((e) => e.label);

    affinities = entries.filter((e) => e.score > 0.05).sort((a, b) => b.score - a.score).slice(0, 6);
    aversions = entries.filter((e) => e.score < -0.05).sort((a, b) => a.score - b.score).slice(0, 6);

    const { data: goals } = await supabase
      .from("health_goals")
      .select("kind")
      .eq("is_active", true);
    activeGoals = (goals ?? []).map((g) => g.kind as string);
  }

  return (
    <AuthProvider>
      <LocaleProvider initial={initialLocale}>
        <TasteMatrix
          classification={classification}
          affinities={affinities}
          aversions={aversions}
          activeGoals={activeGoals}
        />
      </LocaleProvider>
    </AuthProvider>
  );
}
