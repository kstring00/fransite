// Full-page screenshots at desktop and phone, console check, overflow check.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const out = process.argv[2] || "shots";
const base = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const logs = [];
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`[${w}] ${m.type()}: ${m.text().slice(0, 240)}`); });
  p.on("pageerror", (e) => logs.push(`[${w}] pageerror: ${e.message}`));
  await p.goto(base + "/", { waitUntil: "load" });
  await p.waitForTimeout(1500);
  // Scroll through slowly so reveals fire and lazy chunks load.
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.round(h * 0.6)) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(160); }
  await p.waitForTimeout(1500);
  const overflow = await p.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: window.innerWidth, total: document.documentElement.scrollHeight }));
  console.log(w, overflow);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/page-${w}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
console.log(logs.length ? logs.join("\n") : "console clean");
