"use client";

import { useEffect, useRef } from "react";

/**
 * Plays one rendered scene: forty frames of the bell jar coming down over the maquette, driven by how long the
 * visitor holds. A thin real-time layer sits on top: depth parallax under the pointer, the grit that flies at the
 * model, and what happens to it when it meets the glass.
 *
 * Without WebGL or scripts the sealed frame underneath is the scene.
 */
const FRAMES = 40, BASE = "/prototypes/tres-verbos/protejo";
// Where things are in the rendered image, as fractions of its width and height (measured on the sealed frame).
const SHAPES = {
  l: { aspect: 1600 / 900, dome: [0.572, 0.545, 0.238, 0.345], model: [0.565, 0.56, 0.15, 0.17] },
  p: { aspect: 900 / 1600, dome: [0.5, 0.556, 0.335, 0.172], model: [0.5, 0.57, 0.2, 0.09] },
} as const;
const pad = (n: number) => String(n).padStart(3, "0");

const VERTEX = `attribute vec2 p; varying vec2 v; void main() { v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAGMENT = `precision highp float;
uniform sampler2D uFrame, uNear, uFar;
uniform vec2 uScale, uOffset, uPointer;
uniform float uProgress, uTime, uSafe;
varying vec2 v;
float hash(vec2 q) { return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 uv = (v - 0.5) * 0.965 + 0.5;
  uv = uv * uScale + uOffset;
  // Near things move more than far ones under the pointer: the still becomes a place.
  float depth = mix(texture2D(uNear, uv).r, texture2D(uFar, uv).r, uProgress);
  uv += (depth - 0.42) * uPointer * 0.02;
  vec3 c = texture2D(uFrame, uv).rgb;
  c = mix(c, c * c * (3.0 - 2.0 * c), 0.3);
  c *= 1.0 + 0.05 * uSafe;
  c *= mix(1.0, 0.8, smoothstep(0.5, 1.05, distance(v, vec2(0.5))));
  c += (hash(v * 931.0 + uTime) - 0.5) * 0.018;
  gl_FragColor = vec4(c, 1.0);
}`;

export default function Player() {
  const view = useRef<HTMLCanvasElement>(null), layer = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".px-v"), stage = document.querySelector<HTMLElement>(".v-stage");
    const canvas = view.current, fx = layer.current;
    if (!root || !stage || !canvas || !fx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dir: "l" | "p" = innerWidth / innerHeight < 0.85 ? "p" : "l", shape = SHAPES[dir];
    const meter = root.querySelector<HTMLElement>(".v-meter b"), state = root.querySelector<HTMLElement>(".v-meter span");
    const ring = root.querySelector<HTMLElement>(".v-hold"), loading = root.querySelector<HTMLElement>(".v-loading");
    const labels = { open: root.dataset.open || "", safe: root.dataset.safe || "" };
    let disposed = false, frame = 0;

    // Frames: kept compressed, decoded when shown, with a few recent ones cached.
    const blobs: (Blob | null)[] = Array(FRAMES).fill(null), cache = new Map<number, ImageBitmap>();
    let ready = 0;
    const load = async () => {
      // Both ends first, so the scene works before everything has arrived.
      const order = [0, FRAMES - 1, ...Array.from({ length: FRAMES - 2 }, (_, i) => i + 1)];
      for (const i of order) {
        if (disposed) return;
        try { blobs[i] = await (await fetch(`${BASE}/${dir}/${pad(i + 1)}.jpg`)).blob(); } catch { /* A missing frame is skipped. */ }
        ready++;
        if (loading) loading.textContent = pad(Math.round((ready / FRAMES) * 100));
        if (ready === FRAMES) root.dataset.loaded = "1";
      }
    };

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
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const texture = (unit: number, name: string) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      for (const [k, val] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, val);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 18, 16, 255]));
      gl.uniform1i(uniform(name), unit);
      return t;
    };
    const tFrame = texture(0, "uFrame");
    const put = (unit: number, t: WebGLTexture | null, source: TexImageSource) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source); };
    for (const [unit, name, file] of [[1, "uNear", "depth-001"], [2, "uFar", "depth-040"]] as const) {
      const t = texture(unit, name), img = new Image();
      img.onload = () => { if (!disposed) put(unit, t, img); };
      img.src = `${BASE}/${dir}/${file}.jpg`;
    }

    let shown = -1, wanted = 0, decoding = false;
    const show = async () => {
      if (decoding || wanted === shown || !blobs[wanted]) return;
      const index = wanted;
      decoding = true;
      try {
        let bitmap = cache.get(index);
        if (!bitmap) {
          bitmap = await createImageBitmap(blobs[index]!, { imageOrientation: "flipY" }); // bitmaps ignore UNPACK_FLIP_Y
          cache.set(index, bitmap);
          if (cache.size > 10) { const old = cache.keys().next().value!; cache.get(old)?.close(); cache.delete(old); }
        }
        if (!disposed) { put(0, tFrame, bitmap); shown = index; root.dataset.gl = "on"; }
      } catch { /* Keep the last frame that worked. */ }
      decoding = false;
    };

    // Layout: the image covers the viewport, and everything measured on the image is mapped through the same fit.
    let W = 1, H = 1, sx = 1, sy = 1, ox = 0, oy = 0, ratio = 1;
    const fit = () => {
      W = stage.clientWidth; H = stage.clientHeight; ratio = Math.min(devicePixelRatio, 2);
      for (const c of [canvas, fx]) { c.width = Math.round(W * ratio); c.height = Math.round(H * ratio); }
      gl.viewport(0, 0, canvas.width, canvas.height);
      const ca = W / H;
      if (ca > shape.aspect) { sx = 1; sy = shape.aspect / ca; } else { sx = ca / shape.aspect; sy = 1; }
      ox = (1 - sx) / 2; oy = (1 - sy) / 2;
      gl.uniform2f(uniform("uScale"), sx, sy);
      gl.uniform2f(uniform("uOffset"), ox, oy);
    };
    /** A point of the rendered image, in screen pixels. */
    const place = (ix: number, iy: number): [number, number] => [(((ix - ox) / sx - 0.5) / 0.965 + 0.5) * W, (((iy - oy) / sy - 0.5) / 0.965 + 0.5) * H];

    // The hold ---------------------------------------------------------------------------------------------------
    let holding = false, locked = false, progress = 0, sealedFor = 0, integrity = 100, shownIntegrity = -1;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const free = (target: EventTarget | null) => !(target instanceof Element && target.closest("a, .v-again, header"));
    const press = (event: PointerEvent) => { if (free(event.target) && !locked) { holding = true; root.dataset.holding = "1"; } };
    const release = () => { holding = false; root.dataset.holding = ""; };
    const move = (event: PointerEvent) => { if (event.pointerType === "mouse") { pointer.tx = (event.clientX / W) * 2 - 1; pointer.ty = 1 - (event.clientY / H) * 2; } };
    // Keyboard: Space or Enter on the ring toggles the jar; no holding required.
    const key = (event: KeyboardEvent) => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      if (locked) { lift(); holding = false; } else holding = !holding;
      root.dataset.holding = holding ? "1" : "";
    };
    const lift = () => { locked = false; sealedFor = 0; progress = Math.min(progress, 0.9); root.dataset.state = "open"; };
    const again = () => { lift(); holding = false; root.dataset.holding = ""; };

    // The grit ---------------------------------------------------------------------------------------------------
    const ctx = fx.getContext("2d")!;
    type Grit = { x: number; y: number; vx: number; vy: number; life: number; out: boolean };
    const grit: Grit[] = [], sparks: { x: number; y: number; vx: number; vy: number; life: number; hot: boolean }[] = [];
    const COUNT = reduced ? 0 : dir === "p" ? 34 : 64;
    const spawn = (g: Grit) => {
      const [mx, my] = place(shape.model[0], shape.model[1]), k = H / 900;
      const top = Math.random() < 0.3;
      g.x = top ? W * (0.55 + Math.random() * 0.5) : W + 30; g.y = top ? -30 : H * (0.02 + Math.random() * 0.62);
      const tx = mx + (Math.random() - 0.5) * shape.model[2] * W * 0.9, ty = my + (Math.random() - 0.5) * shape.model[3] * H * 0.9;
      const d = Math.hypot(tx - g.x, ty - g.y), speed = (300 + Math.random() * 260) * k;
      g.vx = ((tx - g.x) / d) * speed; g.vy = ((ty - g.y) / d) * speed; g.life = 1; g.out = false;
    };
    const burst = (x: number, y: number, nx: number, ny: number, hot: boolean) => {
      for (let i = 0; i < (hot ? 5 : 3); i++) {
        const a = Math.atan2(ny, nx) + (Math.random() - 0.5) * 1.6, s = (60 + Math.random() * 150) * (H / 900);
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, hot });
      }
    };

    let last = performance.now(), time = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now; time += dt;
      const goal = holding || locked ? 1 : 0;
      progress = reduced ? goal : Math.max(0, Math.min(1, progress + (goal > progress ? dt / 1.5 : -dt / 1.0)));
      const sealed = progress > 0.94;
      sealedFor = sealed ? sealedFor + dt : 0;
      if (sealed && !locked && (sealedFor > 0.9 || reduced)) { locked = true; holding = false; root.dataset.state = "safe"; root.dataset.holding = ""; }
      if (ring) ring.style.setProperty("--hold", progress.toFixed(3));

      wanted = Math.round(progress * (FRAMES - 1));
      if (!blobs[wanted]) wanted = progress > 0.5 && blobs[FRAMES - 1] ? FRAMES - 1 : 0;
      show();

      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 4); pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 4);
      const drift = reduced ? 0 : 0.25;
      gl.uniform2f(uniform("uPointer"), pointer.x + Math.sin(time * 0.31) * drift, pointer.y + Math.cos(time * 0.23) * drift * 0.6);
      gl.uniform1f(uniform("uProgress"), progress);
      gl.uniform1f(uniform("uTime"), reduced ? 0 : time);
      gl.uniform1f(uniform("uSafe"), locked ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Grit against the model, or against the glass.
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const [dx, dy] = place(shape.dome[0], shape.dome[1]), rx = (shape.dome[2] * W) / sx / 0.965, ry = (shape.dome[3] * H) / sy / 0.965;
      const [mx, my] = place(shape.model[0], shape.model[1]), mrx = (shape.model[2] * W) / sx / 0.965, mry = (shape.model[3] * H) / sy / 0.965;
      ctx.lineCap = "round";
      for (const g of grit) {
        g.x += g.vx * dt; g.y += g.vy * dt;
        if (g.out) { g.life -= dt * 2.2; g.vy += 500 * dt * (H / 900); if (g.life <= 0) spawn(g); }
        else if (sealed) {
          const ex = (g.x - dx) / rx, ey = (g.y - dy) / ry;
          if (ex * ex + ey * ey < 1) {
            // Off the glass: reflect about the surface of the dome and lose most of the speed.
            let nx = ex / rx, ny = ey / ry; const n = Math.hypot(nx, ny) || 1; nx /= n; ny /= n;
            const dot = g.vx * nx + g.vy * ny;
            g.vx = (g.vx - 2 * dot * nx) * 0.4; g.vy = (g.vy - 2 * dot * ny) * 0.4; g.out = true;
            burst(g.x, g.y, nx, ny, false);
          }
        } else {
          const ex = (g.x - mx) / mrx, ey = (g.y - my) / mry;
          if (ex * ex + ey * ey < 0.55) { burst(g.x, g.y, -g.vx, -g.vy, true); integrity = Math.max(31, integrity - 0.45); spawn(g); }
        }
        if (g.x < -60 || g.y > H + 60) spawn(g);
        const tail = 0.045;
        ctx.strokeStyle = `rgba(22, 19, 17, ${0.78 * g.life})`; ctx.lineWidth = 1.7;
        ctx.beginPath(); ctx.moveTo(g.x - g.vx * tail, g.y - g.vy * tail); ctx.lineTo(g.x, g.y); ctx.stroke();
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt * (s.hot ? 2.6 : 3.4); s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.strokeStyle = s.hot ? `rgba(255, 96, 32, ${s.life})` : `rgba(255, 250, 240, ${s.life * 0.9})`; ctx.lineWidth = s.hot ? 1.8 : 1.2;
        ctx.beginPath(); ctx.moveTo(s.x - s.vx * 0.03, s.y - s.vy * 0.03); ctx.lineTo(s.x, s.y); ctx.stroke();
      }
      if (sealed) integrity = Math.min(100, integrity + dt * 16);
      const value = Math.round(integrity);
      if (value !== shownIntegrity && meter) { shownIntegrity = value; meter.textContent = pad(value); }
      if (state) { const text = sealed ? labels.safe : labels.open; if (state.textContent !== text) state.textContent = text; }
    };

    const menu = (event: Event) => event.preventDefault();
    stage.addEventListener("pointerdown", press);
    addEventListener("pointerup", release);
    addEventListener("pointercancel", release);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("resize", fit);
    stage.addEventListener("contextmenu", menu);
    ring?.addEventListener("keydown", key);
    const retry = root.querySelector(".v-again");
    retry?.addEventListener("click", again);
    fit();
    // Seeded once the stage has a size, already on their way in.
    for (let i = 0; i < COUNT; i++) { const g = { x: 0, y: 0, vx: 0, vy: 0, life: 1, out: false }; spawn(g); const lead = Math.random() * 1.4; g.x += g.vx * lead; g.y += g.vy * lead; grit.push(g); }
    load();
    frame = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      stage.removeEventListener("pointerdown", press);
      removeEventListener("pointerup", release);
      removeEventListener("pointercancel", release);
      removeEventListener("pointermove", move);
      removeEventListener("resize", fit);
      stage.removeEventListener("contextmenu", menu);
      ring?.removeEventListener("keydown", key);
      retry?.removeEventListener("click", again);
      for (const bitmap of cache.values()) bitmap.close();
    };
  }, []);

  return (
    <>
      <canvas className="v-view" ref={view} aria-hidden="true" />
      <canvas className="v-fx" ref={layer} aria-hidden="true" />
    </>
  );
}
