"use client";
import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { HERO } from "@/lib/content";
import { SECTION_IDS } from "@/lib/config";
import { prefersReducedMotion } from "@/lib/motion";
import { QueenMark } from "@/components/brand/QueenMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import "./hero.css";

const POSTER = "/brand/hero-poster.jpg";
const POSTER_PORTRAIT = "/brand/hero-poster-portrait.jpg";
const POSTER_ALT = "A leopard-print chess queen with a brass crown standing on a puzzle-piece chessboard of black marble and gold";
const SCRUB_1080 = "/brand/hero-scrub.mp4";
const SCRUB_720 = "/brand/hero-scrub-720.mp4";
const FRAME = 1 / 60;
const LERP = 0.12;

type Mode = "pending" | "scrub" | "poster";

/**
 * The poster is the LCP image. Phones get a portrait crop through <picture>
 * so the queen stays centred and the file stays small; wider screens get the
 * full frame.
 */
function HeroPoster() {
  const common = { alt: POSTER_ALT, sizes: "100vw", priority: true, quality: 75 } as const;
  const portrait = getImageProps({ ...common, src: POSTER_PORTRAIT, width: 608, height: 1080 });
  const wide = getImageProps({ ...common, src: POSTER, width: 1920, height: 1080 });
  const { srcSet: wideSet, ...img } = wide.props;
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={portrait.props.srcSet} sizes="100vw" />
      <source media="(min-width: 768px)" srcSet={wideSet} sizes="100vw" />
      <img {...img} alt={POSTER_ALT} className="hero__poster-img" />
    </picture>
  );
}

