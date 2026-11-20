"use client";

import { useEffect, useId, useRef, useState } from "react";

export type FlowStep = { name: string; text: string; enters?: string; leaves?: string };

/**
 * A pipeline you can walk through. The track lights up to the chosen stage and packets travel along the lit part.
 * It is a tab list underneath: arrow keys move between stages, a swipe on the panel does the same on touch screens,
 * and without scripts every stage is simply printed in order.
 *
 * `autoplay` walks the stages while the diagram is in view, until the reader touches it.
 */
export default function Flow({ steps, label, inLabel, outLabel, autoplay = false, onChange }: {
  steps: FlowStep[]; label: string; inLabel?: string; outLabel?: string; autoplay?: boolean; onChange?: (index: number) => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [auto, setAuto] = useState(autoplay);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { onChange?.(at); }, [at, onChange]);

  useEffect(() => {
    if (!auto || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(() => setAt(i => (i + 1) % steps.length), 3600);
    }, { threshold: 0.5 });
    if (root.current) observer.observe(root.current);
    return () => { clearInterval(timer); observer.disconnect(); };
  }, [auto, steps.length]);

  const go = (index: number, focus = false) => {
    const next = (index + steps.length) % steps.length;
    setAuto(false);
    setAt(next);
    if (focus) root.current?.querySelector<HTMLButtonElement>(`[data-step="${next}"]`)?.focus();
  };

  return (
    <div className="flow" ref={root} style={{ "--n": steps.length, "--at": at } as React.CSSProperties}>
      <div className="flow-rail">
        <div className="flow-track" aria-hidden="true">{[0, 1, 2, 3].map(i => <i style={{ "--i": i } as React.CSSProperties} key={i} />)}</div>
        <div className="flow-steps" role="tablist" aria-label={label}
          onKeyDown={e => {
            const move = e.key === "ArrowRight" || e.key === "ArrowDown" ? at + 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? at - 1 : e.key === "Home" ? 0 : e.key === "End" ? steps.length - 1 : null;
            if (move === null) return;
            e.preventDefault();
            go(move, true);
          }}>
          {steps.map((step, i) => (
            <button type="button" role="tab" id={`${id}-tab-${i}`} aria-selected={i === at} aria-controls={`${id}-panel-${i}`} tabIndex={i === at ? 0 : -1} data-step={i}
              className={i === at ? "is-active" : i < at ? "is-past" : undefined} onClick={() => go(i)} key={step.name}>
              <span>{String(i + 1).padStart(2, "0")}</span><b>{step.name}</b>
            </button>
          ))}
        </div>
      </div>
      <div className="flow-panels"
        onTouchStart={e => { swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchEnd={e => {
          const from = swipe.current, end = e.changedTouches[0];
          swipe.current = null;
          if (!from) return;
          const dx = end.clientX - from.x, dy = end.clientY - from.y;
          if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) go(Math.max(0, Math.min(steps.length - 1, at + (dx < 0 ? 1 : -1))));
        }}>
        {steps.map((step, i) => (
          <div role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} className={i === at ? "flow-panel is-active" : "flow-panel"} key={step.name}>
            <p className="flow-name"><span>{String(i + 1).padStart(2, "0")}</span>{step.name}</p>
            <p className="flow-text">{step.text}</p>
            {step.enters && step.leaves && (
              <dl className="flow-io">
                <div><dt>{inLabel}</dt><dd>{step.enters}</dd></div>
                <i aria-hidden="true">→</i>
                <div><dt>{outLabel}</dt><dd>{step.leaves}</dd></div>
              </dl>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
