import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { Caption } from "../components/Caption";
import { LowerThird } from "../components/LowerThird";

const SOURCES = [
  { icon: "👤", label: "Umurava Profile", desc: "Native platform integration" },
  { icon: "📊", label: "CSV / Excel", desc: "Spreadsheet uploads" },
  { icon: "📄", label: "PDF Resume", desc: "Auto-parsed by AI" },
  { icon: "🔗", label: "Resume URL", desc: "SSRF-protected fetch" },
];

export const IngestionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEnter = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <div style={{ padding: 80, paddingTop: 100 }}>
        <div
          style={{
            opacity: titleEnter,
            fontFamily: fonts.display,
            fontSize: 44,
            fontWeight: 700,
            color: colors.textPrimary,
            marginBottom: 12,
          }}
        >
          Multi-Source Ingestion
        </div>
        <div
          style={{
            opacity: titleEnter,
            fontFamily: fonts.body,
            fontSize: 22,
            color: colors.textSecondary,
            marginBottom: 64,
          }}
        >
          Same pipeline. Same scoring quality. Any candidate source.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 40,
          }}
        >
          {SOURCES.map((source, i) => {
            const enter = spring({
              frame: frame - 30 - i * 18,
              fps,
              config: { damping: 14, stiffness: 90 },
            });
            const translateX = interpolate(enter, [0, 1], [-60, 0]);

            return (
              <div
                key={source.label}
                style={{
                  opacity: enter,
                  transform: `translateX(${translateX}px)`,
                  background: colors.bgElevated,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 16,
                  padding: 36,
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                }}
              >
                <div
                  style={{
                    fontSize: 64,
                    width: 100,
                    height: 100,
                    background: colors.bg,
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {source.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: fonts.display,
                      fontSize: 32,
                      fontWeight: 700,
                      color: colors.textPrimary,
                      marginBottom: 6,
                    }}
                  >
                    {source.label}
                  </div>
                  <div
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 18,
                      color: colors.textSecondary,
                    }}
                  >
                    {source.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LowerThird label="Multi-Source Ingestion" delay={20} />
      <Caption
        text="Umurava profiles, CSV, PDF, or URL — all roads lead to ranked results."
        position="bottom"
        delay={180}
        size="md"
      />
    </AbsoluteFill>
  );
};
