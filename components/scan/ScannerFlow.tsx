"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { haptic, HAPTIC } from "@/lib/haptics";
import { clsx } from "@/lib/cn";
import type { PlateAnalysis } from "@/lib/ai/vision";
import type { Sentiment, HealthRating } from "@/lib/types";

type Phase = "idle" | "preview" | "analyzing" | "result" | "done";

const RATING_COLOR: Record<HealthRating, string> = {
  poor: "#C77A6E",
  fair: "#B08A52",
  good: "#6E8CA8",
  great: "#4E9E82",
  excellent: "#3DF5A0",
};

const MACRO_COLOR = { protein: "#4E9E82", carbs: "#B08A52", fat: "#8A77A8" } as const;

export function ScannerFlow() {
  const { d } = useLocale();
  const { configured } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PlateAnalysis | null>(null);
  const [mealId, setMealId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setPhase("preview");
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!image) return;
    setPhase("analyzing");
    haptic(HAPTIC.tick);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image, mediaType: "image/jpeg" }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      setMealId(data.mealId ?? null);
      haptic(HAPTIC.success);
      setPhase("result");
    } catch {
      setPhase("preview");
    }
  }

  async function recordSentiment(sentiment: Sentiment) {
    setBusy(true);
    haptic(HAPTIC.pulse);
    try {
      if (configured) {
        await fetch("/api/scan/sentiment", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ mealId, sentiment }),
        });
      }
      setPhase("done");
      setTimeout(() => window.location.assign("/"), 1100);
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-12">
      {/* Header rail */}
      <div className="mb-6 flex items-center justify-between">
        <a
          href="/"
          className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-ink-2 transition active:scale-90"
          aria-label="Close"
        >
          ✕
        </a>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-3">
          Plate Scanner
        </span>
        <span className="h-9 w-9" />
      </div>

      {phase === "done" ? (
        <DoneCard label={d.scan.logged} />
      ) : phase === "result" && analysis ? (
        <ResultView analysis={analysis} onSentiment={recordSentiment} busy={busy} />
      ) : (
        <CaptureView
          phase={phase}
          image={image}
          d={d}
          onPick={() => fileRef.current?.click()}
          onAnalyze={analyze}
          onRetake={() => {
            setImage(null);
            setPhase("idle");
          }}
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFile}
        className="hidden"
      />
    </div>
  );
}

