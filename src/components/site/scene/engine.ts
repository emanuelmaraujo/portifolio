import * as THREE from "three";
import { createForms, type FormName } from "./forms";
import { createPlaques } from "./plaques";
import { createBadges } from "./badges";
import { budget, type Tier } from "./quality";

/**
 * One persistent particle field for the whole page. Every chapter (`[data-form]`) names the figure the field takes while
 * that chapter is on screen. Scrolling morphs the same matter from one figure to the next.
 *
 * Chapters drive the scene through data attributes, so React never talks to WebGL directly:
 *   data-form     figure name. Changing it while the chapter holds the screen morphs the figure in place
 *   data-seed     text that generates the figure when data-form is "sigil"
 *   data-accent   accent colour for the chapter
 *   data-side     -1 | 0 | 1, where the figure sits horizontally (wide layouts)
 *   data-active   group id to highlight          data-glow / data-dim   field opacity on wide / compact layouts
 *   data-turn     extra yaw in radians, the keyboard alternative to dragging
 *   data-caption  what the figure stands for, announced through the `scene:chapter` event
 * The `scene:show` event (detail: a figure name, or null) lends the chapter on screen another figure for a while. The
 * site's guide uses it so the field takes the shape of what is being answered.
 * Elements with `data-anchor="name"` inside a chapter are positioned over the matching 3D anchor every frame.
 * Elements with `data-grab` are drag surfaces: dragging across one turns the figure, one to one with the finger.
 *
 * Input is direct. The figure turns with the scroll position itself (not its speed), so it moves exactly as far as the
 * page does and comes back when the page does. A finger that is scrolling does not disturb the particles; a tap does.
 *
 * The engine owns every listener and the only render loop. It renders at full rate while something moves, drops to a
 * slow tick when the page is idle and stops when the tab is hidden or the context is lost.
 */

type Pose = { scale: number; rx: number; ry: number; y: number; spin: number; sway: number; dolly: number };
const POSES: Record<FormName, Pose> = {
  mark: { scale: 1, rx: 0, ry: -0.32, y: 0, spin: 0, sway: 0.34, dolly: 6.4 },
  strata: { scale: 1, rx: 0.36, ry: -0.5, y: 0, spin: 0, sway: 0.22, dolly: 6.6 },
  aegis: { scale: 0.9, rx: 0.22, ry: 0.2, y: 0, spin: 0.5, sway: 0.3, dolly: 6.2 },
  lattice: { scale: 0.94, rx: 0.1, ry: -0.36, y: 0, spin: 0.16, sway: 0.3, dolly: 6.3 },
  keystone: { scale: 1, rx: 0.06, ry: -0.42, y: 0.1, spin: 0.1, sway: 0.26, dolly: 6.5 },
  orchestra: { scale: 0.95, rx: 0.12, ry: 0, y: 0, spin: 0, sway: 0.16, dolly: 6.4 },
  prumo: { scale: 1, rx: 0.08, ry: 0, y: 0, spin: 0.9, sway: 0.2, dolly: 6.2 },
  torvya: { scale: 1, rx: 0.1, ry: 0, y: 0, spin: 0, sway: 0.2, dolly: 5.9 },
  kreps: { scale: 0.95, rx: -0.12, ry: -0.42, y: 0, spin: 0, sway: 0.2, dolly: 6.4 },
  horizon: { scale: 1.2, rx: 0, ry: 0, y: -0.7, spin: 0, sway: 0.1, dolly: 6.8 },
  orbit: { scale: 1, rx: 0.3, ry: 0, y: 0, spin: 0, sway: 0.25, dolly: 6.3 },
  sigil: { scale: 0.95, rx: 0.15, ry: 0, y: 0, spin: 0.7, sway: 0.35, dolly: 6.4 },
};

const VERTEX = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec4 aMeta; // from tone, from group, to tone, to group
attribute vec3 aRand;
uniform float uMix, uTime, uActive, uSize, uMotion, uIntro, uStir, uVel;
uniform vec3 uPointer;
uniform vec4 uPulse; // xy: where the visitor touched, w: when
varying float vTone;
varying float vAlpha;

