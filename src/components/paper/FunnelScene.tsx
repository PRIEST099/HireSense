"use client";

/**
 * FunnelScene — the hero visualization for the landing page.
 *
 * Rebuilt to match the hand-drawn sketch spec. Tells the full screening
 * story in one self-contained illustration (no side labels needed).
 *
 * Top     → many person-silhouette avatars + floating skill tags + stray dots
 * Middle  → classic 3D-ish cone funnel with hatching + central "AI" badge
 *           with circuit traces + particles streaming down
 * Bottom  → 3 ranked output cards (silhouette + 1/2/3 badge + stars + score)
 *           with dotted trails coming out of the funnel mouth
 * Caption → "Best candidates, ranked for you" with a green underline
 *
 * All motion is CSS-only. Self-documenting; no legend required.
 */

const W = 480;
const H = 600;

/* ── TOP ROW: scattered person silhouettes ───────────────────────────── */
type SilhouetteStatus = "accepted" | "rejected" | "pending" | "selected";

interface Silhouette {
  x: number;
  y: number;
  size: number;
  rot: number;
  delay: number;
  status: SilhouetteStatus;
}
// 3 accepted (green) pair 1:1 with the 3 output cards,
// 3 rejected (red) dissolve in the funnel,
// 6 pending (indigo) are the general pool.
const AVATARS: Silhouette[] = [
  { x: 90,  y: 12, size: 36, rot: -4, delay: 0,    status: "accepted" }, // → card 1
  { x: 150, y: 2,  size: 32, rot: 2,  delay: 150,  status: "rejected" },
  { x: 210, y: 14, size: 38, rot: -3, delay: 300,  status: "pending"  },
  { x: 270, y: 4,  size: 34, rot: 4,  delay: 450,  status: "accepted" }, // → card 2
  { x: 330, y: 12, size: 36, rot: -2, delay: 600,  status: "pending"  },
  { x: 60,  y: 52, size: 30, rot: 3,  delay: 750,  status: "pending"  },
  { x: 120, y: 60, size: 32, rot: -3, delay: 900,  status: "rejected" },
  { x: 180, y: 48, size: 34, rot: 1,  delay: 1050, status: "pending"  },
  { x: 240, y: 60, size: 32, rot: -2, delay: 1200, status: "pending"  },
  { x: 300, y: 50, size: 34, rot: 3,  delay: 1350, status: "accepted" }, // → card 3
  { x: 360, y: 62, size: 30, rot: -4, delay: 1500, status: "rejected" },
  { x: 395, y: 16, size: 28, rot: 5,  delay: 1650, status: "pending"  },
];

/* ── TOP ROW: floating skill tags ────────────────────────────────────── */
interface SkillTag {
  label: string;
  x: number;
  y: number;
  rot: number;
  delay: number;
}
const TAGS: SkillTag[] = [
  { label: "Python",    x: 60,  y: 34, rot: -5, delay: 200 },
  { label: "AWS",       x: 140, y: 86, rot: 4,  delay: 500 },
  { label: "SQL",       x: 222, y: 88, rot: -3, delay: 800 },
  { label: "UI/UX",     x: 312, y: 84, rot: 5,  delay: 1100 },
  { label: "Marketing", x: 380, y: 38, rot: -4, delay: 1400 },
];

/* ── Floating dots / stray specks near the top of the funnel ─────────── */
const DOTS: { x: number; y: number; r: number; delay: number }[] = [
  { x: 105, y: 45, r: 2,   delay: 100 },
  { x: 185, y: 30, r: 2.5, delay: 400 },
  { x: 268, y: 42, r: 1.8, delay: 700 },
  { x: 330, y: 28, r: 2.2, delay: 1000 },
  { x: 380, y: 70, r: 2,   delay: 1300 },
  { x: 85,  y: 80, r: 1.8, delay: 1600 },
];

/* ── AI branch dots: 8 terminal nodes emitting inward toward the chip ───
      Each dot follows its circuit trace exactly (offset-path), including
      the L-shape kink on the 4 diagonal traces. Positioned absolutely
      at each terminal in scene coordinates; AI badge center = (240, 270). */
