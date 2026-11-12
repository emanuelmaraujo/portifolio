"use client";

import { useEffect, useRef, useState } from "react";
import type { Copy } from "./content";

type Step = { agent: number; line: string; tone?: "warn" | "ok" };

/**
 * An agent run you can start. Each step lights its node in the 3D ring and writes one line to the log.
 * The sequence mirrors the reviewed workflow: checks fail once, the agent fixes, review and human approval follow.
 */
export default function Orchestration({ t }: { t: Copy["orchestration"] }) {
  const [active, setActive] = useState(-1);
  const [log, setLog] = useState<Step[]>([]);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    timers.current.forEach(clearTimeout);
    const a = t.agents;
    const steps: Step[] = [
      { agent: 0, line: a[0].log }, { agent: 1, line: a[1].log }, { agent: 2, line: a[2].log }, { agent: 3, line: a[3].log },
      { agent: 3, line: t.events.fail, tone: "warn" }, { agent: 2, line: a[2].log }, { agent: 3, line: t.events.fixed, tone: "ok" },
      { agent: 4, line: a[4].log }, { agent: 5, line: a[5].log }, { agent: 5, line: t.events.done, tone: "ok" },
    ];
    setLog([]);
    setState("running");
    timers.current = steps.map((step, i) => window.setTimeout(() => {
      setActive(step.agent);
      setLog(lines => [...lines, step]);
      if (i === steps.length - 1) setState("done");
    }, 250 + i * 1150));
  };

  return (
    <>
      <section id="orchestration" className="chapter orchestration" data-form="orchestra" data-side="1" data-active={active < 0 ? 0 : active + 1} data-dim="0.5" data-lift="0.9" aria-labelledby="orchestration-title">
        <div className="anchors" aria-hidden="true">
          <span className={"tag tag--core" + (state === "running" ? " is-active" : "")} data-anchor="core">{t.core}</span>
          {t.agents.map((agent, i) => (
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
              <button type="button" className="button button--accent" onClick={run} disabled={state === "running"}>
                <span className="button-dot" />{state === "running" ? t.running : state === "done" ? t.again : t.run}
              </button>
              <ol className="log" aria-live="polite">
                {log.map((step, i) => (
                  <li className={step.tone ? "log--" + step.tone : undefined} key={i}>
                    <span>{t.agents[step.agent].name}</span>{step.line}
                  </li>
                ))}
              </ol>
              <p className="note">{t.note}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="chapter orchestration-detail" data-form="orchestra" data-side="1" data-dim="0.25" aria-label={t.label}>
        <div className="wide panel">
          <ol className="steps-list">
            {t.agents.map((agent, i) => <li key={agent.name}><span>{String(i + 1).padStart(2, "0")}</span><b>{agent.name}</b>{agent.role}</li>)}
          </ol>
          <div className="principles">
            {t.principles.map(([title, text]) => <article key={title} data-reveal><h3>{title}</h3><p>{text}</p></article>)}
          </div>
          <dl className="stats">
            {t.stats.map(([value, text]) => <div key={text} data-reveal><dt>{value}</dt><dd>{text}</dd></div>)}
          </dl>
          <p className="tools">{t.tools}</p>
          <a className="link" href="https://github.com/emanuelmaraujo/skills" target="_blank" rel="noreferrer">{t.skillsAction}<span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </>
  );
}
