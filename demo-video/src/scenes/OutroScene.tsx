import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../theme";
import { PaperBackground } from "../components/PaperBackground";
import { BrandFunnelIcon } from "../components/BrandFunnelIcon";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoEnter = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
  const tag1Enter = spring({ frame: frame - 30, fps, config: { damping: 18, stiffness: 100 } });
  const tag2Enter = spring({ frame: frame - 60, fps, config: { damping: 18, stiffness: 100 } });
  const linksEnter = spring({ frame: frame - 100, fps, config: { damping: 18, stiffness: 100 } });

  return (
    <PaperBackground>
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 80,
        }}
      >
        {/* Logo */}
        <div
          style={{
            opacity: logoEnter,
            transform: `scale(${interpolate(logoEnter, [0, 1], [0.7, 1])})`,
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 56,
          }}
        >
          <BrandFunnelIcon size={96} color={colors.paperAccent} />
          <span
            style={{
              fontFamily: fonts.caveat,
              fontSize: 128,
              fontWeight: 700,
              color: colors.paperText1,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            HireSense
          </span>
        </div>

        {/* Taglines */}
        <div
          style={{
            opacity: tag1Enter,
            transform: `translateY(${interpolate(tag1Enter, [0, 1], [20, 0])}px)`,
            fontFamily: fonts.caveat,
            fontSize: 48,
            color: colors.paperText2,
            textAlign: "center",
            marginBottom: 12,
            fontWeight: 600,
          }}
        >
          Not a hackathon prototype.
        </div>
        <div
          style={{
            opacity: tag2Enter,
            transform: `translateY(${interpolate(tag2Enter, [0, 1], [20, 0])}px)`,
            fontFamily: fonts.caveat,
            fontSize: 48,
            fontWeight: 700,
            color: colors.paperAccent,
            textAlign: "center",
            marginBottom: 80,
            position: "relative",
          }}
        >
          The screening tool Umurava recruiters will use tomorrow.
          <svg
            width="80%"
            height="14"
            viewBox="0 0 800 14"
            style={{ position: "absolute", bottom: -10, left: "10%" }}
            preserveAspectRatio="none"
          >
            <path
              d="M2 8 Q 100 2, 200 7 T 400 6 T 600 8 T 798 5"
              stroke={colors.paperAccent}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="1600"
              strokeDashoffset={interpolate(frame, [60, 110], [1600, 0], {
                extrapolateRight: "clamp",
              })}
            />
          </svg>
        </div>

        {/* Links */}
        <div
          style={{
            opacity: linksEnter,
            transform: `translateY(${interpolate(linksEnter, [0, 1], [20, 0])}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: fonts.caveat,
              fontSize: 32,
              color: colors.paperText1,
              background: colors.paperCard,
              border: `2px solid ${colors.paperAccent}`,
              padding: "14px 36px",
              borderRadius: 8,
              fontWeight: 700,
              boxShadow: "2px 3px 0 #171826",
            }}
          >
            🔗 hire-sense-omega.vercel.app
          </div>
          <div
            style={{
              fontFamily: fonts.caveat,
              fontSize: 22,
              color: colors.paperText3,
              fontWeight: 600,
            }}
          >
            📂 github.com/PRIEST099/HireSense
          </div>
        </div>
      </div>
    </PaperBackground>
  );
};
