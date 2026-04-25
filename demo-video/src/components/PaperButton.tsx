import { colors, fonts } from "../theme";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  style?: React.CSSProperties;
}

export const PaperButton: React.FC<Props> = ({
  children,
  variant = "primary",
  size = "md",
  style,
}) => {
  const sizes: Record<Size, { fs: number; px: number; py: number }> = {
    sm: { fs: 16, px: 12, py: 6 },
    md: { fs: 19, px: 18, py: 9 },
    lg: { fs: 22, px: 24, py: 12 },
  };
  const s = sizes[size];

  const variants: Record<Variant, React.CSSProperties> = {
    primary: {
      background: colors.paperAccent,
      color: "#FFFFFF",
      border: `2px solid ${colors.paperAccent}`,
      boxShadow: "2px 3px 0 #171826",
    },
    secondary: {
      background: colors.paperCard,
      color: colors.paperAccent,
      border: `2px solid ${colors.paperAccent}`,
      boxShadow: "2px 3px 0 #171826",
    },
    ghost: {
      background: "transparent",
      color: colors.paperText2,
      border: `1.5px solid ${colors.paperInk}`,
      boxShadow: "1px 2px 0 #171826",
    },
  };

  return (
    <span
      style={{
        ...variants[variant],
        fontFamily: fonts.caveat,
        fontWeight: 700,
        fontSize: s.fs,
        padding: `${s.py}px ${s.px}px`,
        borderRadius: 6,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        letterSpacing: 0.5,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
