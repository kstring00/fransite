import { Fraunces, Pinyon_Script, Manrope, IBM_Plex_Mono } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

/** Italic is only used for the one emphasis word per heading, so it is not preloaded. */
export const frauncesItalic = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces-italic",
  preload: false,
});

export const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-pinyon",
  preload: false,
});

export const manrope = Manrope({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-manrope",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-plex-mono",
  preload: false,
});

export const fontClassNames = [fraunces.variable, frauncesItalic.variable, pinyon.variable, manrope.variable, plexMono.variable].join(" ");
