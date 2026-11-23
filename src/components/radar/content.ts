import { z } from "zod";
import { areaIds, kindIds, type Area, type Kind } from "./taxonomy";
import { ai } from "./editorial/ia";
import { security } from "./editorial/security";
import { design } from "./editorial/design";
import { updates } from "./editorial/updates";
import { ecosystems } from "./editorial/ecosystems";
import { discoveries } from "./editorial/discoveries";
import { freshUpdates } from "./editorial/fresh-updates";
import { buildCatalog, catalogIdentity } from "./editorial/catalog";
import { handbook } from "./editorial/handbook";
import { toolboxes } from "./editorial/toolboxes";
import { nightshift, verifiedSecuritySkills } from "./editorial/spotlights";
import { repositorySignal } from "./editorial/repository-signals";
import { communityProjects } from "./editorial/community-projects";
import { expansionSecurity } from "./editorial/expansion-security";
import { expansionDesign } from "./editorial/expansion-design";
import { expansionAI } from "./editorial/expansion-ai";
import { editorialNews } from "./editorial/editorial-news";
import { foundations } from "./editorial/foundations";

const secureUrl = z.string().url().refine(url => new URL(url).protocol === "https:");
const github = z.string().regex(/^https:\/\/github\.com\/[a-z\d][\w.-]*(?:\/[\w./%()@+-]+)?$/i);
const line = z.string().trim().min(1);
const date = z.string().date();
const schema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  area: z.custom<Area>(value => areaIds.includes(value as Area)),
  kind: z.custom<Kind>(value => kindIds.includes(value as Kind)),
  title: line,
  summary: line,
  creator: z.object({ name: line, handle: z.string().regex(/^[\da-z-]+$/i).optional(), github: github.optional(), remoteAvatar: z.boolean().optional() }),
  sources: z.array(z.object({ title: line, url: secureUrl })).min(1),
  tags: z.array(line).min(1),
  sections: z.array(z.object({ title: line, body: line })),
  catalogOrigin: line.optional(),
  level: z.enum(["Inicial", "Intermediário", "Avançado"]).default("Inicial"),
  license: line.optional(),
  demo: z.enum(["rag", "skills", "mcp", "triagem", "interface"]).optional(),
  eventDate: date.optional(),
  reviewedAt: date.default("2026-11-23"),
  featured: z.boolean().optional(),
  weeklyStars: z.number().int().positive().optional(),
}).superRefine((item, context) => {
  if (item.kind === "novidades" && !item.eventDate) context.addIssue({ code: "custom", path: ["eventDate"], message: "Novidades exigem a data da fonte." });
  if ((item.kind === "laboratorios") !== Boolean(item.demo)) context.addIssue({ code: "custom", path: ["demo"], message: "Vincule uma demo à ficha de laboratório." });
  if (!item.catalogOrigin && item.sections.length < 2) context.addIssue({ code: "custom", path: ["sections"], message: "Fichas editoriais exigem duas seções." });
});

export type RecordDraft = z.input<typeof schema>;
export type RadarRecord = z.output<typeof schema>;

const curated = [...nightshift, ...editorialNews, ...freshUpdates, ...updates, ...ai, ...security, ...design, ...ecosystems, ...discoveries];
const expansion = [...expansionSecurity, ...expansionDesign, ...expansionAI, ...foundations].map(item => ({
  ...item,
  creator: item.creator.handle ? { ...item.creator, remoteAvatar: true } : item.creator,
}));
const additions = [...handbook, ...toolboxes, ...verifiedSecuritySkills, ...communityProjects.map(item => ({ ...item, tags: [...item.tags, "Comunidades técnicas"] })), ...expansion];
const additionsByRepository = new Map(additions.flatMap(item => item.kind !== "novidades" && item.creator.github ? [[catalogIdentity(item.creator.github), item.slug] as const] : []));
for (const item of expansion) {
  if (item.kind === "novidades") continue;
  const identity = catalogIdentity(item.sources[0].url);
  if (!additionsByRepository.has(identity)) additionsByRepository.set(identity, item.slug);
}
const catalog = buildCatalog(curated);
export const promotedCatalog = new Map(catalog.flatMap(item => {
  const destination = additionsByRepository.get(catalogIdentity(item.sources[0].url));
  return destination ? [[item.slug, destination] as const] : [];
}));

export const records = schema.array().superRefine((items, context) => {
  const slugs = new Set<string>();
  for (const [index, item] of items.entries()) {
    if (slugs.has(item.slug)) context.addIssue({ code: "custom", path: [index, "slug"], message: `Slug duplicado: ${item.slug}` });
    slugs.add(item.slug);
  }
}).parse([...curated, ...additions, ...catalog.filter(item => !promotedCatalog.has(item.slug))]);

export const news = records.filter(item => item.eventDate).sort((a, b) => b.eventDate!.localeCompare(a.eventDate!));
export const labs = records.filter(item => item.kind === "laboratorios");
export const library = records.filter(item => item.kind !== "novidades");
export const rising = library.filter(item => item.weeklyStars).sort((a, b) => b.weeklyStars! - a.weeklyStars!);
export const communitySelection = library.filter(item => item.tags.includes("Comunidades técnicas"));

const preferredSkills: Record<Area, string[]> = {
  ia: ["last30days-skill", "hf-avaliar-modelos", "hf-escolher-modelo-local", "hf-examinar-datasets", "anthropic-mcp-builder", "anthropic-skill-creator"],
  ciberseguranca: ["security-best-practices", "dependabot-skill", "secret-scanning-skill", "security-ownership-map", "security-threat-model"],
  "design-desenvolvimento": ["modern-web-guidance", "stitch-skills", "impeccable", "vercel-react-best-practices", "lottiefiles-motion-design", "frontend-design-skill"],
};

export function selectedSkills(area: Area) {
  return preferredSkills[area].map(slug => {
    const item = records.find(entry => entry.slug === slug && entry.area === area && entry.kind === "skills");
    if (!item) throw new Error(`Skill editorial ausente: ${area}/${slug}`);
    return item;
  }).concat(records.filter(item => item.area === area && item.kind === "skills" && !item.catalogOrigin && !preferredSkills[area].includes(item.slug)))
    .sort((a, b) => (repositorySignal(b.creator.github, b.sources)?.weekly?.count ?? b.weeklyStars ?? 0) - (repositorySignal(a.creator.github, a.sources)?.weekly?.count ?? a.weeklyStars ?? 0));
}

export function skillHighlights(area: Area) {
  return selectedSkills(area).map(item => ({ slug: item.slug, title: item.title, summary: item.summary, creator: item.creator, weeklyStars: item.weeklyStars, signal: repositorySignal(item.creator.github, item.sources) }));
}

export function belongsToKind(item: RadarRecord, kind: Kind) {
  if (item.kind === kind) return true;
  return kind === "projetos" && item.kind === "repositorios" && /^(?:MIT|Apache-2\.0|BSD-[23]-Clause|MPL-2\.0|(?:A?GPL|LGPL)-[23]\.0)(?:-only|-or-later)?\.?$/i.test(item.license?.trim() ?? "");
}

export function relatedTo(record: RadarRecord) {
  return records.filter(item => item.slug !== record.slug && item.area === record.area)
    .map(item => ({ item, score: item.tags.filter(tag => record.tags.includes(tag)).length * 2 + Number(item.kind === record.kind) }))
    .sort((a, b) => b.score - a.score).slice(0, 3).map(({ item }) => item);
}
