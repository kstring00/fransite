import type { Metadata } from "next";
import Link from "next/link";
import { NOT_FOUND } from "@/lib/content";
import { QueenMark } from "@/components/brand/QueenMark";
import { GoldDust } from "@/components/ui/GoldDust";
import "@/components/sections/lower-sections.css";

export const metadata: Metadata = {
  title: "Off the board",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] items-center overflow-hidden px-[var(--gutter)] pt-[var(--nav-h)]">
      <GoldDust density={0.8} className="opacity-80" />
      <div className="notfound-queen" aria-hidden="true">
        <QueenMark size={560} />
      </div>
      <div className="container relative text-center">
        <span className="section-label">
          <span className="section-label__num">{NOT_FOUND.label}</span>
          <span className="label-mono">Not found</span>
        </span>
        <h1 className="h-display mt-7">
          Off the <em>board</em>.
        </h1>
        <p className="lede mx-auto mt-6">{NOT_FOUND.body}</p>
        <p className="mt-10">
          <Link href="/" className="link-draw text-[16px] font-medium text-gold">
            {NOT_FOUND.link}
          </Link>
        </p>
      </div>
    </main>
  );
}
