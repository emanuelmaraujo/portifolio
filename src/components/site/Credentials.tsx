"use client";

import { useState } from "react";
import { badges, type Copy } from "./content";

/** Badges ride an orbit in the 3D scene. Choosing a credential turns the orbit until its badge faces the reader. */
export default function Credentials({ t }: { t: Copy["credentials"] }) {
  const [selected, setSelected] = useState(-1);
  return (
    <section id="credentials" className="chapter credentials" data-form="orbit" data-side="1" data-dim="0.5" data-active={selected < 0 ? undefined : 1}
      data-badge={selected} data-badges={badges.map(([, , file]) => `/badges/${file}.png`).join(",")} aria-labelledby="credentials-title">
      <div className="col">
        <p className="label" data-reveal><span>06</span>{t.label}</p>
        <h2 id="credentials-title" data-reveal>{t.title}</h2>
        <p className="intro" data-reveal>{t.intro}</p>
        <ul className="credential-list" onMouseLeave={() => setSelected(-1)}>
          {badges.map(([name, issuer, file, id], i) => (
            <li data-reveal key={file}>
              <button type="button" aria-pressed={i === selected} onClick={() => setSelected(i === selected ? -1 : i)} onMouseEnter={() => setSelected(i)} onFocus={() => setSelected(i)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/badges/${file}.png`} alt="" width="40" height="40" loading="lazy" />
                <b>{name}</b><span>{issuer}</span>
              </button>
              {id && <a href={`https://www.credly.com/badges/${id}/public_url`} target="_blank" rel="noreferrer" aria-label={`${t.verify}: ${name}`} title={t.verify}>↗</a>}
            </li>
          ))}
        </ul>
        <h3 className="mini" data-reveal>{t.educationLabel}</h3>
        <ul className="education">
          {t.education.map(([name, detail]) => <li data-reveal key={name}><b>{name}</b><span>{detail}</span></li>)}
        </ul>
      </div>
    </section>
  );
}
