# Handoff: Everything Behavior with Chess, Exam Prep

A one-page site that sells one thing: Chess's Study Set for the BCBA 6th edition exam.
Every page element funnels to "Get the Study Set".

## Needs Chess's input

All of these live in `site.config.ts`. Until they are filled in, the site shows an honest
working state (no placeholders, nothing invented) and this list is the to-do.

| Key | Current value | What to supply |
| --- | --- | --- |
| `price` | `"TBD"` | Display price, e.g. `"$149"`. Until set, the buy card reads "Price announced at launch". |
| `checkoutUrl` | `"#"` | The checkout link (Stripe Payment Link, Gumroad, Thrivecart, etc.). Until set, every "Get the Study Set" button scrolls to the buy section and the buy card says checkout opens soon. |
| `guarantee` | `""` | Refund or guarantee terms, one sentence, shown directly above the buy button. Until set, the line reads "Questions before buying? Ask Chess." |
| `ownerPhotoPath` | `"/brand/logo.png"` | A portrait of Chess, at least 1200px tall, portrait orientation. Drop it in `public/brand/` and point this at it. Then set `ownerPhotoIsReal: true` so the alt text and caption switch to her name. |
| `passDate` | `""` | Month and year she passed, e.g. `"May 2025"`. Shown in About and on her Hall card. |
| `credentials` | `["Board Certified Behavior Analyst (BCBA)"]` | Add anything else she wants listed (degree, years in practice). Do not invent. |
| `testimonials` | `[]` | Collect at least two. Each needs `quote`, `name` (as they want it shown) and `passDate` ("Passed March 2026"). Until then the Hall shows Chess's own pass story only. |
| `contactEmail` | `"TBD"` | The address people email with questions. Drives the "Email Chess" links and the footer. |
| `instagramUrl` | `"TBD"` | Full URL. Shows in the footer and as the fallback contact when email is unset. |
| `domain` | `"TBD"` | Production domain without protocol, e.g. `everythingbehaviorwithchess.com`. Drives the canonical URL, sitemap, robots and share image URLs. |
| `product.questionCount` | `"TBD"` | Total questions in the set once final. Shown as a line on the buy card. |

Also from Chess, outside the config:

- Confirm the two About paragraphs in `lib/content.ts` (`ABOUT.paragraphs`) read as her voice. They are written as a confident introduction; edit freely.
- Confirm the daily puzzle questions in `lib/puzzle.ts` (nine questions, one per day, rotating). Replace or extend with her own. If the `bcba-prep` engine is added later, point `getDailyPuzzle` at it; the component needs no change.

## How to edit `site.config.ts`

1. Open `site.config.ts` at the project root.
2. Change the value in quotes. Keep the quotes. Lists use square brackets with commas.
3. Testimonials look like this:

```ts
testimonials: [
  { quote: "The timed sets were the difference. I walked in knowing I was ready.", name: "Maya R., BCBA", passDate: "Passed March 2026" },
],
```

4. Save, commit, push. Vercel redeploys on every push to the production branch.

Copy lives in `lib/content.ts`. Domain descriptions live in `lib/domains.ts`.

## How to redeploy

- Connected Git deploys: push to the production branch; Vercel builds and goes live in about two minutes.
- Manual: `npx vercel --prod` from the project root (requires the Vercel CLI and a login).
- Local check first: `npm run build` then `npm start`, open http://localhost:3000.

## Vercel settings to confirm

- Add the production domain and the `www` variant in Vercel, Project, Settings, Domains. Set one as primary and let Vercel redirect the other (this handles www / non-www). HTTPS is automatic.
- Set the `domain` key in `site.config.ts` to the same primary domain so canonical tags and the sitemap match.
- Node 20 or newer (default on Vercel). No environment variables are required.

## Assets

- `public/brand/hero.mp4`: original 6 s footage (source, not served).
- `public/brand/hero-scrub.mp4` and `hero-scrub-720.mp4`: re-encoded for scroll scrubbing (keyframe every 6 frames). Regenerate with `npm run encode:hero` if the footage changes.
- `public/brand/hero-poster.jpg`: the final frame, used as the LCP image, the phone hero, and the fallback when the video cannot load.
- `public/brand/logo.png`: the brand image.
- `public/textures/`: generated marble-vein and leopard textures (`node scripts/gen-textures.mjs` regenerates them).
- `app/opengraph-image.jpg` and `app/twitter-image.jpg`: the share image (1200 x 630, the poster with the wordmark). Replace the file to change it.

## Checks before launch

- `npm run lint`, `npm run typecheck`, `npm run check:copy` (fails on em dashes, lorem, TODO and the banned word list).
- `node scripts/shoot-nav.mjs <dir>`, `shoot-hero.mjs`, `shoot-board.mjs`, `shoot-page.mjs` take review screenshots against a running dev server.

## Deviations worth knowing

- Section labels use an oxblood chip for the number and cream mono text for the label, rather than oxblood text, because oxblood text on the marble background fails contrast (about 2:1). Oxblood carries the chips, the wrong-answer sweep, the buy button and the legend chips so the red survives below the fold.
- The Domains board uses a custom warm light environment (drei Lightformers) instead of a downloaded HDRI, so the build has no third-party asset dependency and the brass reflects brand colours.
