import type { SVGProps } from "react";
import type { PieceKind } from "@/lib/domains";

/**
 * Chess piece silhouettes, 48x64 viewBox, currentColor fill. Used by the 2D
 * domains fallback, the Hall of Checkmates (tipped king) and small labels.
 */
const PATHS: Record<PieceKind, string> = {
  pawn:
    "M24 6a7 7 0 0 1 4.6 12.3c3.4 1.4 5.8 4.4 6.3 8.1H28l1.2 14h6.6c2.6 1.4 4.5 3.9 5.2 6.9H7c.7-3 2.6-5.5 5.2-6.9h6.6L20 26.4h-6.9c.5-3.7 2.9-6.7 6.3-8.1A7 7 0 0 1 24 6Z",
  rook:
    "M9 6h6v6h5V6h8v6h5V6h6v12l-4 4v18.5l5 3.5v9.5c0 1.7-1.3 3-3 3H11c-1.7 0-3-1.3-3-3V50l5-3.5V22l-4-4V6Zm9 18v16h12V24H18Z",
  knight:
    "M14 58c0-4 2-8 5-10 3.3-2.3 5.5-5.2 6.5-8.6-2.6 1.2-5.8 1.4-8.3.1-1.4-.7-2.4-1.9-3-3.3-.5-1.3-.3-2.9.6-4 2.8-3.6 6.6-6.2 10.3-8.9 1.2-2.3 1.3-5 2.5-7.3.6-1.2 1.9-1.6 3-1 1.4.9 1.5 2.5 2.5 3.6 1.2 1.3 3 1.7 4.4 2.7 2.7 1.9 4.8 4.6 5.9 7.7 1.4 4.2 1.5 8.8 1.7 13.2.2 5.3.4 10.6.4 15.8H14Zm9-30a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  bishop:
    "M24 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 8c6.5 0 11.5 7.5 11.5 15 0 4.2-1.8 7.8-4.6 10h2.6l1.5 4h-22l1.5-4h2.6c-2.8-2.2-4.6-5.8-4.6-10 0-7.5 5-15 11.5-15Zm-2 9v5h-5v3h5v6h4v-6h5v-3h-5v-5h-4ZM11 44h26l3 6H8l3-6Zm-4 8h34v8H7v-8Z",
  queen:
    "M24 2a3.2 3.2 0 1 1 0 6.4A3.2 3.2 0 0 1 24 2ZM9 10a2.6 2.6 0 1 1 0 5.2A2.6 2.6 0 0 1 9 10Zm30 0a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2ZM16 7a2.6 2.6 0 1 1 0 5.2A2.6 2.6 0 0 1 16 7Zm16 0a2.6 2.6 0 1 1 0 5.2A2.6 2.6 0 0 1 32 7ZM9.5 16l5.5 9 3-13 6 11 6-11 3 13 5.5-9 1.5 20H8l1.5-20ZM8 38h32v4H8v-4Zm1 6h30c-.8 5-4 9-8.5 11.5h-13C13 53 9.8 49 9 44Zm-2 14h34v6H7v-6Z",
  king:
    "M22 2h4v5h5v4h-5v5h-4v-5h-5V7h5V2Zm2 17c4.4 0 8 3.6 8 8 0 2.2-.9 4.2-2.3 5.6 4.1 1.5 7.1 5.4 7.1 10 0 1.6-.4 3.2-1 4.6H12.2c-.6-1.4-1-3-1-4.6 0-4.6 3-8.5 7.1-10A7.96 7.96 0 0 1 16 27c0-4.4 3.6-8 8-8Zm-13 32h26v3H11v-3Zm-3 5h32v6H8v-6Z",
};

export function PieceIcon({ piece, size = 28, ...rest }: SVGProps<SVGSVGElement> & { piece: PieceKind; size?: number }) {
  return (
    <svg width={size * 0.75} height={size} viewBox="0 0 48 64" fill="currentColor" aria-hidden="true" {...rest}>
      <path d={PATHS[piece]} />
    </svg>
  );
}

/** A king lying on its side, the chess sign for a finished game. */
export function TippedKingIcon({ size = 36, ...rest }: SVGProps<SVGSVGElement> & { size?: number }) {
  // The king lies on its right side: rotate the upright silhouette 90 degrees
  // around its centre and rest it on a thin shadow line.
  return (
    <svg width={size * 1.4} height={size} viewBox="0 0 84 60" fill="currentColor" aria-hidden="true" {...rest}>
      <g transform="translate(42 26) rotate(90) scale(0.72) translate(-24 -32)">
        <path d={PATHS.king} />
      </g>
      <rect x="6" y="52" width="72" height="1.5" rx="0.75" opacity="0.45" />
    </svg>
  );
}
