
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Providers from "@/components/Providers";
import "./globals.css";
import "./archive.css";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Emanuel Araújo | Especialista em Infraestrutura & Segurança",
  description: "Portfólio profissional de Emanuel Araújo — Especialista em Infraestrutura de TI, Segurança da Informação, Governança e Automação. Mais de 4 anos protegendo ambientes tecnológicos no setor financeiro.",
  icons: { icon: "/aperture/favicon.svg" },
  keywords: ["segurança da informação", "infraestrutura de TI", "governança de TI", "automação", "compliance", "portfólio", "Emanuel Araújo"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`archive-document scroll-smooth ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <ScrollProgress />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
