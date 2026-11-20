"use client";

import { useRef, useState } from "react";
import type { Copy } from "./content";

const external = (href: string) => href.startsWith("http");

/**
 * The three pillars. Each one has its own figure: choosing a pillar changes `data-form`, and the field rebuilds itself
 * into that figure while the chapter stays on screen. On wide screens the pillars are tabs; on phones the panels are
 * cards on a horizontal snap track, and the card in view chooses the pillar.
 */
export default function Pillars({ t }: { t: Copy["pillars"] }) {
  const [selected, setSelected] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const item = t.items[selected];

  const choose = (index: number, focus = false) => {
    const next = (index + t.items.length) % t.items.length;
    setSelected(next);
    const el = track.current, card = el?.children[next] as HTMLElement | undefined;
    if (el && card && el.scrollWidth > el.clientWidth + 4) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
    if (focus) tabs.current?.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)?.focus();
  };
  const onScroll = () => {
    const el = track.current;
    if (!el || el.scrollWidth <= el.clientWidth + 4) return;
    const centre = el.scrollLeft + el.clientWidth / 2;
    let best = 0, distance = Infinity;
    [...el.children].forEach((child, i) => {
      const card = child as HTMLElement, d = Math.abs(card.offsetLeft - el.offsetLeft + card.offsetWidth / 2 - centre);
      if (d < distance) { distance = d; best = i; }
    });
    if (best !== selected) setSelected(best);
  };

  return (
    <section id="pillars" className="chapter pillars" data-form={item.form} data-caption={item.caption} data-side="-1.15" data-dim="0.3" aria-labelledby="pillars-title">
      <div className="grab grab--left" data-grab aria-hidden="true" />
      <div className="col">
        <p className="label" data-reveal><span>02</span>{t.label}</p>
        <h2 id="pillars-title" data-reveal>{t.title}</h2>
        <p className="intro" data-reveal>{t.intro}</p>
        <div className="pillar-tabs" role="tablist" aria-label={t.label} ref={tabs} data-reveal
          onKeyDown={e => {
            const move = e.key === "ArrowRight" || e.key === "ArrowDown" ? selected + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? selected - 1 : null;
            if (move === null) return;
            e.preventDefault();
            choose(move, true);
          }}>
          {t.items.map((pillar, i) => (
            <button type="button" role="tab" id={"pillar-tab-" + i} aria-selected={i === selected} aria-controls={"pillar-panel-" + i} tabIndex={i === selected ? 0 : -1} data-tab={i} onClick={() => choose(i)} key={pillar.form}>
              <span>{String(i + 1).padStart(2, "0")}</span>{pillar.name}
            </button>
          ))}
        </div>
        <p className="swipe-hint" aria-hidden="true">{t.swipe}<span>{selected + 1}/{t.items.length}</span></p>
        <div className="pillar-track" ref={track} onScroll={onScroll}>
          {t.items.map((pillar, i) => (
            <article className={"panel pillar" + (i === selected ? " is-active" : "")} role="tabpanel" id={"pillar-panel-" + i} aria-labelledby={"pillar-tab-" + i} data-spot key={pillar.form}>
              <h3 className="pillar-name"><span>{String(i + 1).padStart(2, "0")}</span>{pillar.name}</h3>
              <p className="pillar-thesis">{pillar.thesis}</p>
              <h4 className="mini">{t.practiceLabel}</h4>
              <ul className="chips">{pillar.practice.map(line => <li key={line}>{line}</li>)}</ul>
              <h4 className="mini">{t.evidenceLabel}</h4>
              <ol className="evidence">
                {pillar.evidence.map(([claim, where, href]) => (
                  <li key={claim}>
                    <p>{claim}</p>
                    <a className="proof" href={href} {...(external(href) ? { target: "_blank", rel: "noreferrer" } : {})}>{where}<span aria-hidden="true">{external(href) ? "↗" : "→"}</span></a>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
