"use client";

import { useRef, useState, type ReactNode } from "react";
import Flow, { type FlowStep } from "../Flow";
import { prioritise, PRIORITIES, type Criticality, type Exploitation, type Exposure, type Input, type Priority } from "@/lib/risk-model";

/**
 * Interactive pieces for articles. They are plain form controls and text: none of them needs the 3D scene, all of them
 * work with a keyboard and a screen reader, and each states what it is (an illustration, a teaching model) and where
 * it stops being true.
 */

export type Lang = "pt" | "en";

function Widget({ title, kind, note, children }: { title: string; kind: string; note?: ReactNode; children: ReactNode }) {
  return (
    <figure className="widget" data-spot>
      <p className="widget-head"><span className="badge">{kind}</span><b>{title}</b></p>
      {children}
      {note && <figcaption className="note">{note}</figcaption>}
    </figure>
  );
}

function Choice<T extends string>({ legend, name, value, options, onChange }: { legend: string; name: string; value: T; options: [T, string][]; onChange: (value: T) => void }) {
  return (
    <fieldset className="choice">
      <legend>{legend}</legend>
      <div>
        {options.map(([option, label]) => (
          <label key={option}><input type="radio" name={name} checked={value === option} onChange={() => onChange(option)} /><span>{label}</span></label>
        ))}
      </div>
    </fieldset>
  );
}

// Code blocks ------------------------------------------------------------------

export function CodeBlock({ children, lang, language }: { children: ReactNode; lang: Lang; language?: string }) {
  const pre = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pre.current?.innerText ?? "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { /* Clipboard unavailable: the code is still selectable. */ }
  };
  const t = lang === "en" ? ["Copy", "Copied"] : ["Copiar", "Copiado"];
  return (
    <div className="code">
      <p className="code-bar"><span>{language ?? "text"}</span><button type="button" className="copy" onClick={copy} aria-live="polite">{copied ? t[1] : t[0]}</button></p>
      <pre ref={pre} tabIndex={0}>{children}</pre>
    </div>
  );
}

// Decision simulator -------------------------------------------------------------

