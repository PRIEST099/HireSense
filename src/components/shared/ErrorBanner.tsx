"use client";

import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { useState } from "react";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  dismissible?: boolean;
}

export function ErrorBanner({ message, onRetry, dismissible = true }: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="alert"
      style={{
        background: "var(--paper-red-soft)",
        border: "1.5px solid rgba(185,28,28,0.25)",
        borderRadius: 5,
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        boxShadow: "var(--paper-shadow)",
      }}
    >
      <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "var(--paper-red)" }} />
      <div className="flex-1">
        <p style={{ fontSize: 17, fontWeight: 600, color: "var(--paper-red)" }}>{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            title="Retry"
            style={{
              padding: 4,
              borderRadius: 4,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--paper-red)",
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            title="Dismiss"
            style={{
              padding: 4,
              borderRadius: 4,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--paper-red)",
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
