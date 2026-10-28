import type { ReactNode } from "react";

type Props = {
  num: string;
  label: string;
  /** The heading. Put one word in <em> for the italic gold emphasis. */
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  /** Optional element shown beside the label, e.g. the 6th edition badge. */
  aside?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
  id?: string;
};

/**
 * Standard section opener: oxblood numbered chip, mono label, Fraunces
 * heading with one italic word, optional lede. Children get data-enter so the
 * section's reveal choreography picks them up.
 */
export function SectionHeading({ num, label, title, lede, align = "left", aside, as: Tag = "h2", className = "", id }: Props) {
  const center = align === "center";
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-[760px] ${className}`}>
      <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${center ? "justify-center" : ""}`} data-enter>
        <span className="section-label">
          <span className="section-label__num">{num}</span>
          <span className="label-mono">{label}</span>
        </span>
        {aside}
      </div>
      <Tag id={id} className="h-section mt-6" data-enter>
        {title}
      </Tag>
      {lede ? (
        <p className={`lede mt-6 ${center ? "mx-auto" : ""}`} data-enter>
          {lede}
        </p>
      ) : null}
    </div>
  );
}
