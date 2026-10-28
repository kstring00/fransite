// Generates the two brand textures:
//   public/textures/marble-veins.svg  -> rendered to marble-veins.webp (page base layer)
//   public/textures/leopard.svg       -> repeating rosette tile (used sparingly)
// Run: node scripts/gen-textures.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");

mkdirSync("public/textures", { recursive: true });

// Seeded random so the tile is stable between runs.
let seed = 20261028;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

// ---------- Marble veins ----------
// Turbulence pushed through a steep color curve gives thin, branching light veins
// on a transparent field. The page paints it at ~7% opacity over --marble.
const marble = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <!-- Veins live on the iso-lines of fractal noise: luminance is moved into alpha,
         then a table transfer keeps only a thin band around 0.5. -->
    <filter id="veins" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0028 0.0046" numOctaves="4" seed="11" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.95  0 0 0 0 0.91  0 0 0 0 0.84  0.33 0.33 0.34 0 0" result="l"/>
      <feComponentTransfer in="l" result="iso">
        <feFuncA type="table" tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 1 0.2 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"/>
      </feComponentTransfer>
      <feGaussianBlur in="iso" stdDeviation="0.6"/>
    </filter>
    <filter id="fine" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.011" numOctaves="3" seed="3" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.78  0 0 0 0 0.48  0.33 0.33 0.34 0 0" result="l"/>
      <feComponentTransfer in="l">
        <feFuncA type="table" tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 1 0.3 0 0 0 0 0 0 0 0 0 0 0 0 0 0"/>
      </feComponentTransfer>
      <feGaussianBlur stdDeviation="0.4"/>
    </filter>
    <filter id="cloud" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0018" numOctaves="2" seed="21" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.95  0 0 0 0 0.91  0 0 0 0 0.84  0.2 0.2 0.2 0 -0.08"/>
    </filter>
  </defs>
  <rect width="1024" height="1024" fill="#000" filter="url(#cloud)" opacity="0.1"/>
  <rect width="1024" height="1024" fill="#000" filter="url(#veins)" opacity="0.95"/>
  <rect width="1024" height="1024" fill="#000" filter="url(#fine)" opacity="0.5"/>
</svg>`;
writeFileSync("public/textures/marble-veins.svg", marble);

// ---------- Leopard rosettes ----------
const W = 240;
const rosettes = [];
const placed = [];
function far(x, y, r) {
  return placed.every((p) => Math.hypot(p.x - x, p.y - y) > p.r + r + 3);
}
let tries = 0;
while (placed.length < 40 && tries < 6000) {
  tries++;
  const x = rnd() * W;
  const y = rnd() * W;
  const r = 7 + rnd() * 8;
  if (!far(x, y, r)) continue;
  placed.push({ x, y, r });
  const rot = rnd() * 360;
  const sx = 0.85 + rnd() * 0.4;
  const sy = 0.85 + rnd() * 0.4;
  const segs = [];
  const n = 3 + Math.floor(rnd() * 2);
  let a = rnd() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const span = 0.9 + rnd() * 1.1;
    const gap = 0.35 + rnd() * 0.5;
    const a1 = a;
    const a2 = a + span;
    a = a2 + gap;
    const rr = r * (0.9 + rnd() * 0.25);
    const x1 = Math.cos(a1) * rr;
    const y1 = Math.sin(a1) * rr;
    const x2 = Math.cos(a2) * rr;
    const y2 = Math.sin(a2) * rr;
    const large = span > Math.PI ? 1 : 0;
    const w = 3 + rnd() * 2.2;
    segs.push(
      `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} A${rr.toFixed(2)} ${rr.toFixed(2)} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="#2A1A10" stroke-width="${w.toFixed(2)}" stroke-linecap="round" fill="none"/>`
    );
  }
  const inner = r * (0.42 + rnd() * 0.2);
  // For a seamless tile, draw each rosette at its position and at the wrapped offsets.
  const offsets = [[0, 0], [W, 0], [-W, 0], [0, W], [0, -W], [W, W], [-W, -W], [W, -W], [-W, W]];
  for (const [ox, oy] of offsets) {
    const cx = x + ox;
    const cy = y + oy;
    if (cx < -30 || cy < -30 || cx > W + 30 || cy > W + 30) continue;
    rosettes.push(
      `<g transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${rot.toFixed(1)}) scale(${sx.toFixed(2)} ${sy.toFixed(2)})">` +
        `<ellipse rx="${inner.toFixed(2)}" ry="${(inner * 0.85).toFixed(2)}" fill="#B9843C" opacity="0.9"/>` +
        segs.join("") +
        `</g>`
    );
  }
}
// Small solid spots between rosettes.
const spots = [];
for (let i = 0; i < 34; i++) {
  const x = rnd() * W;
  const y = rnd() * W;
  const r = 1.6 + rnd() * 2.2;
  if (!far(x, y, r + 2)) continue;
  spots.push(`<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${r.toFixed(2)}" ry="${(r * (0.7 + rnd() * 0.5)).toFixed(2)}" fill="#2A1A10" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(2)} ${y.toFixed(2)})"/>`);
}
const leopard = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">
  <rect width="${W}" height="${W}" fill="#D9B978"/>
  ${rosettes.join("\n  ")}
  ${spots.join("\n  ")}
</svg>`;
writeFileSync("public/textures/leopard.svg", leopard);

// Render the marble SVG to a WebP so the page never pays for live SVG filters.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
await page.setContent(`<html><body style="margin:0;background:#000">${marble}</body></html>`);
await page.screenshot({ path: "public/textures/marble-veins.png", type: "png" });
await page.setContent(`<html><body style="margin:0;background:#000">${leopard.replace(`width="${W}" height="${W}"`, `width="480" height="480"`)}</body></html>`);
await page.setViewportSize({ width: 480, height: 480 });
await page.screenshot({ path: "public/textures/leopard.png", type: "png" });
await browser.close();
console.log("textures written");
