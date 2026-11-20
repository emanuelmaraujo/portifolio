"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { accents, links, type Copy } from "./content";
import Flow from "./Flow";

const Arrow = () => <span aria-hidden="true">↗</span>;
const Stack = ({ label, items }: { label: string; items: string[] }) => (
  <p className="stack"><span>{label}</span>{items.join(" · ")}</p>
);

// Demonstration series for the verdict bench: [day, price]. A row exists only where the price changed.
const SERIES: [number, number][] = [[0, 349], [12, 329], [25, 359], [40, 339], [58, 319], [70, 349], [82, 345]];
const RAISED: [number, number][] = [[0, 349], [12, 329], [25, 359], [40, 339], [58, 319], [70, 349], [79, 389]];
const DAYS = 90, LOW = 280, HIGH = 400;

type Verdict = keyof Copy["work"]["prumo"]["bench"]["verdicts"];

/** A simplified reading of the engine's rules, enough to show how the claim follows from the recorded history. */
function judge(today: number, series: [number, number][], short: boolean, raised: boolean): Verdict {
  if (short) return "started";
  const prices = series.map(([, price]) => price), lowest = Math.min(...prices);
  const typical = [...prices].sort((a, b) => a - b)[Math.floor(prices.length / 2)];
  if (raised && today > lowest * 1.03) return "inflated";
  if (today <= lowest) return "lowest";
  if (today <= lowest * 1.03) return "near";
  return today <= typical * 1.04 ? "typical" : "above";
}

function VerdictBench({ t }: { t: Copy["work"]["prumo"]["bench"] }) {
  const [today, setToday] = useState(319);
  const [short, setShort] = useState(false);
  const [raised, setRaised] = useState(false);
  const series = raised ? RAISED : SERIES;
  const verdict = judge(today, series, short, raised);
  const W = 320, H = 132, x = (day: number) => 8 + (day / DAYS) * (W - 16), y = (price: number) => 12 + (1 - (price - LOW) / (HIGH - LOW)) * (H - 30);
  const path = useMemo(() => {
    const shown = short ? [[DAYS - 3, series[series.length - 1][1]] as [number, number]] : series;
    return shown.map(([day, price], i) => `${i ? "H" + x(day).toFixed(1) + " V" : "M" + x(day).toFixed(1) + " "}${y(price).toFixed(1)}`).join(" ") + ` H${x(DAYS).toFixed(1)}`;
  }, [short, series]);
  const lowest = Math.min(...series.map(([, price]) => price));
  const money = (value: number) => "R$ " + value;
  return (
    <div className="bench" data-verdict={verdict} data-spot>
      <h3 className="mini">{t.title}</h3>
      <svg className="bench-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.chartAlt}>
        {short && <rect className="bench-unseen" x={x(0)} y="8" width={x(DAYS - 3) - x(0)} height={H - 26} />}
        {!short && <><line className="bench-low" x1={x(0)} x2={x(DAYS)} y1={y(lowest)} y2={y(lowest)} /><text className="bench-tick" x={x(0)} y={y(lowest) + 12}>{t.lowest} · {money(lowest)}</text></>}
        <path className="bench-line" d={path} />
        <line className="bench-now" x1={x(DAYS)} x2={x(DAYS)} y1="8" y2={H - 18} />
        <circle className="bench-dot" cx={x(DAYS)} cy={y(today)} r="5" />
        <text className="bench-tick" x={x(0)} y={H - 4}>{short ? 3 : DAYS} · {t.window}</text>
        <text className="bench-tick bench-tick--end" x={x(DAYS)} y={H - 4}>{t.today}</text>
      </svg>
      <label className="bench-price">
        <span>{t.price}<b>{money(today)}</b></span>
        <input type="range" min={LOW} max={HIGH} step="1" value={today} onChange={e => setToday(Number(e.target.value))} />
      </label>
      <div className="bench-switches">
        <label><input type="checkbox" checked={short} onChange={e => setShort(e.target.checked)} /><span>{t.short}</span></label>
        <label><input type="checkbox" checked={raised} onChange={e => setRaised(e.target.checked)} /><span>{t.inflated}</span></label>
      </div>
      <output className="bench-verdict" aria-live="polite">
        <b>{t.verdicts[verdict][0]}</b>{t.verdicts[verdict][1]}
      </output>
      <p className="note">{t.note}</p>
    </div>
  );
}

