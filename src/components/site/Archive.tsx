import { notFound } from "next/navigation";
import { copy, links } from "./content";
import { entries, entry, formatDate, type Collection } from "./entries";
import Mark from "./Mark";
import Reveals from "./Reveals";
import SeedList from "./SeedList";
import Sigil from "./Sigil";
import Stage from "./Stage";

const routes = { posts: "/blog", projetos_posts: "/projetos" } as const;
const words = (html: string) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const plain = (html: string) => html.replace(/<[^>]+>/g, "").trim();

function Header({ lang }: { lang: "en" | "pt" }) {
  const t = copy[lang === "en" ? "en" : "pt-BR"].writing;
  return (
    <header className="header header--archive">
      <a className="identity" href={lang === "en" ? "/" : "/pt"} aria-label={t.back}><Mark /><span>Emanuel Araújo</span></a>
      <nav aria-label={t.label}>
        <a href={routes.posts}>{t.articles}</a>
        <a href={routes.projetos_posts}>{t.projects}</a>
      </nav>
      <a className="language" href={lang === "en" ? "/" : "/pt"}>{t.back}</a>
    </header>
  );
}

/**
 * Index of a collection. Each language is a chapter of the particle field, and the field takes the figure of the text
 * the reader is pointing at.
 */
export function ArchiveIndex({ collection }: { collection: Collection }) {
  const articles = collection === "posts";
  return (
    <>
      <Stage />
      <Reveals />
      <div className="progress" aria-hidden="true" />
      <Header lang="pt" />
      <main id="main" className="archive-index">
        {(["pt", "en"] as const).map((lang, n) => {
          const t = copy[lang === "en" ? "en" : "pt-BR"].writing;
          const list = entries(collection, lang === "en" ? "en" : "pt-BR");
          return (
            <section className="chapter" data-form="sigil" data-seed={list[0]?.slug} data-side="1" data-dim="0.3" lang={lang === "en" ? "en" : "pt-BR"} aria-labelledby={"archive-" + lang} key={lang}>
              <div className="col">
                <p className="label"><span>{lang.toUpperCase()}</span>{articles ? t.articles : t.projects}</p>
                {n === 0 ? <h1 id={"archive-" + lang}>{articles ? t.title : t.projectsTitle}</h1> : <h2 id={"archive-" + lang}>{articles ? t.title : t.projectsTitle}</h2>}
                <p className="intro">{articles ? t.intro : t.projectsIntro}</p>
                <p className="note">{t.pick}</p>
                <SeedList seeds={list.map(item => item.slug)}>
                  {list.map(item => (
                    <li key={item.slug}>
                      <a href={`${routes[collection]}/${item.slug}`}>
                        <Sigil text={item.slug} />
                        <time dateTime={item.date}>{formatDate(item.date, lang)}</time>
                        <h3>{item.title}</h3>
                        {item.summary && <p>{item.summary}</p>}
                        <span aria-hidden="true">→</span>
                      </a>
                    </li>
                  ))}
                </SeedList>
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}

/**
 * One text. It is split at its second-level headings, and each part is a chapter of the field: the article's figure
 * rearranges itself as the reader moves from one part to the next.
 */
export async function ArchiveEntry({ collection, slug }: { collection: Collection; slug: string }) {
  const item = await entry(collection, slug);
  if (!item) notFound();
  const english = item.lang === "en", t = copy[english ? "en" : "pt-BR"].writing;
  // A text may start straight at a heading, in which case there is no opening.
  const pieces = item.html.trim().split(/(?=<h2>)/);
  const opening = pieces[0].startsWith("<h2>") ? "" : pieces.shift()!;
  const rest = pieces;
  const parts = rest.map(part => {
    const [, heading = "", body = ""] = part.match(/^<h2>([\s\S]*?)<\/h2>([\s\S]*)$/) ?? [];
    return { title: plain(heading), body };
  });
  const list = entries(collection, english ? "en" : "pt-BR");
  const next = list[(list.findIndex(other => other.slug === slug) + 1) % list.length];
  const number = (n: number) => String(n).padStart(2, "0");
  return (
    <>
      <Stage />
      <Reveals />
      <div className="progress" aria-hidden="true" />
      <Header lang={item.lang} />
      <main id="main" className="reading" lang={english ? "en" : "pt-BR"}>
        <article>
          <header className="chapter reading-hero" data-form="sigil" data-seed={slug} data-side="1" data-dim="0.35">
            <div className="col">
              <p className="label">
                <a href={routes[collection]}>← {collection === "posts" ? t.articles : t.projects}</a>
                <time dateTime={item.date}>{formatDate(item.date, item.lang)}</time>
                <span>{Math.max(1, Math.round(words(item.html) / 200))} {t.minutes}</span>
              </p>
              <h1>{item.title}</h1>
              {item.summary && <p className="intro">{item.summary}</p>}
              {item.tags && <ul className="chips">{item.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
              <p className="actions">
                {item.liveUrl && <a className="button button--accent" href={item.liveUrl} target="_blank" rel="noreferrer">{t.live}<span aria-hidden="true">↗</span></a>}
                {item.twin && <a className="link" href={`${routes[collection]}/${item.twin}`} hrefLang={english ? "pt-BR" : "en"}>{t.other}<span aria-hidden="true">→</span></a>}
              </p>
              {parts.length > 1 && (
                <nav className="contents" aria-label={t.contents}>
                  <p className="mini">{t.contents}</p>
                  <ol>{parts.map((part, i) => <li key={part.title}><a href={"#part-" + (i + 1)}><span>{number(i + 1)}</span>{part.title}</a></li>)}</ol>
                </nav>
              )}
            </div>
          </header>

          {/* The HTML comes from Markdown files in this repository, rendered at build time. */}
          {plain(opening) && (
            <section className="part part--opening" data-form="sigil" data-seed={slug} data-side="1" data-dim="0.14" data-glow="0.7">
              <div className="prose" dangerouslySetInnerHTML={{ __html: opening }} />
            </section>
          )}
          {parts.map((part, i) => (
            <section className={i === 0 && !plain(opening) ? "part part--first" : "part"} id={"part-" + (i + 1)} data-form="sigil" data-seed={`${slug}#${i + 1}`} data-side="1" data-dim="0.14" data-glow="0.7" aria-labelledby={"part-title-" + (i + 1)} key={part.title}>
              <p className="part-number" aria-hidden="true">{number(i + 1)}<span>/ {number(parts.length)}</span></p>
              <h2 id={"part-title-" + (i + 1)}>{part.title}</h2>
              <div className="prose" dangerouslySetInnerHTML={{ __html: part.body }} />
            </section>
          ))}

          <footer className="chapter reading-end" data-form="sigil" data-seed={next.slug} data-side="1" data-dim="0.4">
            <div className="col">
              {next.slug !== slug && (
                <a className="next" href={`${routes[collection]}/${next.slug}`}>
                  <span className="label"><span>{t.next}</span>{formatDate(next.date, item.lang)}</span>
                  <strong>{next.title}</strong>
                  <i aria-hidden="true">→</i>
                </a>
              )}
              <p className="actions">
                <span>{t.talk}</span>
                <a className="button" href={links.email}>{t.talkAction}</a>
                <a className="link" href={routes[collection]}>← {collection === "posts" ? t.articles : t.projects}</a>
              </p>
            </div>
          </footer>
        </article>
      </main>
    </>
  );
}
