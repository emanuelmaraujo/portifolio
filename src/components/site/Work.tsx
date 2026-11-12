"use client";

import { useState } from "react";
import { accents, links, type Copy } from "./content";

const Arrow = () => <span aria-hidden="true">↗</span>;
const Stack = ({ label, items }: { label: string; items: string[] }) => (
  <p className="stack"><span>{label}</span>{items.join(" · ")}</p>
);

function Prumo({ t, w }: { t: Copy["work"]["prumo"]; w: Copy["work"] }) {
  const [stage, setStage] = useState(0);
  return (
    <section id="work" className="chapter project prumo" data-form="prumo" data-side="-1" data-accent={accents.prumo} data-active={stage >= 2 ? 1 : 0} data-dim="0.4" style={{ "--accent": accents.prumo } as React.CSSProperties} aria-labelledby="prumo-title">
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
      <div className="wide panel prumo-flow">
        <div>
          <h3 className="mini">{t.stagesTitle}</h3>
          <ol className="stages" style={{ "--stage": stage } as React.CSSProperties}>
            {t.stages.map(([name, text], i) => (
              <li className={i === stage ? "is-active" : i < stage ? "is-past" : undefined} key={name}>
                <button type="button" aria-expanded={i === stage} onClick={() => setStage(i)} onMouseEnter={() => setStage(i)} onFocus={() => setStage(i)}>
                  <span>{String(i + 1).padStart(2, "0")}</span>{name}
                </button>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <Stack label={w.stackLabel} items={t.stack} />
          <p className="actions">
            <a className="button" href={links.prumo} target="_blank" rel="noreferrer">prumobr.app.br<Arrow /></a>
            <a className="link" href={links.prumoTelegram} target="_blank" rel="noreferrer">{t.channel}<Arrow /></a>
          </p>
        </div>
        <figure className="offer-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/work/prumo/card-oferta-prumo.png" alt={t.cardAlt} width="1080" height="1350" loading="lazy" />
          <figcaption>{t.cardNote}</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Torvya({ t, w }: { t: Copy["work"]["torvya"]; w: Copy["work"] }) {
  const [plaque, setPlaque] = useState("review");
  return (
    <section className="chapter project torvya" data-form="torvya" data-side="1" data-accent={accents.torvya} data-plaque={plaque} data-dim="0.5" data-lift="0.85" style={{ "--accent": accents.torvya } as React.CSSProperties} aria-labelledby="torvya-title">
      <div className="col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="brand brand--torvya" src="/work/torvya/torvya-logo-dark.svg" alt="Torvya" width="176" height="48" data-reveal />
        <p className="kind" data-reveal>{t.kind}<b>{t.status}</b></p>
        <h2 id="torvya-title" data-reveal>{t.title}</h2>
        <p className="intro" data-reveal>{t.text}</p>
        <div className="products" role="group" aria-label="Torvya" data-reveal>
          {t.products.map(product => (
            <button type="button" className="product" aria-pressed={plaque === product.id} onClick={() => setPlaque(product.id)} key={product.id}>
              <b>{product.name}</b><span>{product.text}</span>
            </button>
          ))}
        </div>
        <ol className="tap-steps" data-reveal>
          {t.steps.map(([name, text], i) => <li key={name}><span>{i + 1}</span><b>{name}</b>{text}</li>)}
        </ol>
        <p className="spec" data-reveal>{t.spec}</p>
        <Stack label={w.stackLabel} items={t.stack} />
        <p className="actions"><a className="button" href={links.torvya} target="_blank" rel="noreferrer">torvya.app.br<Arrow /></a></p>
        <p className="note">{t.hint}</p>
      </div>
    </section>
  );
}

function Kreps({ t, w }: { t: Copy["work"]["kreps"]; w: Copy["work"] }) {
  return (
    <section className="chapter project kreps" data-form="kreps" data-side="-1" data-accent={accents.kreps} data-dim="0.35" style={{ "--accent": accents.kreps } as React.CSSProperties} aria-labelledby="kreps-title">
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
      <div className="wide panel kreps-ops">
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

export default function Work({ t }: { t: Copy["work"] }) {
  return (
    <>
      <Prumo t={t.prumo} w={t} />
      <Torvya t={t.torvya} w={t} />
      <Kreps t={t.kreps} w={t} />
    </>
  );
}
