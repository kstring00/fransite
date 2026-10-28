"use client";
import { useEffect, useRef } from "react";
import { CLOCK } from "@/lib/content";
import { SECTION_IDS } from "@/lib/config";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReveal } from "@/components/motion/useReveal";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import "./TheClock.css";

const L = { cx: 180, cy: 225, r: 108 };
const R = { cx: 460, cy: 225, r: 108 };
/** The minute hand rests at twenty past, the session length. */
const MINUTE_END = 120;
const HOUR_END = 10;

function face(c: { cx: number; cy: number; r: number }, idPrefix: string) {
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const major = i % 5 === 0;
    const r1 = c.r - (major ? 16 : 10);
    const r2 = c.r - 5;
    ticks.push(
      <line
        key={i}
        x1={(c.cx + Math.sin(a) * r1).toFixed(2)}
        y1={(c.cy - Math.cos(a) * r1).toFixed(2)}
        x2={(c.cx + Math.sin(a) * r2).toFixed(2)}
        y2={(c.cy - Math.cos(a) * r2).toFixed(2)}
        stroke={major ? "#E6C77A" : "#D9CDB4"}
        strokeOpacity={major ? 0.9 : 0.4}
        strokeWidth={major ? 2 : 1}
        strokeLinecap="round"
      />
    );
  }
  return (
    <g>
      <circle cx={c.cx} cy={c.cy} r={c.r + 8} fill={`url(#${idPrefix}-bezel)`} />
      <circle cx={c.cx} cy={c.cy} r={c.r + 1} fill="#0B0A0A" />
      <circle cx={c.cx} cy={c.cy} r={c.r - 2} fill={`url(#${idPrefix}-face)`} />
      <circle cx={c.cx} cy={c.cy} r={c.r - 2} fill="none" stroke="#C9A24B" strokeOpacity="0.5" strokeWidth="1" />
      {ticks}
      {/* 12, 3, 6, 9 numerals as small Fraunces-free marks: three dots */}
      <circle cx={c.cx} cy={c.cy - c.r + 30} r="2.2" fill="#F2E8D5" />
      <circle cx={c.cx + c.r - 30} cy={c.cy} r="2.2" fill="#F2E8D5" />
      <circle cx={c.cx} cy={c.cy + c.r - 30} r="2.2" fill="#F2E8D5" />
      <circle cx={c.cx - c.r + 30} cy={c.cy} r="2.2" fill="#F2E8D5" />
      {/* oxblood flag window: the "time's up" flag sits at twelve */}
      <path
        d={`M${c.cx - 9} ${c.cy - c.r + 44} h18 l-4 10 h-10 z`}
        fill="#5A0E12"
        stroke="#C9A24B"
        strokeOpacity="0.6"
        strokeWidth="0.8"
      />
    </g>
  );
}

/**
 * 5.3 The clock. A brass analog chess clock in SVG. The left minute hand
 * sweeps to twenty past as the section enters, the right face lights, and the
 * second hand ticks only while the section is on screen.
 */
