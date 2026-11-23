import type { ReactNode } from "react";
import { Atkinson_Hyperlegible_Next, Geist_Mono, Instrument_Serif } from "next/font/google";
import "@/components/prototypes/museu/museu.css";

const text = Atkinson_Hyperlegible_Next({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-text", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });

export default function Layout({ children }: { children: ReactNode }) {
  return <div className={`${text.variable} ${mono.variable} ${serif.variable}`}>{children}</div>;
}
