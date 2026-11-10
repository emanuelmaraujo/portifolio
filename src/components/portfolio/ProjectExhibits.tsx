import { ArrowUpRight } from "lucide-react";
import { copy, type Locale } from "./content";
import ExhibitTilt from "./ExhibitTilt";
import SceneStage from "./SceneStage";
import { sceneLabels } from "./Hero";

const ids = ["prumo", "torvya", "marcos-kreps"];

function PrumoFlow({ en }: { en: boolean }) {
  const nodes = en ? [
    ["01", "MARKETPLACES", "Offer feeds"],
    ["02", "PRUMO ENGINE", "Filter · curate · deduplicate"],
    ["03", "DISTRIBUTION", "Telegram · WhatsApp"],
  ] : [
    ["01", "MARKETPLACES", "Fontes de ofertas"],
    ["02", "MOTOR PRUMO", "Filtrar · curar · deduplicar"],
    ["03", "DISTRIBUIÇÃO", "Telegram · WhatsApp"],
  ];
  return <div className="prumo-flow">
    <div className="exhibit-top mono"><span>PRUMO / PIPELINE</span><span>{en ? "SYSTEM DIAGRAM" : "DIAGRAMA DO SISTEMA"}</span></div>
    <ol>{nodes.map(([num, name, detail]) => <li key={num}>
      <small className="mono">{num}</small><strong>{name}</strong><span>{detail}</span>
    </li>)}</ol>
    <div className="prumo-track" aria-hidden="true"><span /></div>
    <div className="exhibit-bottom mono"><span>PYTHON WORKERS</span><span>POSTGRESQL</span></div>
  </div>;
}

function PosMockup({ en }: { en: boolean }) {
  const tasks = en ? ["New order", "Preparing", "Ready to deliver"] : ["Novo pedido", "Em preparo", "Pronto para entrega"];
  return <figure className="pos-viewport">
    <div className="pos-mock">
      <div className="pos-toolbar"><b>MAR<span>·</span>COS</b><span className="mono">{en ? "OPERATIONS" : "OPERAÇÃO"}</span></div>
      <div className="pos-title"><strong>{en ? "Order board" : "Quadro de pedidos"}</strong><span className="mono">POS / 024</span></div>
      {tasks.map((status, index) => <div className="pos-line" key={status}>
        <i aria-hidden="true" /><strong>{status}</strong><span className="mono">#{24 + index}</span>
      </div>)}
      <div className="pos-total"><span>{en ? "Payment method" : "Forma de pagamento"}</span><b>Pix</b></div>
    </div>
    <figcaption className="mono">{en ? "INTERFACE STUDY · SAMPLE DATA" : "ESTUDO DE INTERFACE · DADOS FICTÍCIOS"}</figcaption>
  </figure>;
}

export default function ProjectExhibits({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const en = locale === "en";
  return <div className="exhibit-list">
    {t.projects.map((project, index) => <article className={`exhibit exhibit-${ids[index]}`} key={project.name} id={ids[index]} aria-labelledby={`${ids[index]}-title`}>
      <div className="exhibit-copy">
        <p className="mono exhibit-index">0{index + 1} / {project.status}</p>
        <h3 id={`${ids[index]}-title`}>{project.name}</h3>
        <p className="exhibit-type">{project.type}</p>
        <p className="exhibit-description">{project.summary}</p>
        <ul className="tags mono">{project.stack.map(tool => <li key={tool}>{tool}</li>)}</ul>
        <details>
          <summary>{t.detail}<span aria-hidden="true" /></summary>
          <dl>{[project.challenge, project.approach, project.evidence].map((item, i) =>
            <div key={item}><dt>{t.caseLabels[i]}</dt><dd>{item}</dd></div>)}</dl>
        </details>
        {project.url && <a className="text-link" href={project.url}>{t.visit}<ArrowUpRight size={15} aria-hidden="true" /></a>}
      </div>
      {index === 0 && <ExhibitTilt><PrumoFlow en={en} /></ExhibitTilt>}
      {index === 1 && <figure className="torvya-viewport exhibit-visual">
        <SceneStage kind="torvya" poster="/aperture/torvya-poster.svg" labels={sceneLabels[locale]} />
        <figcaption className="mono">{en ? "REVIEW + CONNECT / PRODUCT CONCEPTS" : "REVIEW + CONNECT / CONCEITOS DE PRODUTO"}</figcaption>
      </figure>}
      {index === 2 && <ExhibitTilt><PosMockup en={en} /></ExhibitTilt>}
    </article>)}
  </div>;
}
