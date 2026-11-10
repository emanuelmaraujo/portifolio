import type { ReactNode } from "react";
import PortfolioLayout from "@/components/portfolio/PortfolioLayout";
import { portfolioMetadata } from "@/components/portfolio/metadata";

export const metadata = portfolioMetadata("pt-BR");

export default function Layout({ children }: { children: ReactNode }) {
  return <PortfolioLayout locale="pt-BR">{children}</PortfolioLayout>;
}
