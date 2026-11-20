"use client";

import { useEffect, useRef, useState } from "react";
import Mark from "./Mark";
import { pickTier } from "./scene/quality";

/**
 * The fixed WebGL layer behind the page. The text never waits for it: the tier is decided first, and the engine (with
 * three.js) is only downloaded when the device will actually run it. Without WebGL, on the static tier or after a
 * context loss, the CSS backdrop and the mark stay and the page remains complete.
 */
export default function Stage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"idle" | "live" | "off">("idle");

  useEffect(() => {
    let disposed = false, dispose = () => {}, idle = 0;
    const start = async () => {
      const tier = pickTier();
      document.documentElement.dataset.quality = tier;
      if (tier === "static") { setState("off"); dispatchEvent(new CustomEvent("scene:quality", { detail: { tier } })); return; }
      try {
        const { createEngine } = await import("./scene/engine");
        if (disposed || !canvas.current) return;
        dispose = createEngine(canvas.current, tier, () => setState("off")).dispose;
        setState("live");
      } catch {
        setState("off");
      }
    };
    const schedule = () => { idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 500 }) : window.setTimeout(start, 80); };
    const cancel = () => { if (window.cancelIdleCallback) window.cancelIdleCallback(idle); else clearTimeout(idle); };
    // The visitor changed the motion setting: tear the scene down and build it again at the new tier.
    const restart = () => { cancel(); dispose(); dispose = () => {}; setState("idle"); schedule(); };
    schedule();
    addEventListener("scene:preference", restart);
    return () => { disposed = true; cancel(); removeEventListener("scene:preference", restart); dispose(); };
  }, []);

  return (
    <div className="stage" data-state={state} aria-hidden="true">
      <canvas ref={canvas} />
      {/* Shown only when the scene is not running. */}
      <Mark />
    </div>
  );
}
