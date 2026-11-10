import Image from "next/image";
import { ArrowDown, ArrowUpRight, Github, Linkedin } from "lucide-react";
import { copy, links, type Locale } from "./content";

export const sceneLabels = {
  en: { pause: "Pause motion", play: "Resume motion", left: "Rotate left", right: "Rotate right" },
  "pt-BR": { pause: "Pausar movimento", play: "Retomar movimento", left: "Girar à esquerda", right: "Girar à direita" },
};

export default function Hero({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const en = locale === "en";
  return <section className="hero aperture-hero portrait-hero" aria-labelledby="hero-title">
    <div className="wrap portrait-content">
      <div className="portrait-frame">
        <Image src="/minha_imagem_de_apresentacao.png" width={168} height={168} priority alt={en ? "Portrait of Emanuel Araújo" : "Retrato de Emanuel Araújo"} />
      </div>
      <h1 id="hero-title">Emanuel Araújo</h1>
      <p className="mono portrait-role">{en ? "IT Infrastructure & Information Security" : "Infraestrutura de TI e Segurança da Informação"}</p>
      <p className="portrait-tagline">{en ? "I protect infrastructure, strengthen defenses and automate processes." : "Protejo infraestruturas, fortaleço defesas e automatizo processos."}</p>
      <p className="portrait-summary">{en ? "I coordinate technology in the financial cooperative sector and build products that bring AI and software engineering into real operations." : "Coordeno tecnologia no cooperativismo financeiro e construo produtos que levam IA e engenharia de software para operações reais."}</p>
      <ul className="portrait-focus mono">{t.pillars.map(pillar => <li key={pillar}>{pillar}</li>)}</ul>
      <div className="hero-actions">
        <a className="button primary" href="#work">{t.workAction}<ArrowDown size={16} aria-hidden="true" /></a>
        <a className="button secondary" href={links.github}><Github size={16} aria-hidden="true" />GitHub</a>
        <a className="button secondary" href={links.linkedin}><Linkedin size={16} aria-hidden="true" />LinkedIn<ArrowUpRight size={14} aria-hidden="true" /></a>
      </div>
    </div>
  </section>;
}
