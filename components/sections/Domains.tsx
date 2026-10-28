"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { DOMAINS, PIECE_NAMES } from "@/lib/domains";
import { DOMAINS_SECTION } from "@/lib/content";
import { SECTION_IDS } from "@/lib/config";
import { prefersReducedMotion } from "@/lib/motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { GoldDust } from "@/components/ui/GoldDust";
import { useReveal } from "@/components/motion/useReveal";
import { DomainsGrid } from "./board/DomainsGrid";
import "./domains.css";

const BoardScene = dynamic(() => import("./board/BoardScene").then((m) => m.BoardScene), { ssr: false, loading: () => null });

type Mode = "pending" | "3d" | "2d";

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function lowEndDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) return true;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return true;
  if (nav.connection?.saveData) return true;
  return false;
}

/**
 * 01, The domains. A 3x3 slice of the puzzle board with one piece per domain.
 * Three.js loads only when the section is within 1.5 viewports, renders only
 * on screen, and falls back to the 2D grid when WebGL is missing.
 */
export function Domains() {
  const sectionRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [pinned, setPinned] = useState(false);
  const [reduce, setReduce] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const selectedRef = useRef<string | null>(null);
  const pinnedRef = useRef(false);
  useEffect(() => {
    selectedRef.current = selected;
    pinnedRef.current = pinned;
  }, [selected, pinned]);

  useReveal(sectionRef);

  // Assume 3D on the client; the WebGL probe runs only when the board is about
  // to load, so a context is never created during the first paint.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode("3d");
    setReduce(prefersReducedMotion());
  }, []);

  // Load the scene chunk within 1.5 viewports on desktop (0.6 on phones, where
  // the board sits just under the hero), and only once the main thread is idle,
  // so hydration and the LCP never compete with three.js. The loop runs only
  // while the board is on screen.
  useEffect(() => {
    const el = boardRef.current;
    if (!el || mode !== "3d") return;
    const phone = window.innerWidth < 768;
    let idleHandle: number | null = null;
    let timer: number | null = null;
    const whenIdle = (fn: () => void) => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
      if (w.requestIdleCallback) idleHandle = w.requestIdleCallback(fn, { timeout: 4000 });
      else timer = window.setTimeout(fn, 1200);
    };
    // On phones the board sits right under the hero, so also wait for the first
    // scroll: a sign the visitor is heading this way, and a way to keep the
    // chunk out of the first paint.
    let scrolled = !phone || window.scrollY > 80;
    let nearNow = false;
    const maybeLoad = () => {
      if (!scrolled || !nearNow) return;
      whenIdle(() => {
        if (webglAvailable() && !lowEndDevice()) setNear(true);
        else setMode("2d");
      });
    };
    const onScroll = () => {
      if (window.scrollY > 80) {
        scrolled = true;
        window.removeEventListener("scroll", onScroll);
        maybeLoad();
      }
    };
    if (!scrolled) window.addEventListener("scroll", onScroll, { passive: true });
    const nearIO = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          nearIO.disconnect();
          nearNow = true;
          maybeLoad();
        }
      },
      { rootMargin: phone ? "60% 0px 60% 0px" : "150% 0px 150% 0px" }
    );
    const viewIO = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.02 });
    // Give the first paint and hydration a moment before even observing.
    const start = window.setTimeout(() => {
      nearIO.observe(el);
      viewIO.observe(el);
    }, phone ? 1500 : 300);
    return () => {
      window.clearTimeout(start);
      window.removeEventListener("scroll", onScroll);
      if (timer) window.clearTimeout(timer);
      const w = window as Window & { cancelIdleCallback?: (h: number) => void };
      if (idleHandle && w.cancelIdleCallback) w.cancelIdleCallback(idleHandle);
      nearIO.disconnect();
      viewIO.disconnect();
    };
  }, [mode]);

  const clearClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const open = useCallback((letter: string, pin: boolean) => {
    clearClose();
    setSelected(letter);
    setPinned(pin);
  }, []);

  const scheduleClose = useCallback(() => {
    clearClose();
    closeTimer.current = window.setTimeout(() => {
      setSelected(null);
      setPinned(false);
    }, 320);
  }, []);

  // Switching from one piece to another waits a beat, so grazing a border
  // between two squares does not flip the card back and forth.
  const dwellTimer = useRef<number | null>(null);
  const onHover = useCallback(
    (letter: string | null) => {
      if (dwellTimer.current) {
        window.clearTimeout(dwellTimer.current);
        dwellTimer.current = null;
      }
      if (letter) {
        clearClose();
        if (!selectedRef.current || selectedRef.current === letter) open(letter, false);
        else dwellTimer.current = window.setTimeout(() => open(letter, false), 110);
      } else if (!pinned) scheduleClose();
    },
    [open, pinned, scheduleClose]
  );
  const onTap = useCallback(
    (letter: string) => {
      if (selectedRef.current === letter && pinned) {
        setSelected(null);
        setPinned(false);
      } else open(letter, true);
    },
    [open, pinned]
  );
  const onMiss = useCallback(() => {
    setSelected(null);
    setPinned(false);
  }, []);

  // Floating card position follows the selected piece, as CSS variables.
  const onProject = useCallback((_: string, x: number, y: number) => {
    const el = boardRef.current;
    if (!el) return;
    el.style.setProperty("--card-x", `${(x * 100).toFixed(2)}%`);
    el.style.setProperty("--card-y", `${(y * 100).toFixed(2)}%`);
    el.dataset.cardSide = x > 0.58 ? "left" : "right";
  }, []);

  // Pop the card in and out.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const r = prefersReducedMotion();
    if (selected) {
      gsap.killTweensOf(card);
      card.style.visibility = "visible";
      gsap.fromTo(card, { opacity: 0, y: r ? 0 : 10, scale: r ? 1 : 0.97 }, { opacity: 1, y: 0, scale: 1, duration: r ? 0.15 : 0.45, ease: "power3.out" });
    } else {
      gsap.killTweensOf(card);
      gsap.to(card, {
        opacity: 0,
        y: r ? 0 : 6,
        duration: r ? 0.1 : 0.25,
        ease: "power2.in",
        onComplete: () => {
          card.style.visibility = "hidden";
        },
      });
    }
  }, [selected]);

  // Escape closes a pinned card.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setPinned(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const current = DOMAINS.find((d) => d.letter === selected) ?? null;

  return (
    <section ref={sectionRef} id={SECTION_IDS.domains} className="section domains" aria-labelledby="domains-title">
      <div className="container container--wide">
        <SectionHeading
          id="domains-title"
          num={DOMAINS_SECTION.num}
          label={DOMAINS_SECTION.label}
          title={
            <>
              Nine domains. <em>One</em> board.
            </>
          }
          lede={DOMAINS_SECTION.lede}
          aside={<Badge>{DOMAINS_SECTION.badge}</Badge>}
        />

        {mode === "2d" ? (
          <div className="domains__grid-wrap" data-enter="none">
            <p className="label-mono mt-12 mb-6">{DOMAINS_SECTION.fallbackHint}</p>
            <DomainsGrid />
          </div>
        ) : (
          <div className="domains__stage" data-enter="none">
            <div
              ref={boardRef}
              className={`domains__board ${ready ? "is-ready" : ""}`}
              data-card-side="right"
              onPointerLeave={(e) => {
                if (e.pointerType !== "mouse") return;
                document.body.style.cursor = "";
                if (!pinnedRef.current) scheduleClose();
              }}
            >
              <GoldDust density={0.9} className="domains__dust" />
              <div className="domains__skeleton" aria-hidden="true">
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
              {mode === "3d" && near ? (
                <BoardScene
                  active={inView}
                  selected={selected}
                  reduceMotion={reduce}
                  onHover={onHover}
                  onTap={onTap}
                  onMiss={onMiss}
                  onProject={onProject}
                  onReady={() => setReady(true)}
                />
              ) : null}

              <div
                ref={cardRef}
                className="domains__card glass"
                role="region"
                aria-live="polite"
                aria-label={current ? `Domain ${current.letter}` : undefined}
                style={{ visibility: "hidden", opacity: 0 }}
                onPointerEnter={clearClose}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse" && !pinnedRef.current) scheduleClose();
                }}
              >
                {current ? (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <span className="section-label">
                        <span className="section-label__num">{current.letter}</span>
                        <span className="label-mono">{PIECE_NAMES[current.piece]}</span>
                      </span>
                      <button
                        type="button"
                        className="domains__close"
                        aria-label="Close"
                        onClick={() => {
                          setSelected(null);
                          setPinned(false);
                        }}
                      >
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                      </button>
                    </div>
                    <h3 className="h-card mt-4">{current.title}</h3>
                    <p className="body-2 mt-3">{current.covers}</p>
                    <a href={`#${SECTION_IDS.buy}`} className="link-draw domains__link mt-5">
                      {DOMAINS_SECTION.cardLink}
                    </a>
                  </>
                ) : null}
              </div>
            </div>

            <p className="label-mono domains__hint">{DOMAINS_SECTION.hint}</p>

            {/* Keyboard and screen-reader path: every piece as a button. */}
            <ul className="domains__legend" aria-label="Pieces on the board">
              {DOMAINS.map((d) => (
                <li key={d.letter}>
                  <button
                    type="button"
                    className={`domains__chip ${selected === d.letter ? "is-active" : ""}`}
                    aria-pressed={selected === d.letter}
                    onClick={() => open(d.letter, true)}
                    onFocus={() => open(d.letter, true)}
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse" && !pinnedRef.current) open(d.letter, false);
                    }}
                    onPointerLeave={(e) => {
                      if (e.pointerType === "mouse" && !pinnedRef.current) scheduleClose();
                    }}
                  >
                    <span className="domains__chip-letter">{d.letter}</span>
                    <span className="domains__chip-title">{d.short}</span>
                    <span className="sr-only">
                      , {d.title}, {PIECE_NAMES[d.piece]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
