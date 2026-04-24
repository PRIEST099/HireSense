"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type DesignMode = "paper" | "classic";

interface DesignModeContextValue {
  mode: DesignMode;
  setMode: (m: DesignMode) => void;
  toggle: () => void;
}

const STORAGE_KEY = "hiresense-design-mode";

const DesignModeContext = createContext<DesignModeContextValue>({
  mode: "paper",
  setMode: () => {},
  toggle: () => {},
});

export function useDesignMode(): DesignModeContextValue {
  return useContext(DesignModeContext);
}

export function DesignModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DesignMode>("paper");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "classic" || saved === "paper") {
        setModeState(saved);
      }
    } catch {
      // localStorage may be unavailable (private mode / SSR); ignore.
    }
    setHydrated(true);
  }, []);

  // Reflect mode onto <html> class + persist
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (mode === "classic") root.classList.add("classic-mode");
    else root.classList.remove("classic-mode");
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode, hydrated]);

  const setMode = useCallback((m: DesignMode) => setModeState(m), []);
  const toggle = useCallback(() => setModeState((m) => (m === "paper" ? "classic" : "paper")), []);

  return (
    <DesignModeContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </DesignModeContext.Provider>
  );
}
