"use client";
import { useRef } from "react";
import Link from "next/link";
import { config, contactHref, contactLabel } from "@/lib/config";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReveal } from "@/components/motion/useReveal";

export function PrivacyContent() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, { start: "top 95%" });
  const href = contactHref();
  const label = contactLabel();

  return (
    <section ref={ref} className="section">
      <div className="container">
        <SectionHeading
          num="00"
          label="Privacy"
          as="h2"
          title={
            <>
              Short, because there&rsquo;s <em>little</em> to say.
            </>
          }
        />
        <p className="label-mono label-mono--gold mt-6" data-enter>
          Last updated: October 2026
        </p>

        <div className="mt-12 flex max-w-[64ch] flex-col gap-6 text-[17px] leading-[1.7] text-cream-2" data-enter>
          <p>
            This site is a page about {config.productName} and a free daily puzzle. It collects no personal information on its own.
            There is no account to create, no sign-up form, and no newsletter.
          </p>
          <p>
            <strong className="font-semibold text-cream">No cookies or trackers.</strong> The site sets no cookies and runs no
            analytics or advertising scripts.
          </p>
          <p>
            <strong className="font-semibold text-cream">The daily puzzle runs in your browser.</strong> Your answer is never sent
            anywhere and nothing about it is stored, on this site or elsewhere.
          </p>
          <p>
            <strong className="font-semibold text-cream">Server logs.</strong> The site is hosted on Vercel. Like any web host, Vercel
            may keep standard server logs, such as your IP address, browser type and the time of your visit, for a short period to
            keep the service secure. Those logs are not used to identify you.
          </p>
          <p>
            <strong className="font-semibold text-cream">Buying the Study Set.</strong> Checkout happens on a separate payment page run
            by a third-party provider. What you enter there is covered by that provider&rsquo;s privacy policy, not this one.
          </p>
          <p>
            <strong className="font-semibold text-cream">Email.</strong> If you write to {config.ownerNickname}, your message and
            address are kept only as long as needed to reply. They are never sold or shared.
          </p>
          <p>
            <strong className="font-semibold text-cream">Questions.</strong>{" "}
            {href ? (
              <>
                <a href={href} className="link-draw text-gold">
                  {label}
                </a>{" "}
                and she will answer.
              </>
            ) : (
              <>The contact address will be in the footer of every page once it is live, and you can reach {config.ownerNickname} there.</>
            )}
          </p>
        </div>

        <p className="mt-14" data-enter>
          <Link href="/" className="link-draw text-gold">
            Back to the start
          </Link>
        </p>
      </div>
    </section>
  );
}
