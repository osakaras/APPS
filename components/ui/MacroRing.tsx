interface MacroRingProps {
  /** 0..1 fill. */
  value: number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
}

/** An Apple Fitness-style progress ring rendered as crisp SVG. */
export function MacroRing({
  value,
  label,
  sublabel,
  color = "#0A84FF",
  size = 92,
}: MacroRingProps) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = c * (1 - clamped);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-hairline"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.32,0.72,0,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-semibold tabular-nums">{label}</span>
          {sublabel && (
            <span className="text-[10px] text-ink-2 -mt-0.5">{sublabel}</span>
          )}
        </div>
      </div>
    </div>
  );
}
