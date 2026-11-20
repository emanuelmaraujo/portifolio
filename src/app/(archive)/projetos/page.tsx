import type { Metadata } from "next";
import { ArchiveIndex } from "@/components/site/Archive";
import { siteUrl } from "@/components/site/content";

export const metadata: Metadata = {
  title: "Notas de projeto",
  description: "Notas de projetos de infraestrutura e produto, com as decisões por trás deles.",
  alternates: { canonical: `${siteUrl}/projetos` },
};

export default function Page() {
  return <ArchiveIndex collection="projetos_posts" />;
}
