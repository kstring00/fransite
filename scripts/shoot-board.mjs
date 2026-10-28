import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const out = process.argv[2] || "shots";
const base = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const logs = [];
const mk = async (opts, tag) => {
  const ctx = await browser.newContext({ deviceScaleFactor: 1.5, ...opts });
  const p = await ctx.newPage();
  p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`[${tag}] ${m.type()}: ${m.text().slice(0, 300)}`); });
  p.on("pageerror", (e) => logs.push(`[${tag}] pageerror: ${e.message}`));
  return p;
};
let p = await mk({ viewport: { width: 1440, height: 900 } }, "board");
await p.goto(base + "/#domains", { waitUntil: "load" });
await p.evaluate(() => document.getElementById("domains").scrollIntoView({ block: "start" }));
await p.waitForTimeout(1200);
await p.evaluate(() => window.scrollBy(0, 320));
try { await p.waitForSelector(".domains__board.is-ready", { timeout: 40000 }); } catch { logs.push("board never ready"); }
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/board-1440.png` });
const box = await p.evaluate(() => { const r = document.querySelector(".board-scene").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
await p.mouse.move(box.x + box.w * 0.5, box.y + box.h * 0.47);
await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/board-hover-1440.png` });
await p.mouse.move(box.x + box.w * 0.5, box.y + box.h * 0.95);
await p.waitForTimeout(500);
await p.click(".domains__chip >> nth=4");
await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/board-chip-1440.png` });
console.log(await p.evaluate(() => ({ mode: document.querySelector(".domains__board") ? "3d" : "2d", side: document.querySelector(".domains__board")?.dataset.cardSide, cx: document.querySelector(".domains__board")?.style.getPropertyValue("--card-x") })));
await p.context().close();

p = await mk({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, "board-phone");
await p.goto(base + "/#domains", { waitUntil: "load" });
await p.evaluate(() => document.getElementById("domains").scrollIntoView({ block: "start" }));
await p.waitForTimeout(800);
await p.evaluate(() => window.scrollBy(0, 420));
try { await p.waitForSelector(".domains__board.is-ready", { timeout: 40000 }); } catch { logs.push("phone board never ready"); }
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/board-390.png` });
await p.click(".domains__chip >> nth=1");
await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/board-chip-390.png` });
await p.context().close();
await browser.close();
console.log(logs.length ? logs.join("\n") : "console clean");
