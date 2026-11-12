import * as THREE from "three";
import { createForms, type FormName } from "./forms";
import { createPlaques } from "./plaques";
import { createBadges } from "./badges";

/**
 * One persistent particle field for the whole page. Every chapter (`[data-form]`) names the figure the field takes while
 * that chapter is on screen. Scrolling morphs the same matter from one figure to the next.
 *
 * Chapters drive the scene through data attributes, so React never talks to WebGL directly:
 *   data-form     figure name                    data-accent   accent colour for the chapter
 *   data-side     -1 | 0 | 1, where the figure sits horizontally (desktop)
 *   data-active   group id to highlight          data-glow / data-dim   field opacity on desktop / phone
 *   data-seed    text that generates the figure when data-form is "sigil"; changing it morphs the figure in place
 * Elements with `data-anchor="name"` inside a chapter are positioned over the matching 3D anchor every frame.
 */

type Pose = { scale: number; rx: number; ry: number; y: number; spin: number; sway: number };
const POSES: Record<FormName, Pose> = {
  mark: { scale: 1, rx: 0, ry: -0.32, y: 0, spin: 0, sway: 0.34 },
  strata: { scale: 1, rx: 0.36, ry: -0.5, y: 0, spin: 0, sway: 0.22 },
  graph: { scale: 0.92, rx: 0.1, ry: 0, y: 0, spin: 0.3, sway: 0.3 },
  orchestra: { scale: 0.95, rx: 0.12, ry: 0, y: 0, spin: 0, sway: 0.16 },
  prumo: { scale: 1, rx: 0.08, ry: 0, y: 0, spin: 0.9, sway: 0.2 },
  torvya: { scale: 1, rx: 0.1, ry: 0, y: 0, spin: 0, sway: 0.2 },
  kreps: { scale: 0.95, rx: -0.12, ry: -0.42, y: 0, spin: 0, sway: 0.2 },
  horizon: { scale: 1.2, rx: 0, ry: 0, y: -0.7, spin: 0, sway: 0.1 },
  orbit: { scale: 1, rx: 0.3, ry: 0, y: 0, spin: 0, sway: 0.25 },
  sigil: { scale: 0.95, rx: 0.15, ry: 0, y: 0, spin: 0.7, sway: 0.35 },
};

