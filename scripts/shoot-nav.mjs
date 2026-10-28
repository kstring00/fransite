// Screenshots the three nav states. Usage: node scripts/shoot-nav.mjs <outDir>
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const out = process.argv[2] || "shots";
const base = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();
const logs = [];
async function page(w, h, mobile = false) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`[${w}x${h}] ${m.type()}: ${m.text()}`); });
  p.on("pageerror", (e) => logs.push(`[${w}x${h}] pageerror: ${e.message}`));
  await p.goto(base + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  return p;
}
let p = await page(1440, 900);
await p.screenshot({ path: `${out}/nav-top-1440.png`, clip: { x: 0, y: 0, width: 1440, height: 420 } });
await p.evaluate(() => window.scrollTo(0, 700));
await p.waitForTimeout(1400);
await p.screenshot({ path: `${out}/nav-floating-1440.png`, clip: { x: 0, y: 0, width: 1440, height: 420 } });
await p.screenshot({ path: `${out}/page-floating-1440.png` });
await p.context().close();

p = await page(390, 844, true);
await p.screenshot({ path: `${out}/nav-top-390.png`, clip: { x: 0, y: 0, width: 390, height: 300 } });
await p.evaluate(() => window.scrollTo(0, 500));
await p.waitForTimeout(1400);
await p.screenshot({ path: `${out}/nav-floating-390.png`, clip: { x: 0, y: 0, width: 390, height: 300 } });
await p.click(".menu-toggle");
await p.waitForTimeout(1400);
await p.screenshot({ path: `${out}/nav-menu-open-390.png` });
await p.context().close();
await browser.close();
console.log(logs.length ? logs.join("\n") : "console clean");
