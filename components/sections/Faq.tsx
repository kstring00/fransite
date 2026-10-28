"use client";
import { useCallback, useId, useRef, useState } from "react";
import { SECTION_IDS } from "@/lib/config";
import { FAQ } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { useReveal } from "@/components/motion/useReveal";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import "./lower-sections.css";

/**
 * Five questions in a glass accordion. Height animates with GSAP; with
 * reduced motion the answer simply fades in. One open at a time.
 */
export function Faq() {
  const sectionRef = useRef<HTMLElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();
  useReveal(sectionRef);

  const animate = useCallback((index: number, show: boolean) => {
    const panel = panels.current[index];
    if (!panel) return;
    const reduce = prefersReducedMotion();
    gsap.killTweensOf(panel);
    if (show) {
      panel.hidden = false;
      if (reduce) {
        gsap.set(panel, { height: "auto", opacity: 0 });
        gsap.to(panel, { opacity: 1, duration: 0.2 });
        return;
      }
      gsap.set(panel, { height: "auto", opacity: 1 });
      const h = panel.offsetHeight;
      gsap.fromTo(panel, { height: 0 }, { height: h, duration: 0.45, ease: "power3.out", onComplete: () => gsap.set(panel, { height: "auto" }) });
    } else {
      if (reduce) {
        gsap.to(panel, {
          opacity: 0,
          duration: 0.15,
          onComplete: () => {
            panel.hidden = true;
            gsap.set(panel, { height: 0 });
          },
        });
        return;
      }
      gsap.to(panel, {
        height: 0,
        duration: 0.4,
        ease: "power3.out",
        onComplete: () => {
          panel.hidden = true;
        },
      });
    }
  }, []);

  const toggle = (index: number) => {
    setOpen((current) => {
      if (current === index) {
        animate(index, false);
        return null;
      }
      if (current !== null) animate(current, false);
      animate(index, true);
      return index;
    });
  };

  return (
    <section id={SECTION_IDS.faq} ref={sectionRef} className="section">
      <div className="container">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:gap-20">
          <SectionHeading
            num={FAQ.num}
            label={FAQ.label}
            title={
              <>
                Before you <em>buy</em>.
              </>
            }
          />
          <GlassCard padding="md" className="px-6 py-2 md:px-9 md:py-3" data-enter>
            {FAQ.items.map((item, i) => {
              const panelId = `${baseId}-panel-${i}`;
              const triggerId = `${baseId}-trigger-${i}`;
              const isOpen = open === i;
              return (
                <div key={item.q} className="faq-item">
                  <h3 className="m-0">
                    <button
                      id={triggerId}
                      type="button"
                      className="faq-trigger"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(i)}
                    >
                      <span>{item.q}</span>
                      <span className="faq-plus" aria-hidden="true" />
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    className="faq-panel"
                    hidden
                    ref={(el) => {
                      panels.current[i] = el;
                    }}
                  >
                    <p className="faq-answer">{item.a}</p>
                  </div>
                </div>
              );
            })}
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