const VERTEX = /* glsl */ `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec4 aMeta; // from tone, from group, to tone, to group
attribute vec3 aRand;
uniform float uMix, uTime, uActive, uSize, uMotion, uIntro, uStir;
uniform vec3 uPointer;
varying float vTone;
varying float vAlpha;

vec3 flow(vec3 p, float t) {
  return vec3(sin(p.y * 2.3 + t) + sin(p.z * 1.7 - t * 0.7), sin(p.z * 2.1 + t * 0.8) + sin(p.x * 1.9 + t * 0.5), sin(p.x * 2.7 - t * 0.6) + sin(p.y * 1.3 + t));
}

void main() {
  // Each particle leaves on its own beat, so a morph reads as matter travelling rather than a crossfade.
  float m = clamp(uMix * 1.6 - aRand.x * 0.6, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  vec3 p = mix(aFrom, aTo, m);
  float burst = sin(m * 3.14159);
  p += flow(p * 1.2 + aRand * 6.0, uTime * 0.35) * (0.011 * uMotion + burst * 0.2 + uStir * 0.07);
  p += normalize(aRand - 0.5) * burst * 0.3 * aRand.y;

  // Entrance: the field condenses from a wide cloud.
  float intro = clamp(uIntro * 1.5 - aRand.y * 0.5, 0.0, 1.0);
  intro = 1.0 - pow(1.0 - intro, 3.0);
  p = mix((aRand - 0.5) * vec3(9.0, 6.0, 5.0), p, intro);

  vec4 world = modelMatrix * vec4(p, 1.0);
  vec3 away = world.xyz - uPointer;
  float near = smoothstep(0.8, 0.0, length(away.xy)) * uMotion;
  world.xyz += normalize(vec3(away.xy, 0.35)) * near * 0.26;

  vec4 view = viewMatrix * world;
  gl_Position = projectionMatrix * view;

  float tone = mix(aMeta.x, aMeta.z, m);
  float group = m > 0.5 ? aMeta.w : aMeta.y;
  float lit = uActive < 0.0 ? 0.0 : (abs(group - uActive) < 0.5 ? 1.0 : -1.0);
  vTone = clamp(tone + max(lit, 0.0), 0.0, 1.0);
  vAlpha = (0.5 + 0.5 * aRand.z) * (lit < 0.0 ? 0.42 : 1.0) * (0.25 + 0.75 * intro);
  gl_PointSize = uSize * (0.55 + aRand.z * 0.95) * (1.0 + max(lit, 0.0) * 0.45 + near * 1.4) / -view.z;
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

type Chapter = { el: HTMLElement; form: FormName; anchors: HTMLElement[] };

export type Engine = { dispose(): void };

export function createEngine(canvas: HTMLCanvasElement, onLost: () => void): Engine {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = matchMedia("(pointer: coarse)").matches;
  const small = () => innerWidth < 900;
  const count = coarse || innerWidth < 900 ? 11000 : 26000;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  let dpr = Math.min(devicePixelRatio, coarse ? 1.5 : 1.75);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  camera.position.set(0, 0, 6.4);
  const rig = new THREE.Group();
  scene.add(rig);

  const forms = createForms(count);
  const chapters_orbit = () => document.querySelector<HTMLElement>('[data-form="orbit"]');
  const geometry = new THREE.BufferGeometry();
  const from = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  const to = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  const meta = new THREE.BufferAttribute(new Float32Array(count * 4), 4);
  const rand = new Float32Array(count * 3);
  let seed = 7;
  for (let i = 0; i < rand.length; i++) { seed = (seed * 16807) % 2147483647; rand[i] = seed / 2147483647; }
  geometry.setAttribute("position", from); // three needs a position attribute to draw; the shader uses aFrom/aTo
  geometry.setAttribute("aFrom", from);
  geometry.setAttribute("aTo", to);
  geometry.setAttribute("aMeta", meta);
  geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

  const uniforms = {
    uMix: { value: 0 }, uTime: { value: 0 }, uActive: { value: -1 }, uSize: { value: 1 }, uMotion: { value: 1 }, uIntro: { value: 0 }, uStir: { value: 0 },
    uPointer: { value: new THREE.Vector3(99, 99, 0) }, uBase: { value: new THREE.Color("#ede8df") }, uAccent: { value: new THREE.Color("#ff5b22") },
    uOpacity: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({ vertexShader: VERTEX, fragmentShader: FRAGMENT, uniforms, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  rig.add(points);

  const plaques = createPlaques();
  rig.add(plaques.group);
  const orbit = chapters_orbit();
  const badges = orbit ? createBadges((orbit.dataset.badges ?? "").split(",").filter(Boolean), camera) : null;
  if (badges) rig.add(badges.group);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x20242c, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(2.5, 3.5, 4);
  scene.add(key);

  let chapters: Chapter[] = [];
  const collect = () => {
    chapters = [...document.querySelectorAll<HTMLElement>("[data-form]")].map(el => ({
      el, form: el.dataset.form as FormName, anchors: [...el.querySelectorAll<HTMLElement>("[data-anchor]")],
    }));
  };
  collect();

  const keyOf = (c: Chapter) => (c.form === "sigil" ? "sigil:" + (c.el.dataset.seed ?? "") : c.form);
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

  const pointer = new THREE.Vector2(0, 0), pointerSmooth = new THREE.Vector2(0, 0), rest = new THREE.Vector2(0, 0);
  let pointerSeen = false;
  const onPointer = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); pointerSeen = true; };
  const onLeave = () => { pointerSeen = false; };
  // On touch screens the finger that scrolls also pushes the particles, and tilting the device turns the scene.
  const onTouch = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    pointer.set((touch.clientX / innerWidth) * 2 - 1, -(touch.clientY / innerHeight) * 2 + 1);
    pointerSeen = true;
    wake();
  };
  const tilt = new THREE.Vector2(0, 0);
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma === null || e.beta === null) return;
    tilt.set(THREE.MathUtils.clamp(e.gamma / 35, -1, 1), THREE.MathUtils.clamp((e.beta - 50) / 35, -1, 1));
  };

  const resize = () => {
    renderer.setPixelRatio(dpr);
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    uniforms.uSize.value = innerHeight * dpr * (small() ? 0.03 : 0.026);
  };

  const accent = new THREE.Color(), base = new THREE.Color(), tmp = new THREE.Vector3(), ray = new THREE.Vector3();
  const poseOf = (c: Chapter) => {
    const pose = POSES[c.form] ?? POSES.mark, side = Number(c.el.dataset.side ?? 0);
    return { pose, side, spin: Number(c.el.dataset.spin ?? pose.spin) };
  };

  let lastScroll = scrollY, stir = 0;
  const shown = new Map<Chapter, string>();
  let swap: { chapter: Chapter; from: string; to: string; t: number } | null = null;
  let position = target(), raf = 0, last = performance.now(), time = 0, spin = 0, visible = true, slow = 0, lost = false;
  let start = 0; // set when the loader lifts, so the field condenses in view

  const frame = (now: number) => {
    raf = 0;
    if (lost) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const still = reduced.matches;
    time += still ? 0 : dt;

    const goal = target();
    position = still ? goal : position + (goal - position) * (1 - Math.exp(-dt * 7));
    const a = Math.min(chapters.length - 1, Math.floor(position)), b = Math.min(chapters.length - 1, a + 1);
    let mix = position - a;
    if (still) mix = mix < 0.5 ? 0 : 1; // reduced motion: figures swap without travelling
    // A chapter can change its own figure while it holds the screen (a list choosing an article). That morph runs on
    // its own clock, between the figure that was showing and the new one.
    const holding = mix < 0.02 ? chapters[a] : mix > 0.98 ? chapters[b] : null;
    if (swap && swap.chapter !== holding) { shown.set(swap.chapter, keyOf(swap.chapter)); swap = null; }
    if (holding && !swap) {
      const key = keyOf(holding), before = shown.get(holding) ?? key;
      if (key !== before) swap = { chapter: holding, from: before, to: key, t: 0 };
      else shown.set(holding, key);
    }
    if (swap) {
      swap.t = still ? 1 : Math.min(1, swap.t + dt / 0.85);
      load(swap.from, swap.to);
      uniforms.uMix.value = swap.t;
      if (swap.t >= 1) { shown.set(swap.chapter, swap.to); swap = null; }
    } else {
      load(keyOf(chapters[a]), keyOf(chapters[b]));
      uniforms.uMix.value = mix;
    }
    uniforms.uTime.value = time;
    uniforms.uMotion.value = still ? 0 : 1;
    if (!start && document.documentElement.dataset.ready) start = now;
    uniforms.uIntro.value = still ? 1 : start ? Math.min(1, (now - start) / 2600) : 0;

    const lead = chapters[mix < 0.5 ? a : b], A = poseOf(chapters[a]), B = poseOf(chapters[b]);
    const e = mix * mix * (3 - 2 * mix), lerp = THREE.MathUtils.lerp;
    const phone = small();
    uniforms.uActive.value = lead.el.dataset.active ? Number(lead.el.dataset.active) : -1;
    accent.set(chapters[a].el.dataset.accent || "#ff5b22").lerp(base.set(chapters[b].el.dataset.accent || "#ff5b22"), e);
    uniforms.uAccent.value.copy(accent);
    // On phones the figure sits behind the text, so it steps back.
    // Phones: each chapter opens with a clear window for the figure (its top padding). The figure is at full strength
    // there and steps back to `data-dim` once the text scrolls over it.
    const strength = (c: Chapter) => {
      if (!phone) return Number(c.el.dataset.glow ?? 1);
      const dim = Number(c.el.dataset.dim ?? 0.4), pad = parseFloat(getComputedStyle(c.el).paddingTop);
      if (pad < innerHeight * 0.25) return dim;
      const contentTop = c.el.getBoundingClientRect().top + pad;
      return lerp(dim, 1, THREE.MathUtils.clamp((contentTop - innerHeight * 0.3) / (innerHeight * 0.2), 0, 1));
    };
    uniforms.uOpacity.value = lerp(strength(chapters[a]), strength(chapters[b]), e);

    pointerSmooth.lerp(pointerSeen ? pointer : coarse ? tilt : rest, 1 - Math.exp(-dt * 4));

    // Scrolling stirs the field, so the figure answers the gesture even without a cursor.
    const speed = Math.abs(scrollY - lastScroll) / Math.max(dt, 0.001) / innerHeight;
    lastScroll = scrollY;
    stir += (Math.min(1, speed * 0.5) - stir) * (1 - Math.exp(-dt * 5));
    uniforms.uStir.value = still ? 0 : stir;
    const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
    const shift = phone ? 0 : lerp(A.side, B.side, e) * halfW * 0.46;
    const fit = phone ? Math.min(0.72, camera.aspect * 1.25) : 1; // tablets keep the figure clear of the text
    // `spin` is the amplitude of a slow turn. It always returns to the authored pose, so later chapters start aligned.
    spin = still ? 0 : Math.sin(time * 0.33) * lerp(A.spin, B.spin, e);
    const sway = lerp(A.pose.sway, B.pose.sway, e);
    const lift = phone ? lerp(Number(chapters[a].el.dataset.lift ?? 0.85), Number(chapters[b].el.dataset.lift ?? 0.85), e) : 0;
    rig.position.set(shift, lerp(A.pose.y, B.pose.y, e) + lift, 0);
    rig.scale.setScalar(lerp(A.pose.scale, B.pose.scale, e) * fit);
    rig.rotation.set(
      lerp(A.pose.rx, B.pose.rx, e) - pointerSmooth.y * sway * 0.5,
      lerp(A.pose.ry, B.pose.ry, e) + spin + pointerSmooth.x * sway + (still ? 0 : Math.sin(time * 0.21 + 1.3) * 0.06),
      0,
    );
    rig.updateMatrixWorld();

    // Pointer on the z=0 plane, in world space, for the repulsion in the shader.
    if (pointerSeen && !still) { // mouse or finger
      ray.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
      uniforms.uPointer.value.copy(camera.position).addScaledVector(ray, -camera.position.z / ray.z);
    } else uniforms.uPointer.value.set(99, 99, 0);

    const torvya = chapters.findIndex(c => c.form === "torvya");
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

    renderer.render(scene, camera);

    // Adaptive resolution: sustained slow frames lower the pixel ratio once or twice.
    slow = dt > 0.03 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 45 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); slow = 0; resize(); }

    const settled = still && Math.abs(goal - position) < 0.001;
    if (visible && !settled) raf = requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf && visible && !lost) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  const onVisibility = () => { visible = !document.hidden; if (visible) wake(); };
  const onResize = () => { resize(); wake(); };
  const onContextLost = (e: Event) => { e.preventDefault(); lost = true; cancelAnimationFrame(raf); raf = 0; onLost(); };
  addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("touchstart", onTouch, { passive: true });
  addEventListener("touchmove", onTouch, { passive: true });
  addEventListener("touchend", onLeave, { passive: true });
  addEventListener("deviceorientation", onTilt);
  document.documentElement.addEventListener("pointerleave", onLeave);
  addEventListener("resize", onResize);
  addEventListener("scroll", wake, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", wake);
  canvas.addEventListener("webglcontextlost", onContextLost);
  // Chapters change `data-active` while the page is idle under reduced motion; repaint when they do.
  const observer = new MutationObserver(wake);
  for (const c of chapters) observer.observe(c.el, { attributes: true, attributeFilter: ["data-active", "data-plaque", "data-seed", "data-badge"] });

  resize();
  wake();

  return {
    dispose() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      removeEventListener("pointermove", onPointer);
      removeEventListener("touchstart", onTouch);
      removeEventListener("touchmove", onTouch);
      removeEventListener("touchend", onLeave);
      removeEventListener("deviceorientation", onTilt);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      removeEventListener("resize", onResize);
      removeEventListener("scroll", wake);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", wake);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geometry.dispose();
      material.dispose();
      plaques.dispose();
      badges?.dispose();
      renderer.dispose();
    },
  };
}
