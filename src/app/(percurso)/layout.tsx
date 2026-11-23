import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { copy, siteUrl } from "@/components/site/content";
import "@/components/prototypes/percurso/percurso.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["italic"], variable: "--font-serif", display: "swap" });

/** The front door of the domain: the scrolled take over the drafting table. The earlier site lives on at /portifolio. */
const { title, description } = copy["pt-BR"].meta;
const image = { url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Emanuel Araújo" };
export const metadata: Metadata = {
  title, description,
  icons: { icon: `${siteUrl}/identity/favicon.svg`, apple: `${siteUrl}/apple-icon.png` },
  alternates: { canonical: `${siteUrl}/`, languages: { "pt-BR": `${siteUrl}/`, en: `${siteUrl}/en`, "x-default": `${siteUrl}/` } },
  openGraph: { title, description, url: `${siteUrl}/`, locale: "pt_BR", alternateLocale: "en_US", type: "website", images: [image] },
  twitter: { card: "summary_large_image", title, description, images: [image] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#08090b" };

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR" className={`${sans.variable} ${mono.variable} ${serif.variable}`}><body>{children}</body></html>;
}
