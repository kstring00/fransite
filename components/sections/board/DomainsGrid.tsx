"use client";
import { useId, useState } from "react";
import { DOMAINS, PIECE_NAMES } from "@/lib/domains";
import { DOMAINS_SECTION } from "@/lib/content";
import { SECTION_IDS } from "@/lib/config";
import { PieceIcon } from "@/components/ui/PieceIcon";

/**
 * The 2D board: nine glass cards with piece silhouettes. Used when WebGL is
 * unavailable or the device is low on headroom. Each card opens in place.
 */
export function DomainsGrid() {
  const [open, setOpen] = useState<string | null>(null);
  const base = useId();
  return (
    <ul className="domains-grid" aria-label="The nine domains">
      {DOMAINS.map((d, i) => {
        const isOpen = open === d.letter;
        const panelId = `${base}-${d.letter}`;
        const gold = d.finish !== "marble";
        return (
          <li key={d.letter} className={`domains-grid__cell glass glass--flat ${isOpen ? "is-open" : ""}`} data-enter style={{ transitionDelay: `${i * 40}ms` }}>
            <button
              type="button"
              className="domains-grid__btn"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : d.letter)}
            >
              <span className={`domains-grid__piece ${gold ? "text-gold" : "text-cream-2"}`} aria-hidden="true">
                <PieceIcon piece={d.piece} size={44} />
              </span>
              <span className="domains-grid__meta">
                <span className="label-mono label-mono--gold">
                  {d.letter} <span className="sr-only">, {PIECE_NAMES[d.piece]}</span>
                </span>
                <span className="domains-grid__title">{d.title}</span>
              </span>
              <span className="domains-grid__plus" aria-hidden="true" />
            </button>
            <div id={panelId} className="domains-grid__panel" hidden={!isOpen}>
              <p className="body-2">{d.covers}</p>
              <a href={`#${SECTION_IDS.buy}`} className="link-draw domains-grid__link">
                {DOMAINS_SECTION.cardLink}
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
