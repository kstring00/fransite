"use client";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  /** Particles per 100k px^2 of canvas, default 1.2. Keep it a whisper. */
  density?: number;
  className?: string;
};

/**
 * Gold dust drifting upward, whisper level. Renders only while on screen and
 * never with reduced motion (the data-particles hook hides it in CSS too).
 */
export function GoldDust({ density = 1.2, className = "" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; t: number };
    let parts: P[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(((w * h) / 100000) * density);
      parts = Array.from({ length: n }, () => spawn(true));
    };

    const spawn = (anywhere = false): P => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 6,
      r: 0.6 + Math.random() * 1.3,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -(0.06 + Math.random() * 0.14),
      a: 0.25 + Math.random() * 0.45,
      t: Math.random() * Math.PI * 2,
    });

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.t += 0.01;
        p.x += p.vx + Math.sin(p.t) * 0.05;
        p.y += p.vy;
        if (p.y < -6 || p.x < -6 || p.x > w + 6) parts[i] = spawn();
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.t * 2));
        ctx.beginPath();
        ctx.fillStyle = `rgba(230, 199, 122, ${alpha.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 }
    );

    resize();
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} data-particles aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
