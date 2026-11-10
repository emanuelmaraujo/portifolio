import {
  ACESFilmicToneMapping, AmbientLight, DirectionalLight, MathUtils,
  Mesh, PerspectiveCamera, PMREMGenerator, Scene, Texture, WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { Model } from "./types";

export function mountScene(host: HTMLElement, model: Model, kind: "core" | "torvya") {
  const isCore = kind === "core";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "low-power" });
  if (!context) return null;
  const renderer = new WebGLRenderer({ canvas, context, alpha: true });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(36, 1, .1, 80);
  function lightEnvironment() {
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(renderer);
    const environment = generator.fromScene(room, .04);
    room.dispose();
    generator.dispose();
    scene.environment = environment.texture;
    return environment;
  }
  let environment = lightEnvironment();
  scene.environmentIntensity = 1.35;
  scene.add(new AmbientLight("#92afd7", .52));
  for (const [color, intensity, x, y, z] of [
    ["#c3edff", 2.8, 2, 5, 5], ["#719bff", 2.1, -4, -1, -2], ["#ffc09b", 1.6, 5, -2, 3],
  ] as const) {
    const light = new DirectionalLight(color, intensity);
    light.position.set(x, y, z);
    scene.add(light);
  }
  const update = model(scene);
  host.appendChild(canvas);
  let active = false, lost = false, paused = false, raf = 0, previous = 0, time = 0;
  let x = 0, y = 0, targetX = 0, targetY = 0, scroll = 0, targetScroll = 0, turn = 0, targetTurn = 0;
  let width = 1, height = 1, density = 1, slow = 0;
  let pointer = -1, dragStart = 0, dragTurn = 0;
  let painted = false;
  const cap = matchMedia("(pointer: coarse)").matches ? 1 : 1.5;

  function size() {
    width = Math.max(host.clientWidth, 1);
    height = Math.max(host.clientHeight, 1);
    renderer.setDrawingBufferSize(width, height, density);
    camera.aspect = width / height;
    const fit = isCore ? 10.7 : 6.9;
    camera.position.z = fit * Math.max(1, .97 / camera.aspect);
    camera.updateProjectionMatrix();
    schedule(true);
  }
  function animate(now: number) {
    raf = 0;
    if (lost || !active || document.hidden) return;
    const elapsed = previous ? now - previous : 16.7;
    const dt = Math.min(elapsed / 1000, .04);
    previous = now;
    if (!paused) time += dt;
    const damping = 1 - Math.exp(-dt * 8);
    x = MathUtils.lerp(x, targetX, damping);
    y = MathUtils.lerp(y, targetY, damping);
    scroll = MathUtils.lerp(scroll, targetScroll, damping);
    turn = MathUtils.lerp(turn, targetTurn, damping);
    if (isCore) {
      camera.position.x = x * .22 + scroll * .34;
      camera.position.y = y * .19 - scroll * .25;
      camera.lookAt(0, 0, 0);
    }
    update({ time, x, y, scroll, turn });
    renderer.render(scene, camera);
    if (!painted) {
      painted = true;
      host.dataset.renderer = "webgl";
    }
    if (isCore && time > 1.5 && !host.dataset.assembled) host.dataset.assembled = "true";
    if (elapsed > 30 && time > 2 && !paused) slow++;
    else slow = Math.max(0, slow - 1);
    if (slow > 18 && density > .75) { density = Math.max(.75, density - .25); slow = 0; size(); }
    if (Math.abs(x - targetX) + Math.abs(y - targetY) + Math.abs(scroll - targetScroll) + Math.abs(turn - targetTurn) > .005) schedule(true);
    else schedule();
  }
  function schedule(force = false) {
    if (active && !lost && !document.hidden && (!paused || force) && !raf) raf = requestAnimationFrame(animate);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; previous = 0; }
  const move = (event: PointerEvent) => {
    if (isCore && paused) return;
    const bounds = host.getBoundingClientRect();
    targetX = MathUtils.clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
    targetY = MathUtils.clamp(1 - (event.clientY - bounds.top) / bounds.height * 2, -1, 1);
    if (pointer === event.pointerId) targetTurn = dragTurn + (event.clientX - dragStart) * .012;
    schedule(true);
  };
  const leave = () => {
    if (isCore && paused) return;
    targetX = targetY = 0;
    schedule(true);
  };
  const startDrag = (event: PointerEvent) => {
    if (isCore || event.button !== 0) return;
    pointer = event.pointerId;
    dragStart = event.clientX;
    dragTurn = targetTurn;
    host.setPointerCapture(pointer);
  };
  const stopDrag = () => { pointer = -1; };
  const scrollPage = () => {
    if (!isCore || !active || paused) return;
    const hero = host.closest(".hero");
    if (!hero) return;
    const bounds = hero.getBoundingClientRect();
    targetScroll = MathUtils.clamp(-bounds.top / Math.max(bounds.height * .85, 1), 0, 1);
    schedule(true);
  };
  const visibility = () => {
    if (document.hidden) stop();
    else schedule(true);
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    stop();
    delete host.dataset.renderer;
    painted = false;
  };
  const contextRestored = () => {
    environment.dispose();
    environment = lightEnvironment();
    lost = false;
    size();
  };
  const intersection = new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting;
    if (active) { scrollPage(); schedule(true); }
    else stop();
  });
  const resize = new ResizeObserver(size);
  density = Math.min(cap, devicePixelRatio);
  size();
  intersection.observe(host);
  resize.observe(host);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  host.addEventListener("pointerdown", startDrag);
  host.addEventListener("lostpointercapture", stopDrag);
  window.addEventListener("scroll", scrollPage, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);

  return {
    pause(value: boolean) {
      paused = value;
      if (value) {
        if (isCore) {
          time = Math.max(time, 1.5);
          targetX = x; targetY = y; targetScroll = scroll;
        }
        stop();
        schedule(true);
      } else { scrollPage(); schedule(); }
    },
    rotate(direction: number) { targetTurn += direction * Math.PI / 3; schedule(true); },
    dispose() {
      stop();
      intersection.disconnect();
      resize.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointerdown", startDrag);
      host.removeEventListener("lostpointercapture", stopDrag);
      window.removeEventListener("scroll", scrollPage);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      const geometries = new Set<Mesh["geometry"]>();
      const materials = new Set<Exclude<Mesh["material"], unknown[]>>();
      const textures = new Set<Texture>();
      scene.traverse(object => {
        if (!(object instanceof Mesh) && !("geometry" in object && "material" in object)) return;
        const renderable = object as Mesh;
        geometries.add(renderable.geometry);
        for (const material of [renderable.material].flat()) materials.add(material);
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => {
        if ("map" in material && material.map instanceof Texture) textures.add(material.map);
        material.dispose();
      });
      textures.forEach(texture => texture.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      delete host.dataset.renderer;
      delete host.dataset.assembled;
    },
  };
}
