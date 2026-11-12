"use client";

import { useEffect } from "react";

/** Marks `[data-reveal]` elements as they enter the viewport. CSS owns the motion and its reduced-motion alternative. */
export default function Reveals() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("is-in"); observer.unobserve(entry.target); }
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  return null;
}
