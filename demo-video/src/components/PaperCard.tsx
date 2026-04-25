import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, shadows } from "../theme";

interface Props {
  children: React.ReactNode;
  delay?: number;
  padding?: number;
  style?: React.CSSProperties;
  accentBorder?: boolean;
}

/**
 * Paper card — white background, sketch-style border, dual shadow.
 * Animates in with subtle scale + fade.
 */
export const PaperCard: React.FC<Props> = ({
  children,
  delay = 0,
  padding = 24,
  style,
  accentBorder = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.6 },
  });

  const scale = interpolate(enter, [0, 1], [0.96, 1]);
  const translateY = interpolate(enter, [0, 1], [16, 0]);

  return (
    <div
      style={{
        background: colors.paperCard,
        border: `1.5px solid ${accentBorder ? colors.paperInkAcc : colors.paperInk}`,
        borderRadius: 6,
        padding,
        boxShadow: shadows.paperCard,
        opacity: enter,
        transform: `translateY(${translateY}px) scale(${scale})`,
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
