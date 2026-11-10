import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/portfolio/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: siteUrl + "/", "pt-BR": siteUrl + "/pt" };
  return Object.values(languages).map(url => ({ url, alternates: { languages } }));
}
