interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  size?: "sm" | "md";
}

const variants = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    draft: { variant: "default", label: "Draft" },
    open: { variant: "success", label: "Open" },
    screening: { variant: "info", label: "Screening" },
    closed: { variant: "danger", label: "Closed" },
    pending: { variant: "warning", label: "Pending" },
    processing: { variant: "info", label: "Processing" },
    completed: { variant: "success", label: "Completed" },
    failed: { variant: "danger", label: "Failed" },
    shortlisted: { variant: "success", label: "Shortlisted" },
    rejected: { variant: "danger", label: "Rejected" },
    interview: { variant: "purple", label: "Interview" },
    strong_match: { variant: "success", label: "Strong Match" },
    good_match: { variant: "info", label: "Good Match" },
    partial_match: { variant: "warning", label: "Partial Match" },
    weak_match: { variant: "danger", label: "Weak Match" },
  };

  const config = map[status] || { variant: "default" as const, label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
