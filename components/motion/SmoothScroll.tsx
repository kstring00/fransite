"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, scrollToId } from "@/lib/motion";

/**
 * Site-wide smooth scrolling. Lenis drives the scroll position and GSAP's
 * ticker drives Lenis, so ScrollTrigger and the hero scrub share one clock.
 * With reduced motion on, native scrolling is left alone.
 */
export function SmoothScroll() {
  useEffect(() => {
    document.documentElement.classList.add("js");

    const onAnchorClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      scrollToId(id);
      history.pushState(null, "", `#${id}`);
    };
    document.addEventListener("click", onAnchorClick);

    if (prefersReducedMotion()) {
      window.__lenis = null;
      return () => document.removeEventListener("click", onAnchorClick);
    }

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
    });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return null;
}
