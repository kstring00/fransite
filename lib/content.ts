/**
 * Every line of copy on the page, in Chess's voice: plain, short, confident.
 * No em dashes. Headings stay under seven words.
 */
import { config } from "@/lib/config";

export const HERO = {
  captions: [
    { from: 0.05, to: 0.3, text: "You've done the hours." },
    { from: 0.35, to: 0.6, text: "Now play the position." },
    { from: 0.65, to: 0.85, text: "Checkmate the exam." },
  ],
  settleFrom: 0.88,
  h1: "BCBA exam prep from a BCBA who passed.",
  mono: "Built for the 6th Edition TCO",
  scrollHint: "Scroll",
} as const;

export const DOMAINS_SECTION = {
  num: "01",
  label: "The domains",
  badge: "Built for the 6th Edition Test Content Outline",
  lede: "The exam has nine domains, A through I. Every question in the Study Set is filed under one of them, so you always know which part of the board you are standing on.",
  cardLink: "Study this domain",
  hint: "Hover a piece, or tap one, to see what the set covers.",
  fallbackHint: "Tap a piece to see what the set covers.",
} as const;

export const HOW = {
  num: "02",
  label: "How it works",
  steps: [
    {
      title: "Open the position",
      body: "Pick a domain, A through I. Every question is filed where the exam files it, so you study the way you will be tested.",
    },
    {
      title: "Play it under the clock",
      body: "Timed sets, paced like the real exam. Twenty minutes at a time, no rabbit holes.",
    },
    {
      title: "Watch your rating climb",
      body: "Every set moves your rating. When it holds above the line, you are ready, and you will know it instead of hoping it.",
    },
  ],
  objection:
    "Unlike free notes and forum threads, the Study Set is sorted by domain, timed like the exam, and scored with a rating that tells you when you have stopped missing.",
} as const;

export const CLOCK = {
  num: "03",
  label: "The clock",
  lede: "The real exam gives you four hours for 185 questions, about 78 seconds each. Every timed set runs at that pace, in 20-minute sessions, so test day feels like one more session.",
  commitment: "One session a day is 20 minutes. Two is 40. It fits around a full caseload.",
  stats: [
    { value: "20", unit: "min", label: "one session" },
    { value: "78", unit: "sec", label: "per question" },
    { value: "185", unit: "", label: "questions on the real exam" },
  ],
} as const;

export const PUZZLE = {
  num: "04",
  label: "Daily puzzle",
  lede: "No account, no email. Answer today's question, read the explanation, and come back tomorrow for the next one.",
  correct: "Checkmate.",
  wrong: "Blundered. Here's why.",
  after: "That was one position. The Study Set has every domain, timed, with a rating that tracks you.",
  afterLink: "See what's in the Study Set",
  newDaily: "A new position every day.",
  submitHint: "Pick an answer",
} as const;

export const HALL = {
  num: "05",
  label: "Hall of Checkmates",
  lede: "In chess you tip your king when the game is over. These are the exams that tipped theirs.",
  dragHint: "Drag to see more",
  /** Shown as the first card when no testimonials have been supplied yet. */
  ownStory: {
    quote:
      "This is the study set I used to pass the 6th edition exam. Nothing in it is filler. If it is in here, it is because I needed it on the way to passing.",
    name: `${config.ownerNickname}, BCBA`,
    passDate: config.passDate ? `Passed ${config.passDate}` : "Passed the 6th edition exam",
  },
} as const;

export const ABOUT = {
  num: "06",
  label: `About ${config.ownerNickname}`,
  paragraphs: [
    `I'm ${config.ownerName}, and everyone calls me ${config.ownerNickname}. I'm a Board Certified Behavior Analyst, and I passed the 6th edition exam${config.passDate ? ` in ${config.passDate}` : ""} using the study content on this page.`,
    "I built it the way I wish someone had built it for me: sorted by domain, timed like the real test, and honest about what you still get wrong. It got me across the line. It can get you there too.",
  ],
  credentialsLabel: "Credentials",
  passLabel: "Exam",
  passValue: config.passDate ? `Passed the 6th edition, ${config.passDate}` : "Passed the 6th edition exam",
} as const;

export const BUY = {
  num: "07",
  label: "Get the Study Set",
  lede: "Everything on this page, in one set. Open it the day you buy it and start with the domain you dread most.",
  insideLabel: "What's inside",
  priceLabel: "Price",
  priceUnset: "Price announced at launch",
  guaranteeFallback: "Questions before buying?",
  secondary: "Have a question first?",
  checkoutUnset: "Checkout opens soon. Until then, reach Chess directly.",
} as const;

export const FAQ = {
  num: "08",
  label: "Questions",
  items: [
    {
      q: "Is this built for the 6th edition?",
      a: "Yes. Every domain, A through I, follows the 6th Edition Test Content Outline, the version of the exam given since January 2025.",
    },
    {
      q: "Do I need an account to try it?",
      a: "No. The daily puzzle on this page is free and needs no account or email. Buying the Study Set is the only step that asks for anything.",
    },
    {
      q: "How long does a session take?",
      a: "Twenty minutes, paced at the real exam's 78 seconds per question. One session a day is enough to see your rating move.",
    },
    {
      q: "What does the rating mean?",
      a: "It is a running score of how you do on timed sets, by domain. When it holds above the ready line, you are ready. When it dips, you can see which domain pulled it down.",
    },
    {
      q: "What if it doesn't help me?",
      a: config.guarantee || "Ask Chess before you buy. She would rather answer the question now than after.",
    },
  ],
} as const;

export const FOOTER = {
  tagline: "Exam prep from a BCBA who passed.",
  privacy: "Privacy",
  instagram: "Instagram",
  email: "Email",
} as const;

export const NOT_FOUND = {
  label: "404",
  heading: "Off the board.",
  body: "That square doesn't exist. Head back to the start and play from there.",
  link: "Back to the start",
} as const;
