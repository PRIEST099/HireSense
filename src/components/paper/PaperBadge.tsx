interface PaperBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "accent";
  size?: "sm" | "md";
}

const variants: Record<string, { bg: string; color: string; border: string }> = {
  default: {
    bg: "rgba(107,115,138,0.1)",
    color: "var(--paper-text-3)",
    border: "rgba(107,115,138,0.2)",
  },
  success: {
    bg: "var(--paper-green-soft)",
    color: "var(--paper-green)",
    border: "rgba(13,148,136,0.3)",
  },
  warning: {
    bg: "var(--paper-amber-soft)",
    color: "var(--paper-amber)",
    border: "rgba(180,83,9,0.25)",
  },
  danger: {
    bg: "var(--paper-red-soft)",
    color: "var(--paper-red)",
    border: "rgba(185,28,28,0.25)",
  },
  info: {
    bg: "rgba(80,110,200,0.08)",
    color: "var(--paper-text-2)",
    border: "var(--paper-border)",
  },
  accent: {
    bg: "var(--paper-accent-soft)",
    color: "var(--paper-accent)",
    border: "var(--paper-border-acc)",
  },
};

export function PaperBadge({ children, variant = "default", size = "sm" }: PaperBadgeProps) {
  const v = variants[variant] || variants.default;
  const sizeClass = size === "md" ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded whitespace-nowrap font-semibold wb-scribble-in torn-bg-subtle ${sizeClass}`}
      style={
        {
          color: v.color,
          border: `1px solid ${v.border}`,
          letterSpacing: "0.01em",
          fontFamily: "var(--font-caveat), 'Caveat', cursive",
          ["--torn-color" as string]: v.bg,
        } as React.CSSProperties
      }
    >
      {children}
    </span>
  );
}

export function PaperStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: PaperBadgeProps["variant"] }> = {
    draft: { label: "Draft", variant: "default" },
    open: { label: "Open", variant: "success" },
    screening: { label: "Screening", variant: "accent" },
    closed: { label: "Closed", variant: "danger" },
    pending: { label: "Pending", variant: "warning" },
    processing: { label: "Processing", variant: "accent" },
    completed: { label: "Completed", variant: "success" },
    failed: { label: "Failed", variant: "danger" },
    shortlisted: { label: "Shortlisted", variant: "success" },
    rejected: { label: "Rejected", variant: "danger" },
    interview: { label: "Interview", variant: "accent" },
    strong_match: { label: "Strong Match", variant: "success" },
    good_match: { label: "Good Match", variant: "accent" },
    partial_match: { label: "Partial Match", variant: "warning" },
    weak_match: { label: "Weak Match", variant: "danger" },
  };
  const config = map[status] || { label: status, variant: "default" as const };
  return <PaperBadge variant={config.variant}>{config.label}</PaperBadge>;
}
