"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * 2px gold line along the very top of the viewport that fills with scroll
 * progress. It glows while the hero is scrubbing (html[data-hero-scrubbing]).
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => gsap.set(el, { scaleX: self.progress }),
    });
    gsap.set(el, { scaleX: 0 });
    return () => st.kill();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="scroll-progress pointer-events-none fixed left-0 top-0 z-[70] h-[2px] w-full origin-left"
    />
  );
}
