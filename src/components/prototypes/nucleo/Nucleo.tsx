import Mark from "@/components/site/Mark";
import { cases, links, root, t } from "../shared";
import Journey from "./Journey";

/**
 * The cyberpunk cut: one LED-lit environment, entered through the screen of a terminal, with four stops on a loop.
 * The copy is the site's own; only the labels of the instrument layer are new.
 */
const fx = {
  sectors: ["mesa", "projetos", "núcleo", "contato"], marks: [0, 0.3, 0.76, 0.915],
  enter: "Role para entrar", entering: "Atravessando a tela", inside: "Você está dentro do sistema.",
  project: "projeto", open: "Estudo de caso", loop: "Continue rolando: o percurso volta à mesa.",
  keys: "Roda do mouse, arrastar ou setas movem a câmera.", loading: "carregando o percurso",
};
const STOPS = [0.405, 0.535, 0.665];
const o = t.orchestration;

export default function Nucleo() {
  return (
    <div className="px-n" data-sectors={fx.sectors.join("|")} data-marks={fx.marks.join("|")}>
      <a className="n-skip" href="#n-projects">{t.skip}</a>
      <div className="n-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="n-poster" src="/prototypes/nucleo/001.jpg" alt="Um terminal sobre uma mesa escura, iluminado por LEDs; pela tela se vê um corredor de racks que continua para dentro." />
        <Journey />

        <header className="n-header">
          <a className="n-identity" href={root} aria-label="Emanuel Araújo"><Mark /><span>Emanuel Araújo</span></a>
          <p className="n-hud" aria-hidden="true"><span className="n-sector">01/04 · mesa</span><span>F <b className="n-frame">001</b>/200</span></p>
        </header>

        <section className="n-panel n-intro" data-from="0" data-to="0.13" data-on="1" aria-labelledby="n-title">
          <p className="n-label">{t.hero.eyebrow}</p>
          <h1 id="n-title">{t.hero.title.map(([text, strong]) => strong ? <em key={text}>{text}</em> : text)}</h1>
          <p className="n-lead">{t.hero.lead}</p>
          <p className="n-hint"><i aria-hidden="true" />{fx.enter}</p>
        </section>

        <p className="n-panel n-passing" data-from="0.16" data-to="0.3" aria-hidden="true"><span>{fx.entering}</span>{fx.inside}</p>

        <div id="n-projects">
          {cases.map((item, i) => (
            <section className="n-panel n-project" data-side={i % 2 ? "left" : "right"} data-from={STOPS[i] - 0.045} data-to={STOPS[i] + 0.05} style={{ "--tone": item.accent } as React.CSSProperties} aria-labelledby={"n-" + item.id} key={item.id}>
              <p className="n-label"><i>{fx.project}_{item.n}</i>{item.kind}<b>{item.status}</b></p>
              <h2 id={"n-" + item.id}>{item.name}</h2>
              <p className="n-title">{item.title}</p>
              <p className="n-text">{item.text}</p>
              <p className="n-links">
                {item.study && <a className="n-button" href={root + "/tres-verbos"}>{fx.open} <span aria-hidden="true">→</span></a>}
                {item.href && <a className="n-button n-button--line" href={item.href} target="_blank" rel="noreferrer">{t.work.visit} <span aria-hidden="true">↗</span></a>}
              </p>
              <p className="n-dots">{cases.map((other, k) => <button type="button" data-go={STOPS[k]} data-sector="1" aria-label={other.name} aria-pressed={k === i} key={other.id}>{other.n}</button>)}</p>
            </section>
          ))}
        </div>

        <section className="n-panel n-core" data-from="0.79" data-to="0.9" aria-labelledby="n-core">
          <p className="n-label"><i>{o.core}</i>{o.label}</p>
          <h2 id="n-core">{o.title}</h2>
          <ol className="n-agents">{o.agents.map(agent => <li key={agent.name}>{agent.name}</li>)}</ol>
          <dl className="n-stats">{o.stats.map(([value, name]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
        </section>

        <section className="n-panel n-contact" data-from="0.915" data-to="0.972" aria-labelledby="n-contact">
          <p className="n-label">{t.contact.label}</p>
          <h2 id="n-contact">{t.contact.title}</h2>
          <p className="n-links">
            <a className="n-button" href={links.email}>{t.contact.email}</a>
            <a className="n-button n-button--line" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
            <a className="n-button n-button--line" href={links.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          </p>
          <p className="n-loop">{fx.loop}</p>
        </section>

        <nav className="n-dock" aria-label="Paradas">
          {[[0, 0], [1, STOPS[0]], [2, 0.855], [3, 0.945]].map(([index, to]) => (
            <button type="button" data-go={to} data-sector={index} aria-current={index === 0 ? "true" : "false"} key={index}><i>{String(index + 1).padStart(2, "0")}</i>{fx.sectors[index]}</button>
          ))}
        </nav>
        <p className="n-bar" aria-hidden="true"><i /></p>
        <p className="n-load" aria-hidden="true"><b className="n-loading">000</b>{fx.loading}</p>
        <p className="n-sr">{fx.keys}</p>
      </div>
    </div>
  );
}
