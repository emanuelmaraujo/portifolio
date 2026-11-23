import type { CSSProperties } from "react";
import Link from "next/link";
import Mark from "@/components/site/Mark";
import { copy, links } from "@/components/site/content";
import Scroll from "./Scroll";
import Table from "./Table";
import { FRAMES, GO, MARKS, NOTION } from "./take";
import { words, type Lang } from "./words";

/**
 * "Três verbos" as one scrolled take over the drafting table. The plan rises into the model (projeto); the sheet
 * turns into a touch table whose eight layers of defence switch on while one scrolls (protejo); the model takes
 * itself apart and puts itself together again, piece by piece through the stages of the agents (orquestro); then one
 * stop for each system, on the same touch table, and the whole table from above with who made it, first in paper
 * and then lit.
 * Everything that can be read or pressed is on the table itself; the page adds one short caption at the foot.
 * The same component serves both languages: the words on the table are rendered once for each.
 */
const TOTAL = "07";
const css = (vars: Record<string, string | number>) => vars as CSSProperties;

function Letters({ text }: { text: string }) {
  let i = 0;
  return (
    <>
      <span className="p-sr">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map(word => (
          <span className="p-w" key={word}>{[...word].map(letter => <i style={css({ "--i": i++ })} key={i}>{letter}</i>)}</span>
        ))}
      </span>
    </>
  );
}

export default function Percurso({ portrait = false, lang = "pt" }: { portrait?: boolean; lang?: Lang }) {
  const w = words[lang], t = copy[lang === "en" ? "en" : "pt-BR"];
  const cases = [
    { id: "prumo", name: "Prumo", href: links.prumo as string | undefined, ...t.work.prumo },
    { id: "torvya", name: "Torvya", href: links.torvya as string | undefined, ...t.work.torvya },
    { id: "kreps", name: "Marcos Krep’s", href: undefined as string | undefined, ...t.work.kreps },
  ];
  const s = w.sentence;
  return (
    <div className="px-p" data-marks={MARKS.join("|")} data-top="light" data-mid="light" data-portrait={portrait ? "1" : "0"} data-rest="" style={css({ "--act": 0, "--s": 0 })}>
      <a className="p-skip" href="#p-summary" data-go="1">{t.skip}</a>
      <div className="p-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="p-poster" src="/prototypes/percurso/l/001.webp" alt={w.poster} />
        <Scroll lang={lang} />

        <header className="p-header">
          <Link className="p-identity" href={w.home} aria-label="Emanuel Araújo"><Mark /><span>Emanuel Araújo</span></Link>
          <p className="p-sentence" aria-hidden="true">{s[0]}<b data-verb="1">{s[1]}</b>{s[2]}<b data-verb="2">{s[3]}</b>{s[4]}<b data-verb="3">{s[5]}</b>{s[6]}<b data-verb="4">{s[7]}</b>{s[8]}</p>
          <p className="p-hud" aria-hidden="true">
            <span className="p-roll"><b>{MARKS.map((m, i) => <i key={m}>{"0" + i}</i>)}</b>/{TOTAL}</span>
            <span>F <b className="p-frame">001</b>/{FRAMES}</span>
          </p>
          <a className="p-lang" href={w.otherHref} hrefLang={w.otherLang} lang={w.otherLang}>{w.other}</a>
          <a className="p-classic" href={w.classicHref}>{w.classic}</a>
        </header>

        <section className="p-panel p-intro" data-from="0" data-to="0.035" data-on="1" aria-labelledby="p-title">
          <p className="p-label">{t.hero.eyebrow}</p>
          <h1 id="p-title">{t.hero.title.map(([text, strong]) => strong ? <em key={text}>{text}</em> : text)}</h1>
          <p className="p-lead">{t.hero.lead}</p>
          <p className="p-hint"><i aria-hidden="true" />{t.hero.hint}</p>
        </section>

        {w.verbs.map((verb, i) => (
          <p className={"p-panel p-word p-word--" + (i + 1)} data-from={MARKS[i + 1]} data-to={MARKS[i + 2]} key={verb}><Letters text={verb} /></p>
        ))}
        <Table lang={lang} links={[links.email, links.linkedin, links.github, links.blog, NOTION.skills, NOTION.updates]} projects={cases.map(item => item.name)} />

        <nav className="p-dock" aria-label={w.stops}>
          {([["1", GO.projeto, w.verbs[0]], ["2", GO.protejo, w.verbs[1]], ["3", GO.orquestro, w.verbs[2]], ["4,5,6", GO.systems, w.systems], ["7", GO.paper, t.contact.label]] as const).map(([acts, to, name]) => (
            <button type="button" data-go={to} data-acts={acts} aria-current="false" key={name}>{name}</button>
          ))}
        </nav>
        <p className="p-rule" aria-hidden="true"><i /><span>{w.scale}</span></p>
        <p className="p-load" aria-hidden="true"><b className="p-loading">000</b>{w.loading}</p>
        <p className="p-sr">{w.keys}</p>
        {/* The same story for readers that do not see the table. */}
        <section className="p-sr" id="p-summary" aria-label={w.summary}>
          {cases.map(item => (
            <article key={item.id}>
              <h2>{item.name}: {item.title}</h2>
              <p>{item.text}</p>
              {item.href && <a href={item.href}>{t.work.visit}</a>}
            </article>
          ))}
          <h2>{t.contact.title}</h2>
          <p>{t.contact.text}</p>
          <a href={links.email}>{t.contact.email}</a> <a href={links.linkedin}>LinkedIn</a> <a href={links.github}>GitHub</a> <a href={links.blog}>{w.articles}</a>
        </section>
      </div>
    </div>
  );
}
