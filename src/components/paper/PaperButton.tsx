"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface PaperButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const PaperButton = forwardRef<HTMLButtonElement, PaperButtonProps>(
  ({ variant = "primary", size = "md", loading, children, disabled, className = "", ...props }, ref) => {
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2 text-base",
      lg: "px-6 py-2.5 text-lg",
    }[size];

    const isDisabled = disabled || loading;
    const pressClass = variant !== "ghost" ? " wb-press" : "";
    // Primary & danger get a torn-paper background behind the label
    const tornClass = !isDisabled && variant !== "ghost" ? " torn-bg-dramatic" : "";

    const baseStyle: React.CSSProperties = {
      fontFamily: "var(--font-caveat), 'Caveat', cursive",
      fontWeight: 700,
      borderRadius: 5,
      transition: "transform 0.15s, box-shadow 0.1s",
    };

    let variantStyle: React.CSSProperties = {};
    if (variant === "primary") {
      variantStyle = {
        // background is handled by .torn-bg-dramatic::before via --torn-color
        ["--torn-color" as string]: isDisabled ? "var(--paper-border)" : "var(--paper-accent)",
        border: `2px solid ${isDisabled ? "var(--paper-border)" : "var(--paper-text-1)"}`,
        color: isDisabled ? "var(--paper-text-4)" : "#fff",
        boxShadow: isDisabled ? "none" : "var(--paper-shadow-hard)",
        // For disabled state (no torn class) the real bg still needs to be set
        background: isDisabled ? "var(--paper-border)" : undefined,
      };
    } else if (variant === "danger") {
      variantStyle = {
        ["--torn-color" as string]: isDisabled ? "var(--paper-border)" : "var(--paper-red)",
        border: `2px solid ${isDisabled ? "var(--paper-border)" : "var(--paper-text-1)"}`,
        color: "#fff",
        boxShadow: isDisabled ? "none" : "var(--paper-shadow-hard)",
        background: isDisabled ? "var(--paper-border)" : undefined,
      };
    } else {
      variantStyle = {
        background: "var(--paper-card)",
        border: "1.5px solid var(--paper-border)",
        color: "var(--paper-text-2)",
        boxShadow: "var(--paper-shadow)",
      };
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center gap-2 ${sizeClasses}${pressClass}${tornClass} ${className}`}
        style={{ ...baseStyle, ...variantStyle, cursor: isDisabled ? "not-allowed" : "pointer" }}
        onMouseDown={(e) => {
          if (!isDisabled && variant !== "ghost") {
            (e.currentTarget as HTMLButtonElement).style.transform = "translate(1px, 1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "1px 2px 0 var(--paper-text-1)";
          }
        }}
        onMouseUp={(e) => {
          if (!isDisabled && variant !== "ghost") {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.015)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--paper-shadow-hard)";
          }
        }}
        onMouseEnter={(e) => {
          if (!isDisabled && variant !== "ghost") {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.015)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled && variant !== "ghost") {
            (e.currentTarget as HTMLButtonElement).style.transform = "";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--paper-shadow-hard)";
          }
        }}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

PaperButton.displayName = "PaperButton";
