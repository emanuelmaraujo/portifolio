import Mark from "@/components/site/Mark";
import { CaseImage, ProtoBar, Title, cases, labels, links, root, t } from "../shared";
import Piece from "./Piece";

const base = root + "/estratos";
const Arrow = () => <span aria-hidden="true">↗</span>;

function Header({ home }: { home: string }) {
  return (
    <header className="e-header">
      <a className="e-identity" href={home} aria-label="Emanuel Araújo"><Mark /><span>Emanuel Araújo</span></a>
      <nav aria-label="Seções">{labels.nav.map(([id, name]) => <a href={`${base}#${id}`} key={id}>{name}</a>)}</nav>
    </header>
  );
}

function Contact() {
  return (
    <section id="contact" className="e-contact" aria-labelledby="contact-title">
      <p className="e-label"><i>03</i>{t.contact.label}</p>
      <h2 id="contact-title">{t.contact.title}</h2>
      <p>{t.contact.text}</p>
      <p className="e-actions">
        <a className="e-button e-button--accent" href={links.email}>{t.contact.email}</a>
        <a className="e-button" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<Arrow /></a>
        <a className="e-button" href={links.github} target="_blank" rel="noreferrer">GitHub<Arrow /></a>
      </p>
      <p className="e-foot"><span>{t.contact.role}</span><span>{t.contact.place}</span><span>{t.contact.footer}</span></p>
    </section>
  );
}

