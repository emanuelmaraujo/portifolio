"use client";

import { useState } from "react";

export default function Workflow({ steps, output }: { steps: string[][]; output: string }) {
  const [active, setActive] = useState(0);
  return <ol className="flow" aria-label={output}>
    {steps.map(([title, description, deliverable], index) =>
      <li key={title} className={active === index ? "flow-item active" : "flow-item"}>
        <button type="button" aria-expanded={active === index} aria-controls={`flow-${index}`} onClick={() => setActive(active === index ? -1 : index)}>
          <span className="mono" aria-hidden="true">0{index + 1}</span>{title}<span aria-hidden="true">{active === index ? "−" : "+"}</span>
        </button>
        <div className="flow-panel" id={`flow-${index}`} hidden={active !== index}>
          <p>{description}</p>
          <p className="flow-output"><small className="mono">{output}</small>{deliverable}</p>
        </div>
      </li>
    )}
  </ol>;
}