const SIM = {
  pt: {
    kind: "Interativo", title: "Simulador de decisão: a mesma falha, contextos diferentes",
    presets: "Cenários", scenarios: ["CVSS 9,8 em servidor de laboratório isolado", "CVSS 6,5 explorada, exposta à internet", "CVSS 7,5 interna, com prova de conceito"],
    cvss: "Severidade técnica (CVSS base)", bands: { none: "Nenhuma", low: "Baixa", medium: "Média", high: "Alta", critical: "Crítica" },
    exploitation: "Exploração conhecida", exploitationOptions: [["none", "Nenhuma evidência"], ["poc", "Prova de conceito pública"], ["active", "Exploração ativa"]] as [Exploitation, string][],
    exposure: "Exposição do ativo", exposureOptions: [["isolated", "Isolado"], ["internal", "Rede interna"], ["internet", "Exposto à internet"]] as [Exposure, string][],
    criticality: "Criticidade para o negócio", criticalityOptions: [["low", "Baixa"], ["medium", "Média"], ["high", "Alta"]] as [Criticality, string][],
    compensated: "Existe controle compensatório verificado (por exemplo, regra de WAF ou segmentação)",
    result: "Tratamento sugerido", alone: "Só pelo CVSS", why: "Por que",
    priorities: {
      act: ["Agir agora", "Tratar fora da janela normal: corrigir, mitigar ou isolar, com acompanhamento como se fosse um incidente em potencial."],
      expedite: ["Antecipar", "Entrar na próxima janela disponível, à frente do ciclo normal, com responsável e data definidos."],
      scheduled: ["Ciclo normal", "Corrigir dentro do ciclo regular de atualizações previsto na política."],
      track: ["Acompanhar", "Registrar a decisão e reavaliar quando o contexto mudar: nova exploração, nova exposição ou mudança no ativo."],
    } as Record<Priority, [string, string]>,
    rules: {
      "exploited-reachable": "Há exploração ativa, o ativo é alcançável e tem valor para o negócio. Os três juntos descrevem um ataque em andamento contra algo que importa.",
      "exploited-internet": "Há exploração ativa e o ativo está exposto à internet. Mesmo com criticidade baixa, ele pode servir de porta de entrada.",
      "everything-but-exploitation": "Falta apenas a confirmação de exploração: a falha é severa, o ativo está exposto e é valioso. Esperar pela evidência seria esperar pelo incidente.",
      "one-strong-signal": "Há um sinal forte (exploração ativa, exposição com severidade crítica ou contexto muito desfavorável), mas não a combinação completa.",
      "some-signal": "Existe algum sinal de risco, sem urgência demonstrada. O ciclo normal é suficiente, desde que seja cumprido.",
      "nothing-pressing": "Sem exploração conhecida, sem exposição relevante e com baixo valor. Corrigir agora tiraria capacidade de algo mais urgente.",
    },
    eased: "O controle compensatório foi considerado e baixou a classe em um nível. Ele compra tempo, não elimina a correção.",
    refused: "O controle compensatório foi informado, mas não foi considerado: com exploração ativa em ativo exposto, a decisão não deve depender de um único controle.",
    differs: "O CVSS sozinho colocaria esta falha em outra posição da fila.", same: "Neste caso o contexto confirma o que a severidade já indicava.",
    limits: "Limitações deste modelo",
    limitList: [
      "É um modelo didático, criado para este artigo. Não é o SSVC, o EPSS nem qualquer padrão, e não gera pontuação.",
      "Os fatores têm três níveis cada. A realidade tem mais nuance: caminhos de ataque, privilégios exigidos, dados envolvidos.",
      "As respostas dependem de inventário e de inteligência de ameaças confiáveis. Com dados ruins, o resultado é ruim.",
      "Prazos e exceções devem vir da política da sua organização e das obrigações regulatórias aplicáveis.",
    ],
  },
  en: {
    kind: "Interactive", title: "Decision simulator: the same flaw in different contexts",
    presets: "Scenarios", scenarios: ["CVSS 9.8 on an isolated lab server", "CVSS 6.5, exploited, internet-facing", "CVSS 7.5, internal, with a proof of concept"],
    cvss: "Technical severity (CVSS base)", bands: { none: "None", low: "Low", medium: "Medium", high: "High", critical: "Critical" },
    exploitation: "Known exploitation", exploitationOptions: [["none", "No evidence"], ["poc", "Public proof of concept"], ["active", "Active exploitation"]] as [Exploitation, string][],
    exposure: "Asset exposure", exposureOptions: [["isolated", "Isolated"], ["internal", "Internal network"], ["internet", "Internet-facing"]] as [Exposure, string][],
    criticality: "Business criticality", criticalityOptions: [["low", "Low"], ["medium", "Medium"], ["high", "High"]] as [Criticality, string][],
    compensated: "A verified compensating control exists (for example a WAF rule or segmentation)",
    result: "Suggested handling", alone: "By CVSS alone", why: "Why",
    priorities: {
      act: ["Act now", "Handle outside the normal window: fix, mitigate or isolate, and follow it as you would a potential incident."],
      expedite: ["Expedite", "Take it in the next available window, ahead of the normal cycle, with an owner and a date."],
      scheduled: ["Normal cycle", "Fix within the regular update cycle set by policy."],
      track: ["Track", "Record the decision and reassess when the context changes: new exploitation, new exposure or a change in the asset."],
    } as Record<Priority, [string, string]>,
    rules: {
      "exploited-reachable": "Exploitation is active, the asset is reachable and it matters to the business. Together they describe an attack under way against something that counts.",
      "exploited-internet": "Exploitation is active and the asset is internet-facing. Even at low criticality it can be the way in.",
      "everything-but-exploitation": "Only confirmed exploitation is missing: the flaw is severe, the asset is exposed and valuable. Waiting for the evidence would be waiting for the incident.",
      "one-strong-signal": "One strong signal is present (active exploitation, exposure with critical severity or a very unfavourable context), but not the full combination.",
      "some-signal": "There is some sign of risk and no demonstrated urgency. The normal cycle is enough, provided it is kept.",
      "nothing-pressing": "No known exploitation, no relevant exposure and low value. Fixing it now would take capacity from something more urgent.",
    },
    eased: "The compensating control was credited and lowered the class by one step. It buys time. It does not replace the fix.",
    refused: "A compensating control was declared and not credited: with active exploitation on an exposed asset, the decision should not rest on a single control.",
    differs: "CVSS alone would put this flaw somewhere else in the queue.", same: "Here the context confirms what the severity already suggested.",
    limits: "Limits of this model",
    limitList: [
      "It is a teaching model written for this article. It is not SSVC, EPSS or any standard, and it produces no score.",
      "Each factor has three levels. Reality has more nuance: attack paths, privileges required, the data involved.",
      "The answers depend on a reliable inventory and reliable threat intelligence. Poor data in, poor decision out.",
      "Deadlines and exceptions must come from your organisation's policy and from the regulations that apply to it.",
    ],
  },
};

