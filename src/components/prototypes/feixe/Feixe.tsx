import Mark from "@/components/site/Mark";
import { cases, links, root, t } from "../shared";
import Bench from "./Bench";
import Stage from "./Stage";

/** New words this cut needs. Everything else is the site's own copy. */
const fx = {
  draw: "Trace um feixe", drawTouch: "Toque, ou segure e arraste", again: "Trace outro", skip: "Seguir direto",
  hint: "Arraste em qualquer direção. O sistema se organiza em torno da sua linha.",
  // From the trajectory copy: the rule the whole practice rests on.
  rule: ["Modelos sugerem,", "regras determinísticas", "decidem."],
  ruleNote: "O feixe que você traçou vira o fio de prumo. O que era estrutura vira evidência.",
  meter: "ordem", act: "Você orquestrou.", actNote: "o ruído virou sistema a partir de uma linha",
  weighing: "Pesando…", unseen: "não observado", window: "Janela observada, em dias", drag: "Arraste o prumo",
  rules: "Limiares lidos do motor: tolerância de 3%, mínimo de 4 observações, alta de 10% em 14 dias, percentil 70.",
  nav: [["#caso", "Projetos"], ["/pt#trajectory", "Trajetória"], ["#contato", "Contato"]],
};

/** A stable scatter for each letter, so the server and the browser agree on where the noise puts it. */
const scatter = (i: number) => {
  const r = (n: number) => { const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v) - 0.5; };
  return { "--nx": (r(1) * 1.5).toFixed(3), "--ny": (r(2) * 1.9).toFixed(3), "--nr": (r(3) * 70).toFixed(1) } as React.CSSProperties;
};

export default function Feixe() {
  const prumo = cases[0], p = t.work.prumo;
  const sentence = t.hero.title.map(([text]) => text).join("");
  let n = 0;
  return (
    <div className="px-f" data-phase="cast" data-scene="hero" suppressHydrationWarning>
      {/* The opening only scatters the headline when a script is there to gather it again. If the scene's code never
          arrives, the headline gathers by itself. */}
      <script dangerouslySetInnerHTML={{ __html: "(function(r){try{if(matchMedia('(prefers-reduced-motion: reduce)').matches||(sessionStorage.getItem('feixe')==='1'&&location.search.indexOf('intro')<0))return}catch(e){}r.dataset.phase='void';setTimeout(function(){if(r.dataset.phase==='void'&&!r.dataset.gl)r.dataset.phase='cast'},7000)})(document.currentScript.parentElement)" }} />
      <div className="fx-hall" aria-hidden="true">
        {/* Slow fog, generated as video and graded down to almost nothing. The still hall stays underneath. */}
        <video className="fx-haze" src="/prototypes/feixe/haze.mp4" autoPlay muted loop playsInline preload="metadata" tabIndex={-1} />
      </div>
      <Stage />
      <a className="fx-skip" href="#caso">{t.skip}</a>

      <header className="fx-header">
        <a className="fx-identity" href={root + "/feixe"} aria-label="Emanuel Araújo"><Mark /><span>Emanuel Araújo</span></a>
        <nav aria-label="Seções">{fx.nav.map(([href, name]) => <a href={href} key={href}>{name}</a>)}</nav>
      </header>

      <main id="main">
        <section className="fx-hero" aria-labelledby="fx-title">
          <p className="fx-eyebrow">{t.hero.eyebrow}</p>
          <button className="fx-prompt" type="button" aria-describedby="fx-hint">
            <i aria-hidden="true" />
            <span className="fx-prompt-draw">{fx.draw}</span>
            <span className="fx-prompt-touch">{fx.drawTouch}</span>
            <span className="fx-prompt-again">{fx.again}</span>
          </button>
          <p className="fx-meter" aria-hidden="true"><b>000</b><span>{fx.meter}</span></p>
          <p className="fx-act" aria-hidden="true"><span>{fx.act}</span><small>{fx.actNote}</small></p>
          <a className="fx-direct" href="#caso">{fx.skip} <span aria-hidden="true">↓</span></a>
          <p className="fx-sr" id="fx-hint">{fx.hint} Enter traça o feixe; as setas o giram.</p>
          <div className="fx-hero-foot">
            <h1 id="fx-title" aria-label={sentence}>
              <span aria-hidden="true">
                {t.hero.title.map(([text, strong], i) => text.split(/(\s+)/).map((word, j) => word.trim()
                  ? <span className={strong ? "fx-w fx-w--strong" : "fx-w"} key={i + "-" + j}>{[...word].map((letter, k) => <span className="fx-l" style={scatter(n++)} key={k}>{letter}</span>)}</span>
                  : " "))}
              </span>
            </h1>
            <div className="fx-hero-side">
              <p className="fx-lead">{t.hero.lead}</p>
              <p className="fx-actions">
                <a className="fx-button fx-button--accent" href="#caso">{t.hero.primary}</a>
                <a className="fx-button" href="#contato">{t.contact.label}</a>
              </p>
            </div>
          </div>
        </section>

        <section className="fx-passage" aria-label="Princípio">
          <p className="fx-rule">{fx.rule.map(line => <span key={line}>{line}</span>)}</p>
          <p className="fx-rule-note">{fx.ruleNote}</p>
        </section>

        <section id="caso" className="fx-case" aria-labelledby="fx-case-title">
          <div className="fx-case-head">
            <p className="fx-mini"><i>01</i>{prumo.kind}<b>{prumo.status}</b></p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="fx-brand" src="/work/prumo/logo-negativo.svg" alt="Prumo" width="302" height="128" />
            <h2 id="fx-case-title">{prumo.title}</h2>
            <p className="fx-lead">{prumo.text}</p>
          </div>
          <Bench t={p.bench} labels={fx} />
          <div className="fx-case-foot">
            <dl className="fx-facts">{p.facts.map(([value, name]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
            <p className="fx-actions">
              <a className="fx-button fx-button--lime" href={links.prumo} target="_blank" rel="noreferrer">{t.work.visit} Prumo <span aria-hidden="true">↗</span></a>
              <a className="fx-button" href={links.prumoTelegram} target="_blank" rel="noreferrer">{p.channel} <span aria-hidden="true">↗</span></a>
              <a className="fx-button" href={root + "/museu/prumo"}>{p.stagesTitle} <span aria-hidden="true">→</span></a>
            </p>
          </div>
        </section>

        <section id="contato" className="fx-contact" aria-labelledby="fx-contact-title">
          <h2 id="fx-contact-title">{t.contact.title}</h2>
          <p className="fx-lead">{t.contact.text}</p>
          <p className="fx-actions">
            <a className="fx-button fx-button--accent" href={links.email}>{t.contact.email}</a>
            <a className="fx-button" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
            <a className="fx-button" href={links.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          </p>
          <p className="fx-foot"><span>{t.contact.role}</span><span>{t.contact.place}</span><a href={root}>Protótipo C · Feixe · comparar</a></p>
        </section>
      </main>
    </div>
  );
}
