import Link from "next/link";
import { ArrowUpRight, Github, Globe2, Linkedin, Mail } from "lucide-react";
import { copy, links, type Locale } from "./content";
import ProjectExhibits from "./ProjectExhibits";
import Hero from "./Hero";
import Workflow from "./Workflow";

const sections = ["work", "workflow", "about", "contact"];

export default function Portfolio({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const english = locale === "en";
  return <>
    <a href="#main" className="skip">{t.skip}</a>
    <header className="masthead" id="top">
      <div className="wrap masthead-inner">
        <a href="#top" className="wordmark" aria-label={`Emanuel Araújo — ${t.home}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aperture/mark-animated.svg" alt="" width={42} height={35} />
          <span>Emanuel Araújo</span>
        </a>
        <nav aria-label={english ? "Main navigation" : "Navegação principal"}>
          {sections.map((id, index) => <a href={`#${id}`} key={id}>{t.nav[index]}</a>)}
        </nav>
        <div className="language mono">
          <Globe2 size={14} aria-hidden="true" />
          <Link href="/" prefetch={false} hrefLang="en" lang="en" aria-label="EN – English" aria-current={english ? "page" : undefined}>EN</Link>
          <Link href="/pt" prefetch={false} hrefLang="pt-BR" lang="pt-BR" aria-label="PT – Português do Brasil" aria-current={!english ? "page" : undefined}>PT</Link>
        </div>
      </div>
    </header>
    <main id="main" tabIndex={-1}>
      <Hero locale={locale} />
      <div className="pillars"><ul className="wrap mono">
        {t.pillars.map(pillar => <li key={pillar}>{pillar}</li>)}
      </ul></div>
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
      <section className="wrap section" id="about" aria-labelledby="about-title">
        <div className="section-heading">
          <p className="eyebrow mono">{t.aboutLabel}</p>
          <h2 id="about-title">{t.aboutTitle}</h2>
          <p id="experience">{t.aboutIntro}</p>
        </div>
        <div className="practice" id="expertise">
          {t.practice.map(([title, detail], index) => <article key={title} id={["security", "infrastructure", undefined, "management"][index]}>
            <span aria-hidden="true">+</span><h3>{title}</h3><p>{detail}</p>
          </article>)}
        </div>
        <div className="about-foot">
          <div id="certifications"><h3>{t.credentials}</h3><ul>{t.credentialItems.map(item => <li key={item}>{item}</li>)}<li><a href="https://www.credly.com/badges/a692655c-e6e6-4f24-90cf-905ea99793b9/public_url">Fortinet Certified Fundamentals in Cybersecurity ↗</a></li><li><a href="https://www.credly.com/badges/e4039c04-39c5-47dd-a1fb-47d77e7961ec/public_url">Cisco Networking Academy · Endpoint Security ↗</a></li></ul></div>
          <div><h3>{t.archive}</h3><ul>{["/blog", "/projetos"].map((path, i) => <li key={path}><a href={path}>{t.archiveLinks[i]} ↗</a></li>)}</ul></div>
        </div>
      </section>
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
