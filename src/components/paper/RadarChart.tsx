interface RadarChartProps {
  skills: number;
  experience: number;
  education: number;
  culture: number;
  size?: number;
}

export function RadarChart({ skills, experience, education, culture, size = 180 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.34;
  const dims = [skills, experience, education, culture];
  const n = dims.length;
  const labels = ["Skills", "Exp", "Edu", "Culture"];

  function pt(i: number, v: number): [number, number] {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    const r = (v / 100) * R;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  const polyPoints = dims.map((v, i) => pt(i, v));
  const polyStr = polyPoints.map((p) => p.join(",")).join(" ");

  // Perimeter for stroke-dasharray draw-in animation
  let perimeter = 0;
  for (let i = 0; i < polyPoints.length; i++) {
    const [x1, y1] = polyPoints[i];
    const [x2, y2] = polyPoints[(i + 1) % polyPoints.length];
    perimeter += Math.hypot(x2 - x1, y2 - y1);
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ maxWidth: size, height: "auto", display: "block" }}
    >
      {/* grid rings */}
      {[0.25, 0.5, 0.75, 1].map((f, idx) => {
        const pts = dims
          .map((_, i) => {
            const a = (i / n) * 2 * Math.PI - Math.PI / 2;
            const r = R * f;
            return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
          })
          .join(" ");
        return (
          <polygon
            key={f}
            points={pts}
            fill="none"
            stroke="var(--paper-radar-grid)"
            strokeWidth="1"
            className="wb-radar-grid"
            style={{ ["--wb-delay" as string]: `${idx * 60}ms` } as React.CSSProperties}
          />
        );
      })}
      {/* spokes */}
      {dims.map((_, i) => {
        const [x, y] = pt(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--paper-radar-grid)"
            strokeWidth="1"
            className="wb-radar-spoke"
            style={{ ["--wb-delay" as string]: `${200 + i * 50}ms` } as React.CSSProperties}
          />
        );
      })}
      {/* value polygon — traces in */}
      <polygon
        points={polyStr}
        fill="var(--paper-accent-soft)"
        stroke="var(--paper-accent)"
        strokeWidth="2"
        strokeDasharray={perimeter}
        className="wb-draw-polygon"
        style={
          {
            ["--poly-start" as string]: perimeter,
            ["--poly-fill-opacity" as string]: 1,
            ["--wb-delay" as string]: "450ms",
          } as React.CSSProperties
        }
      />
      {/* labels */}
      {dims.map((_, i) => {
        const [x, y] = pt(i, 100);
        const lx = cx + (x - cx) * 1.3;
        const ly = cy + (y - cy) * 1.3;
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            fill="var(--paper-text-3)"
            fontSize="12"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-caveat), 'Caveat', cursive"
            className="wb-radar-label"
            style={{ ["--wb-delay" as string]: `${1350 + i * 60}ms` } as React.CSSProperties}
          >
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
}
