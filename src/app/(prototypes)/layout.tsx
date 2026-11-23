import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

/** Local prototypes for comparing creative directions. Never indexed, and not linked from the public site. */
export const metadata: Metadata = {
  title: { default: "Protótipos · Emanuel Araújo", template: "%s · Protótipo" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
