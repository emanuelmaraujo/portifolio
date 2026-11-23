import Mark from "@/components/site/Mark";
import { CaseImage, ProtoBar, Title, cases, labels, links, root, t, type Case } from "../shared";
import Plinth from "./Plinth";

const base = root + "/museu";
const Arrow = () => <span aria-hidden="true">↗</span>;

function Header() {
  return (
    <header className="m-header">
      <a className="m-identity" href={base} aria-label="Emanuel Araújo"><Mark /><span>Emanuel Araújo</span></a>
      <nav aria-label="Seções">{labels.nav.map(([id, name]) => <a href={`${base}#${id}`} key={id}>{name}</a>)}</nav>
    </header>
  );
}

/** The conservation sheet: the same facts every piece carries. */
function Sheet({ item, role = false }: { item: Case; role?: boolean }) {
  return (
    <dl className="m-sheet">
      <div><dt>{labels.kind}</dt><dd>{item.kind}</dd></div>
      <div><dt>{labels.status}</dt><dd>{item.status}</dd></div>
      {role && <div><dt>{labels.role}</dt><dd>{labels.roleValue}</dd></div>}
      <div><dt>{labels.stack}</dt><dd>{item.stack.join(", ")}</dd></div>
      {item.href && <div><dt>{labels.source}</dt><dd><a href={item.href} target="_blank" rel="noreferrer">{item.href.replace(/^https:\/\/|\/$/g, "")}<Arrow /></a></dd></div>}
    </dl>
  );
}

function Contact() {
  return (
    <section id="contact" className="m-contact" aria-labelledby="contact-title">
      <p className="m-label"><i>III</i>{t.contact.label}</p>
      <h2 id="contact-title">{t.contact.title}</h2>
      <p>{t.contact.text}</p>
      <p className="m-actions">
        <a className="m-button" href={links.email}>{t.contact.email}</a>
        <a className="m-link" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<Arrow /></a>
        <a className="m-link" href={links.github} target="_blank" rel="noreferrer">GitHub<Arrow /></a>
      </p>
      <p className="m-foot"><span>{t.contact.role}</span><span>{t.contact.place}</span><span>{t.contact.footer}</span></p>
    </section>
  );
}

export function Opening() {
  return (
    <div className="px-m">
      <a className="m-skip" href="#main">{t.skip}</a>
      <ProtoBar direction="museu" page="" />
      <Header />
      <main id="main">
        <section className="m-hero" aria-labelledby="hero-title">
          <p className="m-eyebrow">{t.hero.eyebrow}</p>
          <h1 id="hero-title"><Title /></h1>
          <div className="m-hero-copy">
            <p className="m-lead">{t.hero.lead}</p>
            <p className="m-actions">
              <a className="m-button" href="#work">{t.hero.primary}<span aria-hidden="true">↓</span></a>
              <a className="m-link" href="#trajectory">{t.trajectory.label}</a>
            </p>
          </div>
          <Plinth caption={t.captions.hero} />
          <ul className="m-facets" aria-label="Áreas de atuação">{t.hero.facets.map(facet => <li key={facet}>{facet}</li>)}</ul>
        </section>

        <section id="work" className="m-work" aria-labelledby="work-title">
          <p className="m-label"><i>I</i>{t.work.label}</p>
          <h2 id="work-title">{t.work.title}</h2>
          <ol className="m-rooms">
            {cases.map(item => (
              <li className={`m-room m-room--${item.id}`} key={item.id}>
                <figure className="m-mat" style={item.study ? { viewTransitionName: "piece-" + item.id } as React.CSSProperties : undefined}>
                  <CaseImage item={item} />
                </figure>
                <div className="m-caption">
                  <p className="m-number">Nº {item.n}</p>
                  <h3>{item.name}</h3>
                  <p className="m-title">{item.title}</p>
                  <p>{item.text}</p>
                  <Sheet item={item} />
                  {item.study && <a className="m-button m-button--line" href={`${base}/${item.id}`}>{labels.study}<span aria-hidden="true">→</span></a>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="trajectory" className="m-trajectory" aria-labelledby="trajectory-title">
          <div>
            <p className="m-label"><i>II</i>{t.trajectory.label}</p>
            <h2 id="trajectory-title">{t.trajectory.title}</h2>
            <p className="m-intro">{t.trajectory.intro}</p>
          </div>
          <ol className="m-chronology">
            {t.trajectory.layers.map(layer => (
              <li key={layer.name}>
                <p className="m-when">{layer.when}</p>
                <div>
                  <h3>{layer.name}</h3>
                  <p className="m-role">{layer.role}</p>
                  <p>{layer.text}</p>
                  <p className="m-gained">{layer.gained.join(" · ")}</p>
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
    <div className="px-m">
      <a className="m-skip" href="#main">{t.skip}</a>
      <ProtoBar direction="museu" page="/prumo" />
      <Header />
      <main id="main" className="m-case">
        <section className="m-case-top" aria-labelledby="case-title">
          <p className="m-crumb"><a href={`${base}#work`}><span aria-hidden="true">←</span> {labels.back}</a><span>Nº {item.n} de {String(cases.length).padStart(2, "0")}</span></p>
          <div className="m-case-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="m-brand" src="/work/prumo/logo.svg" alt="Prumo" width="302" height="128" />
            <h1 id="case-title">{item.title}</h1>
            <p className="m-lead">{item.text}</p>
          </div>
          <figure className="m-mat m-mat--lead" style={{ viewTransitionName: "piece-prumo" } as React.CSSProperties}>
            <CaseImage item={item} eager />
            <figcaption>{p.cardNote}</figcaption>
          </figure>
          <aside className="m-case-side" aria-label="Ficha">
            <Sheet item={item} role />
            <dl className="m-facts">{p.facts.map(([value, name]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
            <p className="m-actions">
              <a className="m-button" href={links.prumo} target="_blank" rel="noreferrer">{t.work.visit} Prumo<Arrow /></a>
              <a className="m-link" href={links.prumoTelegram} target="_blank" rel="noreferrer">{p.channel}<Arrow /></a>
            </p>
          </aside>
        </section>

        <section className="m-pipeline" aria-labelledby="pipeline-title">
          <div>
            <p className="m-label"><i>I</i>{p.stageLabel}</p>
            <h2 id="pipeline-title">{p.stagesTitle}</h2>
          </div>
          <ol className="m-stages">
            {p.stages.map(([name, text, input, output], i) => (
              <li key={name}>
                <span className="m-when">{i + 1}</span>
                <div>
                  <h3>{name}</h3>
                  <p>{text}</p>
                </div>
                <dl><div><dt>{p.inLabel}</dt><dd>{input}</dd></div><div><dt>{p.outLabel}</dt><dd>{output}</dd></div></dl>
              </li>
            ))}
          </ol>
        </section>

        <section className="m-verdicts" aria-labelledby="verdicts-title">
          <div>
            <p className="m-label"><i>II</i>{p.bench.title}</p>
            <h2 id="verdicts-title">{labels.verdicts}</h2>
            <dl>{Object.values(p.bench.verdicts).map(([name, text]) => <div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl>
          </div>
          <figure className="m-mat m-mat--sites">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/work/prumo/site.png" alt={labels.sitesAlt} width="1340" height="3314" loading="lazy" />
          </figure>
        </section>

        <a className="m-next" href={`${base}#work`}>
          <span>{labels.next}</span><b>Nº {next.n} · {next.name}</b><i>{next.title}</i><span aria-hidden="true">→</span>
        </a>
        <Contact />
      </main>
    </div>
  );
}
