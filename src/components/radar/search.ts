import { areaIds, areas, kinds, type Area, type Kind } from "./taxonomy";

import type { repositorySignal } from "./editorial/repository-signals";

export type SearchItem = { slug: string; title: string; summary: string; tags: string[]; area: Area; kind: Kind; creator: { name: string; handle?: string; github?: string; remoteAvatar?: boolean }; source: string; eventDate?: string; catalogOrigin?: string; openSource?: boolean; repository?: ReturnType<typeof repositorySignal>; subareas: string[] };
export type Filters = { q: string; area: string; tipo: string; tema?: string; colecao?: string; ordenar?: string; subarea?: string; uso?: string };
export type CatalogUse = { id: string; label: string; tip: string; slugs: string[] };
export type CatalogParams = Record<string, string | string[] | undefined>;

export function catalogFilters(params: CatalogParams, defaults: Filters): Filters {
  const first = (name: string) => {
    const value = params[name];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  return {
    ...defaults,
    q: first("q").slice(0, 160),
    area: defaults.area || (Object.hasOwn(areas, first("area")) ? first("area") : ""),
    tipo: defaults.tipo || (Object.hasOwn(kinds, first("tipo")) ? first("tipo") : ""),
    tema: first("tema").slice(0, 100),
    colecao: first("colecao").slice(0, 100),
    ordenar: ["estrelas", "crescimento"].includes(first("ordenar")) ? first("ordenar") : "",
    subarea: defaults.subarea || first("subarea").slice(0, 50),
    uso: first("uso").slice(0, 80),
  };
}

const aliases: Record<string, string> = {
  ai: "ia", cybersecurity: "ciberseguranca", sec: "ciberseguranca", security: "ciberseguranca", seguranca: "ciberseguranca",
  ux: "design", ui: "interface", skills: "skill", repos: "repositorio", repositorios: "repositorio", models: "modelo",
  dev: "desenvolvimento", aprendizado: "aprendizagem", distro: "linux", distros: "linux", conteiner: "container", conteineres: "containers",
};
const connectors = new Set(["a", "as", "o", "os", "e", "de", "do", "da", "dos", "das", "em", "para", "como"]);

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function filterRecords(items: SearchItem[], filters: Filters) {
  const phrase = normalize(filters.q.slice(0, 160)).replace(/\b(?:open source|codigo aberto)\b/g, "projeto");
  const wordsInQuery = phrase.split(/\s+/).filter(Boolean);
  const meaningful = wordsInQuery.filter(term => !connectors.has(term));
  const terms = [...new Set((meaningful.length ? meaningful : wordsInQuery).map(term => aliases[term] ?? term))];
  const matches = items.flatMap(item => {
    if ((filters.area && item.area !== filters.area) || (filters.tipo && item.kind !== filters.tipo && !(filters.tipo === "projetos" && item.openSource)) || (filters.tema && !item.tags.includes(filters.tema)) || (filters.colecao && item.catalogOrigin !== filters.colecao) || (filters.subarea && !item.subareas.includes(filters.subarea))) return [];
    if (terms.length === 0) return [{ item, score: 0 }];
    const title = normalize(item.title);
    const tags = normalize(item.tags.join(" "));
    const context = normalize(`${areas[item.area].name} ${areas[item.area].short} ${kinds[item.kind].name} ${kinds[item.kind].singular} ${item.openSource ? "projeto open source" : ""} ${item.summary} ${item.creator.name}`);
    const words = [title, tags, context].map(text => text.split(" "));
    const scores = terms.map(term => {
      const matches = (set: string[]) => term.length < 3 ? set.includes(term) : set.some(word => word.startsWith(term));
      if (matches(words[0])) return 8;
      if (matches(words[1])) return 5;
      return matches(words[2]) ? 2 : 0;
    });
    return scores.includes(0) ? [] : [{ item, score: scores.reduce<number>((sum, score) => sum + score, 0) + (title.includes(phrase) ? 14 : 0) }];
  }).sort((a, b) => {
    if (filters.ordenar === "crescimento") {
      const difference = (b.item.repository?.weekly?.count ?? -1) - (a.item.repository?.weekly?.count ?? -1);
      if (difference) return difference;
    }
    if (filters.ordenar === "estrelas") {
      const difference = (b.item.repository?.total ?? -1) - (a.item.repository?.total ?? -1);
      if (difference) return difference;
    }
    return b.score - a.score || (filters.tipo === "novidades" ? (b.item.eventDate ?? "").localeCompare(a.item.eventDate ?? "") : 0);
  }).map(result => result.item);
  if (terms.length || filters.area || filters.ordenar || filters.tipo === "novidades") return matches;
  const byArea = areaIds.map(area => matches.filter(item => item.area === area));
  return Array.from({ length: Math.max(...byArea.map(group => group.length)) }, (_, index) =>
    byArea.flatMap(group => group[index] ? [group[index]] : [])
  ).flat();
}

export function searchHref(filters: Partial<Filters> = {}, path = "/radar/busca") {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.area) params.set("area", filters.area);
  if (filters.tipo) params.set("tipo", filters.tipo);
  if (filters.tema) params.set("tema", filters.tema);
  if (filters.colecao) params.set("colecao", filters.colecao);
  if (filters.ordenar) params.set("ordenar", filters.ordenar);
  if (filters.subarea) params.set("subarea", filters.subarea);
  if (filters.uso) params.set("uso", filters.uso);
  return `${path}${params.size ? `?${params}` : ""}`;
}
