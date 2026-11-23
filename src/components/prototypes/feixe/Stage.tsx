"use client";

import { useEffect, useRef } from "react";
import Mark from "@/components/site/Mark";
import type { Scene } from "./scene";
import { AXIS, dusk, orbit } from "./verdict";

type Stroke = [number, number, number, number];

/**
 * The fixed scene behind the page and everything the visitor does to it. The page opens under a dark veil; the
 * visitor's stroke tears it, and letting go floods the hall with light while the mark lays itself along the line.
 * After that the same gesture recomposes the mark, and scrolling carries the beam into the case.
 * The page is complete without any of it: no WebGL leaves the lit page and the still mark.
 */
export default function Stage() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".px-f"), hero = document.querySelector<HTMLElement>(".fx-hero");
    const chart = document.querySelector<HTMLElement>("[data-fx-chart]"), prompt = document.querySelector<HTMLButtonElement>(".fx-prompt");
    if (!root || !hero || !canvas.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = innerWidth < 760;
    let scene: Scene | null = null, disposed = false, stroke: Stroke | null = null, auto = 0, again = 0, casts = 0;

    // The glass: the scene owns it; the page only tells it where it has been touched.
    let path: [number, number][] = [];
    const veiled = () => !!scene?.veiled;
    const meter = document.querySelector<HTMLElement>(".fx-meter b");
    let shown = -1, watch = 0;
    const read = () => {
      watch = requestAnimationFrame(read);
      if (!scene || !meter) return;
      const value = Math.round(scene.order * 100);
      if (value !== shown) { shown = value; meter.textContent = String(value).padStart(3, "0"); }
    };
    watch = requestAnimationFrame(read);

    // Strokes ------------------------------------------------------------------------------------------------------
    /** The stroke that puts the mark where the composition wants it, optionally through a given point. */
    const preset = (through?: [number, number], lean = 1): Stroke => {
      const height = compact ? Math.min(innerHeight * 0.46, innerWidth * 0.9) : Math.min(innerHeight * 0.76, innerWidth * 0.56);
      const s = height / 52, cx = innerWidth * (compact ? 0.5 : 0.61), cy = innerHeight * (compact ? 0.31 : 0.46);
      const line: Stroke = [cx + (AXIS.top[0] - 32) * s * lean, cy + (AXIS.top[1] - 32) * s, cx + (AXIS.bottom[0] - 32) * s * lean, cy + (AXIS.bottom[1] - 32) * s];
      if (!through) return line;
      const dx = through[0] - (line[0] + line[2]) / 2, dy = through[1] - (line[1] + line[3]) / 2;
      return [line[0] + dx, line[1] + dy, line[2] + dx, line[3] + dy];
    };
    /** Keeps a drawn stroke to a size the mark can live in. */
    const bound = ([ax, ay, bx, by]: Stroke): Stroke => {
      const length = Math.hypot(bx - ax, by - ay) || 1, min = Math.min(innerWidth, innerHeight) * 0.42, max = Math.min(innerHeight * 0.86, innerWidth * 0.98);
      const k = Math.min(max, Math.max(min, length)) / length, mx = (ax + bx) / 2, my = (ay + by) / 2;
      return [mx + (ax - mx) * k, my + (ay - my) * k, mx + (bx - mx) * k, my + (by - my) * k];
    };

    /** The headline falls into place starting from wherever the beam passed. */
    const order = ([ax, ay, bx, by]: Stroke, instant: boolean) => {
      const length2 = (bx - ax) ** 2 + (by - ay) ** 2 || 1;
      root.querySelectorAll<HTMLElement>(".fx-l").forEach(letter => {
        const r = letter.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        const t = Math.min(1, Math.max(0, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / length2));
        letter.style.setProperty("--d", instant ? "0s" : (0.12 + Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)) / 1300).toFixed(2) + "s");
      });
      root.dataset.phase = "cast";
      try { sessionStorage.setItem("feixe", "1"); } catch { /* Private mode: the opening simply plays again. */ }
    };
    /** `by` says who cast it: only a beam the visitor made is named back to them. */
    const cast = (line: Stroke, instant = false, by: "visitor" | "system" = "visitor") => {
      clearTimeout(auto);
      clearTimeout(again);
      stroke = bound(line);
      scene?.hold(false);
      scene?.cast(...stroke, instant);
      root.dataset.drawing = "";
      if (veiled() && !instant) {
        // The first beam: the glass thaws from the stroke outwards, and the page changes world as the light arrives.
        if (path.length < 2) path = [[stroke[0], stroke[1]], [stroke[2], stroke[3]]];
        scene?.tear(path);
        scene?.melt();
        if (by === "visitor") root.dataset.act = "1";
        casts++;
        again = window.setTimeout(() => stroke && order(stroke, false), 560);
        return;
      }
      if (casts++ && !instant && !reduced) {
        root.dataset.phase = "recast";
        again = window.setTimeout(() => stroke && order(stroke, false), 260);
      } else order(stroke, instant || reduced);
    };

    const follow = () => {
      const top = chart ? chart.getBoundingClientRect().top + scrollY : innerHeight * 2;
      const progress = Math.min(1, Math.max(0, scrollY / Math.max(1, top - innerHeight * (compact ? 0.16 : 0.22))));
      scene?.scroll(progress, scrollY);
      root.style.setProperty("--p", progress.toFixed(4));
      root.style.setProperty("--yaw", orbit(progress).toFixed(4));
      root.style.setProperty("--dark", dusk(progress).toFixed(4));
      root.dataset.scene = dusk(progress) > 0.5 ? "case" : "hero";
      if (scrollY > 8 && root.dataset.phase === "void") cast(preset(), false, "system");
    };
    const resize = () => follow();

    let seen = false;
    try { seen = sessionStorage.getItem("feixe") === "1" && !location.search.includes("intro"); } catch { /* Treated as a first visit. */ }
    const start = async () => {
      try {
        const { createScene } = await import("./scene");
        if (disposed || !canvas.current) return;
        scene = createScene(canvas.current, { compact, reduced, veiled: root.dataset.phase === "void" });
        root.dataset.gl = "on";
      } catch { root.dataset.gl = "off"; }
      if (seen || reduced || !scene || scrollY > 8) cast(preset(), true, "system");
      else auto = window.setTimeout(() => cast(preset(), false, "system"), 5200);
      follow();
    };
    start();

    const free = (target: EventTarget | null) => !(target instanceof Element && target.closest("a, button, input, label, header"));
    const begin = (x: number, y: number) => { clearTimeout(auto); root.dataset.drawing = "1"; scene?.hold(true); path = [[x, y]]; if (veiled()) scene?.tear(path); };
    const extend = (from: [number, number], x: number, y: number) => { path.push([x, y]); if (veiled()) scene?.tear(path); scene?.preview(from[0], from[1], x, y); };
    const drop = () => { root.dataset.drawing = ""; scene?.hold(false); scene?.preview(); path = []; if (veiled()) scene?.tear(path); };

    // Mouse and pen: press, drag, release. A click without a drag places the beam through that point.
    let down: [number, number] | null = null, drawing = false;
    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch" || event.button !== 0 || !free(event.target)) return;
      down = [event.clientX, event.clientY];
      drawing = false;
      hero.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!down || (!drawing && Math.hypot(event.clientX - down[0], event.clientY - down[1]) < 8)) return;
      if (!drawing) { drawing = true; begin(down[0], down[1]); }
      extend(down, event.clientX, event.clientY);
    };
    const pointerUp = (event: PointerEvent) => {
      if (!down) return;
      const from = down;
      down = null;
      if (Math.hypot(event.clientX - from[0], event.clientY - from[1]) >= 48) cast([from[0], from[1], event.clientX, event.clientY]);
      else { drop(); cast(preset([event.clientX, event.clientY])); }
    };
    const pointerCancel = () => { down = null; drop(); };

    // Touch: a tap places the beam, press-and-hold arms a free stroke. A swipe that starts moving at once is a scroll.
    let touch: { x: number; y: number; at: number; armed: boolean; moved: boolean; timer: number } | null = null;
    const touchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || !free(event.target)) { touch = null; return; }
      const { clientX: x, clientY: y } = event.touches[0];
      const state = { x, y, at: performance.now(), armed: false, moved: false, timer: 0 };
      state.timer = window.setTimeout(() => { if (touch === state && !state.moved) { state.armed = true; begin(x, y); navigator.vibrate?.(8); } }, 190);
      touch = state;
    };
    const touchMove = (event: TouchEvent) => {
      if (!touch) return;
      const { clientX: x, clientY: y } = event.touches[0];
      if (touch.armed) { event.preventDefault(); extend([touch.x, touch.y], x, y); }
      else if (Math.hypot(x - touch.x, y - touch.y) > 10) { touch.moved = true; clearTimeout(touch.timer); }
    };
    const touchEnd = (event: TouchEvent) => {
      if (!touch) return;
      const state = touch, { clientX: x, clientY: y } = event.changedTouches[0];
      touch = null;
      clearTimeout(state.timer);
      if (state.armed) {
        if (Math.hypot(x - state.x, y - state.y) >= 48) cast([state.x, state.y, x, y]);
        else { drop(); cast(preset([x, y])); }
      } else if (!state.moved && performance.now() - state.at < 320) cast(preset([x, y]));
    };
    const touchCancel = () => { if (touch) clearTimeout(touch.timer); touch = null; drop(); };

    // Keyboard: Enter casts, and the arrows turn the beam that is there.
    let turn = 0;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); cast(preset(undefined, turn++ % 2 ? -1 : 1)); }
      if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && stroke) {
        event.preventDefault();
        const angle = event.key === "ArrowLeft" ? -0.16 : 0.16, mx = (stroke[0] + stroke[2]) / 2, my = (stroke[1] + stroke[3]) / 2, c = Math.cos(angle), s = Math.sin(angle);
        const spin = (x: number, y: number): [number, number] => [mx + (x - mx) * c - (y - my) * s, my + (x - mx) * s + (y - my) * c];
        cast([...spin(stroke[0], stroke[1]), ...spin(stroke[2], stroke[3])]);
      }
    };
    const click = (event: MouseEvent) => { if (event.detail) cast(preset(undefined, turn++ % 2 ? -1 : 1)); }; // a pointer on the button itself

    hero.addEventListener("pointerdown", pointerDown);
    hero.addEventListener("pointermove", pointerMove);
    hero.addEventListener("pointerup", pointerUp);
    hero.addEventListener("pointercancel", pointerCancel);
    hero.addEventListener("touchstart", touchStart, { passive: true });
    hero.addEventListener("touchmove", touchMove, { passive: false });
    hero.addEventListener("touchend", touchEnd);
    hero.addEventListener("touchcancel", touchCancel);
    prompt?.addEventListener("keydown", key);
    prompt?.addEventListener("click", click);
    addEventListener("scroll", follow, { passive: true });
    addEventListener("resize", resize);
    return () => {
      disposed = true;
      clearTimeout(auto);
      clearTimeout(again);
      cancelAnimationFrame(watch);
      hero.removeEventListener("pointerdown", pointerDown);
      hero.removeEventListener("pointermove", pointerMove);
      hero.removeEventListener("pointerup", pointerUp);
      hero.removeEventListener("pointercancel", pointerCancel);
      hero.removeEventListener("touchstart", touchStart);
      hero.removeEventListener("touchmove", touchMove);
      hero.removeEventListener("touchend", touchEnd);
      hero.removeEventListener("touchcancel", touchCancel);
      prompt?.removeEventListener("keydown", key);
      prompt?.removeEventListener("click", click);
      removeEventListener("scroll", follow);
      removeEventListener("resize", resize);
      scene?.dispose();
    };
  }, []);

  return (
    <div className="fx-stage" aria-hidden="true">
      <canvas ref={canvas} />
      {/* Shown only when the scene cannot run. */}
      <Mark />
    </div>
  );
}
