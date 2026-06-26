import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function OnboardingPage() {
  return (
    <LocaleProvider initial="en">
      <main className="min-h-dvh">
        <OnboardingFlow />
      </main>
    </LocaleProvider>
  );
}
