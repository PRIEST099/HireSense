import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors, timing } from "../theme";

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = (frame / timing.totalDurationFrames) * 100;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: `${progress}%`,
          height: 4,
          backgroundColor: colors.accentBright,
          boxShadow: `0 0 12px ${colors.accentBright}`,
          transition: "width 0.05s linear",
        }}
      />
    </AbsoluteFill>
  );
};
