import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LOCALES, type LocaleCode } from "@/lib/i18n/dictionary";
import type { Metrics } from "@/components/onboarding/MetricsStep";

const codes = new Set(LOCALES.map((l) => l.code));

/**
 * Server component: reads any existing profile so a returning user resumes
 * with their language and metrics already filled in. First-time (anonymous)
 * visitors fall through to clean defaults.
 */
export default async function OnboardingPage() {
  let initialLocale: LocaleCode = "en";
  let initialMetrics: Metrics = { age: "", weight: "", height: "" };

  if (hasSupabaseEnv()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_language, age, weight_kg, height_cm")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.preferred_language && codes.has(profile.preferred_language as LocaleCode)) {
          initialLocale = profile.preferred_language as LocaleCode;
        }
        initialMetrics = {
          age: profile.age != null ? String(profile.age) : "",
          weight: profile.weight_kg != null ? String(profile.weight_kg) : "",
          height: profile.height_cm != null ? String(profile.height_cm) : "",
        };
      }
    }
  }

  return (
    <AuthProvider>
      <LocaleProvider initial={initialLocale}>
        <main className="min-h-dvh">
          <OnboardingFlow initialMetrics={initialMetrics} />
        </main>
      </LocaleProvider>
    </AuthProvider>
  );
}
