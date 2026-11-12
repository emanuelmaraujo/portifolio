import { copy, links, type Locale } from "./content";
import Capabilities from "./Capabilities";
import Credentials from "./Credentials";
import Finale from "./Finale";
import Sigil from "./Sigil";
import Mark from "./Mark";
import Orchestration from "./Orchestration";
import Reveals from "./Reveals";
import Stage from "./Stage";
import Trajectory from "./Trajectory";
import Work from "./Work";
import { entries, formatDate } from "./entries";

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Site({ locale }: { locale: Locale }) {
  const t = copy[locale];
  let word = 0;
  const posts = entries("posts", locale).slice(0, 3);
  return (
    <>
      <a className="skip" href="#main">{t.skip}</a>
      <div className="loader" role="status" aria-live="polite">
        <Mark animated />
        <p>Emanuel Araújo</p>
        <span className="loader-bar" />
        <small>{t.loading}</small>
      </div>
      <Stage />
      <Reveals />
      <div className="progress" aria-hidden="true" />

      <header className="header">
        <a className="identity" href="#top" aria-label="Emanuel Araújo">
          <Mark animated /><span>Emanuel Araújo</span>
        </a>
        <nav aria-label={locale === "en" ? "Sections" : "Seções"}>
          {t.nav.map(([id, name]) => <a href={"#" + id} key={id}>{name}</a>)}
        </nav>
        <a className="language" href={t.switchHref} hrefLang={locale === "en" ? "pt-BR" : "en"} lang={locale === "en" ? "pt-BR" : "en"}>{t.switchLabel}</a>
      </header>

      <main id="main">
        <section id="top" className="chapter hero" data-form="mark" data-side="1.2" data-dim="0.35" data-lift="1.0">
          <div className="col">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1 aria-label={t.hero.title.map(([text]) => text).join("")}>
              {t.hero.title.map(([text, strong], i) => text.split(/(\s+)/).map((part, j) => part.trim()
                ? <span className={strong ? "word word--strong" : "word"} style={{ "--i": word++ } as React.CSSProperties} aria-hidden="true" key={i + "-" + j}><span>{part}</span></span>
                : part))}
            </h1>
            <p className="lead">{t.hero.lead}</p>
            <p className="actions">
              <a className="button button--accent" href="#work">{t.hero.primary}</a>
              <a className="button" href="#orchestration">{t.hero.secondary}</a>
            </p>
          </div>
          <ul className="facets" aria-label={locale === "en" ? "Areas of practice" : "Áreas de atuação"}>
            {t.hero.facets.map((facet, i) => <li style={{ "--i": i } as React.CSSProperties} key={facet}>{facet}</li>)}
          </ul>
          <p className="hint" aria-hidden="true">{t.hero.hint}</p>
        </section>

        <Trajectory t={t.trajectory} />
        <Capabilities t={t.capabilities} />
        <Orchestration t={t.orchestration} />
        <Work t={t.work} />

        <section className="chapter more" data-form="horizon" data-side="0" data-dim="0.16" data-glow="0.4" data-lift="0" aria-labelledby="lab-title">
          <div className="wide">
            <h2 id="lab-title" className="mini" data-reveal>{t.work.labTitle}</h2>
            <div className="lab">
              {t.work.lab.map(item => {
                const body = <><p className="kind">{item.status}</p><h3>{item.name}{item.href && <Arrow />}</h3><p>{item.text}</p></>;
                return item.href
                  ? <a className="lab-item" href={item.href} target="_blank" rel="noreferrer" data-reveal key={item.name}>{body}</a>
                  : <article className="lab-item" data-reveal key={item.name}>{body}</article>;
              })}
            </div>
          </div>

          <div className="wide writing" id="writing">
            <div>
              <p className="label" data-reveal><span>05</span>{t.writing.label}</p>
              <h2 data-reveal>{t.writing.title}</h2>
              <p className="intro" data-reveal>{t.writing.intro}</p>
              <p className="actions" data-reveal>
                <a className="button" href={links.blog}>{t.writing.all}<span aria-hidden="true">→</span></a>
                <a className="link" href={links.notes}>{t.writing.notes}<span aria-hidden="true">→</span></a>
              </p>
            </div>
            <ol className="posts">
              {posts.map(post => (
                <li data-reveal key={post.slug}>
                  <a href={"/blog/" + post.slug}>
                    <Sigil text={post.slug} />
                    <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
                    <h3>{post.title}</h3>
                    <span aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>

        </section>

        <Credentials t={t.credentials} />

        <section id="contact" className="chapter contact" data-form="mark" data-side="1.1" data-dim="0.3" data-lift="0.95" aria-labelledby="contact-title">
          <Finale />
          <div className="wide">
            <figure className="portrait" data-reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/identity/portrait.jpg" alt="Emanuel Araújo" width="880" height="1100" loading="lazy" />
              <figcaption><b>Emanuel Araújo</b>{t.contact.role}<span>{t.contact.place}</span></figcaption>
            </figure>
            <p className="label" data-reveal><span>07</span>{t.contact.label}</p>
            <h2 id="contact-title" data-reveal>{t.contact.title}</h2>
            <p className="intro" data-reveal>{t.contact.text}</p>
            <p className="actions" data-reveal>
              <a className="button button--accent" href={links.email}>{t.contact.email}</a>
              <a className="button" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<Arrow /></a>
              <a className="button" href={links.github} target="_blank" rel="noreferrer">GitHub<Arrow /></a>
            </p>
          </div>
          <div className="marquee" aria-hidden="true">
            <div>{[0, 1].map(n => <span key={n}>{t.contact.words.map(word => <i key={word}>{word}</i>)}</span>)}</div>
          </div>
          <footer className="footer">
            <span className="identity"><Mark />Emanuel Araújo</span>
            <span>{t.contact.footer}</span>
            <a href="#top">{t.contact.top} ↑</a>
          </footer>
        </section>
      </main>
    </>
  );
}
