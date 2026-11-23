import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { copy, siteUrl } from "@/components/site/content";
import "@/components/prototypes/percurso/percurso.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["italic"], variable: "--font-serif", display: "swap" });

/** The scrolled take over the drafting table, in English. The Portuguese one is the front door of the domain. */
const { title, description } = copy.en.meta;
const image = { url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Emanuel Araújo" };
export const metadata: Metadata = {
  title, description,
  icons: { icon: `${siteUrl}/identity/favicon.svg`, apple: `${siteUrl}/apple-icon.png` },
  alternates: { canonical: `${siteUrl}/en`, languages: { "pt-BR": `${siteUrl}/`, en: `${siteUrl}/en`, "x-default": `${siteUrl}/` } },
  openGraph: { title, description, url: `${siteUrl}/en`, locale: "en_US", alternateLocale: "pt_BR", type: "website", images: [image] },
  twitter: { card: "summary_large_image", title, description, images: [image] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#08090b" };

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}><body>{children}</body></html>;
}