export function Opening() {
  const layers = [...t.trajectory.layers].reverse();
  return (
    <div className="px-e">
      <a className="e-skip" href="#main">{t.skip}</a>
      <ProtoBar direction="estratos" page="" />
      <Header home={base} />
      <main id="main">
        <section className="e-hero" aria-labelledby="hero-title">
          <div className="e-hero-copy">
            <p className="e-eyebrow">{t.hero.eyebrow}</p>
            <h1 id="hero-title"><Title /></h1>
            <p className="e-lead">{t.hero.lead}</p>
            <p className="e-actions">
              <a className="e-button e-button--accent" href="#work">{t.hero.primary}</a>
              <a className="e-button" href="#trajectory">{t.trajectory.label}</a>
            </p>
          </div>
          <Piece caption={t.captions.hero} layers={labels.layers} beam={labels.beam} />
          <ul className="e-facets" aria-label="Áreas de atuação">{t.hero.facets.map(facet => <li key={facet}>{facet}</li>)}</ul>
        </section>

        <section id="work" className="e-work" aria-labelledby="work-title">
          <p className="e-label"><i>01</i>{t.work.label}</p>
          <h2 id="work-title">{t.work.title}</h2>
          <ol className="e-cuts">
            {cases.map(item => (
              <li className="e-cut" style={{ "--tone": item.accent } as React.CSSProperties} key={item.id}>
                <div className="e-cut-head">
                  <span className="e-cut-n">{item.n}</span>
                  <h3>{item.name}</h3>
                  <p className="e-meta">{item.kind}<b>{item.status}</b></p>
                </div>
                <div className="e-cut-body">
                  <p className="e-cut-title">{item.title}</p>
                  <p>{item.text}</p>
                  <p className="e-stack"><span>{labels.stack}</span>{item.stack.join(" · ")}</p>
                  <p className="e-links">
                    {item.study && <a className="e-go" href={`${base}/${item.id}`}>{labels.study}<span aria-hidden="true">→</span></a>}
                    {item.href && <a href={item.href} target="_blank" rel="noreferrer">{t.work.visit}<Arrow /></a>}
                  </p>
                </div>
                <div className={`e-plate e-plate--${item.id}`} style={item.study ? { viewTransitionName: "piece-" + item.id } as React.CSSProperties : undefined}>
                  <CaseImage item={item} />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="trajectory" className="e-trajectory" aria-labelledby="trajectory-title">
          <p className="e-label"><i>02</i>{t.trajectory.label}</p>
          <h2 id="trajectory-title">{t.trajectory.title}</h2>
          <p className="e-intro">{t.trajectory.intro}</p>
          {/* Newest on top, foundations at the base: the list is read the way the piece is built. */}
          <ol className="e-layers" reversed>
            {layers.map((layer, i) => (
              <li style={{ "--step": layers.length - 1 - i } as React.CSSProperties} key={layer.name}>
                <p className="e-when">{layer.when}</p>
                <div>
                  <h3>{layer.name}</h3>
                  <p className="e-role">{layer.role}</p>
                  <p>{layer.text}</p>
                  <p className="e-gained">{layer.gained.join(" · ")}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <Contact />
      </main>
    </div>
  );
}

export function CaseStudy() {
  const item = cases[0], next = cases[1], p = t.work.prumo;
  return (
    <div className="px-e">
      <a className="e-skip" href="#main">{t.skip}</a>
      <ProtoBar direction="estratos" page="/prumo" />
      <Header home={base} />
      <main id="main" className="e-case" style={{ "--tone": item.accent } as React.CSSProperties}>
        <section className="e-case-top" aria-labelledby="case-title">
          <div>
            <p className="e-crumb"><a href={`${base}#work`}><span aria-hidden="true">←</span> {labels.back}</a><span>{item.n} / {String(cases.length).padStart(2, "0")}</span></p>
            <p className="e-meta">{item.kind}<b>{item.status}</b></p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="e-brand" src="/work/prumo/logo-negativo.svg" alt="Prumo" width="302" height="128" />
            <h1 id="case-title">{item.title}</h1>
            <p className="e-lead">{item.text}</p>
            <dl className="e-sheet">
              <div><dt>{labels.role}</dt><dd>{labels.roleValue}</dd></div>
              <div><dt>{labels.stack}</dt><dd>{item.stack.join(" · ")}</dd></div>
            </dl>
            <p className="e-actions">
              <a className="e-button e-button--accent" href={links.prumo} target="_blank" rel="noreferrer">{t.work.visit} Prumo<Arrow /></a>
              <a className="e-button" href={links.prumoTelegram} target="_blank" rel="noreferrer">{p.channel}<Arrow /></a>
            </p>
          </div>
          <figure className="e-plate e-plate--prumo e-plate--lead" style={{ viewTransitionName: "piece-prumo" } as React.CSSProperties}>
            <CaseImage item={item} eager />
            <figcaption>{p.cardNote}</figcaption>
          </figure>
        </section>

        <dl className="e-facts">{p.facts.map(([value, name]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>

        <section className="e-pipeline" aria-labelledby="pipeline-title">
          <p className="e-label"><i>01</i>{p.stageLabel}</p>
          <h2 id="pipeline-title">{p.stagesTitle}</h2>
          <ol className="e-stages">
            {p.stages.map(([name, text, input, output], i) => (
              <li style={{ "--step": i } as React.CSSProperties} key={name}>
                <span className="e-cut-n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{name}</h3>
                <p>{text}</p>
                <dl><div><dt>{p.inLabel}</dt><dd>{input}</dd></div><div><dt>{p.outLabel}</dt><dd>{output}</dd></div></dl>
              </li>
            ))}
          </ol>
        </section>

        <section className="e-verdicts" aria-labelledby="verdicts-title">
          <div>
            <p className="e-label"><i>02</i>{p.bench.title}</p>
            <h2 id="verdicts-title">{labels.verdicts}</h2>
            <figure className="e-plate e-plate--sites">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/work/prumo/site.png" alt={labels.sitesAlt} width="1340" height="3314" loading="lazy" />
            </figure>
          </div>
          <dl>{Object.values(p.bench.verdicts).map(([name, text]) => <div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl>
        </section>

        <a className="e-next" href={`${base}#work`}>
          <span>{labels.next}</span><b>{next.n} · {next.name}</b><i>{next.title}</i><span aria-hidden="true">→</span>
        </a>
        <Contact />
      </main>
    </div>
  );
}
