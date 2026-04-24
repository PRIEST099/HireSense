interface BrandFunnelIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * HireSense AI brand logo — a screening funnel.
 *
 * Top: four candidate dots entering
 * Middle: a V-shaped funnel narrowing the pool
 * Bottom: one filtered star emerging — the top match
 *
 * Uses currentColor for fill/stroke so it inherits from its parent
 * (works on both indigo chip backgrounds and on-paper placement).
 * Gets the global hand-drawn wobble via the `lucide` className, which
 * is caught by the `svg.lucide` filter rule in globals.css.
 */
export function BrandFunnelIcon({ size = 24, color = "currentColor", className = "" }: BrandFunnelIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`lucide no-sketch ${className}`}
    >
      {/* Candidates entering at the top (4 dots) */}
      <circle cx="5" cy="4" r="1.6" fill={color} stroke="none" />
      <circle cx="12" cy="4" r="1.6" fill={color} stroke="none" />
      <circle cx="20" cy="4" r="1.6" fill={color} stroke="none" />
      <circle cx="27" cy="4" r="1.6" fill={color} stroke="none" />

      {/* Funnel body — wide at top, narrowing to a tube */}
      <path d="M2 8 L14 18 L14 22 L18 22 L18 18 L30 8" />

      {/* Filtered top match — a single star emerging below */}
      <path
        d="M16 24.2 L17.35 26.9 L20.3 27.35 L18.15 29.4 L18.7 32.3 L16 30.95 L13.3 32.3 L13.85 29.4 L11.7 27.35 L14.65 26.9 Z"
        fill={color}
        stroke="none"
      />
    </svg>
  );
}
