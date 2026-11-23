"use client";

import { useEffect, useRef } from "react";
import { ARM, ARM_AT, ARM_STEP, BASE, FRAMES, REST_ID, SEQ, SHARED, TIMELINE } from "./take";

/**
 * Plays the rendered take of the drafting table against the page's own scroll. The scroll position picks the frame
 * through a small timeline with rests: while the camera travels the scene changes, and at each rest the copy for
 * that act is on screen.
 *
 * One box follows the picture exactly, through its crop, its slow push in and the drift of the pointer: the keys
 * drawn on the table are real buttons inside it (see Table.tsx). When the camera stands still on a rest, the root
 * says which frame it is on, and the table comes alive.
 *
 * Text lives in the DOM. Without WebGL or scripts the first frame and all the text remain.
 */
const pad = (n: number) => String(n).padStart(3, "0");
const frameAt = (s: number) => {
  for (let i = 1; i < TIMELINE.length; i++) {
    const [s0, f0] = TIMELINE[i - 1], [s1, f1] = TIMELINE[i];
    if (s <= s1) return f0 + ((f1 - f0) * (s - s0)) / (s1 - s0 || 1);
  }
  return FRAMES;
};

const VERTEX = `attribute vec2 p; varying vec2 v; void main() { v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAGMENT = `precision highp float;
uniform sampler2D uFrame;
uniform vec2 uScale, uOffset, uPointer;
uniform float uZoom, uTime;
varying vec2 v;
float hash(vec2 q) { return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 uv = (v - 0.5) * uZoom + 0.5 + uPointer * 0.006;
  vec2 t = uv * uScale + uOffset;
  vec3 c = texture2D(uFrame, t).rgb;
  c *= mix(1.0, 0.8, smoothstep(0.5, 1.05, length(v - 0.5) * 1.3));
  c += (hash(v * 917.0 + uTime) - 0.5) * 0.022;
  if (t.y < 0.0 || t.y > 1.0) c = vec3(0.035, 0.027, 0.02);  // below the picture: the foot of the page
  gl_FragColor = vec4(c, 1.0);
}`;

const RESTS = TIMELINE.filter(([, f], i) => i > 0 && TIMELINE[i - 1][1] === f).map(([, f]) => f);

export default function Scroll({ lang = "pt" }: { lang?: "pt" | "en" }) {
  const view = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".px-p"), stage = document.querySelector<HTMLElement>(".p-stage"), canvas = view.current;
    if (!root || !stage || !canvas) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const panels = [...root.querySelectorAll<HTMLElement>("[data-from]")].map(el => ({ el, from: Number(el.dataset.from), to: Number(el.dataset.to), state: "" }));
    const stops = [...root.querySelectorAll<HTMLElement>("[data-go]")];
    const counter = root.querySelector<HTMLElement>(".p-frame"), loading = root.querySelector<HTMLElement>(".p-loading");
    const table = root.querySelector<HTMLElement>(".p-table");
    const marks = (root.dataset.marks || "").split("|").map(Number);
    let disposed = false, raf = 0;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) { root.dataset.gl = "off"; }
    const uniform = (name: string) => gl!.getUniformLocation(program!, name);
    let program: WebGLProgram | null = null;
    if (gl) {
      const compile = (type: number, source: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, source); gl.compileShader(s); return s; };
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const at = gl.getAttribLocation(program, "p");
      gl.enableVertexAttribArray(at);
      gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      for (const [k, val] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, val);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([214, 200, 180, 255]));
    }

    // Which set of frames: the portrait take when it exists and the screen is tall.
    const tall = innerWidth / innerHeight < 0.85 && root.dataset.portrait === "1";
    const dir = tall ? "p" : "l", imageAspect = tall ? 9 / 16 : 16 / 9;
    root.dataset.take = dir;
    // Notes pinned to the picture carry one point for each take.
    const pins = [...root.querySelectorAll<HTMLElement>("[data-at]")].map(el => {
      const [lx, ly, px, py] = (el.dataset.at || "").split(",").map(Number);
      const missing = tall && Number.isNaN(px);
      if (missing) el.hidden = true;
      return { el, x: tall ? px : lx, y: tall ? py : ly, missing };
    }).filter(pin => !pin.missing);

    // Frames arrive coarse to fine, so the whole take can be scrubbed early and sharpens as the rest lands.
    const blobs: (Blob | null)[] = Array(FRAMES).fill(null), cache = new Map<number, ImageBitmap>();
    let ready = 0;
    const order: number[] = [];
    for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < FRAMES; i += step) if (!order.includes(i)) order.push(i);
    const load = () => Promise.all(Array.from({ length: 4 }, async () => {
      while (order.length && !disposed) {
        const i = order.shift()!;
        try { const r = await fetch(`${BASE}${lang === "en" && i >= SHARED ? "/en" : ""}/${dir}/${SEQ[i]}.webp`); if (r.ok) blobs[i] = await r.blob(); } catch { /* A frame that fails is skipped. */ }
        ready++;
        if (loading) loading.textContent = pad(Math.round((ready / FRAMES) * 100));
        if (ready === FRAMES) root.dataset.loaded = "1";
      }
    }));
    const nearest = (index: number) => {
      for (let d = 0; d < FRAMES; d++) {
        if (blobs[index + d]) return index + d;
        if (blobs[index - d]) return index - d;
      }
      return -1;
    };

    // The tone of the upper part of the picture decides whether the type over it is set light or dark.
    const probe = document.createElement("canvas"); probe.width = 16; probe.height = 16;
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    let sx = 1, sy = 1, ox = 0, oy = 0;
    const tone = (bitmap: ImageBitmap) => {
      if (!pctx) return;
      pctx.drawImage(bitmap, 0, 0, 16, 16);
      // The bitmap is stored bottom-up, so the last rows are the top of the picture.
      const data = pctx.getImageData(0, 0, 16, 16).data;
      const zone = (name: "top" | "mid", y0: number, y1: number, width: number) => {
        const x0 = Math.floor(ox * 16), x1 = Math.max(x0 + 1, Math.ceil((ox + sx * width) * 16));
        let sum = 0, n = 0;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * 16 + x) * 4; sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; n++; }
        const lum = sum / n / 255, now = root.dataset[name];
        if (lum > 0.5 && now !== "light") root.dataset[name] = "light";
        if (lum < 0.4 && now !== "dark") root.dataset[name] = "dark";
      };
      zone("top", 14, 16, 1);   // behind the header
      zone("mid", 9, 14, 0.62); // behind the verb
    };

    let shown = -1, decoding = false;
    const show = async (id: number) => {
      const blob = blobs[id];
      if (!gl || decoding || id < 0 || id === shown || !blob) return;
      decoding = true;
      try {
        let bitmap = cache.get(id);
        if (!bitmap) {
          bitmap = await createImageBitmap(blob, { imageOrientation: "flipY" });
          cache.set(id, bitmap);
          if (cache.size > 12) { const old = cache.keys().next().value!; cache.get(old)?.close(); cache.delete(old); }
        }
        if (!disposed) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap); shown = id; root.dataset.gl = "on"; tone(bitmap); }
      } catch { /* Keep the last frame that worked. */ }
      decoding = false;
    };

    let W = 1, H = 1, zoom = 1;
    const fit = () => {
      W = stage.clientWidth; H = stage.clientHeight;
      const ca = W / H;
      // A wide take on a screen that is a little less wide keeps its whole width, so no key of the table is cut:
      // the picture hangs from the top and the foot of the page takes the rest. Otherwise the picture covers the screen.
      const whole = ca < imageAspect && (tall || ca > 1.15);
      sx = whole || ca > imageAspect ? 1 : ca / imageAspect; sy = whole || ca > imageAspect ? imageAspect / ca : 1;
      ox = (1 - sx) / 2; oy = whole ? 1 - sy : (1 - sy) / 2;
      root.dataset.foot = whole ? "1" : ""; root.style.setProperty("--foot", (whole ? H - H / sy : 0).toFixed(0) + "px");
      if (table) {
        // The table's box is the whole picture, cropped by the stage like the picture is.
        const w = W / sx, h = H / sy, left = (-ox / sx) * W, top = (1 - (1 - oy) / sy) * H;
        Object.assign(table.style, { left: left + "px", top: top + "px", width: w + "px", height: h + "px", transformOrigin: `${W / 2 - left}px ${H / 2 - top}px` });
      }
      if (!gl) return;
      const ratio = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniform("uScale"), sx, sy);
      gl.uniform2f(uniform("uOffset"), ox, oy);
    };
    /** Puts each note on the point of the picture it names. */
    const place = () => {
      for (const pin of pins) {
        const x = (((pin.x - ox) / sx - 0.5) / zoom + 0.5) * W, y = (((pin.y - oy) / sy - 0.5) / zoom + 0.5) * H;
        pin.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      }
    };

    const target = () => { const span = root.offsetHeight - innerHeight; return span > 0 ? Math.min(1, Math.max(0, (scrollY - root.offsetTop) / span)) : 0; };
    const top = (to: number) => root.offsetTop + to * (root.offsetHeight - innerHeight);
    const go = (to: number) => scrollTo({ top: top(to), behavior: reduced ? "auto" : "smooth" });
    // A glide plays a stretch of the film at its own pace, whatever the distance: the page is scrolled for the visitor.
    let gliding = 0;
    const glide = (to: number, ms: number) => {
      cancelAnimationFrame(gliding);
      const from = scrollY, goal = top(to), t0 = performance.now();
      if (reduced) return scrollTo({ top: goal, behavior: "auto" });
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms), e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        scrollTo({ top: from + (goal - from) * e, behavior: "instant" as ScrollBehavior });
        if (t < 1 && !disposed) gliding = requestAnimationFrame(step);
      };
      gliding = requestAnimationFrame(step);
    };
    const halt = () => cancelAnimationFrame(gliding);
    const click = (event: Event) => { const b = (event.target as Element).closest<HTMLElement>("[data-go]"); if (b) { event.preventDefault(); if (b.dataset.glide) glide(Number(b.dataset.go), 1700); else go(Number(b.dataset.go)); } };
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const move = (event: PointerEvent) => { if (event.pointerType === "mouse") { pointer.tx = (event.clientX / W) * 2 - 1; pointer.ty = 1 - (event.clientY / H) * 2; } };

    let where = target(), time = 0, last = performance.now(), act = -1, zoomed = 1, resting = 0, arming = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now; time += dt;
      const goal = target();
      where = reduced || Math.abs(goal - where) < 0.0004 ? goal : where + (goal - where) * Math.min(1, dt * 6.5);
      const s = where, frame = frameAt(s);

      show(nearest(Math.min(FRAMES - 1, Math.max(0, Math.round(frame) - 1))));
      const near = Math.round(frame), still = RESTS.includes(near) && Math.abs(frame - near) < 0.02 && Math.abs(goal - where) < 0.003 ? near : 0;
      if (still !== resting) { resting = still; root.dataset.rest = still ? String(REST_ID[still] ?? still) : ""; }
      // Between the bare table and the armed one, the film is switching one layer on: say which.
      const layer = frame > ARM_AT + 0.5 && frame < ARM_AT + ARM + 0.5 && !still ? Math.min(ARM / ARM_STEP, Math.ceil((frame - ARM_AT) / ARM_STEP)) : 0;
      if (layer !== arming) { arming = layer; root.dataset.arm = layer ? String(layer) : ""; }

      // At a rest the picture keeps breathing: a slow push in for as long as the camera stands still.
      let rest = 0;
      for (let i = 1; i < TIMELINE.length; i++) if (TIMELINE[i][1] === TIMELINE[i - 1][1] && s >= TIMELINE[i - 1][0] && s <= TIMELINE[i][0]) rest = (s - TIMELINE[i - 1][0]) / (TIMELINE[i][0] - TIMELINE[i - 1][0]);
      zoomed += ((reduced ? 1 : 1 - rest * 0.012) - zoomed) * Math.min(1, dt * 5);
      if (Math.abs(zoomed - zoom) > 0.0002) { zoom = zoomed; place(); }
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 4); pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 4);
      const px = reduced ? 0 : pointer.x, py = reduced ? 0 : pointer.y;
      if (table) table.style.transform = `scale(${(1 / zoom).toFixed(5)}) translate(${(-px * 0.006 * W).toFixed(2)}px, ${(py * 0.006 * H).toFixed(2)}px)`;
      if (gl) {
        gl.uniform2f(uniform("uPointer"), px, py);
        gl.uniform1f(uniform("uZoom"), zoom);
        gl.uniform1f(uniform("uTime"), reduced ? 0 : time);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      for (const panel of panels) {
        const state = s < panel.from ? "" : s > panel.to ? "past" : "on";
        if (state !== panel.state) { panel.state = state; panel.el.dataset.on = state === "on" ? "1" : ""; panel.el.dataset.past = state === "past" ? "1" : ""; }
        if (state === "on") panel.el.style.setProperty("--k", ((s - panel.from) / (panel.to - panel.from)).toFixed(3));
      }
      let index = 0;
      marks.forEach((m, i) => { if (s >= m) index = i; });
      if (index !== act) {
        act = index; root.dataset.act = String(index); root.style.setProperty("--act", String(index));
        stops.forEach(b => { if (b.dataset.acts) b.setAttribute("aria-current", b.dataset.acts.split(",").includes(String(index)) ? "true" : "false"); });
      }
      root.style.setProperty("--s", s.toFixed(4));
      if (counter) { const text = pad(Math.round(frame)); if (counter.textContent !== text) counter.textContent = text; }
      if (s > 0.004 && !root.dataset.moved) root.dataset.moved = "1";
    };

    const resize = () => { fit(); place(); };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("resize", resize);
    addEventListener("wheel", halt, { passive: true });
    addEventListener("touchstart", halt, { passive: true });
    root.addEventListener("click", click);
    resize();
    load();
    root.dataset.ready = "1";
    raf = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("resize", resize);
      removeEventListener("wheel", halt);
      removeEventListener("touchstart", halt);
      cancelAnimationFrame(gliding);
      root.removeEventListener("click", click);
      for (const bitmap of cache.values()) bitmap.close();
    };
  }, [lang]);

  return <canvas className="p-view" ref={view} aria-hidden="true" />;
}
