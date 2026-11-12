import type { ReactNode } from "react";
import SiteLayout, { siteMetadata } from "@/components/site/SiteLayout";

export const metadata = siteMetadata("pt-BR");

export default function Layout({ children }: { children: ReactNode }) {
  return <SiteLayout locale="pt-BR">{children}</SiteLayout>;
}
