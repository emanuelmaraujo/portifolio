import type { ReactNode } from "react";
import type { Metadata } from "next";
import SiteLayout from "@/components/site/SiteLayout";
import { siteUrl } from "@/components/site/content";

export const metadata: Metadata = {
  title: { default: "Artigos e notas · Emanuel Araújo", template: "%s · Emanuel Araújo" },
  description: "Artigos sobre segurança da informação e notas de projetos de infraestrutura, por Emanuel Araújo.",
  icons: { icon: `${siteUrl}/identity/favicon.svg`, apple: `${siteUrl}/apple-icon.png` },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <SiteLayout locale="pt-BR">{children}</SiteLayout>;
}