const SCENARIOS: Input[] = [
  { cvss: 9.8, exploitation: "none", exposure: "isolated", criticality: "low", compensated: false },
  { cvss: 6.5, exploitation: "active", exposure: "internet", criticality: "high", compensated: false },
  { cvss: 7.5, exploitation: "poc", exposure: "internal", criticality: "medium", compensated: false },
];

export function DecisionSimulator({ lang }: { lang: Lang }) {
  const t = SIM[lang];
  const [input, setInput] = useState<Input>(SCENARIOS[0]);
  const set = (patch: Partial<Input>) => setInput(current => ({ ...current, ...patch }));
  const decision = prioritise(input);
  const number = input.cvss.toLocaleString(lang === "en" ? "en-GB" : "pt-BR", { minimumFractionDigits: 1 });
  return (
    <Widget title={t.title} kind={t.kind}>
      <div className="sim">
        <div className="sim-inputs">
          <div className="sim-presets" role="group" aria-label={t.presets}>
            {t.scenarios.map((name, i) => <button type="button" className="chip-button" aria-pressed={JSON.stringify(input) === JSON.stringify(SCENARIOS[i])} onClick={() => setInput(SCENARIOS[i])} key={name}>{name}</button>)}
          </div>
          <label className="sim-cvss">
            <span>{t.cvss}<b>{number} · {t.bands[decision.severity]}</b></span>
            <input type="range" min="0" max="10" step="0.1" value={input.cvss} onChange={e => set({ cvss: Number(e.target.value) })} aria-valuetext={`${number}, ${t.bands[decision.severity]}`} />
          </label>
          <Choice legend={t.exploitation} name="sim-exploitation" value={input.exploitation} options={t.exploitationOptions} onChange={exploitation => set({ exploitation })} />
          <Choice legend={t.exposure} name="sim-exposure" value={input.exposure} options={t.exposureOptions} onChange={exposure => set({ exposure })} />
          <Choice legend={t.criticality} name="sim-criticality" value={input.criticality} options={t.criticalityOptions} onChange={criticality => set({ criticality })} />
          <label className="sim-check"><input type="checkbox" checked={input.compensated} onChange={e => set({ compensated: e.target.checked })} /><span>{t.compensated}</span></label>
        </div>
        <output className="sim-result" data-priority={decision.priority} aria-live="polite">
          <span className="sim-label">{t.result}</span>
          <strong>{t.priorities[decision.priority][0]}</strong>
          <ol className="sim-scale" aria-hidden="true">{PRIORITIES.map(p => <li className={p === decision.priority ? "is-on" : p === decision.byCvssAlone ? "is-cvss" : undefined} key={p}>{t.priorities[p][0]}</li>)}</ol>
          <p>{t.priorities[decision.priority][1]}</p>
          <p className="sim-alone"><span>{t.alone}</span>{t.priorities[decision.byCvssAlone][0]}. {decision.byCvssAlone === decision.priority ? t.same : t.differs}</p>
          <p className="sim-why"><span>{t.why}</span>{t.rules[decision.rule]}{decision.eased && " " + t.eased}{decision.refused && " " + t.refused}</p>
        </output>
      </div>
      <details className="sim-limits" open>
        <summary>{t.limits}</summary>
        <ul>{t.limitList.map(line => <li key={line}>{line}</li>)}</ul>
      </details>
    </Widget>
  );
}

// Risk matrix ---------------------------------------------------------------------