export function TheClock() {
  const sectionRef = useRef<HTMLElement>(null);
  const minuteRef = useRef<SVGGElement>(null);
  const hourRef = useRef<SVGGElement>(null);
  const secondRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useReveal(sectionRef, { stagger: 0.1 });

  useEffect(() => {
    const minute = minuteRef.current;
    const hour = hourRef.current;
    const second = secondRef.current;
    const glow = glowRef.current;
    const svg = svgRef.current;
    if (!minute || !hour || !second || !glow || !svg) return;
    const reduce = prefersReducedMotion();
    const origin = `${L.cx} ${L.cy}`;

    const setSecond = () => {
      const s = new Date().getSeconds();
      gsap.set(second, { rotation: s * 6, svgOrigin: origin });
    };

    gsap.set(minute, { rotation: reduce ? MINUTE_END : -90, svgOrigin: origin });
    gsap.set(hour, { rotation: reduce ? HOUR_END : -30, svgOrigin: origin });
    gsap.set(glow, { opacity: reduce ? 0.55 : 0 });
    setSecond();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: svg,
        start: "top 75%",
        once: true,
        onEnter: () => {
          if (reduce) return;
          gsap.to(minute, { rotation: MINUTE_END, svgOrigin: origin, duration: 2.2, ease: "power3.inOut", delay: 0.2 });
          gsap.to(hour, { rotation: HOUR_END, svgOrigin: origin, duration: 2.2, ease: "power3.inOut", delay: 0.2 });
          gsap.to(glow, { opacity: 0.55, duration: 1.4, ease: "power2.out", delay: 1.4 });
        },
      });
    }, svg);

    // The second hand only ticks while the clock is in view.
    let timer: number | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduce && timer === null) {
          setSecond();
          timer = window.setInterval(setSecond, 1000);
        } else if (!entry.isIntersecting && timer !== null) {
          window.clearInterval(timer);
          timer = null;
        }
      },
      { threshold: 0.2 }
    );
    io.observe(svg);

    return () => {
      ctx.revert();
      io.disconnect();
      if (timer !== null) window.clearInterval(timer);
    };
  }, []);

  return (
    <section id={SECTION_IDS.clock} ref={sectionRef} className="section" aria-labelledby="clock-heading">
      <div className="container">
        <SectionHeading
          id="clock-heading"
          num={CLOCK.num}
          label={CLOCK.label}
          title={
            <>
              Twenty minutes at <em>exam</em> pace.
            </>
          }
        />

        <div className="clock-layout mt-16 md:mt-20">
          <div data-enter="left">
            <svg
              ref={svgRef}
              className="clock-svg"
              viewBox="0 0 640 400"
              role="img"
              aria-label="A brass chess clock with two faces. The left face reads twenty minutes, the length of one session."
            >
              <defs>
                <linearGradient id="clock-body" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3B2B14" />
                  <stop offset="0.5" stopColor="#2A1E10" />
                  <stop offset="1" stopColor="#1A120A" />
                </linearGradient>
                <linearGradient id="clock-edge" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#E6C77A" />
                  <stop offset="0.5" stopColor="#8C6F2E" />
                  <stop offset="1" stopColor="#C9A24B" />
                </linearGradient>
                <linearGradient id="clock-button" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#E6C77A" />
                  <stop offset="1" stopColor="#8C6F2E" />
                </linearGradient>
                <linearGradient id="clock-button-down" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#8C6F2E" />
                  <stop offset="1" stopColor="#4D3B18" />
                </linearGradient>
                <radialGradient id="l-face" cx="0.5" cy="0.4" r="0.7">
                  <stop offset="0" stopColor="#1E1713" />
                  <stop offset="1" stopColor="#0E0B0A" />
                </radialGradient>
                <radialGradient id="r-face" cx="0.5" cy="0.4" r="0.7">
                  <stop offset="0" stopColor="#1E1713" />
                  <stop offset="1" stopColor="#0E0B0A" />
                </radialGradient>
                <radialGradient id="l-bezel" cx="0.3" cy="0.2" r="0.9">
                  <stop offset="0" stopColor="#E6C77A" />
                  <stop offset="0.6" stopColor="#8C6F2E" />
                  <stop offset="1" stopColor="#C9A24B" />
                </radialGradient>
                <radialGradient id="r-bezel" cx="0.3" cy="0.2" r="0.9">
                  <stop offset="0" stopColor="#E6C77A" />
                  <stop offset="0.6" stopColor="#8C6F2E" />
                  <stop offset="1" stopColor="#C9A24B" />
                </radialGradient>
                <radialGradient id="r-glow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#E6C77A" stopOpacity="0.9" />
                  <stop offset="0.6" stopColor="#C9A24B" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#C9A24B" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* feet */}
              <rect x="70" y="364" width="90" height="16" rx="4" fill="#1A120A" />
              <rect x="480" y="364" width="90" height="16" rx="4" fill="#1A120A" />

              {/* buttons: left pressed, right raised */}
              <rect x="138" y="68" width="84" height="40" rx="8" fill="url(#clock-button-down)" />
              <rect x="138" y="68" width="84" height="40" rx="8" fill="none" stroke="#C9A24B" strokeOpacity="0.5" />
              <rect x="418" y="46" width="84" height="62" rx="8" fill="url(#clock-button)" />
              <rect x="418" y="46" width="84" height="62" rx="8" fill="none" stroke="#E6C77A" strokeOpacity="0.6" />
              <rect x="432" y="52" width="56" height="4" rx="2" fill="#F2E8D5" fillOpacity="0.35" />

              {/* housing */}
              <rect x="20" y="96" width="600" height="272" rx="30" fill="url(#clock-body)" />
              <rect x="20.5" y="96.5" width="599" height="271" rx="29.5" fill="none" stroke="url(#clock-edge)" strokeWidth="1.5" />
              <rect x="34" y="110" width="572" height="244" rx="22" fill="none" stroke="#C9A24B" strokeOpacity="0.18" />
              <line x1="320" y1="118" x2="320" y2="346" stroke="#C9A24B" strokeOpacity="0.25" />

              {/* right face glow, lights as the section enters */}
              <circle ref={glowRef} className="clock-glow" cx={R.cx} cy={R.cy} r={R.r + 60} fill="url(#r-glow)" />

              {face(L, "l")}
              {face(R, "r")}

              {/* left hands */}
              <g ref={hourRef}>
                <line className="clock-hand" x1={L.cx} y1={L.cy + 14} x2={L.cx} y2={L.cy - 52} strokeWidth="5" />
              </g>
              <g ref={minuteRef}>
                <line className="clock-hand" x1={L.cx} y1={L.cy + 18} x2={L.cx} y2={L.cy - 84} strokeWidth="3.2" />
              </g>
              <g ref={secondRef}>
                <line className="clock-hand clock-hand--second" x1={L.cx} y1={L.cy + 24} x2={L.cx} y2={L.cy - 92} strokeWidth="1.2" />
              </g>
              <circle cx={L.cx} cy={L.cy} r="5.5" fill="#C9A24B" />
              <circle cx={L.cx} cy={L.cy} r="2" fill="#0B0A0A" />

              {/* right hands, resting at ten to four */}
              <g transform={`rotate(110 ${R.cx} ${R.cy})`}>
                <line className="clock-hand" x1={R.cx} y1={R.cy + 14} x2={R.cx} y2={R.cy - 52} strokeWidth="5" />
              </g>
              <g transform={`rotate(300 ${R.cx} ${R.cy})`}>
                <line className="clock-hand" x1={R.cx} y1={R.cy + 18} x2={R.cx} y2={R.cy - 84} strokeWidth="3.2" />
              </g>
              <circle cx={R.cx} cy={R.cy} r="5.5" fill="#C9A24B" />
              <circle cx={R.cx} cy={R.cy} r="2" fill="#0B0A0A" />
            </svg>
          </div>

          <div>
            <p className="lede" data-enter>
              {CLOCK.lede}
            </p>
            <p className="mt-6 text-[17px] leading-relaxed text-cream" data-enter>
              {CLOCK.commitment}
            </p>
            <div className="hairline mt-10 max-w-[320px]" data-enter="none" />
            <dl className="clock-stats mt-10" data-enter>
              {CLOCK.stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="clock-stat__value">{s.value}</span>
                    {s.unit ? <span className="clock-stat__unit">{s.unit}</span> : null}
                    <div className="clock-stat__label" aria-hidden="true">
                      {s.label}
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
