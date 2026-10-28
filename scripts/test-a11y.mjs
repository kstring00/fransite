// Keyboard walk, focus ring, mobile menu behaviour.
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const base = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const errors = [];

// Desktop tab walk
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
let p = await ctx.newPage();
p.on("pageerror", (e) => errors.push("pageerror: " + e.message));
await p.goto(base + "/", { waitUntil: "load" });
await p.waitForTimeout(1500);
const seen = [];
let missingRing = [];
for (let i = 0; i < 80; i++) {
  await p.keyboard.press("Tab");
  const info = await p.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    const label = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    const r = el.getBoundingClientRect();
    return { tag: el.tagName.toLowerCase(), label, outline: cs.outlineStyle + " " + cs.outlineWidth + " " + cs.outlineColor, w: Math.round(r.width), h: Math.round(r.height), visible: r.width > 0 && r.height > 0 };
  });
  if (!info) break;
  seen.push(`${info.tag}:${info.label}`);
  if (info.visible && !/solid 2px/.test(info.outline)) missingRing.push(`${info.tag}:${info.label} -> ${info.outline}`);
}
console.log("tab order (" + seen.length + "):\n  " + seen.join("\n  "));
console.log("missing focus ring:", missingRing.length ? missingRing : "none");
// Chip keyboard: focus chip opens card
await p.evaluate(() => document.querySelector(".domains__chip").focus());
await p.waitForTimeout(700);
console.log("chip focus opens card:", await p.evaluate(() => document.querySelector(".domains__card").style.visibility));
await ctx.close();

// Mobile menu
ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
p = await ctx.newPage();
p.on("pageerror", (e) => errors.push("pageerror: " + e.message));
await p.goto(base + "/", { waitUntil: "load" });
await p.waitForTimeout(1000);
const expandedBefore = await p.getAttribute(".menu-toggle", "aria-expanded");
await p.click(".menu-toggle");
await p.waitForTimeout(900);
const expandedAfter = await p.getAttribute(".menu-toggle", "aria-expanded");
const locked = await p.evaluate(() => document.documentElement.classList.contains("scroll-locked"));
const focused = await p.evaluate(() => (document.activeElement?.textContent || "").trim().slice(0, 30));
// Tab trap: press Tab 8 times, ensure focus stays within menu or toggle
let outside = 0;
for (let i = 0; i < 8; i++) {
  await p.keyboard.press("Tab");
  const inside = await p.evaluate(() => { const a = document.activeElement; return !!(a && (a.closest("#mobile-menu") || a.classList.contains("menu-toggle"))); });
  if (!inside) outside++;
}
await p.keyboard.press("Escape");
await p.waitForTimeout(600);
const expandedEsc = await p.getAttribute(".menu-toggle", "aria-expanded");
const unlocked = await p.evaluate(() => !document.documentElement.classList.contains("scroll-locked"));
const focusBack = await p.evaluate(() => document.activeElement?.classList.contains("menu-toggle"));
// Overlay tap closes
await p.click(".menu-toggle"); await p.waitForTimeout(800);
await p.mouse.click(300, 700); await p.waitForTimeout(600);
const expandedTap = await p.getAttribute(".menu-toggle", "aria-expanded");
console.log({ expandedBefore, expandedAfter, locked, firstFocus: focused, tabEscapes: outside, expandedEsc, unlocked, focusBack, expandedTap });
// Tap targets >= 44px
const small = await p.evaluate(() => Array.from(document.querySelectorAll("a, button")).filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44); }).map((el) => `${el.tagName.toLowerCase()}:${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30)} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`));
console.log("tap targets under 44px (visible now):", small);
await ctx.close();
await browser.close();
console.log(errors.length ? errors.join("\n") : "no page errors");
