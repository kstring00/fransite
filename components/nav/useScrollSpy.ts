"use client";
import { useEffect, useState } from "react";

/**
 * Tracks which section currently sits in the reading band of the viewport.
 * Returns the id of the active section, or null when none (top of page).
 */
export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }
        if (visible.size === 0) {
          setActive(null);
          return;
        }
        // Prefer the section whose top is closest to the band.
        let best: string | null = null;
        let bestTop = Infinity;
        for (const id of visible.keys()) {
          const top = Math.abs(document.getElementById(id)!.getBoundingClientRect().top - window.innerHeight * 0.35);
          if (top < bestTop) {
            bestTop = top;
            best = id;
          }
        }
        setActive(best);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.01, 0.1] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}
