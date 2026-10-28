import type { ReactNode } from "react";

/** Small gold-hairline badge, e.g. "Built for the 6th Edition Test Content Outline". */
export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-gold/45 bg-marble-2/70 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold ${className}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
      {children}
    </span>
  );
}
