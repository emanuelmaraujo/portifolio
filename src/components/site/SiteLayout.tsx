import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { copy, siteUrl, type Locale } from "./content";
import "./site.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["italic"], variable: "--font-serif", display: "swap" });

export function siteMetadata(locale: Locale): Metadata {
  const english = locale === "en";
  const url = english ? `${siteUrl}/` : `${siteUrl}/pt`;
  const { title, description } = copy[locale].meta;
  const image = { url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Emanuel Araújo" };
  return {
    title, description,
    icons: { icon: `${siteUrl}/identity/favicon.svg`, apple: `${siteUrl}/apple-icon.png` },
    alternates: { canonical: url, languages: { en: `${siteUrl}/`, "pt-BR": `${siteUrl}/pt`, "x-default": `${siteUrl}/` } },
    openGraph: { title, description, url, locale: english ? "en_US" : "pt_BR", alternateLocale: english ? "pt_BR" : "en_US", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function SiteLayout({ children, locale }: { children: ReactNode; locale: Locale }) {
  return (
    <html lang={locale} suppressHydrationWarning className={`site ${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body>
        {/* Marks the document as scripted before first paint, so reveal states never flash for no-JS readers. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
      </body>
    </html>
  );
}
