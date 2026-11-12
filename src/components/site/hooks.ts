"use client";

import { useEffect, useState, type RefObject } from "react";

/** Index of the child (matched by `selector`) closest to the middle of the viewport. */
export function useCentredChild(root: RefObject<HTMLElement | null>, selector: string) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const items = [...(root.current?.querySelectorAll<HTMLElement>(selector) ?? [])];
    let raf = 0;
    const measure = () => {
      raf = 0;
      let best = 0, distance = Infinity;
      items.forEach((item, i) => {
        const box = item.getBoundingClientRect(), d = Math.abs(box.top + box.height / 2 - innerHeight / 2);
        if (d < distance) { distance = d; best = i; }
      });
      setIndex(best);
    };
    const queue = () => { raf ||= requestAnimationFrame(measure); };
    measure();
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", queue); removeEventListener("resize", queue); };
  }, [root, selector]);
  return index;
}
