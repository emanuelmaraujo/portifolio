import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import paths from "@/components/site/scene/mark-paths.json";

/**
 * The A/E mark as a machined piece: three ceramic strata, an aluminium beam, smoked-glass inlays in the cuts and the
 * dowel pins that hold it together. Built from the same path data as the logo, so there is no model to download.
 * It renders on demand: the loop stops as soon as the camera and the parts have settled.
 */
export type Pose = "closed" | "joints" | "raking";

const POSES: Record<Pose, { az: number; el: number; dist: number; open: number }> = {
  closed: { az: -0.5, el: 0.16, dist: 1, open: 0 },
  joints: { az: -0.98, el: 0.3, dist: 1.4, open: 1 },
  raking: { az: 0.62, el: 0.05, dist: 1.04, open: 0.22 },
};
const S = 1 / 16;
const points = (d: string) => {
  const n = (d.match(/-?\d+(\.\d+)?/g) || []).map(Number);
  return Array.from({ length: n.length / 2 }, (_, i) => [n[i * 2], n[i * 2 + 1]] as [number, number]);
};

function solid(pts: [number, number][], depth: number, bevel = 0.022) {
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2((x - 32) * S, (32 - y) * S)));
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: depth - bevel * 2, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 1 });
  geometry.translate(0, 0, -depth / 2 + bevel);
  return geometry;
}

export function createPiece(canvas: HTMLCanvasElement, reduced: boolean) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const coarse = matchMedia("(pointer: coarse)").matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 2));

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  scene.environmentIntensity = 0.55;
  room.dispose();
  pmrem.dispose();

  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf2541c, roughness: 0.62, clearcoat: 0.25, clearcoatRoughness: 0.5 });
  const aluminium = new THREE.MeshStandardMaterial({ color: 0xd9d6cf, metalness: 1, roughness: 0.34 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x8b8c8d, metalness: 1, roughness: 0.25 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x1a1c20, roughness: 0.06, metalness: 0.2, transparent: true, opacity: 0.62, envMapIntensity: 1.8 });

  const piece = new THREE.Group();
  scene.add(piece);
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material) => {
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = m.receiveShadow = true;
    piece.add(m);
    return m;
  };

  const beam = mesh(solid(points(paths.beam), 0.62), aluminium);
  const strataPts = paths.strata.map(points);
  const strata = strataPts.map(pts => mesh(solid(pts, 0.86), ceramic));
  // Smoked glass fills the two cuts between the strata.
  const [a, b, c] = strataPts;
  const slope = (c[1][0] - c[2][0]) / (c[2][1] - c[1][1]);
  const inlays = [
    [a[2], a[1], b[1], b[0]],
    [b[3], [c[1][0] + slope * (c[1][1] - b[3][1]), b[3][1]], c[1], c[0]],
  ].map(pts => mesh(solid(pts as [number, number][], 0.5, 0.008), glass));
  // Dowel pins run from the beam into each stratum. They show in the gap, and fully once the piece opens.
  const [, , b2, b3] = points(paths.beam);
  strataPts.forEach((pts, i) => {
    const y = (Math.min(...pts.map(p => p[1])) + Math.max(...pts.map(p => p[1]))) / 2;
    // Where the horizontal line at this height leaves the stratum, and where it meets the beam.
    const from = Math.max(...pts.map(([x1, y1], j) => { const [x2, y2] = pts[(j + 1) % pts.length]; return (y1 - y) * (y2 - y) <= 0 && y1 !== y2 ? x1 + ((y - y1) / (y2 - y1)) * (x2 - x1) : -Infinity; }));
    const to = b3[0] + (y - b3[1]) * ((b2[0] - b3[0]) / (b2[1] - b3[1]));
    const length = (to - from) * S + 0.34;
    for (const z of i ? [-0.2, 0.2] : [0]) {
      const pin = mesh(new THREE.CylinderGeometry(0.028, 0.028, length, 20).rotateZ(Math.PI / 2), steel);
      pin.position.set((to - 32) * S + 0.1 - length / 2, (32 - y) * S, z);
    }
  });

  const floorY = (32 - 58) * S - 0.012;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.5 }));
  floor.position.y = floorY;
  floor.receiveShadow = true;
  scene.add(floor);

  const key = new THREE.DirectionalLight(0xfff1e2, 2.4);
  key.position.set(-3.5, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -3.2;
  key.shadow.camera.right = key.shadow.camera.top = 3.2;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  scene.add(key);
  // The raking light: it crosses the cuts once when the piece arrives and once per change of view.
  const rake = new THREE.DirectionalLight(0xffffff, 0);
  scene.add(rake, rake.target);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  const target = new THREE.Vector3(0, -0.12, 0);
  const now = { ...POSES.closed }, goal = { ...POSES.closed };
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let fit = 8, sweep = reduced ? 1 : 0, frame = 0, last = 0, visible = true, disposed = false;

  const place = () => {
    strata.forEach((m, i) => m.position.set(-now.open * (0.5 + i * 0.14), now.open * (1 - i) * 0.1, now.open * (i - 1) * 0.3));
    inlays.forEach((m, i) => m.position.set(-now.open * 0.2, now.open * (0.5 - i) * 0.1, -now.open * 0.34));
    beam.position.x = now.open * 0.22;
    const az = now.az + pointer.x * 0.16, el = now.el - pointer.y * 0.07, d = fit * now.dist;
    camera.position.set(target.x + Math.sin(az) * Math.cos(el) * d, target.y + Math.sin(el) * d, target.z + Math.cos(az) * Math.cos(el) * d);
    camera.lookAt(target);
    const k = Math.sin(Math.min(sweep, 1) * Math.PI);
    rake.intensity = k * 5;
    rake.position.set(-5 + sweep * 10, 0.4, 2.2);
  };

  const render = (time: number) => {
    frame = 0;
    if (disposed) return;
    const dt = Math.min((time - last) / 1000 || 0.016, 0.05);
    last = time;
    const ease = reduced ? 1 : 1 - Math.exp(-dt * 5.5);
    let moving = sweep < 1;
    for (const k of ["az", "el", "dist", "open"] as const) {
      const delta = goal[k] - now[k];
      now[k] += delta * ease;
      if (Math.abs(delta) > 0.0008) moving = true;
    }
    pointer.x += (pointer.tx - pointer.x) * ease;
    pointer.y += (pointer.ty - pointer.y) * ease;
    if (Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.002) moving = true;
    if (sweep < 1) sweep = Math.min(1, sweep + dt / 1.3);
    place();
    renderer.render(scene, camera);
    if (moving) wake();
  };
  const wake = () => { if (!frame && visible && !document.hidden && !disposed) { last = performance.now(); frame = requestAnimationFrame(render); } };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the whole piece in frame, in landscape and in a tall phone crop alike.
    fit = 8.6 * Math.max(1, 0.92 / camera.aspect);
    camera.updateProjectionMatrix();
    wake();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const sight = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); });
  sight.observe(canvas);
  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || reduced) return;
    const box = canvas.getBoundingClientRect();
    pointer.tx = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1));
    pointer.ty = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1));
    wake();
  };
  addEventListener("pointermove", move, { passive: true });
  document.addEventListener("visibilitychange", wake);
  resize();

  return {
    setPose(pose: Pose) {
      Object.assign(goal, POSES[pose]);
      if (!reduced) sweep = 0;
      wake();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      sight.disconnect();
      removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", wake);
      scene.traverse(node => { if (node instanceof THREE.Mesh) node.geometry.dispose(); });
      for (const material of [ceramic, aluminium, steel, glass]) material.dispose();
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
}
