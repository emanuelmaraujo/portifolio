"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCentredChild } from "./hooks";

/**
 * A list whose rows choose the figure of the surrounding chapter. The row under the cursor or focus wins. Without one,
 * the row nearest the middle of the screen does, so the figure also changes while scrolling on a phone.
 */
export default function SeedList({ seeds, children }: { seeds: string[]; children: ReactNode }) {
  const root = useRef<HTMLOListElement>(null);
  const centred = useCentredChild(root, "li");
  const [pointed, setPointed] = useState(-1);
  const active = pointed >= 0 ? pointed : centred;

  useEffect(() => {
    const chapter = root.current?.closest<HTMLElement>("[data-form]");
    if (chapter && seeds[active]) chapter.dataset.seed = seeds[active];
    root.current?.querySelectorAll("li").forEach((row, i) => row.classList.toggle("is-active", i === active));
  }, [active, seeds]);

  const pick = (target: EventTarget) => {
    const row = (target as HTMLElement).closest("li");
    setPointed(row ? [...(root.current?.children ?? [])].indexOf(row) : -1);
  };
  return (
    <ol ref={root} className="posts posts--live" onMouseOver={e => pick(e.target)} onFocus={e => pick(e.target)} onMouseLeave={() => setPointed(-1)} onBlur={() => setPointed(-1)}>
      {children}
    </ol>
  );
}
