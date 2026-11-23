import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import SiteLayout from "@/components/site/SiteLayout";
import { RadarFooter, RadarHeader, radarTitle } from "@/components/radar/views";
import "@/components/radar/radar.css";

export const metadata: Metadata = {
  title: { default: radarTitle, template: `%s · ${radarTitle}` },
  icons: { icon: "/identity/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function Layout({ children }: { children: ReactNode }) {
  return <SiteLayout locale="pt-BR" variant="radar"><div className="radar"><RadarHeader />{children}<RadarFooter /></div></SiteLayout>;
}
