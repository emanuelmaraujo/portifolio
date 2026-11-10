import { ArrowDownRight, ArrowUpRight, Github, Globe2, Linkedin, Mail } from "lucide-react";
import { copy, links, siteUrl, type Locale } from "./content";
import ProjectArt from "./ProjectArt";
import Signal from "./Signal";
import Workflow from "./Workflow";

const basePath = new URL(siteUrl).pathname;
const sections = ["work", "workflow", "about", "contact"];

export default function Portfolio({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const english = locale === "en";
  return <>
    <a href="#main" className="skip">{t.skip}</a>
    <header className="masthead" id="top">
      <div className="wrap masthead-inner">
        <a href="#top" className="wordmark" aria-label={`Emanuel Araújo — ${t.home}`}>
          <svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true">
            <path d="M10 34V14h11M10 24h9m-9 10h10m3 0 8-20 8 20m-13-7h10" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" />
            <circle cx="31" cy="14" r="2.3" fill="currentColor" />
          </svg>
          <span>Emanuel Araújo</span>
        </a>
        <nav aria-label={english ? "Main navigation" : "Navegação principal"}>
          {sections.map((id, index) => <a href={`#${id}`} key={id}>{t.nav[index]}</a>)}
        </nav>
        <div className="language mono">
          <Globe2 size={14} aria-hidden="true" />
          <a href={basePath + "/"} hrefLang="en" lang="en" aria-label="EN – English" aria-current={english ? "page" : undefined}>EN</a>
          <a href={basePath + "/pt"} hrefLang="pt-BR" lang="pt-BR" aria-label="PT – Português do Brasil" aria-current={!english ? "page" : undefined}>PT</a>
        </div>
      </div>
    </header>
    <main id="main" tabIndex={-1}>
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow mono"><i />{t.role}</p>
          <h1 id="hero-title">{t.hero[0]}<br /><em>{t.hero[1]}</em></h1>
          <p className="hero-intro">{t.intro}</p>
          <div className="hero-actions">
            <a className="button primary" href="#work">{t.workAction}<ArrowDownRight size={17} aria-hidden="true" /></a>
            <a className="button secondary" href="#contact">{t.contactAction}<ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
        </div>
        <Signal title={t.sceneTitle} description={t.sceneDescription} meta={t.sceneMeta} />
      </section>
      <div className="pillars"><ul className="wrap mono">
        {t.pillars.map(pillar => <li key={pillar}>{pillar}</li>)}
      </ul></div>
      <section className="wrap section" id="work" aria-labelledby="work-title">
        <div className="section-heading">
          <p className="eyebrow mono">{t.workLabel}</p>
          <h2 id="work-title">{t.workTitle}</h2>
          <p>{t.workIntro}</p>
        </div>
        <div className="project-grid">
          {t.projects.map((project, index) => <article className="project" key={project.name}>
            <ProjectArt index={index} />
            <div className="project-body">
              <p className="project-status mono"><i />{project.status}</p>
              <h3>{project.name}</h3>
              <p className="project-type">{project.type}</p>
              <p>{project.summary}</p>
              <ul className="tags mono">{project.stack.map(tool => <li key={tool}>{tool}</li>)}</ul>
              <details>
                <summary>{t.detail}<span aria-hidden="true" /></summary>
                <dl>{[project.challenge, project.approach, project.evidence].map((item, i) =>
                  <div key={item}><dt>{t.caseLabels[i]}</dt><dd>{item}</dd></div>)}</dl>
                {project.url && <a className="text-link" href={project.url}>{t.visit}<ArrowUpRight size={15} aria-hidden="true" /></a>}
              </details>
            </div>
          </article>)}
        </div>
        <div className="workshop">
          <h3>{t.lab}</h3>
          <ul>{t.experiments.map(([name, status, detail]) => <li key={name}>
            <div><span className="mono">{status}</span><strong>{name === "Cezar" ? <a href="https://github.com/emanuelmaraujo/cezar">Cezar ↗</a> : name}</strong></div>
            <p>{detail}</p>
          </li>)}</ul>
        </div>
      </section>
      <div className="workflow-band">
        <section className="wrap section workflow-layout" id="workflow" aria-labelledby="workflow-title">
          <div className="section-heading">
            <p className="eyebrow mono">{t.workflowLabel}</p>
            <h2 id="workflow-title">{t.workflowTitle}</h2>
            <p>{t.workflowIntro}</p>
            <a className="text-link" href={links.skills}>{t.skillsAction}<ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
          <Workflow steps={t.steps} output={t.output} />
        </section>
      </div>
      <section className="wrap section" id="about" aria-labelledby="about-title">
        <div className="section-heading">
          <p className="eyebrow mono">{t.aboutLabel}</p>
          <h2 id="about-title">{t.aboutTitle}</h2>
          <p>{t.aboutIntro}</p>
        </div>
        <div className="practice">
          {t.practice.map(([title, detail]) => <article key={title}>
            <span aria-hidden="true">+</span><h3>{title}</h3><p>{detail}</p>
          </article>)}
        </div>
        <div className="about-foot">
          <div><h3>{t.credentials}</h3><ul>{t.credentialItems.map(item => <li key={item}>{item}</li>)}</ul></div>
          <div><h3>{t.archive}</h3><ul>{["/blog", "/projetos"].map((path, i) => <li key={path}><a href={basePath + path}>{t.archiveLinks[i]} ↗</a></li>)}</ul></div>
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
