import { Hero } from "@/components/sections/Hero";
import { Domains } from "@/components/sections/Domains";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TheClock } from "@/components/sections/TheClock";
import { DailyPuzzle } from "@/components/sections/DailyPuzzle";
import { HallOfCheckmates } from "@/components/sections/HallOfCheckmates";
import { About } from "@/components/sections/About";
import { Buy } from "@/components/sections/Buy";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Domains />
        <HowItWorks />
        <TheClock />
        <DailyPuzzle />
        <HallOfCheckmates />
        <About />
        <Buy />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
