"use client";
import { useRef } from "react";
import { config, isSet, checkoutConnected, contactHref, contactLabel, SECTION_IDS } from "@/lib/config";
import { BUY } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useReveal } from "@/components/motion/useReveal";
import "./lower-sections.css";

function Check() {
  return (
    <span className="buy-check" aria-hidden="true">
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4.2 3.8 7 9 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/**
 * The buy section, the destination every page funnels to. The marble lightens
 * so it reads as the end of the road. Guarantee line sits directly above the
 * one primary button.
 */
export function Buy() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef, { stagger: 0.08 });

  const href = contactHref();
  const label = contactLabel();
  const priceSet = isSet(config.price);
  const items: string[] = [
    `${config.product.domainCount} domains`,
    ...(isSet(String(config.product.questionCount)) ? [`${config.product.questionCount} questions`] : []),
    ...config.product.features,
  ];

  return (
    <section id={SECTION_IDS.buy} ref={sectionRef} className="section buy-section">
      <div className="container relative">
        <SectionHeading
          num={BUY.num}
          label={BUY.label}
          align="center"
          title={
            <>
              Your <em>move</em>.
            </>
          }
          lede={BUY.lede}
        />

        <GlassCard padding="lg" className="buy-card mx-auto mt-14 max-w-[720px]" data-enter>
          <h3 className="font-display text-[clamp(32px,3.4vw,44px)] leading-[1.05] tracking-[-0.02em] text-cream" data-enter>
            {config.productName}
          </h3>

          <p className="label-mono label-mono--gold mt-8" data-enter>
            {BUY.insideLabel}
          </p>
          <ul className="buy-list mt-3" data-enter>
            {items.map((item) => (
              <li key={item}>
                <Check />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-end justify-between gap-4" data-enter>
            <span className="label-mono label-mono--gold">{BUY.priceLabel}</span>
            {priceSet ? <span className="buy-price">{config.price}</span> : <span className="text-[17px] text-cream-2">{BUY.priceUnset}</span>}
          </div>

          <div className="hairline mt-8" aria-hidden="true" />

          <p className="mt-7 text-[16px] leading-relaxed text-cream" data-enter>
            {config.guarantee ? (
              config.guarantee
            ) : (
              <>
                {BUY.guaranteeFallback}{" "}
                {href ? (
                  <a href={href} className="link-draw text-gold">
                    {label}.
                  </a>
                ) : (
                  <span className="text-gold">{label}.</span>
                )}
              </>
            )}
          </p>

          <div className="mt-6" data-enter>
            <PrimaryButton size="lg" shimmer className="w-full sm:w-auto" />
            {!checkoutConnected() ? <p className="label-mono mt-4 text-cream-2/70 normal-case tracking-[0.06em]">{BUY.checkoutUnset}</p> : null}
          </div>

          <p className="body-2 mt-7" data-enter>
            {BUY.secondary}{" "}
            {href ? (
              <a href={href} className="link-draw text-gold">
                {label}.
              </a>
            ) : (
              <span className="text-gold">{label}.</span>
            )}
          </p>
        </GlassCard>
      </div>
    </section>
  );
}
