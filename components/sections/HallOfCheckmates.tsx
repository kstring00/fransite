"use client";
import { useEffect, useRef } from "react";
import { config, SECTION_IDS } from "@/lib/config";
import { HALL } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { GoldDust } from "@/components/ui/GoldDust";
import { TippedKingIcon } from "@/components/ui/PieceIcon";
import { useReveal } from "@/components/motion/useReveal";
import "./lower-sections.css";

type Card = { quote: string; name: string; passDate: string };

/**
 * Testimonials as tipped-over kings. Drag to scroll with momentum on desktop,
 * swipe with snap on touch. With no testimonials supplied, Chess's own pass
 * story is the only card. Nothing here is ever invented.
 */
export function HallOfCheckmates() {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  useReveal(sectionRef, { stagger: 0.12 });

  const cards: Card[] = config.testimonials.length > 0 ? [...config.testimonials] : [HALL.ownStory];
  const many = cards.length > 1;

  useEffect(() => {
    const row = rowRef.current;
    if (!row || !many) return;

    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    let raf = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      cancelAnimationFrame(raf);
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = row.scrollLeft;
      lastX = e.clientX;
      lastT = performance.now();
      vel = 0;
      row.classList.add("is-dragging");
      row.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      row.scrollLeft = startLeft - dx;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      vel = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      row.classList.remove("is-dragging");
      if (row.hasPointerCapture(e.pointerId)) row.releasePointerCapture(e.pointerId);
      let v = -vel * 16;
      const step = () => {
        if (Math.abs(v) < 0.3) return;
        row.scrollLeft += v;
        v *= 0.94;
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    // A drag should not count as a click on whatever sits under the pointer.
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    // Trackpad horizontal swipes move the row; vertical wheel keeps scrolling the page.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) row.scrollLeft += e.deltaX;
    };

    row.addEventListener("pointerdown", onDown);
    row.addEventListener("pointermove", onMove);
    row.addEventListener("pointerup", onUp);
    row.addEventListener("pointercancel", onUp);
    row.addEventListener("click", onClick, true);
    row.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      row.removeEventListener("pointerdown", onDown);
      row.removeEventListener("pointermove", onMove);
      row.removeEventListener("pointerup", onUp);
      row.removeEventListener("pointercancel", onUp);
      row.removeEventListener("click", onClick, true);
      row.removeEventListener("wheel", onWheel);
    };
  }, [many]);

  return (
    <section id={SECTION_IDS.hall} ref={sectionRef} className="section overflow-hidden">
      <GoldDust density={0.7} className="opacity-70" />
      <div className="container relative">
        <SectionHeading
          num={HALL.num}
          label={HALL.label}
          title={
            <>
              The kings they <em>tipped</em>.
            </>
          }
          lede={HALL.lede}
        />

        <div
          ref={rowRef}
          className={`hall-row mt-14 ${many ? "" : "hall-row--single"}`}
          tabIndex={0}
          role="region"
          aria-label="Pass stories"
        >
          {cards.map((c, i) => (
            <article key={`${c.name}-${i}`} className="hall-card" data-enter>
              <div className="hall-card__glint" aria-hidden="true" />
              <div className="hall-card__body">
                <GlassCard flat className="hall-card__inner flex flex-col" padding="lg">
                <TippedKingIcon size={40} className="text-gold" />
                <blockquote className="mt-7">
                  <p className="hall-quote">&ldquo;{c.quote}&rdquo;</p>
                </blockquote>
                <footer className="mt-8 flex flex-col gap-2">
                  <span className="font-sans text-[15px] font-semibold text-cream">{c.name}</span>
                  <span className="label-mono label-mono--gold">{c.passDate}</span>
                </footer>
                </GlassCard>
              </div>
            </article>
          ))}
        </div>

        {many ? (
          <p className="label-mono mt-2 text-cream-2/70" aria-hidden="true">
            {HALL.dragHint}
          </p>
        ) : null}
      </div>
    </section>
  );
}
