// Renders the share image (1200x630): the poster with the wordmark along the
// bottom edge, the way it settles in the hero. Writes app/opengraph-image.jpg
// and app/twitter-image.jpg. Run: node scripts/gen-og.mjs
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
const { chromium } = createRequire(import.meta.url)("playwright");

const poster = readFileSync("public/brand/hero-poster.jpg").toString("base64");
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400&family=Pinyon+Script&family=IBM+Plex+Mono&display=block" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;background:#0B0A0A;overflow:hidden}
  .frame{position:relative;width:1200px;height:630px}
  img{position:absolute;left:0;top:-30px;width:1200px;height:675px;object-fit:cover}
  .scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,10,10,.45) 0%,rgba(11,10,10,0) 28%,rgba(11,10,10,0) 48%,rgba(11,10,10,.86) 80%,rgba(11,10,10,.97) 100%)}
  .mark{position:absolute;left:0;right:0;bottom:120px;display:flex;align-items:baseline;justify-content:center;color:#F2E8D5;font-family:Fraunces,serif;font-size:66px;letter-spacing:-1px;font-variation-settings:"opsz" 144}
  .mark .w{font-family:"Pinyon Script",cursive;color:#C9A24B;font-size:100px;margin:0 16px;transform:translateY(8px);display:inline-block;text-shadow:0 2px 24px rgba(0,0,0,.6)}
  .tag{position:absolute;left:0;right:0;bottom:66px;text-align:center;color:#E6C77A;font-family:"IBM Plex Mono",monospace;font-size:20px;letter-spacing:.2em;text-transform:uppercase}
  .line{position:absolute;left:50%;bottom:104px;width:260px;height:1px;margin-left:-130px;background:linear-gradient(90deg,transparent,#C9A24B,transparent)}
</style></head><body><div class="frame">
  <img src="data:image/jpeg;base64,${poster}" alt="">
  <div class="scrim"></div>
  <div class="mark"><span>Everything Behavior</span><span class="w">with</span><span>Chess</span></div>
  <div class="line"></div>
  <div class="tag">BCBA exam prep, built for the 6th edition TCO</div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
const png = await page.screenshot({ type: "png" });
await browser.close();
writeFileSync("/tmp/og-render.png", png);
execSync("convert /tmp/og-render.png -quality 84 -strip app/opengraph-image.jpg && cp app/opengraph-image.jpg app/twitter-image.jpg");
console.log("share image written");
