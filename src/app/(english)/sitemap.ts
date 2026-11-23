import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/site/content";
import { entries, type Collection } from "@/components/site/entries";
import { records } from "@/components/radar/content";
import { areaIds, entryPath } from "@/components/radar/taxonomy";
import { subareas } from "@/components/radar/subareas";

export const dynamic = "force-static";

const routes: [Collection, string][] = [["posts", "/blog"], ["projetos_posts", "/projetos"]];

export default function sitemap(): MetadataRoute.Sitemap {
  const home = { en: siteUrl + "/", "pt-BR": siteUrl + "/pt" };
  const pages: MetadataRoute.Sitemap = Object.values(home).map(url => ({ url, alternates: { languages: home } }));
  for (const [collection, route] of routes) {
    const list = entries(collection);
    pages.push({ url: siteUrl + route, lastModified: list[0]?.updated ?? list[0]?.date });
    for (const item of list) {
      const url = `${siteUrl}${route}/${item.slug}`, self = item.lang === "en" ? "en" : "pt-BR", other = item.lang === "en" ? "pt-BR" : "en";
      const languages = item.twin ? { [self]: url, [other]: `${siteUrl}${route}/${item.twin}` } : undefined;
      pages.push({ url, lastModified: item.updated ?? item.date, ...(languages ? { alternates: { languages } } : {}) });
    }
  }
  const radarSections = new Set(["/radar", "/radar/acervo", "/radar/novidades", "/radar/em-alta", "/radar/laboratorios", "/radar/projetos", ...areaIds.flatMap(area => [`/radar/${area}`, ...subareas[area].map(group => `/radar/${area}/${group.id}`)]), ...records.map(item => `/radar/${item.area}/${item.kind}`)]);
  pages.push(...[...radarSections].map(path => ({ url: siteUrl + path })));
  pages.push(...records.map(item => ({ url: siteUrl + entryPath(item.slug), lastModified: item.catalogOrigin ? undefined : item.reviewedAt })));
  return pages;
}
