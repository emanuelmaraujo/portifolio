import { siteUrl } from "@/components/site/content";
import { news } from "@/components/radar/content";
import { entryPath } from "@/components/radar/taxonomy";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function GET() {
  const base = escapeXml(`${siteUrl}/radar`);
  const items = news.map(item => {
    const url = escapeXml(siteUrl + entryPath(item.slug));
    return `<item><title>${escapeXml(item.title)}</title><link>${url}</link><guid>${url}</guid><description>${escapeXml(item.summary)}</description><pubDate>${new Date(item.eventDate!).toUTCString()}</pubDate></item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Radar do Emanuel</title><link>${base}</link><description>Novidades de IA, cibersegurança e design &amp; desenvolvimento.</description><language>pt-br</language><atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>${items.join("")}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
