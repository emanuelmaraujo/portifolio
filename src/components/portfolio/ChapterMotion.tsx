"use client";

import { useEffect } from "react";

export default function ChapterMotion() {
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const bridges = document.querySelectorAll<HTMLElement>(".chapter-bridge");
    let observer: IntersectionObserver | undefined;
    const sync = () => {
      observer?.disconnect();
      bridges.forEach(bridge => delete bridge.dataset.active);
      if (media.matches || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          (entry.target as HTMLElement).dataset.active = String(entry.isIntersecting);
        }
      }, { threshold: .35 });
      bridges.forEach(bridge => observer?.observe(bridge));
    };
    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      observer?.disconnect();
      bridges.forEach(bridge => delete bridge.dataset.active);
    };
  }, []);
  return null;
}
