import Link from "next/link";
import { ArrowUpRight, Github, Globe2, Linkedin, Mail } from "lucide-react";
import { copy, links, type Locale } from "./content";
import ProjectExhibits from "./ProjectExhibits";
import Hero, { sceneLabels } from "./Hero";
import ChapterBridge from "./ChapterBridge";
import ChapterMotion from "./ChapterMotion";
import ProfessionalRecord from "./ProfessionalRecord";
import SceneStage from "./SceneStage";
import TechnicalAreas from "./TechnicalAreas";
import Workflow from "./Workflow";

const sections = ["work", "workflow", "about", "contact"];
const navigation = [2, 0, 1, 3];

export default function Portfolio({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const english = locale === "en";
  return <>
    <a href="#main" className="skip">{t.skip}</a>
    <header className="masthead" id="top">
      <div className="wrap masthead-inner">
        <a href="#top" className="wordmark" aria-label={`Emanuel Araújo — ${t.home}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aperture/mark.svg" alt="" width={42} height={35} />
          <span>Emanuel Araújo</span>
        </a>
        <nav aria-label={english ? "Main navigation" : "Navegação principal"}>
          {navigation.map(index => <a href={`#${sections[index]}`} key={index}>{t.nav[index]}</a>)}
        </nav>
        <div className="language mono">
          <Globe2 size={14} aria-hidden="true" />
          <Link href="/" prefetch={false} hrefLang="en" lang="en" aria-label="EN – English" aria-current={english ? "page" : undefined}>EN</Link>
          <Link href="/pt" prefetch={false} hrefLang="pt-BR" lang="pt-BR" aria-label="PT – Português do Brasil" aria-current={!english ? "page" : undefined}>PT</Link>
        </div>
      </div>
    </header>
    <main id="main" tabIndex={-1}>
      <ChapterMotion />
      <Hero locale={locale} />
      <ChapterBridge index={1} title={t.nav[2]} />
      <section className="wrap section" id="about" aria-labelledby="about-title">
        <div className="section-heading">
          <p className="eyebrow mono">{t.aboutLabel}</p>
          <h2 id="about-title">{t.aboutTitle}</h2>
          <p>{t.aboutIntro}</p>
        </div>
        <TechnicalAreas locale={locale} />
        <ProfessionalRecord locale={locale} />
        <div className="about-foot">
          <div id="certifications"><h3>{t.credentials}</h3><ul>{t.credentialItems.map(item => <li key={item}>{item}</li>)}<li><a href="https://www.credly.com/badges/a692655c-e6e6-4f24-90cf-905ea99793b9/public_url">Fortinet Certified Fundamentals in Cybersecurity ↗</a></li><li><a href="https://www.credly.com/badges/e4039c04-39c5-47dd-a1fb-47d77e7961ec/public_url">Cisco Networking Academy · Endpoint Security ↗</a></li></ul></div>
          <div><h3>{t.archive}</h3><ul>{["/blog", "/projetos"].map((path, i) => <li key={path}><a href={path}>{t.archiveLinks[i]} ↗</a></li>)}</ul></div>
        </div>
      </section>
      <ChapterBridge index={2} title={t.nav[0]} />
      <div className="work-band">
        <section className="wrap section" id="work" aria-labelledby="work-title">
          <div className="section-heading">
            <p className="eyebrow mono">{t.workLabel}</p>
            <h2 id="work-title">{t.workTitle}</h2>
            <p>{t.workIntro}</p>
          </div>
          <ProjectExhibits locale={locale} />
          <div className="workshop" id="techlab">
            <h3>{t.lab}</h3>
            <ul>{t.experiments.map(([name, status, detail]) => <li key={name}>
              <div><span className="mono">{status}</span><strong>{name === "Cezar" ? <a href="https://github.com/emanuelmaraujo/cezar">Cezar ↗</a> : name}</strong></div>
              <p>{detail}</p>
            </li>)}</ul>
          </div>
        </section>
      </div>
      <ChapterBridge index={3} title={t.nav[1]} />
      <div className="workflow-band">
        <section className="wrap section workflow-layout" id="workflow" aria-labelledby="workflow-title">
          <div className="section-heading">
            <p className="eyebrow mono">{t.workflowLabel}</p>
            <h2 id="workflow-title">{t.workflowTitle}</h2>
            <p>{t.workflowIntro}</p>
            <a className="text-link" href={links.skills}>{t.skillsAction}<ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
          <Workflow steps={t.steps} output={t.output} label={t.workflowTitle} />
        </section>
      </div>
      <section className="wrap scene-lab hero" aria-labelledby="scene-lab-title">
        <div><p className="mono eyebrow">WEBGL / APERTURE</p><h3 id="scene-lab-title">{english ? "Interactive lab" : "Laboratório interativo"}</h3><p>{english ? "An interactive study in procedural geometry. The core assembles as you approach, then responds to your pointer and scroll." : "Estudo interativo de geometria procedural. O núcleo se monta à medida que você se aproxima e responde ao cursor e à rolagem."}</p></div>
        <SceneStage kind="core" poster="/aperture/core-poster.svg" labels={sceneLabels[locale]} />
      </section>
      <ChapterBridge index={4} title={t.nav[3]} />
      <div className="contact-band">
        <section className="wrap section" id="contact" aria-labelledby="contact-title">
          <div className="section-heading">
            <p className="eyebrow mono">{t.contactLabel}</p>
            <h2 id="contact-title">{t.contactTitle}</h2>
            <p>{t.contactIntro}</p>
          </div>
          <div className="hero-actions">
            <a className="button primary" href={links.email}><Mail size={17} aria-hidden="true" />Email</a>
            <a className="button secondary" href={links.linkedin}><Linkedin size={17} aria-hidden="true" />LinkedIn</a>
            <a className="button secondary" href={links.github}><Github size={17} aria-hidden="true" />GitHub</a>
          </div>
        </section>
      </div>
    </main>
    <footer className="wrap footer mono">
      <span>Emanuel Araújo <i /> {t.footer}</span>
      <a href="#top">{t.top}<ArrowUpRight size={14} aria-hidden="true" /></a>
    </footer>
  </>;
}
