import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from "remotion";
import { colors, fonts } from "../theme";
import { Caption } from "../components/Caption";
import { LowerThird } from "../components/LowerThird";

const STATS = [
  { label: "Total Jobs", value: 12, color: colors.accentBright },
  { label: "Active Jobs", value: 5, color: colors.scoreHigh },
  { label: "Screenings Run", value: 47, color: colors.scoreMid },
  { label: "Total Candidates", value: 184, color: "#A78BFA" },
];

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {/* If you have a screenshot, uncomment: */}
      {/* <Img src={staticFile("screenshots/dashboard.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> */}

      {/* Animated stat cards (used as overlay or standalone) */}
      <div
        style={{
          padding: 80,
          paddingTop: 140,
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 44,
            fontWeight: 700,
            color: colors.textPrimary,
            marginBottom: 12,
          }}
        >
          Recruiter Dashboard
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 22,
            color: colors.textSecondary,
            marginBottom: 56,
          }}
        >
          Every job, every candidate, every screening — at a glance.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 32,
          }}
        >
          {STATS.map((stat, i) => {
            const enter = spring({
              frame: frame - i * 12,
              fps,
              config: { damping: 14, stiffness: 100 },
            });
            const value = Math.floor(
              interpolate(frame - i * 12, [0, 60], [0, stat.value], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            );
            return (
              <div
                key={stat.label}
                style={{
                  opacity: enter,
                  transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
                  background: colors.bgElevated,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 16,
                  padding: 32,
                  boxShadow: `0 12px 48px rgba(0,0,0,0.4)`,
                }}
              >
                <div
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 18,
                    color: colors.textSecondary,
                    marginBottom: 16,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 80,
                    fontWeight: 800,
                    color: stat.color,
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LowerThird label="Recruiter Dashboard" delay={20} />
      <Caption text="One screen. Total visibility." position="bottom" delay={120} size="md" />
    </AbsoluteFill>
  );
};
