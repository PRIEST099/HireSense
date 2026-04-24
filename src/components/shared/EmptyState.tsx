import { LucideIcon } from "lucide-react";
import { PaperButton } from "@/components/paper/PaperButton";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        style={{
          borderRadius: 8,
          background: "var(--paper-accent-soft)",
          border: "1.5px solid var(--paper-border-acc)",
          padding: 18,
          marginBottom: 16,
        }}
      >
        <Icon className="h-8 w-8" style={{ color: "var(--paper-accent)" }} />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--paper-text-1)", marginBottom: 4 }}>{title}</h3>
      <p
        style={{
          fontSize: 17,
          color: "var(--paper-text-3)",
          maxWidth: 380,
          lineHeight: 1.55,
          marginBottom: 20,
        }}
      >
        {description}
      </p>
      {action && <PaperButton onClick={action.onClick}>{action.label}</PaperButton>}
    </div>
  );
}
