"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(23,24,38,0.5)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={`w-full max-w-[calc(100vw-2rem)] ${maxWidth} max-h-[85vh] overflow-y-auto wb-tilt-in`}
        style={{
          background: "var(--paper-card)",
          border: "1.5px solid var(--paper-border)",
          borderRadius: 6,
          boxShadow: "4px 6px 0 rgba(0,0,0,0.08), 0 14px 36px rgba(0,0,0,0.14)",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ padding: "14px 20px", borderBottom: "1.5px solid var(--paper-border)" }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--paper-text-1)" }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              padding: 4,
              borderRadius: 4,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--paper-text-3)",
              display: "flex",
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div style={{ padding: "18px 20px" }}>{children}</div>
      </div>
    </div>
  );
}
