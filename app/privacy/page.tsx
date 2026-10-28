import type { Metadata } from "next";
import { config, SECTION_IDS } from "@/lib/config";
import { Footer } from "@/components/sections/Footer";
import { PrivacyContent } from "./PrivacyContent";
import "@/components/sections/lower-sections.css";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${config.brandName} handles your information. Short, because this site collects almost nothing.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <main id={SECTION_IDS.hero}>
        <PrivacyContent />
      </main>
      <Footer />
    </>
  );
}
