"use client";
import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

type Options = {
  /** ScrollTrigger start, default "top 78%". */
  start?: string;
  stagger?: number;
  duration?: number;
  /** CSS selector for the elements to reveal, default "[data-enter]". */
  selector?: string;
};

/**
 * Entrance choreography for a section. Elements marked data-enter slide and
 * fade in once the section reaches the viewport. With reduced motion they fade.
 * Elements with data-enter="none" only fade. Runs once.
 */
export function useReveal(ref: RefObject<HTMLElement | null>, opts: Options = {}) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(opts.selector ?? "[data-enter]"));
    if (items.length === 0) return;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: opts.start ?? "top 78%",
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            x: 0,
            y: 0,
            duration: reduce ? 0.3 : (opts.duration ?? 0.9),
            ease: "power3.out",
            stagger: reduce ? 0.03 : (opts.stagger ?? 0.09),
            overwrite: "auto",
            clearProps: "will-change",
          });
        },
      });
    }, root);
    return () => ctx.revert();
  }, [ref, opts.start, opts.stagger, opts.duration, opts.selector]);
}