function Prumo({ t, w }: { t: Copy["work"]["prumo"]; w: WorkCopy }) {
  const [stage, setStage] = useState(0);
  const steps = useMemo(() => t.stages.map(([name, text, enters, leaves]) => ({ name, text, enters, leaves })), [t.stages]);
  return (
    <section id="work" className="chapter project prumo" data-form="prumo" data-caption={w.captions.prumo} data-side="-1" data-accent={accents.prumo} data-active={stage >= 3 ? 1 : 0} data-dim="0.4" style={{ "--accent": accents.prumo } as React.CSSProperties} aria-labelledby="prumo-title">
      <div className="col">
        <p className="label" data-reveal><span>04</span>{w.label}</p>
        <p className="work-title" data-reveal>{w.title}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="brand brand--prumo" src="/work/prumo/logo-negativo.svg" alt="Prumo" width="302" height="128" data-reveal />
        <p className="kind" data-reveal>{t.kind}<b>{t.status}</b></p>
        <h2 id="prumo-title" data-reveal>{t.title}</h2>
        <p className="intro" data-reveal>{t.text}</p>
        <dl className="facts" data-reveal>{t.facts.map(([value, text]) => <div key={text}><dt>{value}</dt><dd>{text}</dd></div>)}</dl>
      </div>
      <div className="wide panel prumo-flow" data-reveal>
        <h3 className="mini">{t.stagesTitle}</h3>
        <Flow steps={steps} label={t.stageLabel} inLabel={t.inLabel} outLabel={t.outLabel} autoplay onChange={setStage} />
        <div className="prumo-proof">
          <VerdictBench t={t.bench} />
          <figure className="offer-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/work/prumo/card-oferta-prumo.png" alt={t.cardAlt} width="1080" height="1350" loading="lazy" />
            <figcaption>{t.cardNote}</figcaption>
          </figure>
        </div>
        <Stack label={w.stackLabel} items={t.stack} />
        <p className="actions">
          <a className="button" href={links.prumo} target="_blank" rel="noreferrer">prumobr.app.br<Arrow /></a>
          <a className="link" href={links.prumoTelegram} target="_blank" rel="noreferrer">{t.channel}<Arrow /></a>
        </p>
      </div>
    </section>
  );
}

/** One tap, followed from the plaque to wherever the owner pointed it. The same code resolves to a new destination. */
function TapFlow({ t, onPhase }: { t: Copy["work"]["torvya"]["flow"]; onPhase: (phase: number) => void }) {
  const [destination, setDestination] = useState(0);
  const [phase, setPhase] = useState(0); // 0 idle, 1 plaque, 2 resolver, 3 destination
  const [arrived, setArrived] = useState<number | null>(null);
  const [changed, setChanged] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { onPhase(phase); }, [phase, onPhase]);

  const tap = () => {
    timers.current.forEach(clearTimeout);
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setChanged(arrived !== null && arrived !== destination);
    const land = () => { setPhase(3); setArrived(destination); };
    if (instant) return land();
    setPhase(1);
    timers.current = [window.setTimeout(() => setPhase(2), 520), window.setTimeout(land, 1100), window.setTimeout(() => setPhase(0), 3600)];
  };

  return (
    <div className="tap-flow" data-phase={phase}>
      <h3 className="mini">{t.title}</h3>
      <ol className="tap-nodes">
        {t.nodes.map(([name, text], i) => (
          <li className={phase === i + 1 ? "is-active" : phase > i + 1 ? "is-past" : undefined} key={name}>
            <span aria-hidden="true">{i + 1}</span>
            <b>{i === 2 && arrived !== null ? t.destinations[arrived] : name}</b>
            <small>{i === 0 ? <>{text} <code>K7Q2</code></> : text}</small>
          </li>
        ))}
      </ol>
      <fieldset className="tap-destinations">
        <legend>{t.destLabel}</legend>
        {t.destinations.map((name, i) => (
          <label key={name}><input type="radio" name="torvya-destination" checked={destination === i} onChange={() => setDestination(i)} /><span>{name}</span></label>
        ))}
      </fieldset>
      <p className="actions">
        <button type="button" className="button button--accent" onClick={tap}><span className="button-dot" />{t.tap}</button>
        <span className="tap-result" role="status">{arrived !== null && phase !== 1 && phase !== 2 ? (changed ? t.same : "→ " + t.destinations[arrived]) : ""}</span>
      </p>
      <p className="note">{t.note}</p>
    </div>
  );
}

