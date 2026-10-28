// Hero self-test: scrub states, phone path, fetch failure, reduced motion.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const out = process.argv[2] || "shots";
const base = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();
const logs = [];
const mk = async (opts, tag) => {
  const ctx = await browser.newContext({ deviceScaleFactor: 1.5, ...opts });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`[${tag}] ${m.type()}: ${m.text()}`); });
  p.on("pageerror", (e) => logs.push(`[${tag}] pageerror: ${e.message}`));
  return p;
};
const waitReady = (p) => p.waitForFunction(() => ["ready", "failed"].includes(document.querySelector(".hero__loader")?.dataset.state || ""), null, { timeout: 30000 });

// Desktop scrub
let p = await mk({ viewport: { width: 1440, height: 900 } }, "desktop");
await p.goto(base + "/", { waitUntil: "load" });
await p.waitForTimeout(600);
await p.screenshot({ path: `${out}/hero-loading-1440.png` });
await waitReady(p);
await p.waitForTimeout(1200);
const state = await p.evaluate(() => document.querySelector(".hero__loader").dataset.state);
await p.screenshot({ path: `${out}/hero-p0-1440.png` });
const sectionH = await p.evaluate(() => document.querySelector(".hero").offsetHeight);
const scrollTo = async (prog) => { await p.evaluate((y) => window.scrollTo(0, y), prog * (sectionH - 900)); await p.waitForTimeout(1800); };
await scrollTo(0.2); const t02 = await p.evaluate(() => document.querySelector(".hero__video").currentTime);
await p.screenshot({ path: `${out}/hero-p02-1440.png` });
await scrollTo(0.5); const t05 = await p.evaluate(() => document.querySelector(".hero__video").currentTime);
await p.screenshot({ path: `${out}/hero-p05-1440.png` });
await scrollTo(0.75); const t075 = await p.evaluate(() => document.querySelector(".hero__video").currentTime);
await p.screenshot({ path: `${out}/hero-p075-1440.png` });
await scrollTo(1); const t1 = await p.evaluate(() => document.querySelector(".hero__video").currentTime);
await p.screenshot({ path: `${out}/hero-p1-1440.png` });
console.log({ state, sectionH, t02, t05, t075, t1 });
await p.context().close();

// Phone poster path
p = await mk({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, "phone");
await p.goto(base + "/", { waitUntil: "load" });
await p.waitForTimeout(1200); await p.screenshot({ path: `${out}/hero-phone-1.png` });
await p.waitForTimeout(3000); await p.screenshot({ path: `${out}/hero-phone-2.png` });
await p.waitForTimeout(6000); await p.screenshot({ path: `${out}/hero-phone-3.png` });
await p.context().close();

// Fetch failure
p = await mk({ viewport: { width: 1440, height: 900 } }, "nofetch");
await p.route("**/*.mp4", (r) => r.abort());
await p.goto(base + "/", { waitUntil: "load" });
await waitReady(p);
await p.waitForTimeout(800);
const failState = await p.evaluate(() => document.querySelector(".hero__loader").dataset.state);
await p.screenshot({ path: `${out}/hero-nofetch-p0-1440.png` });
const sh = await p.evaluate(() => document.querySelector(".hero").offsetHeight);
await p.evaluate((y) => window.scrollTo(0, y), sh - 900); await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}/hero-nofetch-p1-1440.png` });
console.log({ failState });
await p.context().close();

// Reduced motion
p = await mk({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }, "reduced");
await p.goto(base + "/", { waitUntil: "load" });
await p.waitForTimeout(6000);
await p.screenshot({ path: `${out}/hero-reduced-1440.png` });
console.log({ reducedMode: await p.evaluate(() => document.querySelector(".hero").dataset.mode) });
await p.context().close();
await browser.close();
console.log(logs.length ? logs.join("\n") : "console clean");
