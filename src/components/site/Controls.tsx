"use client";

import { useEffect, useRef, useState } from "react";
import { preference, setPreference, type Preference, type Tier } from "./scene/quality";

/**
 * Small pieces of page chrome that listen to the scene or to the document. Each owns its listeners and removes them,
 * and none of them is needed to read or navigate the page.
 */

/** Names the figure on screen and what it stands for, so the particles read as part of the story. */
export function Legend({ label }: { label: string }) {
  const [now, setNow] = useState<{ index: number; total: number; caption: string } | null>(null);
  useEffect(() => {
    const on = (e: Event) => setNow((e as CustomEvent).detail);
    addEventListener("scene:chapter", on);
    return () => removeEventListener("scene:chapter", on);
  }, []);
  if (!now?.caption) return null;
  const n = (v: number) => String(v).padStart(2, "0");
  return (
    <p className="legend" aria-hidden="true" key={now.caption}>
      <span>{label} {n(now.index + 1)}<i>/{n(now.total)}</i></span>{now.caption}
    </p>
  );
}

/** Marks the section link of the chapter in view, in the header and in the dock. */
export function Wayfinder() {
  useEffect(() => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.header nav a[href^="#"]')];
    const sections = links.map(link => document.getElementById(link.hash.slice(1))).filter((s): s is HTMLElement => Boolean(s));
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = innerHeight * 0.45;
      let current = "";
      for (const section of sections) if (section.getBoundingClientRect().top <= line) current = section.id;
      for (const link of links) {
        if (link.hash.slice(1) === current) link.setAttribute("aria-current", "true"); else link.removeAttribute("aria-current");
      }
    };
    const queue = () => { raf ||= requestAnimationFrame(measure); };
    measure();
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", queue); removeEventListener("resize", queue); };
  }, []);
  return null;
}

/** Surfaces marked `data-spot` get a soft light that follows the pointer. One listener serves the whole page. */
export function Spotlight() {
  useEffect(() => {
    if (!matchMedia("(hover: hover)").matches) return;
    const move = (e: PointerEvent) => {
      const spot = (e.target as Element | null)?.closest?.<HTMLElement>("[data-spot]");
      if (!spot) return;
      const box = spot.getBoundingClientRect();
      spot.style.setProperty("--mx", e.clientX - box.left + "px");
      spot.style.setProperty("--my", e.clientY - box.top + "px");
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);
  return null;
}

type Orientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

/** Opt-in device tilt. It is offered only on touch devices that have the sensor, and asks permission where required. */
export function TiltToggle({ on, off }: { on: string; off: string }) {
  const [available, setAvailable] = useState(false);
  const [active, setActive] = useState(false);
  useEffect(() => {
    setAvailable(matchMedia("(pointer: coarse)").matches && "DeviceOrientationEvent" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches);
    return () => { dispatchEvent(new CustomEvent("scene:tilt", { detail: false })); };
  }, []);
  if (!available) return null;
  const toggle = async () => {
    let next = !active;
    if (next) {
      const ask = (DeviceOrientationEvent as Orientation).requestPermission;
      if (ask) next = (await ask().catch(() => "denied")) === "granted";
    }
    setActive(next);
    dispatchEvent(new CustomEvent("scene:tilt", { detail: next }));
  };
  return <button type="button" className="chip-button" aria-pressed={active} onClick={toggle}>{active ? off : on}</button>;
}

/** The visitor's say over motion: automatic, light or none. The choice is remembered on this device. */
export function MotionControl({ t }: { t: { label: string; auto: string; lite: string; off: string; now: string; tiers: Record<Tier, string> } }) {
  const [choice, setChoice] = useState<Preference>("auto");
  const [tier, setTier] = useState<Tier | null>(null);
  const group = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setChoice(preference());
    const current = document.documentElement.dataset.quality as Tier | undefined;
    if (current) setTier(current);
    const on = (e: Event) => setTier((e as CustomEvent<{ tier: Tier }>).detail.tier);
    addEventListener("scene:quality", on);
    return () => removeEventListener("scene:quality", on);
  }, []);
  const options: [Preference, string][] = [["auto", t.auto], ["lite", t.lite], ["static", t.off]];
  return (
    <div className="motion-control" role="radiogroup" aria-label={t.label} ref={group}
      onKeyDown={e => {
        const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = options[(options.findIndex(([v]) => v === choice) + step + options.length) % options.length][0];
        setChoice(next); setPreference(next);
        group.current?.querySelector<HTMLButtonElement>(`[data-value="${next}"]`)?.focus();
      }}>
      <span>{t.label}</span>
      {options.map(([value, name]) => (
        <button type="button" role="radio" aria-checked={choice === value} tabIndex={choice === value ? 0 : -1} data-value={value} key={value}
          onClick={() => { setChoice(value); setPreference(value); }}>{name}</button>
      ))}
      {tier && <small aria-live="polite">{t.now} {t.tiers[tier]}</small>}
    </div>
  );
}
