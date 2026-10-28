import Image from "next/image";
import { SECTION_IDS } from "@/lib/config";

/* Temporary page while the design system and nav are tuned. The real sections replace this. */
export default function Home() {
  return (
    <main id={SECTION_IDS.hero}>
      <section className="relative h-[100vh] overflow-hidden">
        <div className="absolute inset-x-0 bottom-0" style={{ top: "var(--hero-safe-top)" }}>
          <Image src="/brand/hero-poster.jpg" alt="" fill priority sizes="100vw" className="object-cover object-top" />
        </div>
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-marble via-marble/70 to-transparent" />
      </section>
      <section id={SECTION_IDS.domains} className="section">
        <div className="container">
          <p className="label-mono">01, The domains</p>
          <h2 className="h-section mt-5">Nine domains. <em>One</em> board.</h2>
        </div>
      </section>
      <section id={SECTION_IDS.how} className="section">
        <div className="container">
          <p className="label-mono">02, How it works</p>
          <h2 className="h-section mt-5">Three moves to <em>ready</em>.</h2>
        </div>
      </section>
      <section id={SECTION_IDS.puzzle} className="section">
        <div className="container">
          <p className="label-mono">04, Daily puzzle</p>
          <h2 className="h-section mt-5">Today&apos;s <em>position</em>.</h2>
        </div>
      </section>
      <section id={SECTION_IDS.hall} className="section">
        <div className="container">
          <p className="label-mono">05, Hall of Checkmates</p>
          <h2 className="h-section mt-5">Kings that <em>fell</em>.</h2>
        </div>
      </section>
      <section id={SECTION_IDS.about} className="section">
        <div className="container">
          <p className="label-mono">06, About Chess</p>
          <h2 className="h-section mt-5">Meet <em>Chess</em>.</h2>
        </div>
      </section>
      <section id={SECTION_IDS.buy} className="section bg-marble-2">
        <div className="container">
          <p className="label-mono">07, Get the Study Set</p>
          <h2 className="h-section mt-5">Your <em>move</em>.</h2>
        </div>
      </section>
    </main>
  );
}
