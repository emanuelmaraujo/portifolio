import type { Metadata } from "next";
import { ArchiveEntry } from "@/components/site/Archive";
import { entry, slugs } from "@/components/site/entries";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => slugs("projetos_posts").map(slug => ({ slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await entry("projetos_posts", (await params).slug);
  return item ? { title: item.title, description: item.summary } : {};
}

export default async function Page({ params }: Props) {
  return <ArchiveEntry collection="projetos_posts" slug={(await params).slug} />;
}