const MATRIX = {
  pt: {
    kind: "Interativo", title: "Matriz de risco: o apetite muda a cor da célula",
    likelihood: "Probabilidade", impact: "Impacto", appetite: "Apetite a risco", appetites: ["Conservador", "Moderado", "Tolerante"],
    bands: ["Baixo", "Moderado", "Alto", "Crítico"], cell: (l: number, i: number, band: string) => `Probabilidade ${l} de 5, impacto ${i} de 5: ${band}`,
    reading: (l: number, i: number, band: string, appetite: string) => `Probabilidade ${l}, impacto ${i}: risco ${band.toLowerCase()} com apetite ${appetite.toLowerCase()}.`,
    note: "As faixas são ilustrativas. Escalas de 1 a 5 são ordinais: multiplicá-las é uma convenção útil para ordenar, não uma medida. Quem define os limites é a organização, ao declarar seu apetite a risco.",
    grid: "Matriz de probabilidade por impacto. Use as setas para percorrer.",
  },
  en: {
    kind: "Interactive", title: "Risk matrix: appetite changes the colour of the cell",
    likelihood: "Likelihood", impact: "Impact", appetite: "Risk appetite", appetites: ["Conservative", "Moderate", "Tolerant"],
    bands: ["Low", "Moderate", "High", "Critical"], cell: (l: number, i: number, band: string) => `Likelihood ${l} of 5, impact ${i} of 5: ${band}`,
    reading: (l: number, i: number, band: string, appetite: string) => `Likelihood ${l}, impact ${i}: ${band.toLowerCase()} risk under a ${appetite.toLowerCase()} appetite.`,
    note: "The bands are illustrative. Scales from 1 to 5 are ordinal: multiplying them is a convention that helps ordering, not a measurement. The thresholds are set by the organisation when it states its risk appetite.",
    grid: "Likelihood by impact matrix. Use the arrow keys to move.",
  },
};
// Lower bounds of moderate, high and critical for each appetite.
const THRESHOLDS = [[4, 8, 15], [5, 12, 20], [8, 15, 25]];
const bandOf = (score: number, appetite: number) => THRESHOLDS[appetite].filter(limit => score >= limit).length;

export function RiskMatrix({ lang }: { lang: Lang }) {
  const t = MATRIX[lang];
  const [cell, setCell] = useState({ l: 4, i: 3 });
  const [appetite, setAppetite] = useState(1);
  const grid = useRef<HTMLDivElement>(null);
  const move = (l: number, i: number) => {
    const next = { l: Math.max(1, Math.min(5, l)), i: Math.max(1, Math.min(5, i)) };
    setCell(next);
    grid.current?.querySelector<HTMLButtonElement>(`[data-cell="${next.l}-${next.i}"]`)?.focus();
  };
  const band = bandOf(cell.l * cell.i, appetite);
  return (
    <Widget title={t.title} kind={t.kind} note={t.note}>
      <div className="matrix">
        <div className="matrix-board">
          <span className="matrix-axis matrix-axis--y" aria-hidden="true">{t.impact} →</span>
          <div className="matrix-grid" role="group" aria-label={t.grid} ref={grid}
            onKeyDown={e => {
              const step: Record<string, [number, number]> = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
              if (!step[e.key]) return;
              e.preventDefault();
              move(cell.l + step[e.key][0], cell.i + step[e.key][1]);
            }}>
            {[5, 4, 3, 2, 1].map(i => [1, 2, 3, 4, 5].map(l => {
              const on = cell.l === l && cell.i === i, level = bandOf(l * i, appetite);
              return <button type="button" data-cell={`${l}-${i}`} data-band={level} aria-pressed={on} aria-label={t.cell(l, i, t.bands[level])} tabIndex={on ? 0 : -1} onClick={() => setCell({ l, i })} key={`${l}-${i}`}>{l * i}</button>;
            }))}
          </div>
          <span className="matrix-axis" aria-hidden="true">{t.likelihood} →</span>
        </div>
        <div className="matrix-side">
          <Choice legend={t.appetite} name="matrix-appetite" value={String(appetite)} options={t.appetites.map((name, i) => [String(i), name] as [string, string])} onChange={value => setAppetite(Number(value))} />
          <output className="matrix-reading" data-band={band} aria-live="polite"><strong>{t.bands[band]}</strong>{t.reading(cell.l, cell.i, t.bands[band], t.appetites[appetite])}</output>
          <ul className="matrix-legend" aria-hidden="true">{t.bands.map((name, i) => <li data-band={i} key={name}>{name}</li>)}</ul>
        </div>
      </div>
    </Widget>
  );
}

// Data flow -----------------------------------------------------------------------

export function DataFlowDiagram({ lang, title, steps, note }: { lang: Lang; title: string; steps: FlowStep[]; note?: string }) {
  const t = lang === "en" ? { kind: "Interactive", enters: "In", leaves: "Out" } : { kind: "Interativo", enters: "Entra", leaves: "Sai" };
  return (
    <Widget title={title} kind={t.kind} note={note}>
      <Flow steps={steps} label={title} inLabel={t.enters} outLabel={t.leaves} />
    </Widget>
  );
}

// Callout -------------------------------------------------------------------------

export function Callout({ title, children }: { title?: string; children: ReactNode }) {
  return <aside className="callout">{title && <p className="callout-title">{title}</p>}{children}</aside>;
}
