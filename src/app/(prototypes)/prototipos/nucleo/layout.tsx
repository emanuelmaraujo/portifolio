import type { ReactNode } from "react";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "@/components/prototypes/nucleo/nucleo.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["italic"], variable: "--font-serif", display: "swap" });

export default function Layout({ children }: { children: ReactNode }) {
  return <div className={`${sans.variable} ${mono.variable} ${serif.variable}`}>{children}</div>;
}
