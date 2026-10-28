import Link from "next/link";
import { config, isSet, NAV_LINKS, PRIMARY_CTA, SECTION_IDS } from "@/lib/config";
import { FOOTER } from "@/lib/content";
import { QueenMark } from "@/components/brand/QueenMark";
import { Wordmark } from "@/components/brand/Wordmark";
import "./lower-sections.css";

/** Site footer. The year is computed when the site is built. */
export function Footer() {
  const year = new Date().getFullYear();
  const hasInstagram = isSet(config.instagramUrl);
  const hasEmail = isSet(config.contactEmail);

  return (
    <footer className="site-footer">
      <div className="hairline absolute inset-x-0 top-0" aria-hidden="true" />
      <div className="container">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="flex flex-col items-start gap-5">
            <a href={`#${SECTION_IDS.hero}`} className="flex items-center gap-3 text-cream">
              <QueenMark size={32} />
              <Wordmark size="footer" />
              <span className="sr-only">, back to top</span>
            </a>
            <p className="body-2 max-w-[32ch]">{FOOTER.tagline}</p>
          </div>

          <nav aria-label="Footer">
            <p className="footer-heading">Explore</p>
            <ul className="footer-links">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="link-draw">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`#${SECTION_IDS.buy}`} className="link-draw">
                  {PRIMARY_CTA}
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <p className="footer-heading">Reach {config.ownerNickname}</p>
            <ul className="footer-links">
              {hasInstagram ? (
                <li>
                  <a href={config.instagramUrl} className="link-draw" target="_blank" rel="noopener noreferrer">
                    {FOOTER.instagram}
                  </a>
                </li>
              ) : null}
              {hasEmail ? (
                <li>
                  <a href={`mailto:${config.contactEmail}`} className="link-draw">
                    {FOOTER.email}
                  </a>
                </li>
              ) : null}
              <li>
                <Link href="/privacy" className="link-draw">
                  {FOOTER.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-gold/15 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-cream-2/70 sm:flex-row sm:items-center sm:justify-between">
          <span>
            &copy; {year} {config.brandName}
          </span>
          <span>All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
