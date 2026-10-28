import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  flat?: boolean;
  padding?: "sm" | "md" | "lg";
};

/** Liquid-glass surface. */
export function GlassCard({ flat = false, padding = "md", className = "", children, ...rest }: Props) {
  const pad = padding === "sm" ? "p-5" : padding === "lg" ? "p-8 md:p-10" : "p-6 md:p-8";
  return (
    <div className={`glass ${flat ? "glass--flat" : ""} ${pad} ${className}`} {...rest}>
      {children}
    </div>
  );
}
