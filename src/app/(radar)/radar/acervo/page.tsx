import { RadarDirectory, radarMetadata } from "@/components/radar/views";
import type { CatalogParams } from "@/components/radar/search";

export const metadata = radarMetadata("Acervo de conhecimento", "Skills, repositórios, ferramentas e referências organizados por área e assunto.", "/radar/acervo");

export default async function Page({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  return <RadarDirectory params={await searchParams} />;
}
