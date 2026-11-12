"use client";

import { useEffect, useRef, useState } from "react";
import Mark from "./Mark";

/**
 * The fixed WebGL layer behind the page. The engine is loaded after first paint, so text and links never wait for it.
 * Without WebGL, or after a context loss, the CSS backdrop stays and the page remains complete.
 */
export default function Stage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"idle" | "live" | "off">("idle");

  useEffect(() => {
    let disposed = false, dispose = () => {};
    // The loader stays for a short minimum so it reads as an entrance and never as a flash.
    const ready = () => window.setTimeout(() => { document.documentElement.dataset.ready = "1"; }, Math.max(0, 1500 - performance.now()));
    const start = async () => {
      try {
        const { createEngine } = await import("./scene/engine");
        if (disposed || !canvas.current) return;
        const engine = createEngine(canvas.current, () => setState("off"));
        dispose = engine.dispose;
        setState("live");
      } catch {
        setState("off");
      }
      ready();
    };
    const idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 600 }) : window.setTimeout(start, 120);
    return () => {
      disposed = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle); else clearTimeout(idle);
      dispose();
    };
  }, []);

  return (
    <div className="stage" data-state={state} aria-hidden="true">
      <canvas ref={canvas} />
      {/* Shown only when WebGL is unavailable or its context is lost. */}
      <Mark />
    </div>
  );
}