interface BranchDot {
  /** Scene-coord X/Y of the terminal node (where the dot starts). */
  x: number;
  y: number;
  /** Offset-path (relative to start, i.e. M 0 0 L ...) along the trace. */
  path: string;
  delay: number;
}
// One-at-a-time firing: each dot owns one of 8 time-slots in a 14s cycle
// (1.75s per slot). Slot index is hand-shuffled so the visible firing
// pattern around the chip looks random rather than clockwise.
//
// Firing order (slot 0 → 7): up-left, top, down-left, right, up-right,
// down-right, left, bottom.
const BRANCH_DOTS: BranchDot[] = [
  // Horizontal (straight line from terminal to chip edge)
  { x: 306, y: 270, path: "M 0 0 L -36 0",              delay:  5250 }, // slot 3 — right
  { x: 174, y: 270, path: "M 0 0 L 36 0",               delay: 10500 }, // slot 6 — left
  // Vertical (straight line)
  { x: 240, y: 212, path: "M 0 0 L 0 28",               delay:  1750 }, // slot 1 — top
  { x: 240, y: 328, path: "M 0 0 L 0 -28",              delay: 12250 }, // slot 7 — bottom
  // Diagonals — L-shape: first horizontal to the kink, then diagonal to the chip edge.
  { x: 290, y: 236, path: "M 0 0 L -16 0 L -29 13",     delay:  7000 }, // slot 4 — up-right
  { x: 190, y: 236, path: "M 0 0 L 16 0 L 29 13",       delay:     0 }, // slot 0 — up-left
  { x: 290, y: 304, path: "M 0 0 L -16 0 L -29 -13",    delay:  8750 }, // slot 5 — down-right
  { x: 190, y: 304, path: "M 0 0 L 16 0 L 29 -13",      delay:  3500 }, // slot 2 — down-left
];

/* ── Descending silhouettes: emerge from AI bottom, travel *along* the
      dashed downlink path (through the funnel mouth), land on their card ── */
interface Descender {
  /** Starting scene coord (AI chip bottom). */
  startX: number;
  startY: number;
  /** CSS offset-path string, in coords relative to the descender's own box.
      Must match the corresponding dashed downlink path (below). */
  path: string;
  delay: number;
  status: SilhouetteStatus;
}
// Paths share shape with the downlink SVG paths:
//   Flowchart-style right-angle branches (no curves):
//   Start (0, 0) = AI chip bottom
//   Go straight down through the funnel mouth to y=115 (branch point)
//   Then horizontal to the card's X (left=-108, middle=0, right=108)
//   Then straight down to the card top at dy=144
const DESCENDER_PATHS = [
  "M 0 0 L 0 115 L -108 115 L -108 144",
  "M 0 0 L 0 144",
  "M 0 0 L 0 115 L 108 115 L 108 144",
] as const;
const DESCENDERS: Descender[] = [
  { startX: 240, startY: 296, delay: 1000, status: "accepted", path: DESCENDER_PATHS[0] },
  { startX: 240, startY: 296, delay: 1400, status: "accepted", path: DESCENDER_PATHS[1] },
  { startX: 240, startY: 296, delay: 1800, status: "accepted", path: DESCENDER_PATHS[2] },
];

/* ── Screening-response pulses: one pulse per output card, every cycle.
      Exactly 3 responses per screening — the AI produces 3 results and
      pushes them down the 3 branch paths to fill the 3 cards. Small
      inter-card stagger so the batch reads as an organic "here are the
      top 3" rather than a synchronized strobe. */
interface DataPulse {
  path: string;
  delay: number;
}
const DATA_PULSES: DataPulse[] = [
  { path: DESCENDER_PATHS[0], delay: 0   },
  { path: DESCENDER_PATHS[1], delay: 250 },
  { path: DESCENDER_PATHS[2], delay: 500 },
];

