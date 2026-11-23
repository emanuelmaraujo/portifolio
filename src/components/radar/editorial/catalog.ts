import { z } from "zod";
import type { RecordDraft } from "../content";
import { areaIds, kindIds, type Area, type Kind } from "../taxonomy";
import entries from "./notion-catalog.json";

const imported = z.object({
  title: z.string().min(1), url: z.string().startsWith("https://"),
  area: z.custom<Area>(value => areaIds.includes(value as Area)), kind: z.custom<Kind>(value => kindIds.includes(value as Kind)),
  topic: z.string().min(1), group: z.string().min(1), summary: z.string().optional(),
  tags: z.string().array(), publisher: z.string().optional(), licenseNote: z.string().optional(),
});

const topicDescriptions: Record<string, string> = {
  "Galerias e inspiração": "Galeria para pesquisar referências de composição, navegação e tipografia.",
  "Sites de referência": "Site ou exemplo para examinar padrões de interface e comportamento.",
  Templates: "Modelo de interface para estudar estrutura de páginas e componentes.",
  "Componentes UI": "Referência de elementos de interface, estados e interações.",
  "Design systems": "Referência para organizar componentes, variantes e padrões reutilizáveis.",
  Motion: "Material de referência para estudar transições, ritmo e animação.",
  "3D e WebGL": "Referência para estudar cenas, materiais e interações tridimensionais na web.",
  "Ferramentas criativas": "Ferramenta para explorar um fluxo de criação ou prototipagem.",
  "Formação em IA": "Material da trilha de formação em IA, com acesso pelo provedor do curso.",
  "Engenharia de software": "Recurso para consultar instruções e exemplos em fluxos de desenvolvimento.",
  "Documentação e mídia": "Material de referência para pesquisa, produção visual ou documentação.",
};

export function catalogIdentity(url: string) {
  const parsed = new URL(url);
  const path = parsed.pathname.replace(/\/$/, "");
  if (parsed.hostname === "github.com") return `${parsed.hostname}${path.replace(/\/(tree|blob)\//, "/tree/").replace(/\/SKILL\.md$/i, "")}`.toLowerCase();
  return `${parsed.hostname.replace(/^www\./, "")}${path}${parsed.search}`.toLowerCase();
}

function slugify(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 95).replace(/-$/, "");
}

export function buildCatalog(curated: RecordDraft[]): RecordDraft[] {
  const usedUrls = new Set(curated.flatMap(item => [item.creator.github, ...item.sources.map(source => source.url)].filter((url): url is string => Boolean(url)).map(catalogIdentity)));
  const usedSlugs = new Set(curated.map(item => item.slug));
  return imported.array().parse(entries).flatMap(item => {
    const key = catalogIdentity(item.url);
    if (usedUrls.has(key)) return [];
    usedUrls.add(key);
    const url = new URL(item.url);
    const owner = url.hostname === "github.com" ? url.pathname.split("/")[1] : undefined;
    const handle = owner && /^[\da-z-]+$/i.test(owner) ? owner : undefined;
    const base = slugify(item.title) || slugify(key);
    let slug = `acervo-${base}`;
    for (let i = 2; usedSlugs.has(slug); i++) slug = `acervo-${base}-${i}`;
    usedSlugs.add(slug);
    return [{
      slug, area: item.area, kind: item.kind, title: item.title,
      summary: item.summary ?? topicDescriptions[item.topic] ?? `Referência de ${item.topic.toLowerCase()} disponível na fonte indicada.`,
      creator: { name: item.publisher || handle || url.hostname.replace(/^www\./, ""), handle, github: handle ? `${url.origin}${url.pathname}` : undefined, remoteAvatar: Boolean(handle) },
      sources: [{ title: handle ? "Abrir no GitHub" : "Abrir a fonte", url: item.url }],
      tags: [...new Set([item.topic, ...item.tags])], sections: [], catalogOrigin: item.group,
      license: item.licenseNote,
    }];
  });
}
