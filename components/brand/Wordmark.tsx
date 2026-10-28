import { config } from "@/lib/config";

type Props = {
  /** "full" = Everything Behavior with Chess. "short" = Chess. */
  variant?: "full" | "short";
  className?: string;
  size?: "nav" | "hero" | "footer";
};

/**
 * The wordmark. "with" is set in Pinyon Script and gold; the rest in Fraunces.
 */
export function Wordmark({ variant = "full", className = "", size = "nav" }: Props) {
  const base =
    size === "hero"
      ? "text-[clamp(30px,4vw,54px)] leading-none"
      : size === "footer"
        ? "text-[22px] leading-none"
        : "text-[19px] leading-none";
  const script =
    size === "hero"
      ? "text-[1.55em] mx-[0.12em] translate-y-[0.12em]"
      : "text-[1.5em] mx-[0.1em] translate-y-[0.1em]";

  if (variant === "short") {
    return (
      <span className={`font-display whitespace-nowrap text-cream ${base} ${className}`} style={{ fontVariationSettings: '"opsz" 72, "SOFT" 30' }}>
        {config.brandShort}
      </span>
    );
  }
  return (
    <span className={`font-display inline-flex items-baseline whitespace-nowrap text-cream ${base} ${className}`} style={{ fontVariationSettings: '"opsz" 72, "SOFT" 30' }}>
      <span>Everything Behavior</span>
      <span className={`font-script inline-block text-gold ${script}`} aria-hidden="true">
        with
      </span>
      <span className="sr-only"> with </span>
      <span>{config.brandShort}</span>
    </span>
  );
}
