interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  size?: "sm" | "md";
}

const colorMap: Record<string, string> = {
  blue: "var(--paper-accent)",
  green: "var(--paper-green)",
  yellow: "var(--paper-amber)",
  red: "var(--paper-red)",
  purple: "#7C3AED",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = "blue",
  size = "md",
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const h = size === "sm" ? 6 : 10;

  return (
    <div>
      {(label || showValue) && (
        <div className="flex justify-between mb-1">
          {label && <span style={{ fontSize: 15, fontWeight: 600, color: "var(--paper-text-3)" }}>{label}</span>}
          {showValue && (
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--paper-text-1)",
                fontFamily: "var(--font-caveat), 'Caveat', cursive",
              }}
            >
              {Math.round(value)}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: h,
          background: "var(--paper-radar-grid)",
          borderRadius: h / 2,
        }}
      >
        <div
          style={{
            height: h,
            background: colorMap[color],
            borderRadius: h / 2,
            width: `${pct}%`,
            transition: "width 0.5s",
          }}
        />
      </div>
    </div>
  );
}

export function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "green" : score >= 50 ? "yellow" : "red";
  return <ProgressBar value={score} label={label} color={color} size="sm" />;
}
