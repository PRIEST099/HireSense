"use client";

import { HTMLAttributes, useState } from "react";

interface PaperCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  padding?: string;
  /** Delay (ms) for the entrance / border-trace animation. */
  animationDelay?: number;
}

export function PaperCard({
  children,
  interactive = false,
  padding = "p-5",
  className = "",
  onClick,
  style,
  animationDelay = 0,
  ...rest
}: PaperCardProps) {
  const [hov, setHov] = useState(false);
  const isInteractive = interactive || !!onClick;
  const borderColor = hov && isInteractive ? "var(--paper-ink-acc)" : "var(--paper-ink)";
  const wbClasses = `wb-fade-in wb-trace-border${isInteractive ? " wb-wiggle" : ""}`;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`paper-sketch-border ${wbClasses} rounded-md ${padding} ${className}`}
      style={{
        background: "transparent",
        boxShadow:
          hov && isInteractive
            ? "3px 4px 0 rgba(0,0,0,0.07), 0 6px 16px rgba(0,0,0,0.08)"
            : "var(--paper-shadow-card)",
        cursor: isInteractive ? "pointer" : "default",
        transition: "box-shadow 0.15s",
        ["--sketch-color" as string]: borderColor,
        ["--wb-delay" as string]: `${animationDelay}ms`,
        ...style,
      }}
      {...rest}
    >
      {/* Third pen stroke overlaid */}
      <span className="sketch-stroke-3" aria-hidden="true" />
      {children}
    </div>
  );
}
