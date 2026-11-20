import type { Metadata } from "next";
import { ArchiveEntry, entryMetadata } from "@/components/site/Archive";
import { slugs } from "@/components/site/entries";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => slugs("posts").map(slug => ({ slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return entryMetadata("posts", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <ArchiveEntry collection="posts" slug={(await params).slug} />;
}
