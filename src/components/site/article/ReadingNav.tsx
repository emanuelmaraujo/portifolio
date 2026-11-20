"use client";

import { useEffect, useState } from "react";

/**
 * Where the reader is in the article. On wide screens it is a rail of the sections with the current one marked. On
 * phones it is a bar within thumb reach: progress, the current section and a button that opens the contents.
 * The article already has a plain list of contents in its header, so this is an enhancement and nothing depends on it.
 */
export default function ReadingNav({ parts, label, close }: { parts: { id: string; title: string }[]; label: string; close: string }) {
  const [active, setActive] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>("article");
    const targets = parts.map(part => document.getElementById(part.id));
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = innerHeight * 0.4;
      let current = -1;
      targets.forEach((target, i) => { if (target && target.getBoundingClientRect().top <= line) current = i; });
      setActive(current);
      if (article) {
        const box = article.getBoundingClientRect();
        setProgress(Math.max(0, Math.min(1, -box.top / Math.max(1, box.height - innerHeight))));
      }
    };
    const queue = () => { raf ||= requestAnimationFrame(measure); };
    measure();
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", queue); removeEventListener("resize", queue); };
  }, [parts]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  const n = (v: number) => String(v).padStart(2, "0");
  const current = parts[Math.max(0, active)];
  return (
    <nav className="reading-nav" aria-label={label} data-open={open} data-started={active >= 0} style={{ "--progress": progress } as React.CSSProperties}>
      <button type="button" className="reading-bar" aria-expanded={open} aria-controls="reading-contents" onClick={() => setOpen(value => !value)}>
        <span className="reading-count">{n(Math.max(1, active + 1))}<i>/{n(parts.length)}</i></span>
        <span className="reading-title">{open ? close : current.title}</span>
        <span className="reading-toggle" aria-hidden="true">{open ? "×" : "≡"}</span>
      </button>
      <p className="mini" aria-hidden="true">{label}</p>
      <ol id="reading-contents">
        {parts.map((part, i) => (
          <li key={part.id}>
            <a href={"#" + part.id} aria-current={i === active ? "location" : undefined} onClick={() => setOpen(false)}><span>{n(i + 1)}</span>{part.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
