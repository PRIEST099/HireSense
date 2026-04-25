interface Props {
  size?: number;
  color?: string;
}

/** Verbatim port of src/components/paper/BrandFunnelIcon.tsx */
export const BrandFunnelIcon: React.FC<Props> = ({ size = 24, color = "currentColor" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="5" cy="4" r="1.6" fill={color} stroke="none" />
      <circle cx="12" cy="4" r="1.6" fill={color} stroke="none" />
      <circle cx="20" cy="4" r="1.6" fill={color} stroke="none" />
      <circle cx="27" cy="4" r="1.6" fill={color} stroke="none" />
      <path d="M2 8 L14 18 L14 22 L18 22 L18 18 L30 8" />
      <path
        d="M16 24.2 L17.35 26.9 L20.3 27.35 L18.15 29.4 L18.7 32.3 L16 30.95 L13.3 32.3 L13.85 29.4 L11.7 27.35 L14.65 26.9 Z"
        fill={color}
        stroke="none"
      />
    </svg>
  );
};
