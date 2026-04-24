"use client";

import { useDesignMode } from "@/context/DesignModeContext";

/**
 * Plain, "undesigned" fallback button that instantly toggles the entire
 * platform between the paper-sketch design and a classic neutral look.
 *
 * Intentionally uses vanilla inline styles and system-ui font so it
 * keeps working even if the paper-theme CSS has issues. Fixed to the
 * bottom-right corner of every page.
 */
export function DesignModeToggle() {
  const { mode, toggle } = useDesignMode();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "paper" ? "Switch to classic design" : "Switch to paper design"}
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 9999,
        padding: "6px 10px",
        background: "#ffffff",
        color: "#222222",
        border: "1px solid #888888",
        borderRadius: 4,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: 0,
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
    >
      {mode === "paper" ? "Switch to Classic" : "Switch to Paper"}
    </button>
  );
}
