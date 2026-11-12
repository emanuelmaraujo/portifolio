"use client";

import { useState } from "react";
import type { Copy } from "./content";

/** Four disciplines as a connected graph. Selecting one highlights its cluster and lists what links it to the others. */
export default function Capabilities({ t }: { t: Copy["capabilities"] }) {
  const [selected, setSelected] = useState(0);
  const node = t.nodes[selected];
  const edges = t.edges.filter(edge => edge.a === selected || edge.b === selected);
  return (
    <section id="capabilities" className="chapter capabilities" data-form="graph" data-side="-1.15" data-active={selected} data-dim="0.26" aria-labelledby="capabilities-title">
      <div className="anchors">
        {t.nodes.map((n, i) => (
          <button type="button" className={"tag tag--node" + (i === selected ? " is-active" : "")} data-anchor={"node" + i} onClick={() => setSelected(i)} tabIndex={-1} aria-hidden="true" key={n.name}>{n.name}</button>
        ))}
      </div>
      <div className="col">
        <p className="label" data-reveal><span>02</span>{t.label}</p>
        <h2 id="capabilities-title" data-reveal>{t.title}</h2>
        <p className="intro" data-reveal>{t.intro}</p>
        <div className="tabs" role="tablist" aria-label={t.label} data-reveal>
          {t.nodes.map((n, i) => (
            <button type="button" role="tab" id={"cap-tab-" + i} aria-selected={i === selected} aria-controls="cap-panel" className="tab" onClick={() => setSelected(i)} onMouseEnter={() => setSelected(i)} key={n.name}>
              <span>{String(i + 1).padStart(2, "0")}</span>{n.name}
            </button>
          ))}
        </div>
        <div className="panel cap-panel" id="cap-panel" role="tabpanel" aria-labelledby={"cap-tab-" + selected} key={selected}>
          <p className="cap-summary">{node.summary}</p>
          <ul className="chips">{node.items.map(item => <li key={item}>{item}</li>)}</ul>
          <h3 className="mini">{t.edgesTitle}</h3>
          <ul className="edges">
            {edges.map(edge => {
              const other = t.nodes[edge.a === selected ? edge.b : edge.a];
              return <li key={edge.a + "-" + edge.b}><strong>{other.name}</strong><span>{edge.text}</span></li>;
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
