import type { Metadata } from "next";
import { copy, siteUrl, type Locale } from "./content";

export function portfolioMetadata(locale: Locale): Metadata {
  const english = locale === "en";
  const url = english ? `${siteUrl}/` : `${siteUrl}/pt`;
  const title = english ? "Emanuel Araújo | AI Engineering & Cybersecurity" : "Emanuel Araújo | Engenharia de IA e Cibersegurança";
  const { description } = copy[locale];
  const image = { url: `${siteUrl}/aperture/social.png`, width: 1200, height: 630, alt: "Emanuel Araújo — EA" };
  return {
    title, description,
    icons: { icon: `${siteUrl}/aperture/favicon.svg`, apple: `${siteUrl}/aperture/avatar.png` },
    alternates: { canonical: url, languages: { en: `${siteUrl}/`, "pt-BR": `${siteUrl}/pt`, "x-default": `${siteUrl}/` } },
    openGraph: { title, description, url, locale: english ? "en_US" : "pt_BR", alternateLocale: english ? "pt_BR" : "en_US", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
