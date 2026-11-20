import type { Metadata } from "next";
import { ArchiveIndex } from "@/components/site/Archive";
import { siteUrl } from "@/components/site/content";

export const metadata: Metadata = {
  title: "Artigos",
  description: "Artigos sobre segurança da informação, gestão de riscos e engenharia, por Emanuel Araújo.",
  alternates: { canonical: `${siteUrl}/blog` },
};

export default function Page() {
  return <ArchiveIndex collection="posts" />;
}
