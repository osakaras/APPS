import { BentoCard } from "@/components/ui/BentoCard";
import { MacroRing } from "@/components/ui/MacroRing";
import { StoreMatchCard } from "@/components/ui/StoreMatchCard";
import { TabBar } from "@/components/ui/TabBar";
import type { StoreQuote } from "@/lib/types";

// ── Demo data ────────────────────────────────────────────────────────────────
// Hard-wired for the skeleton screen so the layout reads true before the
// Supabase data + engine are wired to live queries. Mirrors real engine output.
const sampleQuote: StoreQuote = {
  store: {
    id: "demo",
    chain: "lidl",
    name: "Lidl Žirmūnai",
    address: "Žirmūnų g. 64, Vilnius",
    distance_m: 540,
  },
  distance_m: 540,
  complete: true,
  currency: "EUR",
  total_cost: 6.43,
  score: 6.62,
  missing: [
    { ingredient_id: "1", label: "chicken breast", product_name: "Freshona Chicken Fillet 500g", price: 3.79, unit: "g", stock: "in_stock" },
    { ingredient_id: "2", label: "baby spinach", product_name: "Baby Spinach 200g", price: 1.49, unit: "g", stock: "in_stock" },
    { ingredient_id: "3", label: "feta", product_name: "Eridanous Feta 200g", price: 1.15, unit: "g", stock: "low_stock" },
  ],
};

export default function TodayPage() {
  return (
    <main className="mx-auto max-w-md px-4 pt-12">
      {/* Greeting */}
      <header className="mb-6 px-1">
        <p className="text-sm font-medium text-ink-2">Friday, June 26</p>
        <h1 className="text-3xl font-semibold tracking-tight">Good evening 👋</h1>
      </header>

      {/* Bento grid */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Calorie hero */}
        <BentoCard span="2" className="flex items-center gap-5">
          <MacroRing value={0.68} label="1,360" sublabel="of 2,000" color="#0A84FF" />
          <div className="flex-1 space-y-3">
            <Macro name="Protein" value="92g" pct={0.74} color="#30D158" />
            <Macro name="Carbs" value="148g" pct={0.55} color="#FF9F0A" />
            <Macro name="Fat" value="41g" pct={0.6} color="#BF5AF2" />
          </div>
        </BentoCard>

        {/* Scan plate */}
        <BentoCard interactive className="flex flex-col justify-between">
          <span className="text-2xl">📸</span>
          <div>
            <p className="font-semibold leading-tight">Scan plate</p>
            <p className="text-xs text-ink-2">Macros in a snap</p>
          </div>
        </BentoCard>

        {/* Fridge */}
        <BentoCard interactive className="flex flex-col justify-between">
          <span className="text-2xl">❄️</span>
          <div>
            <p className="font-semibold leading-tight">Fridge</p>
            <p className="text-xs text-ink-2">14 items · 2 expiring</p>
          </div>
        </BentoCard>

        {/* Health score */}
        <BentoCard className="flex flex-col justify-between">
          <span className="pill bg-mint/15 text-mint w-fit">Great</span>
          <div>
            <p className="text-2xl font-semibold">87</p>
            <p className="text-xs text-ink-2">Health score today</p>
          </div>
        </BentoCard>

        {/* Suggested meal */}
        <BentoCard span="full" interactive className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-canvas text-3xl">
            🥗
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-accent">From your fridge</p>
            <p className="font-semibold leading-tight">Warm chicken & feta bowl</p>
            <p className="text-xs text-ink-2">High protein · matches your taste · 22 min</p>
          </div>
          <span className="text-ink-3 text-xl">›</span>
        </BentoCard>
      </section>

      {/* The critical engine, shown live */}
      <section className="mt-7">
        <div className="mb-3 flex items-baseline justify-between px-1">
          <h2 className="text-lg font-semibold tracking-tight">Cheapest place to shop</h2>
          <span className="text-xs text-ink-2">3 missing items</span>
        </div>
        <StoreMatchCard quote={sampleQuote} />
      </section>

      <TabBar active="today" />
    </main>
  );
}

function Macro({
  name,
  value,
  pct,
  color,
}: {
  name: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-ink-2">{name}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-hairline">
        <div
          className="h-full rounded-full transition-all duration-700 ease-ios"
          style={{ width: `${Math.round(pct * 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
