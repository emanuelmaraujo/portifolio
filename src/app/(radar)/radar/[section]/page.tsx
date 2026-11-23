import { notFound } from "next/navigation";
import { areaIds, areas, kinds } from "@/components/radar/taxonomy";
import { RadarCollection, radarMetadata } from "@/components/radar/views";

import type { CatalogParams } from "@/components/radar/search";

const shared = ["novidades", "laboratorios", "projetos"] as const;
type Params = Promise<{ section: string }>;

export function generateStaticParams() {
  return [...areaIds, ...shared].map(section => ({ section }));
}

function resolve(section: string) {
  const area = areaIds.find(value => value === section);
  if (area) return { area, title: areas[area].name, description: areas[area].description };
  const kind = shared.find(value => value === section);
  if (kind) return { kind, title: kinds[kind].name, description: { novidades: "Lançamentos e mudanças nas três áreas, com fontes oficiais.", laboratorios: "Experimentos guiados de IA, cibersegurança e design & desenvolvimento.", projetos: "Projetos com licenças abertas, documentação oficial e descobertas de comunidades técnicas." }[kind] };
  notFound();
}

export async function generateMetadata({ params }: { params: Params }) {
  const { section } = await params;
  const { title, description } = resolve(section);
  return radarMetadata(title, description, `/radar/${section}`);
}

export default async function Page({ params, searchParams }: { params: Params; searchParams: Promise<CatalogParams> }) {
  const route = resolve((await params).section);
  return <RadarCollection area={route.area} kind={route.kind} params={await searchParams} />;
}