/* ── OUTPUT CARDS ────────────────────────────────────────────────────── */
interface OutputCard {
  rank: 1 | 2 | 3;
  stars: number;
  score: number;
}
const OUTPUTS: OutputCard[] = [
  { rank: 1, stars: 5, score: 94 },
  { rank: 2, stars: 4, score: 92 },
  { rank: 3, stars: 4, score: 90 },
];

/* ────────────────────────────────────────────────────────────────────── */

function PersonSilhouette({
  size = 32,
  status = "pending",
}: {
  size?: number;
  status?: SilhouetteStatus;
}) {
  // "selected" uses the platform's indigo accent so the result cards
  // share the same blue palette as the rest of the funnel/platform.
  // Distinction from the top-scatter "pending" silhouettes comes from
  // the context (they sit in ranked, bordered cards) + the flash glow.
  const ring =
    status === "selected"
      ? "var(--paper-accent)"
      : status === "accepted"
      ? "var(--paper-green)"
      : status === "rejected"
      ? "var(--paper-red)"
      : "var(--paper-accent)";
  const person =
    status === "selected"
      ? "var(--paper-accent)"
      : status === "accepted"
      ? "var(--paper-green)"
      : status === "rejected"
      ? "var(--paper-red)"
      : "var(--paper-text-2)";
  const opacity = status === "rejected" ? 0.75 : 0.95;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="lucide no-sketch" aria-hidden="true">
      <circle
        cx="20"
        cy="20"
        r="19"
        fill="var(--paper-card)"
        stroke={ring}
        strokeWidth="1.6"
        opacity={opacity}
      />
      {/* head */}
      <circle cx="20" cy="15" r="5.5" fill="none" stroke={person} strokeWidth="1.4" opacity={opacity} />
      {/* shoulders */}
      <path
        d="M 9 33 C 10 25, 15 22, 20 22 C 25 22, 30 25, 31 33"
        fill="none"
        stroke={person}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity={opacity}
      />
    </svg>
  );
}

function RankBadge({ n }: { n: 1 | 2 | 3 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "var(--paper-accent)",
        border: "1.5px solid var(--paper-text-1)",
        color: "#fff",
        fontSize: 15,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "1px 1px 0 var(--paper-text-1)",
        fontFamily: "var(--font-caveat), 'Caveat', cursive",
      }}
    >
      {n}
    </span>
  );
}