/**
 * The hero. Desktop: a 500vh section with a sticky viewport whose video is
 * scrubbed by scroll. The footage is fetched as a Blob, the seek target is
 * lerped in a rAF loop that rests when idle, and captions and the settle
 * sequence ride a scrubbed GSAP timeline. Phones and reduced motion get the
 * poster with a slow push-in and the captions as a timed sequence.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const captionsRef = useRef<HTMLDivElement>(null);
  const settleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("pending");
  const [videoState, setVideoState] = useState<"idle" | "loading" | "ready" | "failed">("idle");

  // Decide the path once we know the viewport.
  useEffect(() => {
    const decide = () => (window.innerWidth < 768 || prefersReducedMotion() ? "poster" : "scrub");
    // The path depends on the viewport, which only exists on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(decide());
  }, []);

  // ---------------------------------------------------------------
  // Scrub path
  // ---------------------------------------------------------------
  useEffect(() => {
    if (mode !== "scrub") return;
    const section = sectionRef.current!;
    const video = videoRef.current!;
    const loader = loaderRef.current!;
    const ring = ringRef.current!;
    let cancelled = false;
    let objectUrl: string | null = null;

    // Seek loop state
    let duration = 6;
    let target = 0;
    let displayed = 0;
    let lastSet = -1;
    let seeking = false;
    let running = false;
    let raf = 0;
    let ready = false;

    const seekTo = (t: number) => {
      seeking = true;
      lastSet = t;
      video.currentTime = t;
    };

    const loop = () => {
      const delta = target - displayed;
      if (Math.abs(delta) < FRAME) {
        displayed = target;
        if (!seeking && Math.abs(displayed - lastSet) > FRAME / 2) seekTo(displayed);
        running = false;
        return;
      }
      displayed += delta * LERP;
      if (!seeking && Math.abs(displayed - lastSet) > FRAME) seekTo(displayed);
      raf = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (running || !ready) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const onSeeked = () => {
      seeking = false;
      if (!running && Math.abs(displayed - lastSet) > FRAME) wake();
      else if (!running && Math.abs(target - displayed) >= FRAME) wake();
    };
    video.addEventListener("seeked", onSeeked);

    // Scroll progress drives the target time and the scrub flag.
    let scrubbing = false;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        target = self.progress * duration;
        wake();
        const now = ready && self.progress > 0.01 && self.progress < HERO.settleFrom;
        if (now !== scrubbing) {
          scrubbing = now;
          if (now) document.documentElement.dataset.heroScrubbing = "1";
          else delete document.documentElement.dataset.heroScrubbing;
        }
      },
    });

    // Fetch the footage as a Blob with honest progress on the ring.
    const circumference = 2 * Math.PI * 22;
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference}`;
    const setRing = (p: number) => {
      ring.style.strokeDashoffset = `${circumference * (1 - Math.max(0, Math.min(1, p)))}`;
    };

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const light = window.innerWidth <= 1366 || conn?.saveData || /(^|[^4])[23]g/.test(conn?.effectiveType ?? "");
    const src = light ? SCRUB_720 : SCRUB_1080;

    gsap.set(loader, { opacity: 1 });

    (async () => {
      setVideoState("loading");
      try {
        const res = await fetch(src, { cache: "force-cache" });
        if (!res.ok || !res.body) throw new Error(`fetch ${res.status}`);
        const total = Number(res.headers.get("content-length")) || 0;
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (cancelled) return;
          chunks.push(value);
          received += value.byteLength;
          if (total) setRing(received / total);
        }
        setRing(1);
        const blob = new Blob(chunks as BlobPart[], { type: "video/mp4" });
        objectUrl = URL.createObjectURL(blob);
        await new Promise<void>((resolve, reject) => {
          const onMeta = () => {
            video.removeEventListener("loadedmetadata", onMeta);
            resolve();
          };
          const onErr = () => reject(new Error("video error"));
          video.addEventListener("loadedmetadata", onMeta);
          video.addEventListener("error", onErr, { once: true });
          video.src = objectUrl!;
          video.load();
        });
        if (cancelled) return;
        duration = video.duration || 6;
        // First seek to wherever the scroll already is, then reveal.
        await new Promise<void>((resolve) => {
          const once = () => {
            video.removeEventListener("seeked", once);
            resolve();
          };
          video.addEventListener("seeked", once);
          displayed = target = st.progress * duration;
          seekTo(displayed);
        });
        if (cancelled) return;
        ready = true;
        setVideoState("ready");
        gsap.to(video, { opacity: 1, duration: 0.9, ease: "power2.out" });
        gsap.to(loader, { opacity: 0, duration: 0.5, delay: 0.2 });
        wake();
      } catch {
        if (cancelled) return;
        setVideoState("failed");
        gsap.to(loader, { opacity: 0, duration: 0.4 });
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      video.removeEventListener("seeked", onSeeked);
      st.kill();
      delete document.documentElement.dataset.heroScrubbing;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mode]);

  // Captions and settle, scrubbed by the same section.
  useEffect(() => {
    if (mode !== "scrub") return;
    const section = sectionRef.current!;
    const captions = Array.from(captionsRef.current!.querySelectorAll<HTMLElement>("[data-caption]"));
    const settle = settleRef.current!;
    const settleItems = Array.from(settle.querySelectorAll<HTMLElement>("[data-settle]"));
    const hint = hintRef.current!;
    const chevron = chevronRef.current!;
    let pulsed = false;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: 0.45 },
        defaults: { ease: "none" },
      });
      // Timeline time units are progress (0 to 1).
      gsap.set(captions, { opacity: 0, y: 28 });
      gsap.set(settleItems, { opacity: 0, y: 20 });
      gsap.set(hint, { opacity: 1 });
      tl.to(hint, { opacity: 0, duration: 0.04 }, 0.01);
      HERO.captions.forEach((c, i) => {
        const el = captions[i];
        const inDur = Math.min(0.06, (c.to - c.from) * 0.3);
        const outDur = Math.min(0.05, (c.to - c.from) * 0.25);
        tl.to(el, { opacity: 1, y: 0, duration: inDur, ease: "power2.out" }, c.from);
        tl.to(el, { opacity: 0, y: -18, duration: outDur, ease: "power2.in" }, c.to - outDur);
      });
      const s = HERO.settleFrom;
      const step = (1 - s) / (settleItems.length + 1);
      settleItems.forEach((el, i) => {
        tl.to(el, { opacity: 1, y: 0, duration: step * 1.4, ease: "power2.out" }, s + step * i);
      });
      tl.add(() => {
        if (pulsed || prefersReducedMotion()) return;
        pulsed = true;
        gsap.fromTo(
          chevron,
          { y: 0, opacity: 0.4 },
          { y: 8, opacity: 1, duration: 0.55, ease: "power2.out", yoyo: true, repeat: 1 }
        );
      }, 0.985);
      tl.to({}, { duration: 0.001 }, 1);
    }, section);

    return () => ctx.revert();
  }, [mode]);

  // ---------------------------------------------------------------
  // Poster path: phones and reduced motion
  // ---------------------------------------------------------------
  useEffect(() => {
    if (mode !== "poster") return;
    const poster = posterRef.current!;
    const captions = Array.from(captionsRef.current!.querySelectorAll<HTMLElement>("[data-caption]"));
    const settleItems = Array.from(settleRef.current!.querySelectorAll<HTMLElement>("[data-settle]"));
    const hint = hintRef.current!;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.set(hint, { opacity: 0 });
      // On phones the first caption is already painted (see hero.css); start from there.
      const firstShown = window.innerWidth < 768;
      gsap.set(firstShown ? captions.slice(1) : captions, { opacity: 0, y: reduce ? 0 : 16 });
      if (firstShown) gsap.set(captions[0], { opacity: 1, y: 0 });
      gsap.set(settleItems, { opacity: 0, y: reduce ? 0 : 16 });
      if (!reduce) {
        gsap.fromTo(poster, { scale: 1 }, { scale: 1.08, duration: 12, ease: "power1.out", transformOrigin: "50% 40%" });
      }
      const tl = gsap.timeline({ delay: reduce ? 0.1 : 0.3 });
      const hold = reduce ? 1.0 : 1.15;
      captions.forEach((el, i) => {
        if (!(firstShown && i === 0)) tl.to(el, { opacity: 1, y: 0, duration: reduce ? 0.3 : 0.55, ease: "power3.out" });
        tl.to(el, { opacity: 0, y: reduce ? 0 : -10, duration: reduce ? 0.25 : 0.4, ease: "power2.in" }, `+=${hold}`);
      });
      tl.to(settleItems, { opacity: 1, y: 0, duration: reduce ? 0.3 : 0.9, ease: "power3.out", stagger: reduce ? 0.05 : 0.14 }, "+=0.1");
    });
    return () => ctx.revert();
  }, [mode]);

  const scrub = mode === "scrub";

  return (
    <section
      ref={sectionRef}
      id={SECTION_IDS.hero}
      className={`hero ${scrub ? "hero--scrub" : "hero--poster"}`}
      data-mode={mode}
      aria-label="Introduction"
    >
      <div ref={stickyRef} className="hero__sticky">
        <div ref={frameRef} className="hero__frame">
          <div ref={posterRef} className="hero__poster">
            <HeroPoster />
          </div>
          <video
            ref={videoRef}
            className="hero__video"
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
        <div className="hero__fade-top" aria-hidden="true" />
        <div className="hero__fade-bottom" aria-hidden="true" />

        {/* Loading ring on the queen mark, honest to the byte. */}
        <div ref={loaderRef} className="hero__loader" aria-hidden="true" data-state={videoState}>
          <svg width="56" height="56" viewBox="0 0 56 56" className="hero__ring">
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(201,162,75,0.18)" strokeWidth="1" />
            <circle ref={ringRef} cx="28" cy="28" r="22" fill="none" stroke="var(--gold)" strokeWidth="1.25" strokeLinecap="round" transform="rotate(-90 28 28)" />
          </svg>
          <QueenMark size={22} className="hero__ring-mark" />
        </div>

        <div ref={captionsRef} className="hero__captions" aria-hidden="true">
          {HERO.captions.map((c) => (
            <p key={c.text} className="hero__caption" data-caption>
              <span>{c.text}</span>
            </p>
          ))}
        </div>

        <div ref={settleRef} className="hero__settle">
          <div data-settle className="hero__wordmark">
            <Wordmark size="hero" />
          </div>
          <h1 data-settle className="hero__h1">
            {HERO.h1}
          </h1>
          <div data-settle className="hero__cta">
            <PrimaryButton size="lg" />
          </div>
          <p data-settle className="hero__mono label-mono label-mono--gold">
            {HERO.mono}
          </p>
          <div ref={chevronRef} className="hero__chevron" aria-hidden="true">
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
              <path d="M1 1l8 7 8-7" stroke="var(--gold)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div ref={hintRef} className="hero__hint" aria-hidden="true">
          <span className="label-mono label-mono--gold">{HERO.scrollHint}</span>
          <span className="hero__hint-line" />
        </div>
      </div>
      {/* The captions are decorative on screen; give assistive tech the line once. */}
      <p className="sr-only">{HERO.captions.map((c) => c.text).join(" ")}</p>
    </section>
  );
}
