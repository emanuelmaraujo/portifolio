"use client";

import { useEffect, useRef, useState } from "react";
import paths from "@/components/site/scene/mark-paths.json";
import type { Pose } from "./piece-scene";

const VIEWS: [Pose, string][] = [["closed", "Fechada"], ["joints", "Juntas"], ["raking", "Luz rasante"]];

/** The still that is always in the HTML: the same geometry, drawn flat with a short extrusion. */
function Poster() {
  const depth = Array.from({ length: 9 }, (_, i) => i + 1);
  const part = (d: string, side: string, face: string) => (
    <g key={d}>
      {depth.map(i => <path d={d} fill={side} transform={`translate(${i * 0.55} ${i * -0.3})`} key={i} />).reverse()}
      <path d={d} fill={face} />
    </g>
  );
  return (
    <svg className="e-poster" viewBox="-4 -2 76 70" aria-hidden="true">
      <defs>
        <linearGradient id="e-alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4f1ea" /><stop offset=".55" stopColor="#c9c6bf" /><stop offset="1" stopColor="#8f8f8c" /></linearGradient>
        <linearGradient id="e-cer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff6c38" /><stop offset="1" stopColor="#d9461a" /></linearGradient>
      </defs>
      <ellipse cx="34" cy="59.5" rx="31" ry="2.6" fill="#000" opacity=".5" />
      {paths.strata.map(d => part(d, "#8c2c0f", "url(#e-cer)"))}
      {part(paths.beam, "#6b6c6a", "url(#e-alu)")}
    </svg>
  );
}

export default function Piece({ caption, layers, beam }: { caption: string; layers: string[]; beam: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ setPose(pose: Pose): void; dispose(): void } | null>(null);
  const [live, setLive] = useState(false);
  const [pose, setPose] = useState<Pose>("closed");

  useEffect(() => {
    let cancelled = false;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    const start = async () => {
      try {
        const { createPiece } = await import("./piece-scene");
        if (cancelled || !canvas.current) return;
        api.current = createPiece(canvas.current, matchMedia("(prefers-reduced-motion: reduce)").matches);
        setLive(true);
      } catch { /* No WebGL: the poster stays and the view buttons stay hidden. */ }
    };
    const idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 600 }) : window.setTimeout(start, 120);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle); else clearTimeout(idle);
      api.current?.dispose();
      api.current = null;
    };
  }, []);

  return (
    <figure className="e-piece" data-live={live} data-pose={pose}>
      <div className="e-piece-stage">
        <Poster />
        <canvas ref={canvas} aria-hidden="true" />
      </div>
      <figcaption>
        <span className="e-fig">Fig. 01</span>{caption}
        <ol className="e-legend" reversed>
          {layers.map((name, i) => <li key={name}><i>{String(3 - i).padStart(2, "0")}</i>{name}<span>cerâmica</span></li>)}
          <li className="is-beam"><i>—</i>{beam}<span>alumínio</span></li>
        </ol>
      </figcaption>
      {/* The buttons only exist while there is a scene for them to turn. */}
      <div className="e-views" role="group" aria-label="Vistas da peça" hidden={!live}>
        {VIEWS.map(([id, name]) => (
          <button type="button" aria-pressed={pose === id} onClick={() => { setPose(id); api.current?.setPose(id); }} key={id}>{name}</button>
        ))}
      </div>
    </figure>
  );
}
