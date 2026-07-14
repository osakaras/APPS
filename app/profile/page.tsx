import { redirect } from "next/navigation";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProfileSettings, type ProfileInit } from "@/components/profile/ProfileSettings";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LOCALES, type LocaleCode } from "@/lib/i18n/dictionary";

const codes = new Set(LOCALES.map((l) => l.code));

export default async function ProfilePage() {
  let initialLocale: LocaleCode = "en";
  let initial: ProfileInit = { age: "29", weight: "78", height: "179" };

  if (hasSupabaseEnv()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/onboarding");

    const { data: p } = await supabase
      .from("profiles")
      .select("age, weight_kg, height_cm, preferred_language")
      .eq("id", user.id)
      .maybeSingle();

    if (p) {
      const lang = p.preferred_language;
      if (lang && codes.has(lang as LocaleCode)) initialLocale = lang as LocaleCode;
      initial = {
        age: p.age != null ? String(p.age) : "",
        weight: p.weight_kg != null ? String(p.weight_kg) : "",
        height: p.height_cm != null ? String(p.height_cm) : "",
      };
    }
  }

  return (
    <AuthProvider>
      <LocaleProvider initial={initialLocale}>
        <ProfileSettings initial={initial} />
      </LocaleProvider>
    </AuthProvider>
  );
}
