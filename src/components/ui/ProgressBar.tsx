interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  size?: "sm" | "md";
}

const colors = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  yellow: "bg-yellow-500",
  red: "bg-red-600",
  purple: "bg-purple-600",
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

  return (
    <div>
      {(label || showValue) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-xs font-medium text-gray-600">{label}</span>}
          {showValue && <span className="text-xs font-medium text-gray-900">{Math.round(value)}</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${size === "sm" ? "h-1.5" : "h-2.5"}`}>
        <div
          className={`${colors[color]} rounded-full transition-all duration-500 ${size === "sm" ? "h-1.5" : "h-2.5"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "green" : score >= 50 ? "yellow" : "red";
  return <ProgressBar value={score} label={label} color={color} size="sm" />;
}
