import type { Metadata, Viewport } from "next";
import { fontClassNames } from "@/lib/fonts";
import { config, siteOrigin } from "@/lib/config";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ScrollProgress } from "@/components/nav/ScrollProgress";
import { Header } from "@/components/nav/Header";
import "./globals.css";

const title = `${config.brandName}, BCBA Exam Prep`;
const description = `Study content from a BCBA who passed the 6th edition exam. Nine domains, timed sets paced like the real test, a rating that tells you when you are ready, and a free daily puzzle.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: title,
    template: `%s, ${config.brandName}`,
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: config.brandName,
    title,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B0A0A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClassNames}>
      <body>
        <div id="__site">
          <SmoothScroll />
          <ScrollProgress />
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
