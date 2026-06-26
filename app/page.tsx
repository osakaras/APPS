import { redirect } from "next/navigation";
import { TabBar } from "@/components/ui/TabBar";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { DICTIONARIES, type LocaleCode } from "@/lib/i18n/dictionary";
import { TIER_COLOR } from "@/lib/bmi";
import type { BmiTierKey } from "@/lib/i18n/dictionary";
import {
  computeTargets,
  sumIntake,
  healthIndex,
  startOfTodayISO,
  type DailyTargets,
  type MealRow,
} from "@/lib/nutrition";

const MACRO_COLOR = { protein: "#4E9E82", carbs: "#B08A52", fat: "#8A77A8" } as const;

interface DashProfile {
  display_name: string | null;
  preferred_language: string;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  calculated_bmi: number | null;
  bmi_status: BmiTierKey | null;
}

// Design-preview data so the layout renders without Supabase keys.
const DEMO_PROFILE: DashProfile = {
  display_name: "Operator",
  preferred_language: "en",
  age: 29, weight_kg: 78, height_cm: 179,
  calculated_bmi: 24.3, bmi_status: "optimal_balance",
};
const DEMO_MEALS: MealRow[] = [
  { kcal: 520, protein_g: 38, carbs_g: 54, fat_g: 18, health_rating: "great" },
  { kcal: 430, protein_g: 26, carbs_g: 41, fat_g: 16, health_rating: "good" },
];