function Torvya({ t, w }: { t: Copy["work"]["torvya"]; w: WorkCopy }) {
  const [plaque, setPlaque] = useState("review");
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState(0);
  const rotate = (step: number) => setTurn(value => Math.max(-0.9, Math.min(0.9, value + step)));
  return (
    <section className="chapter project torvya" data-form="torvya" data-caption={w.captions.torvya} data-side="1" data-accent={accents.torvya} data-plaque={plaque} data-turn={turn} data-active={phase ? phase + 1 : undefined} data-dim="0.5" data-lift="0.85" style={{ "--accent": accents.torvya } as React.CSSProperties} aria-labelledby="torvya-title">
      <div className="grab grab--right" data-grab aria-hidden="true"><span>{t.flow.drag}</span></div>
      <div className="col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="brand brand--torvya" src="/work/torvya/torvya-logo-dark.svg" alt="Torvya" width="176" height="48" data-reveal />
        <p className="kind" data-reveal>{t.kind}<b>{t.status}</b></p>
        <h2 id="torvya-title" data-reveal>{t.title}</h2>
        <p className="intro" data-reveal>{t.text}</p>
        <div className="products" role="group" aria-label="Torvya" data-reveal>
          {t.products.map(product => (
            <button type="button" className="product" aria-pressed={plaque === product.id} onClick={() => setPlaque(product.id)} data-spot key={product.id}>
              <b>{product.name}</b><span>{product.text}</span>
            </button>
          ))}
        </div>
        <p className="turns" data-reveal>
          <button type="button" className="chip-button" onClick={() => rotate(-0.45)} aria-label={t.flow.rotate[0]}><span aria-hidden="true">⟲</span></button>
          <button type="button" className="chip-button" onClick={() => rotate(0.45)} aria-label={t.flow.rotate[1]}><span aria-hidden="true">⟳</span></button>
          <span>{t.spec}</span>
        </p>
        <div className="panel" data-reveal data-spot><TapFlow t={t.flow} onPhase={setPhase} /></div>
        <ol className="tap-steps" data-reveal>
          {t.steps.map(([name, text], i) => <li key={name}><span>{i + 1}</span><b>{name}</b>{text}</li>)}
        </ol>
        <Stack label={w.stackLabel} items={t.stack} />
        <p className="actions"><a className="button" href={links.torvya} target="_blank" rel="noreferrer">torvya.app.br<Arrow /></a></p>
        <p className="note">{t.hint}</p>
      </div>
    </section>
  );
}

function Kreps({ t, w }: { t: Copy["work"]["kreps"]; w: WorkCopy }) {
  return (
    <section className="chapter project kreps" data-form="kreps" data-caption={w.captions.kreps} data-side="-1" data-accent={accents.kreps} data-dim="0.35" style={{ "--accent": accents.kreps } as React.CSSProperties} aria-labelledby="kreps-title">
      <div className="col">
        <p className="brand brand--kreps" data-reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/work/kreps/logo.png" alt="" width="72" height="72" loading="lazy" />Marcos Krep’s
        </p>
        <p className="kind" data-reveal>{t.kind}<b>{t.status}</b></p>
        <h2 id="kreps-title" data-reveal>{t.title}</h2>
        <p className="intro" data-reveal>{t.text}</p>
        <Stack label={w.stackLabel} items={t.stack} />
      </div>
      <div className="wide panel kreps-ops" data-spot>
        <div className="phones">
          {t.shots.map(([name, src]) => (
            <figure className="phone" key={src} data-reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div><img src={src} alt={name} loading="lazy" /></div>
              <figcaption>{name}<span>{t.shotNote}</span></figcaption>
            </figure>
          ))}
        </div>
        <div>
          <h3 className="mini">{t.flowTitle}</h3>
          <ol className="order-flow">{t.flow.map((status, i) => <li style={{ "--i": i } as React.CSSProperties} key={status}>{status}</li>)}</ol>
          <div className="points">
            {t.points.map(([title, text]) => <article key={title} data-reveal><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </div>
    </section>
  );
}

export type WorkCopy = Copy["work"] & { captions: Copy["captions"] };

export default function Work({ t }: { t: WorkCopy }) {
  return (
    <>
      <Prumo t={t.prumo} w={t} />
      <Torvya t={t.torvya} w={t} />
      <Kreps t={t.kreps} w={t} />
    </>
  );
}
