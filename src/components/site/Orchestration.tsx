"use client";

import { useEffect, useRef, useState } from "react";
import { links, type Copy } from "./content";

type Line = { agent: number; text: string; tone?: "warn" | "ok" };

/**
 * An illustrative agent run. Each step lights its node in the 3D ring and writes one line to the log. The sequence
 * mirrors the reviewed workflow: checks fail once, the agent fixes, an independent review reads the diff, and then the
 * run stops and waits. Nothing is approved until the visitor decides, which is the point of the whole section.
 * No agent is executed here: the lines are scripted.
 */
export default function Orchestration({ t, caption }: { t: Copy["orchestration"]; caption: string }) {
  const [active, setActive] = useState(-1);
  const [log, setLog] = useState<Line[]>([]);
  const [state, setState] = useState<"idle" | "running" | "waiting" | "done">("idle");
  const [revised, setRevised] = useState(false);
  const timers = useRef<number[]>([]);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);

  const a = t.agents;
  const play = (lines: Line[], then: "waiting" | "done") => {
    clear();
    setState("running");
    const pace = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1050;
    timers.current = lines.map((line, i) => window.setTimeout(() => {
      setActive(line.agent);
      setLog(all => [...all, line]);
      if (i === lines.length - 1) setState(then);
    }, 200 + i * pace));
  };
  const run = () => {
    setLog([]);
    setRevised(false);
    play([
      { agent: 0, text: a[0].log }, { agent: 1, text: a[1].log }, { agent: 2, text: a[2].log }, { agent: 3, text: a[3].log },
      { agent: 3, text: t.events.fail, tone: "warn" }, { agent: 2, text: a[2].log }, { agent: 3, text: t.events.fixed, tone: "ok" },
      { agent: 4, text: a[4].log }, { agent: 5, text: a[5].log },
    ], "waiting");
  };
  const approve = () => play([{ agent: 5, text: t.events.done, tone: "ok" }], "done");
  const requestChanges = () => {
    setRevised(true);
    play([
      { agent: 4, text: t.events.changes, tone: "warn" }, { agent: 2, text: a[2].log }, { agent: 3, text: t.events.fixed, tone: "ok" },
      { agent: 4, text: a[4].log }, { agent: 5, text: a[5].log },
    ], "waiting");
  };
  const stop = () => { clear(); setLog(all => [...all, { agent: Math.max(0, active), text: t.events.stopped, tone: "warn" }]); setState("idle"); setActive(-1); };

  return (
    <>
      <section id="orchestration" className="chapter orchestration" data-form="orchestra" data-caption={caption} data-side="1" data-active={active < 0 ? 0 : active + 1} data-dim="0.5" data-lift="0.9" aria-labelledby="orchestration-title">
        <div className="anchors" aria-hidden="true">
          <span className={"tag tag--core" + (state === "running" ? " is-active" : "")} data-anchor="core">{t.core}</span>
          {a.map((agent, i) => (
            <span className={"tag tag--agent" + (i === active ? " is-active" : "")} data-anchor={"agent" + i} key={agent.name}>
              <b>{String(i + 1).padStart(2, "0")} {agent.name}</b><i>{agent.role}</i>
            </span>
          ))}
        </div>
        <div className="sticky">
          <div className="col">
            <p className="label" data-reveal><span>03</span>{t.label}</p>
            <h2 id="orchestration-title" data-reveal>{t.title}</h2>
            <p className="intro" data-reveal>{t.intro}</p>
            <div className="run" data-reveal>
              <ol className="run-steps" aria-hidden="true">
                {a.map((agent, i) => <li className={i === active ? "is-active" : i < active ? "is-past" : undefined} key={agent.name}><span>{String(i + 1).padStart(2, "0")}</span>{agent.name}</li>)}
              </ol>
              <p className="run-actions">
                {state === "waiting" ? (
                  <>
                    <button type="button" className="button button--accent" onClick={approve}>{t.approve}</button>
                    <button type="button" className="button" onClick={requestChanges} disabled={revised}>{t.changes}</button>
                  </>
                ) : state === "running" ? (
                  <>
                    <button type="button" className="button button--accent" disabled><span className="button-dot" />{t.running}</button>
                    <button type="button" className="button" onClick={stop}>{t.stop}</button>
                  </>
                ) : (
                  <button type="button" className="button button--accent" onClick={run}><span className="button-dot" />{state === "done" ? t.again : t.run}</button>
                )}
                <span className="badge">{t.badge}</span>
              </p>
              <p className="run-waiting" role="status">{state === "waiting" ? t.waiting : ""}</p>
              <ol className="log" aria-live="polite">
                {log.map((line, i) => (
                  <li className={line.tone ? "log--" + line.tone : undefined} key={i}>
                    <span>{a[line.agent].name}</span>{line.text}
                  </li>
                ))}
              </ol>
              <p className="note">{t.note}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="chapter orchestration-detail" data-form="orchestra" data-caption={caption} data-side="1" data-dim="0.25" aria-label={t.label}>
        <div className="wide panel" data-spot>
          <ol className="steps-list">
            {a.map((agent, i) => <li key={agent.name}><span>{String(i + 1).padStart(2, "0")}</span><b>{agent.name}</b>{agent.role}</li>)}
          </ol>
          <div className="principles">
            {t.principles.map(([title, text]) => <article key={title} data-reveal><h3>{title}</h3><p>{text}</p></article>)}
          </div>
          <dl className="stats">
            {t.stats.map(([value, text]) => <div key={text} data-reveal><dt>{value}</dt><dd>{text}</dd></div>)}
          </dl>
          <p className="tools">{t.tools}</p>
          <a className="link" href={links.skills} target="_blank" rel="noreferrer">{t.skillsAction}<span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </>
  );
}
