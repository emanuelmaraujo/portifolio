"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Copy } from "@/components/site/content";
import { DAYS, HIGH, LOW, RAISED, SERIES, judge, link, priceAt } from "./verdict";

const RISE = 0.14; // how far above the chart the line is tied, as a share of its height
const money = (value: number) => "R$ " + value;

/**
 * The plumb line weighs a price against what was actually observed. The visitor moves the bob, narrows the window
 * or lets the price rise beforehand; the verdict is only read once the line is at rest.
 */
export default function Bench({ t, labels }: { t: Copy["work"]["prumo"]["bench"]; labels: { weighing: string; unseen: string; window: string; drag: string; rules: string } }) {
  const [price, setPrice] = useState(319);
  const [days, setDays] = useState(DAYS);
  const [raised, setRaised] = useState(false);
  const [weighing, setWeighing] = useState(false);
  const chart = useRef<HTMLDivElement>(null), bob = useRef<HTMLButtonElement>(null);
  const sim = useRef({ phi: 0, omega: 0, held: false, frame: 0, price: 319 });

  const series = raised ? RAISED : SERIES;
  const verdict = judge(price, series, days);
  const level = (value: number) => (value - LOW) / (HIGH - LOW);

  /** Puts the handle on the tip of the bob, wherever the line has swung to. */
  const place = useCallback(() => {
    const box = chart.current, handle = bob.current;
    if (!box || !handle) return;
    const h = box.clientHeight, length = (1 - level(sim.current.price) + RISE) * h, phi = sim.current.phi;
    handle.style.transform = `translate(${(box.clientWidth + Math.sin(phi) * length).toFixed(1)}px, ${(-RISE * h + Math.cos(phi) * length).toFixed(1)}px)`;
    link.swing = phi;
  }, []);

  const swing = useCallback(() => {
    const s = sim.current;
    s.frame = 0;
    if (s.held) return;
    s.omega += (-46 * Math.sin(s.phi) - 3.4 * s.omega) / 60;
    s.phi = Math.max(-0.7, Math.min(0.7, s.phi + s.omega / 60));
    if (Math.abs(s.phi) < 0.012 && Math.abs(s.omega) < 0.08) { s.phi = s.omega = 0; place(); setWeighing(false); return; }
    place();
    s.frame = requestAnimationFrame(swing);
  }, [place]);

  /** Any change of evidence disturbs the line. It has to settle before the verdict is read again. */
  const disturb = useCallback((push: number) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    sim.current.omega = push; // a push replaces the last one, so a held key cannot wind the line up
    setWeighing(true);
    if (!sim.current.frame) sim.current.frame = requestAnimationFrame(swing);
  }, [swing]);

  useEffect(() => {
    sim.current.price = price;
    link.price = level(price);
    link.window = 1 - days / DAYS;
    link.raised = raised ? 1 : 0;
    place();
  }, [price, days, raised, place]);
  useEffect(() => {
    addEventListener("resize", place);
    const state = sim.current;
    return () => { removeEventListener("resize", place); cancelAnimationFrame(state.frame); };
  }, [place]);

  const drag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const box = chart.current;
    if (!box || !sim.current.held) return;
    const r = box.getBoundingClientRect(), anchorY = r.top - RISE * r.height;
    const next = Math.round(Math.min(HIGH, Math.max(LOW, HIGH - ((event.clientY - r.top) / r.height) * (HIGH - LOW))));
    sim.current.phi = Math.max(-0.7, Math.min(0.7, Math.atan2(event.clientX - r.right, Math.max(40, event.clientY - anchorY))));
    sim.current.omega = 0;
    sim.current.price = next;
    setPrice(next);
    place();
  };
  const hold = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    sim.current.held = true;
    setWeighing(true);
  };
  const release = () => {
    if (!sim.current.held) return;
    sim.current.held = false;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { sim.current.phi = 0; place(); setWeighing(false); }
    else if (!sim.current.frame) sim.current.frame = requestAnimationFrame(swing);
  };

  const start = verdict.start, x = (day: number) => (day / DAYS) * 100, y = (value: number) => 100 - level(value) * 100;
  const shown = [[start, priceAt(series, start)] as [number, number], ...series.filter(([day]) => day > start)];
  const path = shown.map(([day, value], i) => (i ? `H${x(day).toFixed(2)}V` : `M${x(day).toFixed(2)} `) + y(value).toFixed(2)).join("") + "H100";
  const [name, text] = t.verdicts[verdict.claim];

  return (
    <>
      <div className="fx-plot">
        <div className="fx-chart" data-fx-chart ref={chart}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={t.chartAlt}>
            {start > 0 && <rect className="fx-unseen" x="0" y="0" width={x(start)} height="100" />}
            <line className="fx-lowline" x1={x(start)} x2="100" y1={y(verdict.lowest)} y2={y(verdict.lowest)} />
            <path className="fx-step" d={path} />
          </svg>
          {start > 0 && <span className="fx-tag fx-tag--unseen" style={{ width: x(start) + "%" }}>{labels.unseen}</span>}
          <span className="fx-tag fx-tag--low" style={{ top: y(verdict.lowest) + "%", left: x(start) + "%" }}>{t.lowest} · {money(verdict.lowest)}</span>
          <span className="fx-tag fx-tag--window">{days} · {t.window}</span>
          <span className="fx-tag fx-tag--today">{t.today} · {money(price)}</span>
          <button className="fx-bob" type="button" ref={bob} tabIndex={-1} aria-hidden="true" onPointerDown={hold} onPointerMove={drag} onPointerUp={release} onPointerCancel={release}><span>{labels.drag}</span></button>
        </div>
      </div>

      <div className="fx-verdict" data-claim={verdict.claim} data-weighing={weighing}>
        <p className="fx-mini">{t.title}</p>
        <p className="fx-claim" aria-hidden="true">{weighing ? labels.weighing : name}</p>
        <p className="fx-reason" aria-hidden={weighing}>{text}</p>
        {/* Screen readers hear the verdict only when the line has settled. */}
        <p className="fx-sr" aria-live="polite">{weighing ? "" : `${name}. ${text}`}</p>
      </div>

      <div className="fx-controls">
        <label className="fx-range">
          <span>{t.price}<b>{money(price)}</b></span>
          <input type="range" min={LOW} max={HIGH} step="1" value={price} onChange={event => { const next = Number(event.target.value); disturb(next > price ? 0.9 : -0.9); setPrice(next); }} />
        </label>
        <label className="fx-range">
          <span>{labels.window}<b>{days}</b></span>
          <input type="range" min="3" max={DAYS} step="1" value={days} onChange={event => { setDays(Number(event.target.value)); disturb(0.8); }} />
        </label>
        <label className="fx-check">
          <input type="checkbox" checked={raised} onChange={event => { setRaised(event.target.checked); disturb(event.target.checked ? 1.4 : -1.4); }} />
          <span>{t.inflated}</span>
        </label>
        <p className="fx-note">{t.note} {labels.rules}</p>
      </div>
    </>
  );
}
