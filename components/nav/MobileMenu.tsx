"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { NAV_LINKS } from "@/lib/config";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { QueenMark } from "@/components/brand/QueenMark";
import { lockScroll, prefersReducedMotion } from "@/lib/motion";

type Props = {
  open: boolean;
  onClose: () => void;
  /** The menu toggle in the header, included in the focus trap. */
  toggleRef: React.RefObject<HTMLButtonElement | null>;
};

/**
 * Full-screen takeover for phones: marble with veins, a faint leopard corner,
 * links set down one after another like pieces on a board, the primary
 * button pinned in the thumb zone.
 */
export function MobileMenu({ open, onClose, toggleRef }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const root = rootRef.current!;
    const items = Array.from(linksRef.current!.querySelectorAll<HTMLElement>("[data-menu-item]"));
    const cta = root.querySelector<HTMLElement>("[data-menu-cta]")!;
    const reduce = prefersReducedMotion();

    if (open) {
      wasOpen.current = true;
      lockScroll(true);
      root.style.visibility = "visible";
      gsap.killTweensOf([root, ...items, cta]);
      if (reduce) {
        gsap.set(root, { opacity: 1 });
        gsap.set([...items, cta], { opacity: 1, y: 0 });
      } else {
        gsap.set([...items, cta], { opacity: 0, y: 44 });
        gsap.to(root, { opacity: 1, duration: 0.45, ease: "power2.out" });
        gsap.to(items, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06, delay: 0.12 });
        gsap.to(cta, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.12 + items.length * 0.06 });
      }
      // Focus the first link once it is visible.
      window.setTimeout(() => items[0]?.focus({ preventScroll: true }), reduce ? 0 : 200);
    } else if (wasOpen.current) {
      lockScroll(false);
      gsap.killTweensOf([root, ...items, cta]);
      gsap.to(root, {
        opacity: 0,
        duration: reduce ? 0 : 0.35,
        ease: "power2.inOut",
        onComplete: () => {
          root.style.visibility = "hidden";
        },
      });
      toggleRef.current?.focus({ preventScroll: true });
    }
  }, [open, toggleRef]);

  // Escape closes; Tab is trapped between the toggle and the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const root = rootRef.current!;
      const focusables = [
        toggleRef.current,
        ...Array.from(root.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")),
      ].filter((el): el is HTMLElement => !!el);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (current === first || !focusables.includes(current!))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, toggleRef]);

  return (
    <div
      ref={rootRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      className="mobile-menu fixed inset-0 z-[55] opacity-0"
      style={{ visibility: "hidden" }}
      onClick={(e) => {
        // Tap on the open background closes; taps on links and the button pass through.
        if ((e.target as HTMLElement).closest("a, button")) return;
        onClose();
      }}
    >
      <div className="mobile-menu__leopard" aria-hidden="true" />
      <div className="mobile-menu__queen" aria-hidden="true">
        <QueenMark size={220} />
      </div>
      <nav className="relative flex h-full flex-col px-7 pt-[calc(var(--nav-h)+28px)]" aria-label="Site">
        <ul ref={linksRef} className="flex flex-col gap-1">
          {NAV_LINKS.map((l, i) => (
            <li key={l.href}>
              <a
                href={l.href}
                data-menu-item
                onClick={onClose}
                className="mobile-menu__link"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                <span className="label-mono label-mono--gold mr-4 inline-block w-7 translate-y-[-6px]">0{i + 1}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto pb-[max(28px,env(safe-area-inset-bottom))]" data-menu-cta>
          <div className="hairline mb-6" />
          <PrimaryButton size="lg" className="w-full" onClick={onClose} />
          <p className="body-2 mt-4 text-center text-cream-2/80">Built for the 6th Edition Test Content Outline</p>
        </div>
      </nav>
    </div>
  );
}
