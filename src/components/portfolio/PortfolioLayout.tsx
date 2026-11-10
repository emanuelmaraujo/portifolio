import type { ReactNode } from "react";
import type { Locale } from "./content";
import "./portfolio.css";

export default function PortfolioLayout({ children, locale }: { children: ReactNode; locale: Locale }) {
  return <html lang={locale} className="signal-document"><body>{children}</body></html>;
}
