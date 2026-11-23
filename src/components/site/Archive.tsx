import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { copy, links, siteUrl } from "./content";
import { entries, entry, formatDate, related, type Collection, type Entry } from "./entries";
import { render, sections } from "./article/render";
import ReadingNav from "./article/ReadingNav";
import { Spotlight } from "./Controls";
import Mark from "./Mark";
import Reveals from "./Reveals";
import SeedList from "./SeedList";
import Sigil from "./Sigil";
import Stage from "./Stage";

export const routes = { posts: "/blog", projetos_posts: "/projetos" } as const;
const urlOf = (collection: Collection, slug: string) => `${siteUrl}${routes[collection]}/${slug}`;
const number = (n: number) => String(n).padStart(2, "0");

/** Canonical URL, language alternates and social cards for one text. */
export function entryMetadata(collection: Collection, slug: string): Metadata {
  const item = entry(collection, slug);
  if (!item) return {};
  const url = urlOf(collection, slug), title = item.seo.title ?? item.title, description = item.seo.description ?? item.summary;
  const self = item.lang === "en" ? "en" : "pt-BR", other = item.lang === "en" ? "pt-BR" : "en";
  const languages: Record<string, string> = { [self]: url };
  if (item.twin) languages[other] = urlOf(collection, item.twin);
  languages["x-default"] = item.lang === "en" && item.twin ? urlOf(collection, item.twin) : url;
  const image = { url: `${siteUrl}/og.png`, width: 1200, height: 630, alt: "Emanuel Araújo" };
  return {
    title, description, authors: [{ name: item.author, url: siteUrl }], keywords: item.tags,
    alternates: { canonical: url, languages },
    openGraph: { type: "article", title, description, url, locale: item.lang === "en" ? "en_US" : "pt_BR", publishedTime: item.date, modifiedTime: item.updated ?? item.date, authors: [item.author], tags: item.tags, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function structuredData(collection: Collection, item: Entry) {
  return {
    "@context": "https://schema.org", "@type": collection === "posts" ? "BlogPosting" : "TechArticle",
    headline: item.title, description: item.summary, inLanguage: item.lang === "en" ? "en" : "pt-BR",
    datePublished: item.date, dateModified: item.updated ?? item.date, keywords: item.tags.join(", ") || undefined, articleSection: item.category,
    mainEntityOfPage: urlOf(collection, item.slug), url: urlOf(collection, item.slug), image: `${siteUrl}/og.png`,
    author: { "@type": "Person", name: item.author, url: siteUrl }, publisher: { "@type": "Person", name: "Emanuel Araújo", url: siteUrl },
    citation: item.references.length ? item.references.map(reference => reference.url) : undefined,
  };
}

function Header({ lang, reading = false }: { lang: "en" | "pt"; reading?: boolean }) {
  const t = copy[lang === "en" ? "en" : "pt-BR"].writing;
  return (
    <header className={"header header--archive" + (reading ? " header--reading" : "")}>
      <a className="identity" href={lang === "en" ? "/portifolio" : "/portifolio/pt"} aria-label={t.back}><Mark /><span>Emanuel Araújo</span></a>
      <nav aria-label={t.label}>
        <a href={routes.posts}>{t.articles}</a>
        <a href={routes.projetos_posts}>{t.projects}</a>
        <Link href="/radar" hrefLang="pt-BR">Radar{lang === "en" && <abbr className="lang-tag" title="in Portuguese">PT</abbr>}</Link>
      </nav>
      <a className="language" href={lang === "en" ? "/portifolio" : "/portifolio/pt"}>{t.back}</a>
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
      <Spotlight />
      <div className="progress" aria-hidden="true" />
      <Header lang="pt" />
      <main id="main" className="archive-index">
        {(["pt", "en"] as const).map((lang, n) => {
          const t = copy[lang === "en" ? "en" : "pt-BR"].writing;
          const list = entries(collection, lang === "en" ? "en" : "pt-BR");
          const categories = [...new Set(list.map(item => item.category).filter((c): c is string => Boolean(c)))];
          return (
            <section className="chapter" data-form="sigil" data-seed={list[0]?.figure} data-side="1" data-dim="0.3" lang={lang === "en" ? "en" : "pt-BR"} aria-labelledby={"archive-" + lang} key={lang}>
              <div className="col">
                <p className="label"><span>{lang.toUpperCase()}</span>{articles ? t.articles : t.projects}</p>
                {n === 0 ? <h1 id={"archive-" + lang}>{articles ? t.title : t.projectsTitle}</h1> : <h2 id={"archive-" + lang}>{articles ? t.title : t.projectsTitle}</h2>}
                <p className="intro">{articles ? t.intro : t.projectsIntro}</p>
                <p className="note">{t.pick}</p>
                <SeedList seeds={list.map(item => item.figure)} filter={{ label: t.filter, all: t.everything, options: categories }}>
                  {list.map(item => (
                    <li data-category={item.category} key={item.slug}>
                      <a href={`${routes[collection]}/${item.slug}`}>
                        <Sigil text={item.figure} />
                        <small className="posts-meta">
                          <time dateTime={item.date}>{formatDate(item.date, lang)}</time>
                          {item.category && <i>{item.category}</i>}
                          <i>{item.minutes} {t.minutes}</i>
                          {item.format === "mdx" && <b>{t.interactive}</b>}
                        </small>
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
  const item = entry(collection, slug);
  if (!item) notFound();
  const english = item.lang === "en", t = copy[english ? "en" : "pt-BR"].writing;
  // A text may start straight at a heading, in which case there is no opening.
  const split = sections(item.source);
  const [opening, ...bodies] = await Promise.all([split.opening, ...split.parts.map(part => part.body)].map(text => render(text, item.format, item.lang)));
  const parts = split.parts.map((part, i) => ({ id: "part-" + (i + 1), title: part.title, body: bodies[i] }));
  const list = entries(collection, english ? "en" : "pt-BR");
  const next = list[(list.findIndex(other => other.slug === slug) + 1) % list.length];
  const more = related(collection, item).filter(other => other.slug !== next.slug);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(collection, item)).replace(/</g, "\\u003c") }} />
      <Stage />
      <Reveals />
      <Spotlight />
      <div className="progress" aria-hidden="true" />
      <Header lang={item.lang} reading />
      <main id="main" className="reading" lang={english ? "en" : "pt-BR"}>
        <article>
          <header className="chapter reading-hero" data-form="sigil" data-seed={item.figure} data-side="1" data-dim="0.35">
            <div className="grab grab--right" data-grab aria-hidden="true" />
            <div className="col">
              <p className="label">
                <a href={routes[collection]}>← {collection === "posts" ? t.articles : t.projects}</a>
                {item.category && <span>{item.category}</span>}
              </p>
              <h1>{item.title}</h1>
              {item.summary && <p className="intro">{item.summary}</p>}
              <dl className="byline">
                <div><dt>{t.by}</dt><dd>{item.author}</dd></div>
                <div><dt>{formatDate(item.date, item.lang)}</dt><dd>{item.minutes} {t.minutes}</dd></div>
                {item.updated && item.updated !== item.date && <div><dt>{t.updated}</dt><dd><time dateTime={item.updated}>{formatDate(item.updated, item.lang)}</time></dd></div>}
              </dl>
              {item.tags.length > 0 && <ul className="chips">{item.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
              <p className="actions">
                {item.liveUrl && <a className="button button--accent" href={item.liveUrl} target="_blank" rel="noreferrer">{t.live}<span aria-hidden="true">↗</span></a>}
                {item.twin && <a className="link" href={`${routes[collection]}/${item.twin}`} hrefLang={english ? "pt-BR" : "en"}>{t.other}<span aria-hidden="true">→</span></a>}
              </p>
              {parts.length > 1 && (
                <nav className="contents" aria-label={t.contents}>
                  <p className="mini">{t.contents}</p>
                  <ol>{parts.map((part, i) => <li key={part.id}><a href={"#" + part.id}><span>{number(i + 1)}</span>{part.title}</a></li>)}</ol>
                </nav>
              )}
            </div>
          </header>
          {parts.length > 1 && <ReadingNav parts={parts.map(({ id, title }) => ({ id, title }))} label={t.contents} close={t.close} />}

          {opening && (
            <section className="part part--opening" data-form="sigil" data-seed={item.figure} data-side="1" data-dim="0.14" data-glow="0.5">
              <div className="prose">{opening}</div>
            </section>
          )}
          {parts.map((part, i) => (
            <section className={i === 0 && !opening ? "part part--first" : "part"} id={part.id} data-form="sigil" data-seed={`${item.figure}#${i + 1}`} data-side="1" data-dim="0.14" data-glow="0.5" aria-labelledby={"part-title-" + (i + 1)} key={part.id}>
              <p className="part-number" aria-hidden="true">{number(i + 1)}<span>/ {number(parts.length)}</span></p>
              <h2 id={"part-title-" + (i + 1)}>{part.title}</h2>
              <div className="prose">{part.body}</div>
            </section>
          ))}

          {item.references.length > 0 && (
            <section className="part references" data-form="sigil" data-seed={item.figure} data-side="1" data-dim="0.14" data-glow="0.5" aria-labelledby="references-title">
              <h2 id="references-title">{t.references}</h2>
              <ol>
                {item.references.map(reference => (
                  <li key={reference.url}>
                    <a href={reference.url} target="_blank" rel="noreferrer">{reference.title}<span aria-hidden="true">↗</span></a>
                    {reference.publisher && <span>{reference.publisher}</span>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <footer className="chapter reading-end" data-form="sigil" data-seed={next.figure} data-side="1" data-dim="0.4">
            <div className="col">
              {more.length > 0 && (
                <div className="related">
                  <p className="mini">{t.related}</p>
                  <ul>
                    {more.map(other => (
                      <li key={other.slug}><a href={`${routes[collection]}/${other.slug}`} data-spot><Sigil text={other.figure} /><span><b>{other.title}</b>{other.category ?? formatDate(other.date, item.lang)}</span></a></li>
                    ))}
                  </ul>
                </div>
              )}
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
