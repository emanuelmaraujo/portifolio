"use client";

import { useRef } from "react";
import type { Copy } from "./content";
import { useCentredChild } from "./hooks";

/** Career as strata. The step nearest the middle of the screen lights its layer in the 3D stack. */
export default function Trajectory({ t }: { t: Copy["trajectory"] }) {
  const root = useRef<HTMLElement>(null);
  const active = useCentredChild(root, ".layer");
  return (
    <section ref={root} id="trajectory" className="chapter trajectory" data-form="strata" data-side="1" data-active={active} data-dim="0.42" aria-labelledby="trajectory-title">
      <div className="anchors" aria-hidden="true">
        {t.layers.map((layer, i) => <span className={"tag" + (i === active ? " is-active" : "")} data-anchor={"layer" + i} key={layer.name}>{layer.when}</span>)}
      </div>
      <div className="col">
        <p className="label" data-reveal><span>01</span>{t.label}</p>
        <h2 id="trajectory-title" data-reveal>{t.title}</h2>
        <p className="intro" data-reveal>{t.intro}</p>
        <ol className="layers">
          {t.layers.map((layer, i) => (
            <li className={"layer" + (i === active ? " is-active" : "")} key={layer.name}>
              <p className="layer-when">{layer.when}<span>{String(i + 1).padStart(2, "0")} / {String(t.layers.length).padStart(2, "0")}</span></p>
              <h3>{layer.name}</h3>
              <p className="layer-role">{layer.role}</p>
              <p>{layer.text}</p>
              <ul className="chips">{layer.gained.map(item => <li key={item}>{item}</li>)}</ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