vec3 flow(vec3 p, float t) {
  return vec3(sin(p.y * 2.3 + t) + sin(p.z * 1.7 - t * 0.7), sin(p.z * 2.1 + t * 0.8) + sin(p.x * 1.9 + t * 0.5), sin(p.x * 2.7 - t * 0.6) + sin(p.y * 1.3 + t));
}

void main() {
  // Each particle leaves on its own beat. Part of the beat follows height, so a figure comes apart from the top down
  // while the next one is already settling: the morph reads as matter travelling, never as a crossfade.
  float order = mix(aRand.x, 0.5 - 0.5 * clamp(aFrom.y / 1.4, -1.0, 1.0), 0.4);
  float m = clamp(uMix * 1.6 - order * 0.6, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  vec3 p = mix(aFrom, aTo, m);
  float burst = sin(m * 3.14159);
  // In transit the matter turns around the vertical axis.
  float turn = burst * (aRand.y - 0.5) * 1.3;
  p.xz = mat2(cos(turn), -sin(turn), sin(turn), cos(turn)) * p.xz;
  p += flow(p * 1.2 + aRand * 6.0, uTime * 0.35) * (0.011 * uMotion + burst * 0.11 + uStir * 0.035);
  p += normalize(aRand - 0.5) * burst * 0.2 * aRand.y;
  // Scrolling drags a short streak behind every particle, in the direction of travel.
  p.y += uVel * (0.05 + aRand.z * 0.14) * (0.35 + burst);

  // Entrance: the field condenses from a wide cloud.
  float intro = clamp(uIntro * 1.5 - aRand.y * 0.5, 0.0, 1.0);
  intro = 1.0 - pow(1.0 - intro, 3.0);
  p = mix((aRand - 0.5) * vec3(9.0, 6.0, 5.0), p, intro);

  vec4 world = modelMatrix * vec4(p, 1.0);
  vec3 away = world.xyz - uPointer;
  float near = smoothstep(0.7, 0.0, length(away.xy)) * uMotion;
  // Under the pointer the surface swells towards the viewer and brightens. It is not pushed aside, so the figure
  // never shows a hole where the cursor rests.
  world.xyz += vec3(normalize(away.xy + 0.0001) * 0.035, 0.22) * near;

  // A touch sends one ring through the field.
  float age = uTime - uPulse.w;
  vec2 fromTouch = world.xy - uPulse.xy;
  float ring = exp(-pow((length(fromTouch) - age * 2.4) * 3.2, 2.0)) * exp(-age * 1.5) * step(age, 3.0) * uMotion;
  world.xyz += vec3(normalize(fromTouch + 0.0001) * 0.15, 0.28) * ring;

  vec4 view = viewMatrix * world;
  gl_Position = projectionMatrix * view;

  float tone = mix(aMeta.x, aMeta.z, m);
  float group = m > 0.5 ? aMeta.w : aMeta.y;
  float lit = uActive < 0.0 ? 0.0 : (abs(group - uActive) < 0.5 ? 1.0 : -1.0);
  float far = smoothstep(5.4, 9.0, -view.z);
  vTone = clamp(tone + max(lit, 0.0) + ring * 0.6, 0.0, 1.0);
  vAlpha = (0.5 + 0.5 * aRand.z) * (lit < 0.0 ? 0.42 : 1.0) * (0.25 + 0.75 * intro) * mix(1.0, 0.45, far);
  gl_PointSize = uSize * (0.55 + aRand.z * 0.95) * (1.0 + max(lit, 0.0) * 0.45 + near * 0.9 + ring * 1.6) / -view.z;
}`;

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uBase, uAccent;
uniform float uOpacity;
varying float vTone;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float disc = smoothstep(0.5, 0.12, d);
  gl_FragColor = vec4(mix(uBase, uAccent, vTone), disc * vAlpha * uOpacity);
}`;

type Chapter = { el: HTMLElement; anchors: HTMLElement[] };

export type Engine = { dispose(): void };
export type QualityReport = { tier: Tier; particles: number; dpr: number; fps: number };

/** Compact layout: the figure sits behind the text instead of beside it. Mirrors the media query in site.css. */
export const COMPACT = "(max-width: 899px) and (orientation: portrait), (max-width: 599px)";

export function createEngine(canvas: HTMLCanvasElement, tier: Exclude<Tier, "static">, onLost: () => void): Engine {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia(COMPACT);
  const touch = matchMedia("(pointer: coarse)").matches;
  const limits = budget(tier, touch);
  const count = limits.particles;
  let dpr = limits.dpr, fps = limits.fps, drawn = count;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: tier === "lite" ? "low-power" : "high-performance" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  camera.position.set(0, 0, 6.4);
  const rig = new THREE.Group();
  scene.add(rig);

  const forms = createForms(count);
  const geometry = new THREE.BufferGeometry();
  const from = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  const to = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  const meta = new THREE.BufferAttribute(new Float32Array(count * 4), 4);
  const rand = new Float32Array(count * 3);
  let seed = 7;
  const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < rand.length; i++) rand[i] = next();
  // Figures are written part by part. Drawing through a shuffled index lets the engine draw fewer particles under
  // load and thin the whole figure evenly, instead of cutting off whatever part was written last.
  const order = new Uint32Array(count);
  for (let i = 0; i < count; i++) order[i] = i;
  for (let i = count - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t; }
  geometry.setIndex(new THREE.BufferAttribute(order, 1));
  geometry.setAttribute("position", from); // three needs a position attribute to draw; the shader uses aFrom/aTo
  geometry.setAttribute("aFrom", from);
  geometry.setAttribute("aTo", to);
  geometry.setAttribute("aMeta", meta);
  geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

  const uniforms = {
    uMix: { value: 0 }, uTime: { value: 0 }, uActive: { value: -1 }, uSize: { value: 1 }, uMotion: { value: 1 }, uIntro: { value: 0 }, uStir: { value: 0 }, uVel: { value: 0 },
    uPointer: { value: new THREE.Vector3(99, 99, 0) }, uPulse: { value: new THREE.Vector4(0, 0, 0, -10) },
    uBase: { value: new THREE.Color("#ede8df") }, uAccent: { value: new THREE.Color("#ff5b22") }, uOpacity: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({ vertexShader: VERTEX, fragmentShader: FRAGMENT, uniforms, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  rig.add(points);

  // Depth dust: sparse points far behind and in front of the figure. They are not part of any figure, so the camera's
  // small moves show real parallax between the layers.
  let dust: THREE.Points | null = null;
  if (limits.dust) {
    const spots = new Float32Array(limits.dust * 3);
    for (let i = 0; i < limits.dust; i++) spots.set([(next() - 0.5) * 15, (next() - 0.5) * 10, -7 + next() * 9.5], i * 3);
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(spots, 3));
    dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xede8df, size: 0.022, sizeAttenuation: true, transparent: true, opacity: 0.4, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
    dust.frustumCulled = false;
    scene.add(dust);
  }

  const plaques = createPlaques(limits.reflections ? renderer : null);
  rig.add(plaques.group);
  const orbit = document.querySelector<HTMLElement>('[data-form="orbit"]');
  const badges = orbit ? createBadges((orbit.dataset.badges ?? "").split(",").filter(Boolean), camera) : null;
  if (badges) rig.add(badges.group);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x20242c, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(2.5, 3.5, 4);
  scene.add(key);

  const chapters: Chapter[] = [...document.querySelectorAll<HTMLElement>("[data-form]")].map(el => ({ el, anchors: [...el.querySelectorAll<HTMLElement>("[data-anchor]")] }));
  const formOf = (c: Chapter) => c.el.dataset.form as FormName;
  let lent: { chapter: Chapter; key: string } | null = null;
  const keyOf = (c: Chapter) => (lent?.chapter === c ? lent.key : formOf(c) === "sigil" ? "sigil:" + (c.el.dataset.seed ?? "") : formOf(c));
  let pair = ["", ""];
  const load = (a: string, b: string) => {
    if (pair[0] === a && pair[1] === b) return;
    pair = [a, b];
    const A = forms(a), B = forms(b);
    (from.array as Float32Array).set(A.pos);
    (to.array as Float32Array).set(B.pos);
    const m = meta.array as Float32Array;
    for (let i = 0; i < count; i++) { m[i * 4] = A.tone[i]; m[i * 4 + 1] = A.group[i]; m[i * 4 + 2] = B.tone[i]; m[i * 4 + 3] = B.group[i]; }
    from.needsUpdate = to.needsUpdate = meta.needsUpdate = true;
  };

  /** Continuous chapter position: integer while a chapter holds the screen, fractional while crossing a boundary. */
  const target = () => {
    const centre = innerHeight * 0.5, span = innerHeight * 0.8;
    for (let i = 0; i < chapters.length; i++) {
      const box = chapters[i].el.getBoundingClientRect();
      if (centre < box.bottom || i === chapters.length - 1) {
        const leaving = THREE.MathUtils.clamp((centre - (box.bottom - span / 2)) / span, 0, 1);
        const entering = THREE.MathUtils.clamp((centre - (box.top - span / 2)) / span, 0, 1);
        return THREE.MathUtils.clamp(i + leaving - (1 - entering), 0, chapters.length - 1);
      }
    }
    return 0;
  };

  // Input --------------------------------------------------------------------
  const pointer = new THREE.Vector2(0, 0), pointerSmooth = new THREE.Vector2(0, 0), rest = new THREE.Vector2(0, 0), tilt = new THREE.Vector2(0, 0);
  let pointerSeen = false, tilting = false, lastInput = performance.now();
  const drag = { on: false, id: -1, x: 0, y: 0, yaw: 0, pitch: 0, goal: 0, tilt: 0, vyaw: 0, released: 0 };
  const tap = { id: -1, x: 0, y: 0, at: 0 };
  const place = (x: number, y: number) => { pointer.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1); pointerSeen = true; };
  const awake = () => { lastInput = performance.now(); wake(); };

  const onPointerMove = (e: PointerEvent) => {
    if (drag.on && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      // The same distance on any screen: a full swipe across the viewport is a little under half a turn.
      drag.vyaw = (dx / innerWidth) * 2.6;
      drag.goal = THREE.MathUtils.clamp(drag.goal + drag.vyaw, -1.3, 1.3);
      if (e.pointerType === "mouse") drag.tilt = THREE.MathUtils.clamp(drag.tilt + (dy / innerHeight) * 1.6, -0.5, 0.5);
      awake();
    }
    if (e.pointerType === "mouse") { place(e.clientX, e.clientY); lastInput = performance.now(); }
  };
  const world = new THREE.Vector3(), ray = new THREE.Vector3();
  const onPlane = (out: THREE.Vector3) => {
    ray.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
    return out.copy(camera.position).addScaledVector(ray, -camera.position.z / ray.z);
  };
  const pulse = (x: number, y: number) => {
    if (reduced.matches) return;
    pointer.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
    onPlane(world);
    uniforms.uPulse.value.set(world.x, world.y, 0, time);
  };
  const onPointerDown = (e: PointerEvent) => {
    const mouse = e.pointerType === "mouse";
    if (mouse) place(e.clientX, e.clientY);
    const grab = (e.target as Element | null)?.closest?.("[data-grab]");
    if (grab) {
      drag.on = true; drag.id = e.pointerId; drag.x = e.clientX; drag.y = e.clientY; drag.vyaw = 0;
      document.documentElement.dataset.touched = "1";
    }
    // A mouse press answers at once. A finger only answers if it turns out to be a tap, so scrolling stays quiet.
    if (mouse) pulse(e.clientX, e.clientY); else { tap.id = e.pointerId; tap.x = e.clientX; tap.y = e.clientY; tap.at = performance.now(); }
    awake();
  };
  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerId === drag.id) { drag.on = false; drag.id = -1; drag.released = performance.now(); }
    if (e.type === "pointerup" && e.pointerId === tap.id && performance.now() - tap.at < 350 && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 12) { pulse(e.clientX, e.clientY); awake(); }
    if (e.pointerId === tap.id) tap.id = -1;
  };
  const onLeave = () => { pointerSeen = false; };
  // Device tilt is opt-in: the page asks for it (and for permission where the browser requires one) before listening.
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma === null || e.beta === null) return;
    tilt.set(THREE.MathUtils.clamp(e.gamma / 35, -1, 1), THREE.MathUtils.clamp((e.beta - 50) / 35, -1, 1));
    awake();
  };
  const onShow = (e: Event) => {
    const key = (e as CustomEvent<string | null>).detail;
    lent = key && leading >= 0 ? { chapter: chapters[leading], key } : null;
    awake();
  };
  const onTiltSwitch = (e: Event) => {
    const on = Boolean((e as CustomEvent<boolean>).detail);
    if (on === tilting) return;
    tilting = on;
    if (on) addEventListener("deviceorientation", onTilt); else { removeEventListener("deviceorientation", onTilt); tilt.set(0, 0); }
  };

  const report = () => {
    const detail: QualityReport = { tier, particles: drawn, dpr, fps };
    document.documentElement.dataset.quality = tier;
    dispatchEvent(new CustomEvent("scene:quality", { detail }));
  };
  const resize = () => {
    renderer.setPixelRatio(dpr);
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    // Fewer particles are drawn larger, so a thinned figure keeps its weight.
    uniforms.uSize.value = innerHeight * dpr * (compact.matches ? 0.03 : 0.026) * Math.min(1.5, Math.sqrt((touch ? 11000 : 26000) / drawn));
    geometry.setDrawRange(0, drawn);
  };

  const accent = new THREE.Color(), base = new THREE.Color(), tmp = new THREE.Vector3();
  const poseOf = (c: Chapter) => {
    const pose = POSES[formOf(c)] ?? POSES.mark;
    return { pose, side: Number(c.el.dataset.side ?? 0), spin: Number(c.el.dataset.spin ?? pose.spin), turn: Number(c.el.dataset.turn ?? 0) };
  };

  let lastScroll = scrollY, stir = 0, velocity = 0, turn = 0, scrub = 0;
  const shown = new Map<Chapter, string>();
  let swap: { chapter: Chapter; from: string; to: string; t: number } | null = null;
  let position = target(), raf = 0, last = performance.now(), time = 0, visible = !document.hidden, slow = 0, lost = false, intro = 0, leading = -1;
  let ready = false, captioned = "";

  const frame = (now: number) => {
    raf = 0;
    if (lost) return;
    const elapsed = now - last, still = reduced.matches, goal = target();
    const settled = Math.abs(goal - position) < 0.0015 && !swap && intro >= 1 && !drag.on && Math.abs(drag.vyaw) < 0.0005 && Math.abs(drag.goal - drag.yaw) < 0.001;
    // Nothing moved for a while: keep the figure breathing at a slow tick and let the GPU rest.
    const rate = settled && now - lastInput > 4000 ? Math.min(fps, 24) : fps;
    if (elapsed < 1000 / rate - 2) { raf = requestAnimationFrame(frame); return; }
    const dt = Math.min(0.05, elapsed / 1000);
    last = now;
    time += still ? 0 : dt;

    position = still ? goal : position + (goal - position) * (1 - Math.exp(-dt * 9));
    const a = Math.min(chapters.length - 1, Math.floor(position)), b = Math.min(chapters.length - 1, a + 1);
    let mix = position - a;
    if (still) mix = mix < 0.5 ? 0 : 1; // reduced motion: figures swap without travelling
    // A chapter can change its own figure while it holds the screen (a pillar being chosen, a list pointing at an
    // article). That morph runs on its own clock, between the figure that was showing and the new one.
    const holding = mix < 0.02 ? chapters[a] : mix > 0.98 ? chapters[b] : null;
    if (swap && swap.chapter !== holding) { shown.set(swap.chapter, keyOf(swap.chapter)); swap = null; }
    if (holding && !swap) {
      const key = keyOf(holding), before = shown.get(holding) ?? key;
      if (key !== before) swap = { chapter: holding, from: before, to: key, t: 0 };
      else shown.set(holding, key);
    }
    let travel = mix; // 0..1 through whichever morph is running, for the camera
    if (swap) {
      swap.t = still ? 1 : Math.min(1, swap.t + dt / 0.9);
      load(swap.from, swap.to);
      uniforms.uMix.value = travel = swap.t;
      if (swap.t >= 1) { shown.set(swap.chapter, swap.to); swap = null; }
    } else {
      load(keyOf(chapters[a]), keyOf(chapters[b]));
      uniforms.uMix.value = mix;
    }
    uniforms.uTime.value = time;
    uniforms.uMotion.value = still ? 0 : 1;

    // Scrolling stirs the field and leaves a streak, so the figure answers the gesture even without a cursor.
    const moved = (scrollY - lastScroll) / Math.max(dt, 0.001) / innerHeight;
    lastScroll = scrollY;
    stir += (Math.min(1, Math.abs(moved) * 0.4) - stir) * (1 - Math.exp(-dt * 4));
    velocity += (THREE.MathUtils.clamp(moved * 0.3, -1, 1) - velocity) * (1 - Math.exp(-dt * 4));
    // The figure turns with the page: this depends on where the scroll is, never on how fast it got there.
    scrub += (Math.sin((scrollY / innerHeight) * 1.1) * 0.42 - scrub) * (still ? 1 : 1 - Math.exp(-dt * 12));
    uniforms.uStir.value = still ? 0 : stir;
    uniforms.uVel.value = still ? 0 : velocity;
    // The entrance never blocks: the text is already readable, and the first scroll hurries the field into place.
    intro = still ? 1 : Math.min(1, intro + (dt / 1.8) * (scrollY > 8 ? 3 : 1));
    uniforms.uIntro.value = intro;

    const lead = chapters[mix < 0.5 ? a : b], A = poseOf(chapters[a]), B = poseOf(chapters[b]);
    const e = mix * mix * (3 - 2 * mix), lerp = THREE.MathUtils.lerp;
    const phone = compact.matches;
    uniforms.uActive.value = lead.el.dataset.active ? Number(lead.el.dataset.active) : -1;
    accent.set(chapters[a].el.dataset.accent || "#ff5b22").lerp(base.set(chapters[b].el.dataset.accent || "#ff5b22"), e);
    uniforms.uAccent.value.copy(accent);
    // Compact layouts: each chapter opens with a clear window for the figure (its top padding). The figure is at full
    // strength there and steps back to `data-dim` once the text scrolls over it.
    const strength = (c: Chapter) => {
      if (!phone) return Number(c.el.dataset.glow ?? 1);
      const dim = Number(c.el.dataset.dim ?? 0.4), pad = parseFloat(getComputedStyle(c.el).paddingTop);
      if (pad < innerHeight * 0.25) return dim;
      const contentTop = c.el.getBoundingClientRect().top + pad;
      return lerp(dim, 1, THREE.MathUtils.clamp((contentTop - innerHeight * 0.3) / (innerHeight * 0.2), 0, 1));
    };
    const opacity = lerp(strength(chapters[a]), strength(chapters[b]), e);
    uniforms.uOpacity.value = opacity;

    pointerSmooth.lerp(pointerSeen ? pointer : tilting ? tilt : rest, 1 - Math.exp(-dt * 4));

    // Drag: the figure follows the finger, keeps a little momentum on release and then eases home.
    if (!drag.on) {
      drag.goal = THREE.MathUtils.clamp(drag.goal + drag.vyaw, -1.3, 1.3);
      drag.vyaw *= Math.exp(-dt * 3.2);
      if (now - drag.released > 1800) { const home = 1 - Math.exp(-dt * 1.1); drag.goal -= drag.goal * home; drag.tilt -= drag.tilt * home; }
    }
    // What is drawn follows the finger through a short spring: tight enough to feel held, soft enough to hide jitter.
    const follow = still ? 1 : 1 - Math.exp(-dt * 16);
    drag.yaw += (drag.goal - drag.yaw) * follow;
    drag.pitch += (drag.tilt - drag.pitch) * follow;
    turn += (lerp(A.turn, B.turn, e) - turn) * (still ? 1 : 1 - Math.exp(-dt * 6));

    // Camera: it dollies with the chapter, pushes through the cloud while a figure is in transit, backs off a little
    // under fast scrolling and shifts with the pointer, which is what gives the layers their parallax.
    const transit = still ? 0 : Math.sin(Math.min(1, Math.max(0, travel)) * Math.PI);
    const dolly = lerp(A.pose.dolly, B.pose.dolly, e) - transit * (compact.matches ? 0.3 : 0.6) + stir * 0.2;
    camera.position.set(still ? 0 : pointerSmooth.x * 0.3, still ? 0 : pointerSmooth.y * 0.18, dolly);
    camera.lookAt(0, 0, 0);

    const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dolly * camera.aspect;
    const shift = phone ? 0 : lerp(A.side, B.side, e) * halfW * 0.46;
    const fit = phone ? Math.min(0.72, camera.aspect * 1.25) : 1; // tablets keep the figure clear of the text
    // `spin` is the amplitude of a slow turn. It always returns to the authored pose, so later chapters start aligned.
    const spin = still ? 0 : Math.sin(time * 0.33) * lerp(A.spin, B.spin, e);
    const sway = lerp(A.pose.sway, B.pose.sway, e);
    const lift = phone ? lerp(Number(chapters[a].el.dataset.lift ?? 0.85), Number(chapters[b].el.dataset.lift ?? 0.85), e) : 0;
    rig.position.set(shift, lerp(A.pose.y, B.pose.y, e) + lift, 0);
    rig.scale.setScalar(lerp(A.pose.scale, B.pose.scale, e) * fit);
    rig.rotation.set(
      lerp(A.pose.rx, B.pose.rx, e) - pointerSmooth.y * sway * 0.5 + drag.pitch,
      lerp(A.pose.ry, B.pose.ry, e) + spin + pointerSmooth.x * sway + drag.yaw + turn + scrub + (still ? 0 : Math.sin(time * 0.21 + 1.3) * 0.06),
      0,
    );
    rig.updateMatrixWorld();
    camera.updateMatrixWorld();
    if (dust) {
      dust.position.y = position * 0.3;
      dust.rotation.y = time * 0.012;
      (dust.material as THREE.PointsMaterial).opacity = 0.4 * Math.min(1, opacity + 0.2) * intro;
    }

    // Pointer on the z=0 plane, in world space, for the repulsion in the shader.
    if (pointerSeen && !still && !drag.on) onPlane(uniforms.uPointer.value); else uniforms.uPointer.value.set(99, 99, 0);

    const torvya = chapters.findIndex(c => formOf(c) === "torvya");
    plaques.update(torvya < 0 ? 0 : Math.max(0, 1 - Math.abs(position - torvya) * 2.4), time, lead.el.dataset.plaque ?? "review", still);
    if (badges && orbit) {
      const at = chapters.findIndex(c => c.el === orbit);
      badges.update(Math.max(0, 1 - Math.abs(position - at) * 2.4), time, Number(orbit.dataset.badge ?? -1), still, dt);
    }

    // Labels follow their 3D anchors.
    for (const [index, chapter] of chapters.entries()) {
      if (!chapter.anchors.length) continue;
      const presence = Math.max(0, 1 - Math.abs(position - index) * 3);
      const anchors = forms(keyOf(chapter)).anchors;
      for (const label of chapter.anchors) {
        const at = anchors[label.dataset.anchor!];
        if (!at || presence === 0) { label.style.opacity = "0"; continue; }
        tmp.set(at[0], at[1], at[2]).applyMatrix4(rig.matrixWorld).project(camera);
        const box = chapter.el.getBoundingClientRect();
        label.style.opacity = String(presence);
        label.style.transform = `translate3d(${((tmp.x + 1) / 2) * innerWidth - box.left}px, ${((1 - tmp.y) / 2) * innerHeight - box.top}px, 0)`;
      }
    }

    const leadIndex = mix < 0.5 ? a : b;
    if (lent && lent.chapter !== lead) lent = null; // the visitor scrolled on: the chapter gets its own figure back
    const caption = lead.el.dataset.caption ?? "";
    if (leadIndex !== leading || caption !== captioned) {
      leading = leadIndex;
      captioned = caption;
      dispatchEvent(new CustomEvent("scene:chapter", { detail: { index: leadIndex, total: chapters.length, caption } }));
    }

    renderer.render(scene, camera);
    if (!ready) { ready = true; performance.mark("scene:first-frame"); }

    // Measured performance has the last word. Sustained slow frames lower the pixel ratio first, then the number of
    // particles drawn, then the frame rate. The steps are one-way for the visit, so quality never oscillates.
    if (rate === fps && elapsed < 250) slow = elapsed > (1000 / fps) * 1.45 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 50) {
      slow = 0;
      if (dpr > 1) dpr = Math.max(1, dpr - 0.25);
      else if (drawn > 5000) drawn = Math.max(5000, Math.round(drawn * 0.7));
      else if (fps > 30) fps = 30;
      resize();
      report();
    }

    if (visible && !(still && settled)) raf = requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf && visible && !lost) { last = performance.now() - 17; raf = requestAnimationFrame(frame); } };

  const onVisibility = () => { visible = !document.hidden; if (visible) awake(); else { cancelAnimationFrame(raf); raf = 0; } };
  const onResize = () => { resize(); awake(); };
  const onContextLost = (e: Event) => { e.preventDefault(); lost = true; cancelAnimationFrame(raf); raf = 0; onLost(); };
  addEventListener("pointermove", onPointerMove, { passive: true });
  addEventListener("pointerdown", onPointerDown, { passive: true });
  addEventListener("pointerup", onPointerUp, { passive: true });
  addEventListener("pointercancel", onPointerUp, { passive: true });
  addEventListener("scene:tilt", onTiltSwitch);
  addEventListener("scene:show", onShow);
  document.documentElement.addEventListener("pointerleave", onLeave);
  addEventListener("resize", onResize);
  addEventListener("scroll", awake, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", awake);
  compact.addEventListener("change", onResize);
  canvas.addEventListener("webglcontextlost", onContextLost);
  // Chapters change their attributes while the page is idle; repaint when they do.
  const observer = new MutationObserver(awake);
  for (const c of chapters) observer.observe(c.el, { attributes: true, attributeFilter: ["data-active", "data-plaque", "data-seed", "data-badge", "data-form", "data-turn"] });

  resize();
  report();
  wake();

  return {
    dispose() {
      cancelAnimationFrame(raf);
      lost = true;
      observer.disconnect();
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("pointerdown", onPointerDown);
      removeEventListener("pointerup", onPointerUp);
      removeEventListener("pointercancel", onPointerUp);
      removeEventListener("scene:tilt", onTiltSwitch);
      removeEventListener("scene:show", onShow);
      removeEventListener("deviceorientation", onTilt);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      removeEventListener("resize", onResize);
      removeEventListener("scroll", awake);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", awake);
      compact.removeEventListener("change", onResize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.dispose();
      material.dispose();
      if (dust) { dust.geometry.dispose(); (dust.material as THREE.Material).dispose(); }
      plaques.dispose();
      badges?.dispose();
      renderer.dispose();
    },
  };
}
