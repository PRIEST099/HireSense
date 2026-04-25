import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

type Variant = "default" | "success" | "warning" | "danger" | "info" | "accent";

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  size?: "sm" | "md";
  delay?: number;
}

const variants: Record<Variant, { bg: string; color: string; border: string }> = {
  default: {
    bg: "rgba(107, 115, 138, 0.1)",
    color: colors.paperText3,
    border: "rgba(107, 115, 138, 0.2)",
  },
  success: {
    bg: colors.paperGreenSoft,
    color: colors.paperGreen,
    border: "rgba(13, 148, 136, 0.3)",
  },
  warning: {
    bg: colors.paperAmberSoft,
    color: colors.paperAmber,
    border: "rgba(180, 83, 9, 0.25)",
  },
  danger: {
    bg: colors.paperRedSoft,
    color: colors.paperRed,
    border: "rgba(185, 28, 28, 0.25)",
  },
  info: {
    bg: "rgba(80, 110, 200, 0.08)",
    color: colors.paperText2,
    border: colors.paperBorder,
  },
  accent: {
    bg: colors.paperAccentSoft,
    color: colors.paperAccent,
    border: colors.paperBorderAcc,
  },
};

export const PaperBadge: React.FC<Props> = ({
  children,
  variant = "default",
  size = "sm",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const v = variants[variant];

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  const fontSize = size === "md" ? 18 : 16;
  const py = size === "md" ? 4 : 2;
  const px = size === "md" ? 10 : 8;

  return (
    <span
      style={{
        opacity: enter,
        display: "inline-flex",
        alignItems: "center",
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        borderRadius: 4,
        padding: `${py}px ${px}px`,
        fontFamily: fonts.caveat,
        fontWeight: 600,
        fontSize,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
};
