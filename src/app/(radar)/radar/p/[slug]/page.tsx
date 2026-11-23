import { notFound, permanentRedirect } from "next/navigation";
import { promotedCatalog, records } from "@/components/radar/content";
import { entryPath } from "@/components/radar/taxonomy";
import { RadarEntry, radarMetadata } from "@/components/radar/views";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return [...records.map(({ slug }) => slug), ...promotedCatalog.keys()].map(slug => ({ slug }));
}

async function resolve(params: Params) {
  const { slug } = await params;
  const destination = promotedCatalog.get(slug);
  if (destination) permanentRedirect(entryPath(destination));
  const record = records.find(item => item.slug === slug);
  if (!record) notFound();
  return record;
}

export async function generateMetadata({ params }: { params: Params }) {
  const item = await resolve(params);
  return radarMetadata(item.title, item.summary, entryPath(item.slug));
}

export default async function Page({ params }: { params: Params }) {
  return <RadarEntry item={await resolve(params)} />;
}
