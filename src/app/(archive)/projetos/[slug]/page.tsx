import type { Metadata } from "next";
import { ArchiveEntry, entryMetadata } from "@/components/site/Archive";
import { slugs } from "@/components/site/entries";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => slugs("projetos_posts").map(slug => ({ slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return entryMetadata("projetos_posts", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <ArchiveEntry collection="projetos_posts" slug={(await params).slug} />;
}
