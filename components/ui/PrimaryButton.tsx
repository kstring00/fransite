import type { AnchorHTMLAttributes } from "react";
import { PRIMARY_CTA, checkoutHref, checkoutConnected } from "@/lib/config";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: "md" | "lg";
  shimmer?: boolean;
  /** Where to send people. Defaults to the checkout URL, or the buy section until it is set. */
  href?: string;
};

/**
 * The one primary button. Used for "Get the Study Set" only: nav, hero settle, buy section.
 */
export function PrimaryButton({ size = "md", shimmer = false, href, className = "", children, ...rest }: Props) {
  const target = href ?? checkoutHref();
  const external = checkoutConnected() && target === checkoutHref() && /^https?:/.test(target);
  return (
    <a
      href={target}
      className={["btn-primary", size === "lg" ? "btn-primary--lg" : "", shimmer ? "btn-primary--shimmer" : "", className].join(" ").trim()}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children ?? PRIMARY_CTA}
    </a>
  );
}