function StarRow({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: 1.5 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2 L15 9 L22 9 L16.5 13.5 L19 21 L12 17 L5 21 L7.5 13.5 L2 9 L9 9 Z"
            fill={i < count ? "var(--paper-accent)" : "none"}
            stroke="var(--paper-accent)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

export function FunnelScene() {
  return (
    <div
      className="funnel-scene"
      style={{ position: "relative", width: W, height: H, maxWidth: "100%" }}
      aria-label="AI screening funnel: candidates flow through AI scoring and emerge ranked"
    >
      {/* ═══════ TOP BAND — scattered candidates + skill tags + dots ═══════ */}
      <div style={{ position: "absolute", top: 0, left: 0, width: W, height: 110 }}>
        {AVATARS.map((a, i) => {
          // Target point = AI badge center (silhouettes pass THROUGH the AI)
          const targetX = 240;
          const targetY = 270;
          const dx = targetX - (a.x + a.size / 2);
          const dy = targetY - (a.y + a.size / 2);
          return (
            <div
              key={`av-${i}`}
              className="funnel-input-pill"
              data-status={a.status}
              style={
                {
                  position: "absolute",
                  left: a.x,
                  top: a.y,
                  width: a.size,
                  height: a.size,
                  ["--fp-rot" as string]: `${a.rot}deg`,
                  ["--fp-dx" as string]: `${dx}px`,
                  ["--fp-dy" as string]: `${dy}px`,
                  ["--fp-delay" as string]: `${a.delay}ms`,
                  animationDelay: `${a.delay}ms`,
                } as React.CSSProperties
              }
            >
              <PersonSilhouette size={a.size} status={a.status} />
            </div>
          );
        })}
        {TAGS.map((t, i) => {
          const targetX = 240;
          const targetY = 270;
          // Tag is small, ~25px wide so use its approximate center
          const dx = targetX - (t.x + 25);
          const dy = targetY - (t.y + 10);
          return (
            <span
              key={`tg-${i}`}
              className="funnel-input-pill"
              style={
                {
                  position: "absolute",
                  left: t.x,
                  top: t.y,
                  ["--fp-rot" as string]: `${t.rot}deg`,
                  ["--fp-dx" as string]: `${dx}px`,
                  ["--fp-dy" as string]: `${dy}px`,
                  ["--fp-delay" as string]: `${t.delay}ms`,
                  animationDelay: `${t.delay}ms`,
                  padding: "1px 7px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--paper-accent)",
                  background: "var(--paper-accent-soft)",
                  border: "1.2px solid var(--paper-border-acc)",
                  borderRadius: 10,
                  fontFamily: "var(--font-caveat), 'Caveat', cursive",
                  whiteSpace: "nowrap",
                } as React.CSSProperties
              }
            >
              {t.label}
            </span>
          );
        })}
        {/* stray specks */}
        <svg width={W} height={110} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
          {DOTS.map((d, i) => (
            <circle
              key={`d-${i}`}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="var(--paper-accent)"
              className="funnel-particle-stray"
              style={{ animationDelay: `${d.delay}ms` } as React.CSSProperties}
            />
          ))}
        </svg>
      </div>

      {/* ═══════ MIDDLE — the funnel itself + AI badge ═══════════════════ */}
      <svg
        width={W}
        height={300}
        viewBox={`0 0 ${W} 300`}
        style={{ position: "absolute", top: 130, left: 0, overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="funnel-wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(79,70,229,0.18)" />
            <stop offset="100%" stopColor="rgba(79,70,229,0.04)" />
          </linearGradient>
        </defs>

        {/* Cone geometry — wrapped in a hand-drawn displacement filter so the
            walls and lip wobble like a pen sketch, while crisp elements
            (labels, particles, AI badge, trails, neurolinks) sit outside. */}
        <g filter="url(#funnel-sketch)">
          {/* Top lip ellipse — gives the funnel its "cup" perspective */}
          <ellipse
            cx={W / 2}
            cy="14"
            rx="195"
            ry="14"
            fill="url(#funnel-wall)"
            stroke="var(--paper-accent)"
            strokeWidth="2"
          />

          {/* Cone body */}
          <path
            d={`M ${W / 2 - 195} 14 L 220 220 L 220 270 L 260 270 L 260 220 L ${W / 2 + 195} 14`}
            fill="url(#funnel-wall)"
            stroke="var(--paper-accent)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Hatching on cone walls (subtle, sketch-style) */}
          <g stroke="var(--paper-accent)" strokeWidth="0.6" opacity="0.22">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const t = i / 7;
              const yTop = 20 + t * 15;
              const yBot = 40 + t * 180;
              const xLeftTop = W / 2 - 190 + t * 20;
              const xLeftBot = 225 + t * 3;
              const xRightTop = W / 2 + 190 - t * 20;
              const xRightBot = 255 - t * 3;
              return (
                <g key={i}>
                  <line x1={xLeftTop} y1={yTop} x2={xLeftBot} y2={yBot} />
                  <line x1={xRightTop} y1={yTop} x2={xRightBot} y2={yBot} />
                </g>
              );
            })}
          </g>

          {/* Bottom mouth ellipse (small) */}
          <ellipse
            cx="240"
            cy="270"
            rx="20"
            ry="4"
            fill="var(--paper-card)"
            stroke="var(--paper-accent)"
            strokeWidth="1.5"
          />
        </g>

        {/* AI BADGE: chip + 8 circuit branches + thinking dots streaming in */}
        <g transform="translate(240, 140)" className="funnel-ai-badge">
          {/* Circuit traces — horizontal + vertical + diagonal (dashed) */}
          <g stroke="var(--paper-accent)" strokeWidth="1.2" opacity="0.85">
            {/* Horizontal */}
            <line x1="-30" y1="0" x2="-66" y2="0" strokeDasharray="3 3" />
            <line x1="30" y1="0" x2="66" y2="0" strokeDasharray="3 3" />
            {/* Vertical */}
            <line x1="0" y1="-30" x2="0" y2="-58" strokeDasharray="3 3" />
            <line x1="0" y1="30" x2="0" y2="58" strokeDasharray="3 3" />
            {/* Diagonals with step kinks */}
            <path d="M 21 -21 L 34 -34 L 50 -34" fill="none" strokeDasharray="3 3" />
            <path d="M -21 -21 L -34 -34 L -50 -34" fill="none" strokeDasharray="3 3" />
            <path d="M 21 21 L 34 34 L 50 34" fill="none" strokeDasharray="3 3" />
            <path d="M -21 21 L -34 34 L -50 34" fill="none" strokeDasharray="3 3" />
            {/* Trace nodes — these are the BRANCH ENDS */}
            {[
              [-66, 0], [66, 0], [0, -58], [0, 58],
              [50, -34], [-50, -34], [50, 34], [-50, 34],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.2" fill="var(--paper-accent)" stroke="none" />
            ))}
          </g>

          {/* Pulse ring */}
          <circle r="34" fill="none" stroke="var(--paper-accent)" strokeOpacity="0.35" strokeWidth="1.5" className="funnel-ai-pulse" />
          {/* Core white circle */}
          <circle r="26" fill="var(--paper-card)" stroke="var(--paper-accent)" strokeWidth="2.2" />
          {/* "AI" label */}
          <text
            textAnchor="middle"
            dominantBaseline="central"
            y="1"
            fontSize="18"
            fontWeight="700"
            fill="var(--paper-accent)"
            fontFamily="var(--font-caveat), 'Caveat', cursive"
          >
            AI
          </text>
        </g>
      </svg>

      {/* ═══════ AI BOTTOM → OUTPUT CARDS: 3 dashed green downlinks ══════ */}
      {/* Overlay SVG spans from just under the AI chip to the card tops.
          These are the ONLY dashed lines in the scene — the paths along
          which accepted silhouettes descend into their output cards. */}
      <svg
        width={W}
        height={160}
        viewBox={`0 0 ${W} 160`}
        style={{
          position: "absolute",
          top: 296,
          left: 0,
          pointerEvents: "none",
          overflow: "visible",
        }}
        aria-hidden="true"
      >
        <g
          className="funnel-ai-downlinks"
          stroke="var(--paper-accent)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
        >
          {/* Flowchart-style right-angle branches. Each path descends from
              AI chip bottom (240, 0) through the funnel mouth to a shared
              horizontal branch bar at y=115, then jogs right-angle to the
              card X, then drops straight down to the card top (y=144).
              Middle card is a plain vertical line. Must match DESCENDER_PATHS. */}
          <path d="M 240 0 L 240 115 L 132 115 L 132 144" />
          <path d="M 240 0 L 240 144" />
          <path d="M 240 0 L 240 115 L 348 115 L 348 144" />
        </g>
      </svg>

      {/* ═══════ AI BRANCH DOTS: 8 thinking pulses streaming into the chip
          Each dot is a 1×1 point positioned at a terminal node; its CSS
          offset-path matches the circuit trace exactly (including the
          L-shape kink on the 4 diagonal branches). */}
      {BRANCH_DOTS.map((b, i) => (
        <div
          key={`branch-${i}`}
          className="funnel-branch-dot"
          style={
            {
              position: "absolute",
              left: b.x,
              top: b.y,
              width: 1,
              height: 1,
              offsetPath: `path('${b.path}')`,
              offsetRotate: "0deg",
              animationDelay: `${b.delay}ms`,
              pointerEvents: "none",
              zIndex: 3,
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      ))}

      {/* ═══════ DESCENDING SILHOUETTES: fill each card once on mount ═══
          Each uses CSS `offset-path` so it *literally travels along its
          corresponding dashed downlink*, not in a straight line. */}
      {DESCENDERS.map((d, i) => (
        <div
          key={`desc-${i}`}
          className="funnel-descending-silhouette"
          style={
            {
              position: "absolute",
              left: d.startX - 18,
              top: d.startY - 18,
              width: 36,
              height: 36,
              offsetPath: `path('${d.path}')`,
              offsetRotate: "0deg",
              animationDelay: `${d.delay}ms`,
              pointerEvents: "none",
              zIndex: 5,
            } as React.CSSProperties
          }
        >
          <PersonSilhouette size={36} status={d.status} />
        </div>
      ))}

      {/* ═══════ CONTINUOUS DATA PULSES: small green dots forever flowing
          from the AI chip down each dashed line into its card. This is
          the ONGOING "AI is feeding the cards" visual so the viewer
          always sees the relationship after the one-shot descenders. */}
      {DATA_PULSES.map((p, i) => (
        <div
          key={`pulse-${i}`}
          className="funnel-data-pulse"
          style={
            {
              position: "absolute",
              left: 240,
              top: 296,
              width: 1,
              height: 1,
              offsetPath: `path('${p.path}')`,
              offsetRotate: "0deg",
              animationDelay: `${p.delay}ms`,
              pointerEvents: "none",
              zIndex: 4,
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      ))}

      {/* ═══════ BOTTOM — 3 ranked output cards ═══════════════════════════ */}
      <div
        style={{
          position: "absolute",
          top: 440,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 16,
          padding: "0 20px",
        }}
      >
        {OUTPUTS.map((o, i) => {
          // Cards start bunched toward the funnel mouth (center), slide out to flex positions
          const ocDx = i === 0 ? 108 : i === 2 ? -108 : 0;
          return (
          <div
            key={o.rank}
            className="funnel-output-card"
            style={
              {
                position: "relative",
                width: 92,
                minHeight: 108,
                padding: "8px 8px 10px",
                background: "var(--paper-card)",
                border: "1.8px solid var(--paper-accent)",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                boxShadow: "2px 3px 0 var(--paper-text-1), 0 6px 18px rgba(79,70,229,0.22)",
                ["--oc-dx" as string]: `${ocDx}px`,
                animationDelay: `${400 + i * 280}ms`,
                fontFamily: "var(--font-caveat), 'Caveat', cursive",
                transformOrigin: "top center",
              } as React.CSSProperties
            }
          >
            <RankBadge n={o.rank} />
            {/* Card content starts empty — fades in when the descending
                silhouette arrives at this card (~2.1s + i*400ms after mount). */}
            <div
              className="funnel-card-content"
              style={
                {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  ["--fill-delay" as string]: `${2400 + i * 400}ms`,
                } as React.CSSProperties
              }
            >
              {/* "selected" = vibrant blue: once the AI response lands in
                  the card, the silhouette turns blue to flag that a
                  specific candidate has been chosen.
                  The wrapper div runs a 3.2s flash animation phase-locked
                  to the data-pulse cycle (same duration + matching delay),
                  so the silhouette visibly pulses blue every time a new
                  screening response arrives at this card. */}
              <div
                className="funnel-card-silhouette-flash"
                style={{ animationDelay: `${i * 250}ms` }}
              >
                <PersonSilhouette size={40} status="selected" />
              </div>
              <StarRow count={o.stars} />
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--paper-accent)", lineHeight: 1 }}>
                {o.score}%
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {/* ═══════ CAPTION ═══════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          top: 572,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-block",
            position: "relative",
            fontSize: 16,
            color: "var(--paper-text-2)",
            fontWeight: 600,
            fontFamily: "var(--font-caveat), 'Caveat', cursive",
          }}
        >
          Best candidates, ranked for you
          <svg
            aria-hidden="true"
            viewBox="0 0 240 6"
            preserveAspectRatio="none"
            style={{ position: "absolute", bottom: -6, left: 0, width: "100%", height: 6 }}
          >
            <path
              d="M2 3 Q 30 0, 60 3 T 120 3 T 180 3 T 238 3"
              fill="none"
              stroke="var(--paper-green)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="260"
              className="wb-draw-underline"
              style={{ ["--underline-length" as string]: 260 } as React.CSSProperties}
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
