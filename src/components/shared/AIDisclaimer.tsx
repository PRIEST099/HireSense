import { Shield } from "lucide-react";

interface AIDisclaimerProps {
  compact?: boolean;
}

export function AIDisclaimer({ compact = false }: AIDisclaimerProps) {
  if (compact) {
    return (
      <div
        className="flex items-center gap-2"
        style={{
          fontSize: 17,
          color: "var(--paper-text-3)",
          background: "var(--paper-input-bg)",
          border: "1.5px solid var(--paper-border)",
          borderRadius: 5,
          padding: "8px 12px",
        }}
      >
        <Shield className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--paper-accent)" }} />
        <span>AI scores are recommendations only. Final hiring decisions should always be made by a human recruiter.</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-3"
      style={{
        background: "var(--paper-accent-soft)",
        border: "1.5px solid var(--paper-border-acc)",
        borderRadius: 6,
        padding: 14,
      }}
    >
      <div
        style={{
          background: "var(--paper-card)",
          border: "1.5px solid var(--paper-border-acc)",
          borderRadius: 5,
          padding: 6,
          flexShrink: 0,
        }}
      >
        <Shield className="h-4 w-4" style={{ color: "var(--paper-accent)" }} />
      </div>
      <div>
        <p style={{ fontSize: 17, fontWeight: 700, color: "var(--paper-accent)" }}>Responsible AI Notice</p>
        <p style={{ fontSize: 17, color: "var(--paper-text-2)", marginTop: 2, lineHeight: 1.5 }}>
          AI-generated scores and recommendations are designed to assist, not replace, human judgment. All candidate
          assessments should be reviewed by a recruiter before making hiring decisions. Scores reflect pattern matching
          against stated requirements and may not capture all relevant factors.
        </p>
      </div>
    </div>
  );
}
