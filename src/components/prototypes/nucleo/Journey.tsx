"use client";

import { useEffect, useRef } from "react";

/**
 * Plays the rendered camera journey: desk, through the screen, down the corridor, round the core, into its light
 * and back to the desk. There is no page to scroll: the wheel, a drag, the arrow keys or the dock move the camera
 * along the path, and the path is a loop.
 *
 * Text lives in the DOM and fades in at its stop. Without WebGL or scripts the first frame and all the text remain.
 */
const FRAMES = 200, BASE = "/prototypes/nucleo";
const pad = (n: number) => String(n).padStart(3, "0");
const wrap = (v: number) => ((v % 1) + 1) % 1;

const VERTEX = `attribute vec2 p; varying vec2 v; void main() { v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAGMENT = `precision highp float;
uniform sampler2D uFrame;
uniform vec2 uScale, uOffset, uPointer;
uniform float uSpeed, uTime, uFlash;
varying vec2 v;
float hash(vec2 q) { return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
vec3 at(vec2 uv) { return texture2D(uFrame, uv * uScale + uOffset).rgb; }
void main() {
  vec2 uv = (v - 0.5) * 0.97 + 0.5 + uPointer * 0.006;
  vec2 away = uv - 0.5;
  // Speed pulls the colours apart towards the edges, the way a fast lens would.
  float split = 0.0025 + uSpeed * 0.02;
  vec3 c = vec3(at(uv + away * split).r, at(uv).g, at(uv - away * split).b);
  // A soft halo round whatever is bright: the LEDs light the air a little.
  vec3 halo = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 0.785;
    halo += max(at(uv + vec2(cos(a), sin(a)) * vec2(0.012, 0.02)) - 0.55, 0.0);
  }
  c += halo * 0.11;
  c *= 0.965 + 0.035 * sin(v.y * 900.0);
  c *= mix(1.0, 0.72, smoothstep(0.45, 1.0, length(away) * 1.25));
  c = mix(c, vec3(1.0, 0.985, 0.96), uFlash);
  c += (hash(v * 917.0 + uTime) - 0.5) * 0.02;
  gl_FragColor = vec4(c, 1.0);
}`;

export default function Journey() {
  const view = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".px-n"), stage = document.querySelector<HTMLElement>(".n-stage"), canvas = view.current;
    if (!root || !stage || !canvas) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const panels = [...root.querySelectorAll<HTMLElement>("[data-from]")].map(el => ({ el, from: Number(el.dataset.from), to: Number(el.dataset.to), on: false }));
    const stops = [...root.querySelectorAll<HTMLElement>("[data-go]")];
    const anchors = [...new Set(stops.map(b => Number(b.dataset.go)))].sort((a, b) => a - b);
    const sector = root.querySelector<HTMLElement>(".n-sector"), counter = root.querySelector<HTMLElement>(".n-frame"), bar = root.querySelector<HTMLElement>(".n-bar i"), loading = root.querySelector<HTMLElement>(".n-loading");
    const names = (root.dataset.sectors || "").split("|"), marks = (root.dataset.marks || "").split("|").map(Number);
    let disposed = false, raf = 0;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) { root.dataset.gl = "off"; return; }
    const compile = (type: number, source: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, source); gl.compileShader(s); return s; };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const at = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(at);
    gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    for (const [k, val] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, val);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([5, 6, 9, 255]));

    // Frames arrive coarse to fine, so the whole journey is walkable early and sharpens as the rest lands.
    const blobs: (Blob | null)[] = Array(FRAMES).fill(null), cache = new Map<number, ImageBitmap>();
    let ready = 0;
    const order: number[] = [];
    for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < FRAMES; i += step) if (!order.includes(i)) order.push(i);
    const load = async () => {
      const lanes = Array.from({ length: 4 }, async () => {
        while (order.length && !disposed) {
          const i = order.shift()!;
          try { const r = await fetch(`${BASE}/${pad(i + 1)}.jpg`); if (r.ok) blobs[i] = await r.blob(); } catch { /* A frame that fails is skipped. */ }
          ready++;
          if (loading) loading.textContent = pad(Math.round((ready / FRAMES) * 100));
          if (ready === FRAMES) root.dataset.loaded = "1";
        }
      });
      await Promise.all(lanes);
    };
    /** The nearest frame that has arrived. */
    const nearest = (index: number) => {
      for (let d = 0; d < FRAMES; d++) {
        if (blobs[(index + d) % FRAMES]) return (index + d) % FRAMES;
        if (blobs[(index - d + FRAMES) % FRAMES]) return (index - d + FRAMES) % FRAMES;
      }
      return -1;
    };
    let shown = -1, decoding = false;
    const show = async (index: number) => {
      if (decoding || index < 0 || index === shown) return;
      decoding = true;
      try {
        let bitmap = cache.get(index);
        if (!bitmap) {
          bitmap = await createImageBitmap(blobs[index]!, { imageOrientation: "flipY" });
          cache.set(index, bitmap);
          if (cache.size > 14) { const old = cache.keys().next().value!; cache.get(old)?.close(); cache.delete(old); }
        }
        if (!disposed) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap); shown = index; root.dataset.gl = "on"; }
      } catch { /* Keep the last frame that worked. */ }
      decoding = false;
    };

    let W = 1, H = 1;
    const fit = () => {
      W = stage.clientWidth; H = stage.clientHeight;
      const ratio = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const ca = W / H, ia = 16 / 9;
      const sx = ca > ia ? 1 : ca / ia, sy = ca > ia ? ia / ca : 1;
      gl.uniform2f(uniform("uScale"), sx, sy);
      gl.uniform2f(uniform("uOffset"), (1 - sx) / 2, (1 - sy) / 2);
    };

    // Movement: `goal` runs on without limit, `where` follows it, and only its fraction picks the frame.
    let goal = 0, where = 0, speed = 0, idle = 0, time = 0, glare = 0, seen = 0, last = performance.now();
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const nudge = (amount: number) => { goal += amount; idle = 0; root.dataset.moved = "1"; };
    /** Goes to a stop the short way round the loop. */
    const go = (to: number) => { let d = to - wrap(goal); if (d > 0.5) d -= 1; if (d < -0.5) d += 1; goal += d; idle = 0; root.dataset.moved = "1"; if (reduced) where = goal; };
    const step = (dir: number) => {
      const here = wrap(goal), list = dir > 0 ? anchors : [...anchors].reverse();
      const next = list.find(a => (dir > 0 ? a > here + 0.012 : a < here - 0.012));
      go(next ?? (dir > 0 ? anchors[0] : anchors[anchors.length - 1]));
    };
    const wheel = (event: WheelEvent) => { event.preventDefault(); nudge(Math.max(-140, Math.min(140, event.deltaY)) * 0.00021); };
    let drag: number | null = null;
    const down = (event: PointerEvent) => { if (!(event.target instanceof Element && event.target.closest("a, button"))) { drag = event.clientY; stage.setPointerCapture(event.pointerId); } };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "mouse") { pointer.tx = (event.clientX / W) * 2 - 1; pointer.ty = 1 - (event.clientY / H) * 2; }
      if (drag !== null) { nudge((drag - event.clientY) * 0.0011); drag = event.clientY; }
    };
    const up = () => { drag = null; };
    const key = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("a, button") && (event.key === " " || event.key === "Enter")) return;
      if (["ArrowDown", "PageDown", " ", "ArrowRight"].includes(event.key)) { event.preventDefault(); step(1); }
      if (["ArrowUp", "PageUp", "ArrowLeft"].includes(event.key)) { event.preventDefault(); step(-1); }
      if (event.key === "Home") { event.preventDefault(); go(0); }
    };
    const click = (event: Event) => { const b = (event.target as Element).closest<HTMLElement>("[data-go]"); if (b) { event.preventDefault(); go(Number(b.dataset.go)); } };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now; time += dt; idle += dt;
      // Left alone near a stop, the camera settles on it.
      if (idle > 0.7 && !reduced) {
        const here = wrap(goal);
        for (const a of anchors) { let d = a - here; if (d > 0.5) d -= 1; if (d < -0.5) d += 1; if (Math.abs(d) < 0.028 && Math.abs(d) > 0.0004) { goal += d * Math.min(1, dt * 2.2); break; } }
      }
      const before = where;
      where = reduced || Math.abs(goal - where) < 0.0006 ? goal : where + (goal - where) * Math.min(1, dt * 4.2);
      speed += (Math.min(1, Math.abs(where - before) / Math.max(dt, 0.001) * 2.6) - speed) * Math.min(1, dt * 8);
      const p = wrap(where);
      show(nearest(Math.min(FRAMES - 1, Math.round(p * (FRAMES - 1)))));

      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 4); pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 4);
      gl.uniform2f(uniform("uPointer"), reduced ? 0 : pointer.x, reduced ? 0 : pointer.y);
      gl.uniform1f(uniform("uSpeed"), reduced ? 0 : speed);
      gl.uniform1f(uniform("uTime"), reduced ? 0 : time);
      // The journey ends in the light of the core. Coming out the other side, the glare fades over the desk, so the
      // seam of the loop is inside the light. A first arrival at the desk has no glare.
      if (seen > 0.9 && p < 0.1) glare = 1;
      seen = p;
      glare = Math.max(0, glare - dt * (reduced ? 9 : 1.3));
      const flash = Math.max(Math.min(1, Math.max(0, (p - 0.972) / 0.024)), glare);
      gl.uniform1f(uniform("uFlash"), flash * flash);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      for (const panel of panels) {
        const on = p >= panel.from && p <= panel.to;
        if (on !== panel.on) { panel.on = on; panel.el.dataset.on = on ? "1" : ""; }
      }
      let index = 0;
      marks.forEach((m, i) => { if (p >= m) index = i; });
      const label = `${pad(index + 1).slice(1)}/${pad(names.length).slice(1)} · ${names[index]}`;
      if (sector && sector.textContent !== label) { sector.textContent = label; root.dataset.sector = String(index); stops.forEach(b => b.setAttribute("aria-current", Number(b.dataset.sector) === index ? "true" : "false")); }
      if (counter) { const text = pad(Math.round(p * (FRAMES - 1)) + 1); if (counter.textContent !== text) counter.textContent = text; }
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    };

    stage.addEventListener("wheel", wheel, { passive: false });
    stage.addEventListener("pointerdown", down);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    addEventListener("keydown", key);
    addEventListener("resize", fit);
    root.addEventListener("click", click);
    fit();
    load();
    raf = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      stage.removeEventListener("wheel", wheel);
      stage.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      removeEventListener("keydown", key);
      removeEventListener("resize", fit);
      root.removeEventListener("click", click);
      for (const bitmap of cache.values()) bitmap.close();
    };
  }, []);

  return <canvas className="n-view" ref={view} aria-hidden="true" />;
}
