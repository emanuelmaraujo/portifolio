"use client";

import type { PointerEvent, ReactNode } from "react";

export default function ExhibitTilt({ children }: { children: ReactNode }) {
  const point = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const panel = event.currentTarget;
    const bounds = panel.getBoundingClientRect();
    panel.style.setProperty("--tilt-x", `${((.5 - (event.clientY - bounds.top) / bounds.height) * 8).toFixed(2)}deg`);
    panel.style.setProperty("--tilt-y", `${(((event.clientX - bounds.left) / bounds.width - .5) * 10).toFixed(2)}deg`);
  };
  return <div className="exhibit-visual exhibit-tilt" onPointerMove={point} onPointerLeave={event => {
    event.currentTarget.style.removeProperty("--tilt-x");
    event.currentTarget.style.removeProperty("--tilt-y");
  }}>{children}</div>;
}
