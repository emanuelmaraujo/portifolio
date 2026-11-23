import { Search } from "lucide-react";
import { Breadcrumb, radarMetadata } from "@/components/radar/views";
import { searchIndex } from "@/components/radar/search-index";
import { SearchExplorer } from "@/components/radar/widgets";
import { catalogFilters, type CatalogParams } from "@/components/radar/search";

export const metadata = { ...radarMetadata("Biblioteca", "Encontre fichas por assunto, área ou tipo de conteúdo.", "/radar/busca"), robots: { index: false, follow: true } };

export default async function Page({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  const initial = catalogFilters(await searchParams, { q: "", area: "", tipo: "" });
  return <main className="r-wrap r-inner" id="main"><Breadcrumb /><header className="r-page-hero r-search-hero"><span className="r-area-icon"><Search size={26} aria-hidden /></span><h1>Biblioteca técnica</h1><p>Encontre skills, projetos, cursos e referências. Combine área, tipo e assunto para refinar.</p></header><SearchExplorer items={searchIndex} initial={initial} key={JSON.stringify(initial)} /></main>;
}
