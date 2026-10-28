"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { config, SECTION_IDS } from "@/lib/config";
import { ABOUT } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReveal } from "@/components/motion/useReveal";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import "./lower-sections.css";

/**
 * About Chess: her photo in a tall marble frame, credentials, pass date,
 * two short paragraphs in her voice. An introduction, not a pitch.
 */
export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  useReveal(sectionRef);

  // Living element: a gold hairline draws itself under the heading.
  useEffect(() => {
    const rule = ruleRef.current;
    const root = sectionRef.current;
    if (!rule || !root) return;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: "top 70%",
        once: true,
        onEnter: () => gsap.to(rule, { scaleX: 1, duration: reduce ? 0.3 : 1.6, ease: "power3.out", delay: reduce ? 0 : 0.35 }),
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const photoAlt = config.ownerPhotoIsReal ? `Portrait of ${config.ownerNickname}` : "Everything Behavior with Chess queen";

  return (
    <section id={SECTION_IDS.about} ref={sectionRef} className="section">
      <div className="container">
        <div className="grid items-start gap-14 md:grid-cols-[minmax(0,440px)_1fr] md:gap-20">
          <div data-enter="left">
            <figure className="about-frame">
              <Image
                src={config.ownerPhotoPath}
                alt={photoAlt}
                fill
                sizes="(max-width: 768px) 92vw, 440px"
                className="object-cover object-center"
              />
              <div className="about-frame__tint" aria-hidden="true" />
              <div className="about-frame__duotone" aria-hidden="true" />
            </figure>
            <p className="label-mono label-mono--gold mt-5">
              {config.ownerName}, {config.ownerNickname}
            </p>
          </div>

          <div>
            <SectionHeading
              num={ABOUT.num}
              label={ABOUT.label}
              title={
                <>
                  I&rsquo;m {config.ownerNickname}. I <em>passed</em> this exam.
                </>
              }
            />
            <div ref={ruleRef} className="about-rule mt-8" aria-hidden="true" />
            <div className="mt-8 flex flex-col gap-5">
              {ABOUT.paragraphs.map((p, i) => (
                <p key={i} className="lede" data-enter>
                  {p}
                </p>
              ))}
            </div>
            <dl className="about-dl mt-10" data-enter>
              <dt>{ABOUT.credentialsLabel}</dt>
              <dd>
                <ul className="flex flex-col gap-1">
                  {config.credentials.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </dd>
              <dt>{ABOUT.passLabel}</dt>
              <dd>{ABOUT.passValue}</dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
