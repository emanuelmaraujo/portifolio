"use client";

import Link from "next/link";
import { useLanguage } from "../hooks/useLanguage";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
  const { lang, t } = useLanguage();
  const home = lang === "pt" ? "/pt" : "/";
  return <header className="archive-header">
    <div className="archive-header-inner">
      <a href={home} className="archive-brand" aria-label="Emanuel Araújo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/aperture/mark.svg" width={42} height={35} alt="" />
        <span>Emanuel Araújo</span>
      </a>
      <nav aria-label={lang === "pt" ? "Navegação do acervo" : "Archive navigation"}>
        <a href={home + "#work"}>{lang === "pt" ? "Portfólio" : "Portfolio"}</a>
        <Link href="/blog">{t("nav.blog")}</Link>
        <Link href="/projetos">{t("nav.projects")}</Link>
      </nav>
      <LanguageToggle />
    </div>
  </header>;
}