/* ── Capture / preview / analyzing ─────────────────────────────────────────── */
function CaptureView({
  phase,
  image,
  d,
  onPick,
  onAnalyze,
  onRetake,
}: {
  phase: Phase;
  image: string | null;
  d: ReturnType<typeof useLocale>["d"];
  onPick: () => void;
  onAnalyze: () => void;
  onRetake: () => void;
}) {
  const analyzing = phase === "analyzing";
  return (
    <div className="flex flex-1 flex-col">
      <button
        onClick={!image ? onPick : undefined}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-4xl border border-white/10 bg-[#0C0D12]"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="meal" className="h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center px-10 text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-white/40">
            {d.scan.capturePrompt}
          </span>
        )}

        {/* Viewfinder ticks */}
        {!image && <Viewfinder />}

        {/* Scan overlay */}
        {analyzing && (
          <>
            <div className="absolute inset-0 bg-[#0C0D12]/40" />
            <div className="absolute inset-x-0 top-0 h-1/2 animate-scanline bg-gradient-to-b from-transparent via-[#3DF5A0]/30 to-[#3DF5A0]/60" />
            <span className="absolute inset-x-0 bottom-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-[#3DF5A0]">
              {d.scan.analyzing}…
            </span>
          </>
        )}
      </button>

      {!image && (
        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
          {d.scan.capture}
        </p>
      )}

      <div className="mt-auto pt-6">
        {!image ? (
          <div className="flex">
            <PrimaryButton onClick={onPick}>{d.scan.capturePrompt}</PrimaryButton>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onRetake}
              disabled={analyzing}
              className="rounded-3xl px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2 transition active:scale-95 disabled:opacity-40"
            >
              {d.scan.retake}
            </button>
            <PrimaryButton onClick={onAnalyze} disabled={analyzing}>
              {analyzing ? "…" : d.scan.analyze}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

function Viewfinder() {
  const corner = "absolute h-5 w-5 border-white/30";
  return (
    <>
      <span className={clsx(corner, "left-4 top-4 border-l-2 border-t-2 rounded-tl-lg")} />
      <span className={clsx(corner, "right-4 top-4 border-r-2 border-t-2 rounded-tr-lg")} />
      <span className={clsx(corner, "bottom-4 left-4 border-b-2 border-l-2 rounded-bl-lg")} />
      <span className={clsx(corner, "bottom-4 right-4 border-b-2 border-r-2 rounded-br-lg")} />
    </>
  );
}

/* ── Result + macro telemetry + palate response ────────────────────────────── */
function ResultView({
  analysis,
  onSentiment,
  busy,
}: {
  analysis: PlateAnalysis;
  onSentiment: (s: Sentiment) => void;
  busy: boolean;
}) {
  const { d } = useLocale();
  const color = RATING_COLOR[analysis.health_rating];
  const macros: [string, number, string, string][] = [
    ["Protein", analysis.protein_g, "g", MACRO_COLOR.protein],
    ["Carbs", analysis.carbs_g, "g", MACRO_COLOR.carbs],
    ["Fat", analysis.fat_g, "g", MACRO_COLOR.fat],
  ];
  const sentiments: [Sentiment, string][] = [
    ["loved", d.scan.loved],
    ["liked", d.scan.liked],
    ["neutral", d.scan.neutral],
    ["disliked", d.scan.disliked],
    ["hated", d.scan.hated],
  ];

  return (
    <div className="animate-pop-in">
      {/* Macro telemetry panel */}
      <section className="rounded-4xl bg-[#0C0D12] p-6 text-white shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
              Macro Telemetry · kcal
            </p>
            <p className="mt-1.5 font-mono text-[2.75rem] font-semibold leading-none tabular-nums">
              {Math.round(analysis.kcal)}
            </p>
          </div>
          <span
            className="mt-1 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{ color, borderColor: `${color}55` }}
          >
            {analysis.health_rating}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          {macros.map(([label, value, unit, c]) => (
            <div key={label}>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{label}</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                {Math.round(value)}
                <span className="text-xs text-white/35">{unit}</span>
              </p>
              <div className="mt-2 h-px w-full bg-white/10">
                <div className="h-full" style={{ width: "100%", backgroundColor: c }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Title + notes */}
      <div className="mt-5">
        <h1 className="text-xl font-semibold tracking-tight">{analysis.title}</h1>
        <p className="mt-1.5 text-[13px] leading-snug text-ink-2">{analysis.health_notes}</p>
      </div>

      {/* Detected items */}
      <p className="mb-2 mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
        Detected · {analysis.items.length}
      </p>
      <div className="space-y-1.5">
        {analysis.items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-hairline bg-surface px-4 py-2.5"
          >
            <span className="text-sm font-medium capitalize">{item.label}</span>
            <span className="font-mono text-[11px] tabular-nums text-ink-3">
              {item.quantity ? `${Math.round(item.quantity)}${item.unit ?? ""}` : "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Palate response → taste matrix */}
      <div className="mt-7 rounded-4xl border border-hairline bg-surface p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">Palate Response</p>
        <p className="mt-1.5 text-[15px] font-semibold tracking-tight">{d.scan.palateQ}</p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {sentiments.map(([key, label]) => (
            <button
              key={key}
              disabled={busy}
              onClick={() => onSentiment(key)}
              className="flex flex-col items-center gap-1 rounded-2xl border border-hairline bg-canvas py-2.5 transition active:scale-95 disabled:opacity-40"
            >
              <span className="text-base">{SENTIMENT_GLYPH[key]}</span>
              <span className="text-center font-mono text-[8px] uppercase leading-tight tracking-[0.06em] text-ink-2">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const SENTIMENT_GLYPH: Record<Sentiment, string> = {
  loved: "◆",
  liked: "▲",
  neutral: "■",
  disliked: "▽",
  hated: "○",
};

function DoneCard({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center animate-fade-up">
      <div className="relative grid h-20 w-20 place-items-center">
        <span className="absolute inset-0 rounded-full bg-[#4E9E82]/30 animate-pulse-ring" />
        <div className="grid h-20 w-20 place-items-center rounded-full border border-[#4E9E82]/60">
          <span
            className="h-3 w-3 rounded-full bg-[#4E9E82]"
            style={{ boxShadow: "0 0 22px 4px rgba(78,158,130,0.7)" }}
          />
        </div>
      </div>
      <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.24em] text-[#3DA37A]">{label}</p>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex-1 rounded-3xl px-6 py-4 font-mono text-[12px] uppercase tracking-[0.14em] text-white transition active:scale-[0.97]",
        disabled ? "cursor-not-allowed bg-ink-3" : "bg-[#0C0D12]",
      )}
    >
      {children}
    </button>
  );
}
