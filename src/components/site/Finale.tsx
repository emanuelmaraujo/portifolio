"use client";

import { useEffect, useRef } from "react";

/**
 * The closing gesture: while the last chapter is on screen, light climbs the three strata of the mark and reaches the
 * beam, then rests. It repeats the idea of the whole page in one figure.
 */
export default function Finale() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const chapter = ref.current?.closest<HTMLElement>("[data-form]");
    if (!chapter || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sequence = ["3", "2", "1", "0", "", ""]; // strata from the base up, then the beam, then rest
    let step = 0, timer = 0;
    const tick = () => {
      const group = sequence[step++ % sequence.length];
      if (group) chapter.dataset.active = group; else delete chapter.dataset.active;
    };
    const observer = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(tick, 620);
      else delete chapter.dataset.active;
    }, { threshold: 0.35 });
    observer.observe(chapter);
    return () => { clearInterval(timer); observer.disconnect(); delete chapter.dataset.active; };
  }, []);
  return <span ref={ref} hidden />;
}
