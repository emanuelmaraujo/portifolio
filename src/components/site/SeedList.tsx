"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCentredChild } from "./hooks";

/**
 * A list whose rows choose the figure of the surrounding chapter. The row under the cursor or focus wins. Without one,
 * the row nearest the middle of the screen does, so the figure also changes while scrolling on a phone.
 *
 * With `filter`, the rows (each carrying `data-category`) can be narrowed to one category.
 */
export default function SeedList({ seeds, filter, children }: { seeds: string[]; filter?: { label: string; all: string; options: string[] }; children: ReactNode }) {
  const root = useRef<HTMLOListElement>(null);
  const centred = useCentredChild(root, "li:not([hidden])");
  const [pointed, setPointed] = useState(-1);
  const [category, setCategory] = useState("");

  useEffect(() => {
    root.current?.querySelectorAll<HTMLElement>(":scope > li").forEach(row => { row.hidden = Boolean(category) && row.dataset.category !== category; });
    dispatchEvent(new Event("resize")); // the list changed height: let scroll-driven listeners measure again
  }, [category]);

  useEffect(() => {
    const rows = [...(root.current?.querySelectorAll<HTMLElement>(":scope > li") ?? [])];
    const shown = rows.filter(row => !row.hidden);
    const row = pointed >= 0 ? rows[pointed] : shown[Math.min(centred, shown.length - 1)];
    const chapter = root.current?.closest<HTMLElement>("[data-form]");
    const seed = row ? seeds[rows.indexOf(row)] : undefined;
    if (chapter && seed) chapter.dataset.seed = seed;
    rows.forEach(item => item.classList.toggle("is-active", item === row));
  }, [pointed, centred, seeds, category]);

  const pick = (target: EventTarget) => {
    const row = (target as HTMLElement).closest("li");
    setPointed(row ? [...(root.current?.children ?? [])].indexOf(row) : -1);
  };
  return (
    <>
      {filter && filter.options.length > 1 && (
        <div className="filters" role="group" aria-label={filter.label}>
          {["", ...filter.options].map(option => (
            <button type="button" className="chip-button" aria-pressed={category === option} onClick={() => setCategory(option)} key={option || "all"}>{option || filter.all}</button>
          ))}
        </div>
      )}
      <ol ref={root} className="posts posts--live" onMouseOver={e => pick(e.target)} onFocus={e => pick(e.target)} onMouseLeave={() => setPointed(-1)} onBlur={() => setPointed(-1)}>
        {children}
      </ol>
    </>
  );
}