export default async function TodayPage() {
  let profile = DEMO_PROFILE;
  let meals: MealRow[] = DEMO_MEALS;
  let goalTargets: Partial<DailyTargets> = {};

  if (hasSupabaseEnv()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/onboarding");

    const { data: p } = await supabase
      .from("profiles")
      .select("display_name, preferred_language, age, weight_kg, height_cm, calculated_bmi, bmi_status, onboarded_at")
      .eq("id", user.id)
      .maybeSingle();
    if (!p?.onboarded_at) redirect("/onboarding");
    profile = p as DashProfile;

    const { data: m } = await supabase
      .from("meals")
      .select("kcal, protein_g, carbs_g, fat_g, health_rating")
      .gte("eaten_at", startOfTodayISO());
    meals = (m ?? []) as MealRow[];

    const { data: goal } = await supabase
      .from("health_goals")
      .select("target_kcal, target_protein_g, target_carbs_g, target_fat_g")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (goal) {
      goalTargets = {
        kcal: goal.target_kcal ?? undefined,
        protein_g: goal.target_protein_g ?? undefined,
        carbs_g: goal.target_carbs_g ?? undefined,
        fat_g: goal.target_fat_g ?? undefined,
      };
    }
  }

  const lang = (DICTIONARIES[profile.preferred_language as LocaleCode]
    ? (profile.preferred_language as LocaleCode)
    : "en") as LocaleCode;
  const d = DICTIONARIES[lang];

  const computed = computeTargets(profile) ?? { kcal: 2000, protein_g: 140, carbs_g: 200, fat_g: 65 };
  const target: DailyTargets = {
    kcal: goalTargets.kcal ?? computed.kcal,
    protein_g: goalTargets.protein_g ?? computed.protein_g,
    carbs_g: goalTargets.carbs_g ?? computed.carbs_g,
    fat_g: goalTargets.fat_g ?? computed.fat_g,
  };

  const intake = sumIntake(meals);
  const health = healthIndex(meals);
  const remaining = Math.max(0, target.kcal - Math.round(intake.kcal));
  const energyPct = Math.min(100, Math.round((intake.kcal / target.kcal) * 100));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? d.today.morning : hour < 18 ? d.today.afternoon : d.today.evening;
  const name = profile.display_name ? `, ${profile.display_name}` : "";

  const tierColor = profile.bmi_status ? TIER_COLOR[profile.bmi_status] : "#8A8A8E";
  const classification = profile.bmi_status ? d.bmi.tiers[profile.bmi_status].name : null;

  const dateLabel = new Date()
    .toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
    .toUpperCase();

  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-12">
      {/* Telemetry rail */}
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
        <span>Pl8 · Today</span>
        <span className="tabular-nums">{dateLabel}</span>
      </div>

      <header className="mb-6 mt-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          {greeting}
          {name}
        </h1>
        {classification && (
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-3">
            <span style={{ color: tierColor }}>{classification}</span>
            {profile.calculated_bmi != null && (
              <span> · BMI {Number(profile.calculated_bmi).toFixed(1)}</span>
            )}
          </p>
        )}
      </header>

      {/* Energy instrument panel */}
      <section className="rounded-4xl bg-[#0C0D12] p-6 text-white shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              Energy · kcal
            </p>
            <p className="mt-1.5 font-mono text-[2.75rem] font-semibold leading-none tabular-nums">
              {Math.round(intake.kcal)}
              <span className="text-xl font-normal text-white/35"> / {target.kcal}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              {d.today.remaining}
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums">{remaining}</p>
          </div>
        </div>

        {/* Energy hairline */}
        <div className="mt-5 h-px w-full overflow-hidden bg-white/10">
          <div
            className="h-full bg-white/70 transition-all duration-700 ease-ios"
            style={{ width: `${energyPct}%` }}
          />
        </div>

        {/* Macro readouts */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <MacroReadout label="Protein" value={intake.protein_g} target={target.protein_g} color={MACRO_COLOR.protein} />
          <MacroReadout label="Carbs" value={intake.carbs_g} target={target.carbs_g} color={MACRO_COLOR.carbs} />
          <MacroReadout label="Fat" value={intake.fat_g} target={target.fat_g} color={MACRO_COLOR.fat} />
        </div>
      </section>

      {/* Bento instruments */}
      <section className="mt-3 grid grid-cols-2 gap-3">
        {/* Composition */}
        <div className="rounded-3xl border border-hairline bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
            {d.today.composition}
          </p>
          <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">
            {profile.calculated_bmi != null ? Number(profile.calculated_bmi).toFixed(1) : "—"}
          </p>
          <div className="mt-3 h-[3px] w-10 rounded-full" style={{ backgroundColor: tierColor }} />
          {classification && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: tierColor }}>
              {classification}
            </p>
          )}
        </div>

        {/* Health index */}
        <div className="rounded-3xl border border-hairline bg-surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">
            {d.today.health}
          </p>
          {health != null ? (
            <>
              <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">
                {health}
                <span className="text-base font-normal text-ink-3"> / 100</span>
              </p>
              <div className="mt-3 h-px w-full overflow-hidden bg-hairline">
                <div className="h-full bg-[#4E9E82]" style={{ width: `${health}%` }} />
              </div>
            </>
          ) : (
            <p className="mt-3 font-mono text-[11px] uppercase leading-relaxed tracking-[0.1em] text-ink-3">
              {d.today.awaitingScan}
            </p>
          )}
        </div>

        {/* Scan plate — primary action, graphite */}
        <ActionTile label={d.today.scan} glyph="⌖" graphite />
        {/* Fridge */}
        <ActionTile label={d.today.fridge} glyph="❒" />
      </section>

      <TabBar active="today" />
    </main>
  );
}

function MacroReadout({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums">
        {Math.round(value)}
        <span className="text-white/35"> / {target}g</span>
      </p>
      <div className="mt-2 h-px w-full overflow-hidden bg-white/10">
        <div
          className="h-full transition-all duration-700 ease-ios"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ActionTile({
  label,
  glyph,
  graphite = false,
}: {
  label: string;
  glyph: string;
  graphite?: boolean;
}) {
  return (
    <button
      className={
        "flex h-28 flex-col justify-between rounded-3xl border p-5 text-left transition duration-300 ease-ios active:scale-[0.97] " +
        (graphite
          ? "border-transparent bg-[#0C0D12] text-white shadow-card"
          : "border-hairline bg-surface hover:-translate-y-0.5 hover:shadow-card-hover")
      }
    >
      <span className={"text-2xl " + (graphite ? "text-white/80" : "text-ink-2")}>{glyph}</span>
      <span className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em]">{label}</span>
        <span className={graphite ? "text-white/40" : "text-ink-3"}>→</span>
      </span>
    </button>
  );
}
