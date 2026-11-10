"use client";

import { useState } from "react";

const edges = [
  { from: 0, to: 1, d: "M16.7 25H50" },
  { from: 1, to: 2, d: "M50 25H83.3" },
  { from: 2, to: 3, d: "M83.3 25V75" },
  { from: 3, to: 4, d: "M83.3 75H50" },
  { from: 4, to: 5, d: "M50 75H16.7" },
  { from: 1, to: 4, d: "M50 25V75" },
];

export default function Workflow({ steps, output, label }: { steps: string[][]; output: string; label: string }) {
  const [active, setActive] = useState(0);
  const [name, description, deliverable] = steps[active];
  return <div className="agent-machine">
    <div className="agent-map">
      <svg className="agent-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {edges.map(({ from, to, d }) => <g key={d}>
          <path d={d} vectorEffect="non-scaling-stroke" className="agent-wire" />
          {(from === active || to === active) && <path key={active} d={d} vectorEffect="non-scaling-stroke" className="agent-pulse" pathLength={100} />}
        </g>)}
      </svg>
      <ol aria-label={label} className="agent-nodes">
        {steps.map(([title], index) => <li key={title} className={`agent-node node-${index}`}>
          <button type="button" aria-pressed={active === index} aria-controls="agent-detail" onClick={() => setActive(index)}>
            <span className="mono" aria-hidden="true">0{index + 1} <i /></span>
            {title}
          </button>
        </li>)}
      </ol>
    </div>
    <div id="agent-detail" className="agent-detail" aria-live="polite" aria-atomic="true">
      <div key={name} className="agent-detail-copy">
        <span className="mono agent-detail-index">/ 0{active + 1}</span>
        <div><h3>{name}</h3><p>{description}</p></div>
        <p className="agent-output"><span className="mono">{output}</span>{deliverable}</p>
      </div>
    </div>
  </div>;
}
