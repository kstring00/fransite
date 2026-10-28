"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { NAV_LINKS, PRIMARY_CTA, SECTION_IDS } from "@/lib/config";
import { QueenMark } from "@/components/brand/QueenMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { MobileMenu } from "./MobileMenu";
import { useScrollSpy } from "./useScrollSpy";
import { prefersReducedMotion } from "@/lib/motion";

const SPY_IDS = NAV_LINKS.map((l) => l.id);
const LIFT_AT = 80;

/**
 * Transparent over the hero; after 80px it lifts into a floating liquid-glass
 * pill. The lift is a GSAP timeline played forward and reversed, so it glides.
 */
export function Header() {
  const barRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  const active = useScrollSpy(SPY_IDS);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const bar = barRef.current!;
    let isFloating = false;
    const reduce = prefersReducedMotion();

    const build = () => {
      const w = window.innerWidth;
      const mobile = w < 900;
      const pillMax = mobile ? w - 24 : Math.min(1120, w - 48);
      const navH = mobile ? 72 : 84;
      const pillH = mobile ? 56 : 60;
      const padTop = mobile ? 20 : 40;
      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true, defaults: { duration: reduce ? 0 : 0.8, ease: "power3.out" } });
      tl.fromTo(
        bar,
        {
          y: 0,
          "--bar-max": `${w}px`,
          height: navH,
          paddingLeft: padTop,
          paddingRight: padTop,
          borderRadius: 0,
          backgroundColor: "rgba(22,17,15,0)",
          borderColor: "rgba(201,162,75,0)",
          boxShadow: "0 20px 60px rgba(0,0,0,0), inset 0 1px 0 rgba(242,232,213,0)",
          "--glass-blur": "0px",
        },
        {
          y: 16,
          "--bar-max": `${pillMax}px`,
          height: pillH,
          paddingLeft: mobile ? 14 : 22,
          paddingRight: mobile ? 8 : 10,
          borderRadius: 999,
          backgroundColor: "rgba(22,17,15,0.55)",
          borderColor: "rgba(201,162,75,0.35)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(242,232,213,0.08)",
          "--glass-blur": "18px",
        },
        0
      );
      tlRef.current = tl;
      if (isFloating) tl.progress(1);
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (y > LIFT_AT && !isFloating) {
        isFloating = true;
        setFloating(true);
        tlRef.current?.play();
      } else if (y <= LIFT_AT && isFloating) {
        isFloating = false;
        setFloating(false);
        tlRef.current?.reverse();
      }
    };

    build();
    onScroll();
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      tlRef.current?.kill();
    };
  }, []);

  return (
    <>
      <header className="site-header pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center" data-floating={floating || undefined}>
        <div ref={barRef} className="site-bar pointer-events-auto relative flex w-full items-center justify-between border border-transparent">
          <a href={`#${SECTION_IDS.hero}`} className="site-brand flex items-center gap-3 text-gold">
            <QueenMark size={28} className="shrink-0 drop-shadow-[0_2px_8px_rgba(201,162,75,0.35)]" />
            <span className="site-brand__full">
              <Wordmark variant="full" />
            </span>
            <span className="site-brand__short">
              <Wordmark variant="short" />
            </span>
            <span className="sr-only">, back to top</span>
          </a>

          <nav className="site-links flex flex-1 justify-center px-6" aria-label="Primary">
            <ul className="flex items-center gap-6 xl:gap-7">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className={`link-draw site-link ${active === l.id ? "is-active" : ""}`}
                    aria-current={active === l.id ? "location" : undefined}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <PrimaryButton className="site-cta" aria-label={PRIMARY_CTA} />
            <button
              ref={toggleRef}
              type="button"
              className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="menu-toggle__line" aria-hidden="true" />
              <span className="menu-toggle__line" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={closeMenu} toggleRef={toggleRef} />
    </>
  );
}
