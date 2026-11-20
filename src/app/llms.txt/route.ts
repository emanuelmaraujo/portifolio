import { links, siteUrl } from "@/components/site/content";
import { topics } from "@/components/site/ask/knowledge";
import { entries, type Collection } from "@/components/site/entries";

/** A plain-text summary of the site for language models and agents, generated from the same content as the pages. */
export const dynamic = "force-static";

const listing = (collection: Collection, route: string) => entries(collection, "en")
  .map(item => `- [${item.title}](${siteUrl}${route}/${item.slug})${item.summary ? ": " + item.summary : ""}`).join("\n");

export function GET() {
  const sections = [
    "# Emanuel Araújo",
    "> IT coordinator in the financial cooperative sector and builder of AI-driven products, based in Brasília, Brazil. This file summarises his portfolio site.",
    `Site: ${siteUrl}/ (English), ${siteUrl}/pt (Portuguese). GitHub: ${links.github}. LinkedIn: ${links.linkedin}.`,
    ...topics("en").filter(topic => topic.id !== "contact").map(topic => `## ${topic.title}\n${topic.text}`),
    `## Articles\n${listing("posts", "/blog")}`,
    `## Project notes\n${listing("projetos_posts", "/projetos")}`,
  ];
  return new Response(sections.join("\n\n") + "\n", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
