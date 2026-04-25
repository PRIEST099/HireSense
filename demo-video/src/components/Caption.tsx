import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

interface Props {
  text: string;
  position?: "top" | "bottom" | "center";
  delay?: number;
  size?: "sm" | "md" | "lg";
}

export const Caption: React.FC<Props> = ({
  text,
  position = "bottom",
  delay = 0,
  size = "md",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, stiffness: 100, mass: 0.5 },
  });

  const translateY = interpolate(opacity, [0, 1], [20, 0]);

  const fontSize = size === "lg" ? 56 : size === "md" ? 36 : 24;
  const verticalPos =
    position === "top" ? "10%" : position === "center" ? "45%" : "82%";

  return (
    <div
      style={{
        position: "absolute",
        top: verticalPos,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: fonts.display,
        fontWeight: 600,
        fontSize,
        color: colors.textPrimary,
        textShadow: "0 4px 24px rgba(0,0,0,0.8)",
        padding: "0 80px",
        lineHeight: 1.2,
        letterSpacing: -0.5,
      }}
    >
      {text}
    </div>
  );
};
