import { notFound } from "next/navigation";
import { belongsToKind, records } from "@/components/radar/content";
import { areaIds, areas, kindIds, kinds } from "@/components/radar/taxonomy";
import { RadarCollection, radarMetadata } from "@/components/radar/views";
import { subareas } from "@/components/radar/subareas";
import type { CatalogParams } from "@/components/radar/search";

type Params = Promise<{ section: string; type: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return areaIds.flatMap(section => [
    ...kindIds.filter(type => records.some(item => item.area === section && belongsToKind(item, type))),
    ...subareas[section].map(group => group.id),
  ].map(type => ({ section, type })));
}

async function resolve(params: Params) {
  const { section, type } = await params;
  const area = areaIds.find(value => value === section);
  if (!area) notFound();
  const group = subareas[area].find(value => value.id === type);
  if (group) return { area, group, title: group.title, description: group.description, type };
  const kind = kindIds.find(value => value === type);
  if (!kind || !records.some(item => item.area === area && belongsToKind(item, kind))) notFound();
  return { area, kind, title: kinds[kind].name, description: `Explore ${kinds[kind].name.toLowerCase()} em ${areas[area].name}.`, type };
}

export async function generateMetadata({ params }: { params: Params }) {
  const { area, title, description, type } = await resolve(params);
  return radarMetadata(`${title} · ${areas[area].name}`, description, `/radar/${area}/${type}`);
}

export default async function Page({ params, searchParams }: { params: Params; searchParams: Promise<CatalogParams> }) {
  const { area, kind, group } = await resolve(params);
  return <RadarCollection area={area} kind={kind} group={group} params={await searchParams} />;
}
