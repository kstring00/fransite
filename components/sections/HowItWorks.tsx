"use client";
import { useEffect, useRef } from "react";
import { HOW } from "@/lib/content";
import { SECTION_IDS } from "@/lib/config";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { useReveal } from "@/components/motion/useReveal";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import "./HowItWorks.css";

/**
 * 5.2 How it works. Three glass cards slide in from the right; a gold line
 * draws itself in knight's moves (two squares down, one across) between them.
 */
export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const glintRef = useRef<SVGCircleElement>(null);

  useReveal(sectionRef, { stagger: 0.14 });

  useEffect(() => {
    const grid = gridRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const dot = dotRef.current;
    const glint = glintRef.current;
    if (!grid || !svg || !path || !dot || !glint) return;
    const reduce = prefersReducedMotion();
    let length = 0;
    let drawn = false;

    // Layout values ignore the entrance transforms, so the path is right
    // even while the cards are still sliding in.
    const layout = () => {
      if (window.innerWidth < 900) {
        svg.style.display = "none";
        return;
      }
      svg.style.display = "";
      const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-step-card]")).map((el) => ({
        left: el.offsetLeft,
        right: el.offsetLeft + el.offsetWidth,
        top: el.offsetTop,
        bottom: el.offsetTop + el.offsetHeight,
      }));
      const w = grid.offsetWidth;
      const h = grid.offsetHeight;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      let d = "";
      let endX = 0;
      let endY = 0;
      for (let i = 0; i < cards.length - 1; i++) {
        const a = cards[i];
        const b = cards[i + 1];
        const x0 = a.right - 1;
        const y0 = a.bottom;
        const y1 = b.bottom - 44;
        const x1 = b.left + 1;
        d += `M${x0} ${y0} V${y1} H${x1} `;
        endX = x1;
        endY = y1;
      }
      path.setAttribute("d", d.trim());
      length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = drawn ? "0" : `${length}`;
      dot.setAttribute("cx", String(endX));
      dot.setAttribute("cy", String(endY));
      glint.setAttribute("cx", String(endX));
      glint.setAttribute("cy", String(endY));
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(grid);

    const ctx = gsap.context(() => {
      gsap.set(dot, { scale: 0, transformOrigin: "50% 50%" });
      ScrollTrigger.create({
        trigger: grid,
        start: "top 72%",
        once: true,
        onEnter: () => {
          drawn = true;
          if (reduce) {
            path.style.strokeDashoffset = "0";
            gsap.set(dot, { scale: 1 });
            glint.classList.add("is-live");
            return;
          }
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.8,
            delay: 0.55,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.to(dot, { scale: 1, duration: 0.5, ease: "back.out(2)" });
              glint.classList.add("is-live");
            },
          });
        },
      });
    }, grid);

    return () => {
      ro.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section id={SECTION_IDS.how} ref={sectionRef} className="section" aria-labelledby="how-heading">
      <div className="container">
        <SectionHeading
          id="how-heading"
          num={HOW.num}
          label={HOW.label}
          title={
            <>
              Three moves to <em>ready</em>.
            </>
          }
        />

        <div ref={gridRef} className="how-grid mt-16 md:mt-20">
          <svg ref={svgRef} className="how-path" aria-hidden="true" focusable="false">
            <path ref={pathRef} className="how-path__line" />
            <circle ref={glintRef} className="how-path__glint" r="9" />
            <circle ref={dotRef} className="how-path__dot" r="3" />
          </svg>

          {HOW.steps.map((step, i) => (
            <GlassCard key={step.title} className="how-card" data-step-card data-step={i + 1} data-enter="right" padding="lg">
              <span className="how-step-num label-mono label-mono--gold">0{i + 1}</span>
              <h3 className="h-card mt-6">{step.title}</h3>
              <p className="body-2 mt-4 text-[16px]">{step.body}</p>
            </GlassCard>
          ))}
        </div>

        <p className="how-objection lede mt-16 md:mt-20" data-enter>
          {HOW.objection}
        </p>
      </div>
    </section>
  );
}
