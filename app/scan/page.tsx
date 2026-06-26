import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ScannerFlow } from "@/components/scan/ScannerFlow";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LOCALES, type LocaleCode } from "@/lib/i18n/dictionary";

const codes = new Set(LOCALES.map((l) => l.code));

/** Reads the user's language so the scanner speaks the same locale as the app. */
export default async function ScanPage() {
  let initialLocale: LocaleCode = "en";

  if (hasSupabaseEnv()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", user.id)
        .maybeSingle();
      const lang = profile?.preferred_language;
      if (lang && codes.has(lang as LocaleCode)) initialLocale = lang as LocaleCode;
    }
  }

  return (
    <AuthProvider>
      <LocaleProvider initial={initialLocale}>
        <main className="min-h-dvh bg-canvas">
          <ScannerFlow />
        </main>
      </LocaleProvider>
    </AuthProvider>
  );
}
