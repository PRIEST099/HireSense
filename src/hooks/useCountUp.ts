"use client";

import { useEffect, useState } from "react";

/**
 * Animates a number from 0 to `target` over `ms` milliseconds
 * using requestAnimationFrame. Useful for stat cards so the value
 * appears to be "written in" rather than snapping to the final figure.
 */
export function useCountUp(target: number, ms = 900, delayMs = 0): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    let raf: number;
    let start: number | null = null;
    let cancelled = false;

    const tick = (t: number) => {
      if (cancelled) return;
      if (start === null) start = t;
      const elapsed = t - start - delayMs;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / ms, 1);
      // ease-out cubic for a natural "slowing" finish
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [target, ms, delayMs]);

  return value;
}
