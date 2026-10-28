import { siteConfig } from "@/site.config";

/** True when a config value has been supplied (not empty, not "TBD", not "#"). */
export function isSet(value: string | undefined | null): value is string {
  if (!value) return false;
  const v = value.trim();
  return v !== "" && v.toUpperCase() !== "TBD" && v !== "#";
}

export const config = siteConfig;

/** Absolute site origin used for canonical URLs, sitemap and share images. */
export function siteOrigin(): string {
  if (isSet(config.domain)) return `https://${config.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Where the primary button sends people. Falls back to the buy section until checkout is connected. */
export function checkoutHref(): string {
  return isSet(config.checkoutUrl) ? config.checkoutUrl : "#get-the-study-set";
}

/** True when checkout is connected (the buy button can leave the site). */
export function checkoutConnected(): boolean {
  return isSet(config.checkoutUrl);
}

export function contactHref(): string | null {
  if (isSet(config.contactEmail)) return `mailto:${config.contactEmail}`;
  if (isSet(config.instagramUrl)) return config.instagramUrl;
  return null;
}

export function contactLabel(): string {
  if (isSet(config.contactEmail)) return `Email ${config.ownerNickname}`;
  if (isSet(config.instagramUrl)) return `Message ${config.ownerNickname} on Instagram`;
  return `Ask ${config.ownerNickname}`;
}

export const SECTION_IDS = {
  hero: "top",
  domains: "domains",
  how: "how-it-works",
  clock: "the-clock",
  puzzle: "daily-puzzle",
  hall: "hall-of-checkmates",
  about: "about",
  buy: "get-the-study-set",
  faq: "faq",
} as const;

export const NAV_LINKS = [
  { href: `#${SECTION_IDS.domains}`, id: SECTION_IDS.domains, label: "Domains" },
  { href: `#${SECTION_IDS.how}`, id: SECTION_IDS.how, label: "How it works" },
  { href: `#${SECTION_IDS.puzzle}`, id: SECTION_IDS.puzzle, label: "Daily puzzle" },
  { href: `#${SECTION_IDS.hall}`, id: SECTION_IDS.hall, label: "Hall of Checkmates" },
  { href: `#${SECTION_IDS.about}`, id: SECTION_IDS.about, label: "About" },
] as const;

export const PRIMARY_CTA = "Get the Study Set";
