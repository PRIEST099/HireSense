"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface ScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
  showValue?: boolean;
  color?: string;
  /** Delay before the ring starts drawing, in ms. */
  animationDelay?: number;
}

function scoreColor(s: number) {
  return s >= 85 ? "var(--paper-green)" : s >= 70 ? "var(--paper-amber)" : "var(--paper-red)";
}

export function ScoreRing({
  score,
  size = 72,
  stroke = 6,
  showValue = true,
  color,
  animationDelay = 200,
}: ScoreRingProps) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const targetOffset = circ * (1 - score / 100);
  const c = color || scoreColor(score);
  const animatedValue = useCountUp(score, 1200, animationDelay);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--paper-radar-grid)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={c}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeLinecap="round"
          className="wb-draw-ring"
          style={
            {
              ["--ring-start" as string]: circ,
              ["--ring-end" as string]: targetOffset,
              ["--wb-delay" as string]: `${animationDelay}ms`,
            } as React.CSSProperties
          }
        />
      </svg>
      {showValue && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size / 3,
            fontWeight: 700,
            color: c,
            fontFamily: "var(--font-caveat), 'Caveat', cursive",
          }}
        >
          {animatedValue}
        </div>
      )}
    </div>
  );
}
