import { belongsToKind, records } from "./content";
import type { SearchItem } from "./search";
import { repositorySignal } from "./editorial/repository-signals";
import { recordSubareas } from "./subareas";

export const searchIndex: SearchItem[] = records.map(item => ({
  slug: item.slug, title: item.title, summary: item.summary, tags: item.tags, area: item.area, kind: item.kind, creator: item.creator, eventDate: item.eventDate, catalogOrigin: item.catalogOrigin, source: item.sources[0].url, openSource: belongsToKind(item, "projetos") || undefined,
  repository: repositorySignal(item.creator.github, item.sources),
  subareas: recordSubareas(item.area, item.tags, item.title),
}));
