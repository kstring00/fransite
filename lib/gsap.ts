"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out", duration: 0.7 });
}

/** The site's easing curve, cubic-bezier(0.22, 1, 0.36, 1), registered for GSAP. */
export const EASE = "power3.out";

export { gsap, ScrollTrigger };
