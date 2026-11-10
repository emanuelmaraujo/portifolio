"use client";

import { useEffect, useRef, useState } from "react";
import type { mountScene } from "./webgl/renderer";

type Controller = NonNullable<ReturnType<typeof mountScene>>;
const models = {
  core: () => import("./webgl/core").then(module => module.buildCore),
  torvya: () => import("./webgl/torvya").then(module => module.buildTorvya),
};

export default function SceneStage({ kind, poster, labels }: {
  kind: keyof typeof models;
  poster: string;
  labels: { pause: string; play: string; left: string; right: string };
}) {
  const stage = useRef<HTMLDivElement>(null);
  const controller = useRef<Controller | null>(null);
  const [available, setAvailable] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let epoch = 0;
    let watcher: IntersectionObserver | undefined;
    const reset = () => {
      const version = ++epoch;
      watcher?.disconnect();
      controller.current?.dispose();
      controller.current = null;
      setAvailable(false);
      setPaused(false);
      if (motion.matches || !("WebGL2RenderingContext" in window)) return;
      watcher = new IntersectionObserver(([entry], observer) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void Promise.all([import("./webgl/renderer"), models[kind]()]).then(([renderer, model]) => {
          if (version !== epoch) return;
          controller.current = renderer.mountScene(host, model, kind);
          if (kind === "torvya") controller.current?.pause(true);
          setAvailable(Boolean(controller.current));
        }).catch(() => { /* The pre-rendered poster remains visible. */ });
      }, { rootMargin: kind === "core" ? "80px" : "30px" });
      watcher.observe(host);
    };
    reset();
    motion.addEventListener("change", reset);
    return () => {
      epoch++;
      watcher?.disconnect();
      controller.current?.dispose();
      controller.current = null;
      motion.removeEventListener("change", reset);
    };
  }, [kind]);

  return <div className={`scene-shell scene-${kind}`}>
    <div className="scene-surface" ref={stage} aria-hidden="true" />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="scene-poster" src={poster} alt="" width={720} height={600} loading={kind === "core" ? "eager" : "lazy"} fetchPriority={kind === "core" ? "high" : "auto"} />
    {available && <div className="scene-controls">
      {kind === "core" ? <button type="button" onClick={() => {
        controller.current?.pause(!paused);
        setPaused(!paused);
      }}>{paused ? labels.play : labels.pause}</button> : <>
        <button type="button" onClick={() => controller.current?.rotate(-1)} aria-label={labels.left}>↶</button>
        <button type="button" onClick={() => controller.current?.rotate(1)} aria-label={labels.right}>↷</button>
      </>}
    </div>}
  </div>;
}
