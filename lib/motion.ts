"use client";
import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isPhone(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export function getLenis(): Lenis | null {
  if (typeof window === "undefined") return null;
  return window.__lenis ?? null;
}

/** Scroll to an element id, through Lenis when it is running, natively otherwise. */
export function scrollToId(id: string, opts: { offset?: number; immediate?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  const offset = opts.offset ?? 0;
  if (lenis && !opts.immediate) {
    lenis.scrollTo(el, { offset, duration: 1.3, easing: (t) => 1 - Math.pow(1 - t, 3) });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
  // Move focus for keyboard and screen-reader users once the move is underway.
  window.setTimeout(() => {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }, 50);
}

export function lockScroll(lock: boolean) {
  const lenis = getLenis();
  if (lock) {
    lenis?.stop();
    document.documentElement.classList.add("scroll-locked");
  } else {
    lenis?.start();
    document.documentElement.classList.remove("scroll-locked");
  }
}
