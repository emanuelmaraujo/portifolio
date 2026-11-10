import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { copy, type Locale } from "./content";
import SceneStage from "./SceneStage";

export const sceneLabels = {
  en: { pause: "Pause motion", play: "Resume motion", left: "Rotate left", right: "Rotate right" },
  "pt-BR": { pause: "Pausar movimento", play: "Retomar movimento", left: "Girar à esquerda", right: "Girar à direita" },
};

export default function Hero({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const en = locale === "en";
  return <section className="hero aperture-hero" aria-labelledby="hero-title">
    <div className="hero-grid wrap">
      <div className="aperture-copy">
        <p className="mono hero-kicker"><i /> {en ? "INDEPENDENT ENGINEERING PORTFOLIO" : "PORTFÓLIO DE ENGENHARIA"}</p>
        <h1 id="hero-title"><span><span>Emanuel</span></span><span><span>Araújo<span className="hero-period">.</span></span></span></h1>
        <p className="hero-statement">{en ? "Building intelligent systems at the intersection of AI, cybersecurity and engineering." : "Construo sistemas inteligentes na interseção entre IA, cibersegurança e engenharia."}</p>
        <div className="hero-actions">
          <a className="button primary" href="#work">{t.workAction}<ArrowDownRight size={18} aria-hidden="true" /></a>
          <a className="button secondary" href="#contact">{t.contactAction}<ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
      </div>
      <figure className="aperture-figure">
        <SceneStage kind="core" poster="/aperture/core-poster.svg" labels={sceneLabels[locale]} />
        <figcaption className="mono aperture-caption">
          <span><b>01 / APERTURE</b><small>{en ? "INTELLIGENCE / TRUST / SYSTEMS" : "INTELIGÊNCIA / CONFIANÇA / SISTEMAS"}</small></span>
          <span aria-hidden="true">[ EA — 3D ]</span>
        </figcaption>
      </figure>
    </div>
    <div className="hero-index mono wrap"><span>{en ? "BRASÍLIA / BRAZIL" : "BRASÍLIA / BRASIL"}</span><a href="#work">{en ? "SCROLL TO EXPLORE" : "ROLE PARA EXPLORAR"} ↓</a></div>
  </section>;
}
