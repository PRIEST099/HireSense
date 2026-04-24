"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const colorMap: Record<ToastType, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    success: {
      color: "var(--paper-green)",
      bg: "var(--paper-green-soft)",
      border: "rgba(13,148,136,0.3)",
      icon: <CheckCircle className="h-5 w-5" style={{ color: "var(--paper-green)" }} />,
    },
    error: {
      color: "var(--paper-red)",
      bg: "var(--paper-red-soft)",
      border: "rgba(185,28,28,0.3)",
      icon: <AlertTriangle className="h-5 w-5" style={{ color: "var(--paper-red)" }} />,
    },
    info: {
      color: "var(--paper-accent)",
      bg: "var(--paper-accent-soft)",
      border: "var(--paper-border-acc)",
      icon: <Info className="h-5 w-5" style={{ color: "var(--paper-accent)" }} />,
    },
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => {
          const c = colorMap[t.type];
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 wb-tilt-in torn-bg-subtle max-w-sm"
              style={
                {
                  padding: "10px 14px",
                  borderRadius: 5,
                  border: `1.5px solid ${c.border}`,
                  boxShadow: "2px 3px 0 rgba(0,0,0,0.08), 0 6px 16px rgba(0,0,0,0.10)",
                  ["--torn-color" as string]: c.bg,
                } as React.CSSProperties
              }
            >
              {c.icon}
              <p
                className="flex-1"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: c.color,
                }}
              >
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: c.color,
                  opacity: 0.6,
                  display: "flex",
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
