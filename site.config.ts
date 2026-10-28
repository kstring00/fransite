/**
 * Everything Behavior with Chess, Exam Prep
 * ------------------------------------------------------------
 * Every piece of business information the site shows lives here.
 * Edit this file, redeploy, done. Values marked "TBD" or left empty are
 * read by the site as "not supplied yet" and are listed in HANDOFF.md.
 */

export type Testimonial = {
  /** Full quote, in the person's own words. */
  quote: string;
  /** Name as it should appear, e.g. "Maya R., BCBA". */
  name: string;
  /** When they passed, e.g. "Passed March 2026". */
  passDate: string;
};

export const siteConfig = {
  /** Brand shown in the wordmark, title tags and the share image. */
  brandName: "Everything Behavior with Chess",
  brandShort: "Chess",
  tagline: "Exam Prep",

  /** The one thing the site sells. */
  productName: "The Study Set",
  /** Display price, e.g. "$149". "TBD" hides the number and shows a launch note. */
  price: "TBD",
  /** Where "Get the Study Set" sends people. "#" means not connected yet. */
  checkoutUrl: "#",
  /**
   * Guarantee or refund terms, shown directly above the buy button.
   * Leave empty to show "Questions before buying? Email Chess." instead.
   */
  guarantee: "",

  /** Owner */
  ownerName: "Franhesca",
  ownerNickname: "Chess",
  /** Path under /public. Replace with Chess's real photo (portrait, at least 1200px tall). */
  ownerPhotoPath: "/brand/logo.png",
  /** True once ownerPhotoPath points at a real photo of Chess. */
  ownerPhotoIsReal: false,
  credentials: ["Board Certified Behavior Analyst (BCBA)"],
  /** Month and year Chess passed the 6th edition exam, e.g. "May 2025". Empty hides the date. */
  passDate: "",

  /** Social proof. Empty array shows Chess's own pass story instead. Never invent one. */
  testimonials: [] as Testimonial[],

  /** Contact. "TBD" or empty hides the link. */
  contactEmail: "TBD",
  instagramUrl: "TBD",

  /** Production domain without protocol, e.g. "everythingbehaviorwithchess.com". */
  domain: "TBD",

  /** What the Study Set contains. Keep these honest; they print on the buy card. */
  product: {
    domainCount: 9,
    /** Total questions in the set. Update when the final count is known. */
    questionCount: "TBD",
    sessionMinutes: 20,
    features: [
      "All nine 6th edition domains, A through I",
      "Timed sets paced like the real exam",
      "A rating that tells you when you are ready",
      "The free daily puzzle, every day",
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
