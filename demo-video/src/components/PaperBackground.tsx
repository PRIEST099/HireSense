import { AbsoluteFill } from "remotion";
import { colors } from "../theme";

/**
 * Paper-sketch background — cream paper with subtle wavy grid pattern.
 * Mirrors the .paper-bg + .paper-grid combination from globals.css
 */
export const PaperBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paperBg }}>
      {/* Grid pattern overlay */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.55 }}
      >
        <defs>
          <pattern id="paperGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="rgba(90, 120, 210, 0.18)"
              strokeWidth="1"
            />
          </pattern>
          <pattern id="paperGridLarge" width="160" height="160" patternUnits="userSpaceOnUse">
            <path
              d="M 160 0 L 0 0 0 160"
              fill="none"
              stroke="rgba(90, 120, 210, 0.3)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#paperGrid)" />
        <rect width="100%" height="100%" fill="url(#paperGridLarge)" />
      </svg>

      {/* Subtle vignette for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(80, 110, 200, 0.04) 100%)",
        }}
      />

      {children}
    </AbsoluteFill>
  );
};
