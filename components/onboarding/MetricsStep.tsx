"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { MetricField } from "@/components/onboarding/MetricField";

export interface Metrics {
  age: string;
  weight: string;
  height: string;
}

/**
 * Step 2 — minimal metric capture. Values are lifted to the flow so Step 3's
 * gauge can react in real time.
 */
export function MetricsStep({
  metrics,
  onChange,
}: {
  metrics: Metrics;
  onChange: (m: Metrics) => void;
}) {
  const { d } = useLocale();
  const set = (k: keyof Metrics) => (v: string) => onChange({ ...metrics, [k]: v });

  return (
    <div className="animate-pop-in">
      <h1 className="text-3xl font-semibold tracking-tight">{d.metrics.title}</h1>
      <p className="mt-2 text-ink-2">{d.metrics.subtitle}</p>

      <div className="mt-7 space-y-4">
        <MetricField label={d.metrics.age} value={metrics.age} onChange={set("age")} unit={d.metrics.years} max={120} />
        <MetricField label={d.metrics.weight} value={metrics.weight} onChange={set("weight")} unit="kg" max={400} />
        <MetricField label={d.metrics.height} value={metrics.height} onChange={set("height")} unit="cm" max={260} />
      </div>
    </div>
  );
}
