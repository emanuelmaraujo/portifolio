import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import paths from "@/components/site/scene/mark-paths.json";
import { AXIS, DAYS, HIGH, LOW, RAISED, SERIES, dusk, link, orbit, priceAt, smooth } from "./verdict";

/**
 * One scene for the whole cut, rendered in three steps: the world, a glow pass, and a final pass that puts a pane
 * of frosted glass between the visitor and the world.
 *
 * The world: thousands of ceramic bricks adrift in a hall. The visitor's stroke melts the glass; letting go melts all
 * of it, and the bricks lay themselves into the mark along the stroke, standing on a floor that takes their shadow
 * and their reflection. Down the page the camera swings round the mark, the bricks let go, and the same beam
 * becomes Prumo's plumb line over a wall of price history.
 *
 * Strokes and the chart are placed on the z = 0 plane by casting rays through the live camera.
 */
const pts = (d: string) => {
  const n = (d.match(/-?\d+(\.\d+)?/g) || []).map(Number);
  return Array.from({ length: n.length / 2 }, (_, i) => [n[i * 2], n[i * 2 + 1]] as [number, number]);
};
const inside = (poly: [number, number][], x: number, y: number) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};

const BRICK_VERTEX = /* glsl */ `
uniform float uTime, uOrder, uRelease, uCase, uRaised, uWindow, uAgit, uMirror, uScale, uArrive, uMode, uFloor;
uniform vec4 uMark, uChart;
uniform vec2 uCell, uView, uPointer;
uniform vec3 uBrick, uSun;
attribute vec3 aTarget;
attribute vec4 aMeta, aSeed, aChart;
varying vec3 vWorld;
varying vec4 vInfo;
varying float vLaid;
mat3 spin(vec3 a, float t) {
  float s = sin(t), c = cos(t), o = 1.0 - c;
  return mat3(o*a.x*a.x + c, o*a.x*a.y + a.z*s, o*a.z*a.x - a.y*s, o*a.x*a.y - a.z*s, o*a.y*a.y + c, o*a.y*a.z + a.x*s, o*a.z*a.x + a.y*s, o*a.y*a.z - a.x*s, o*a.z*a.z + c);
}
void main() {
  // Adrift: a slow tumble through the depth of the hall.
  float t = uTime * 0.11 + aSeed.w * 40.0;
  vec3 np = vec3((aSeed.x * 2.0 - 1.0) * uView.x * 1.7, (aSeed.y * 2.0 - 1.0) * uView.y * 1.6 + 0.6, mix(-12.0, 2.2, aSeed.z));
  np.z -= (1.0 - uArrive) * 18.0 * (0.35 + aSeed.x);
  np += vec3(sin(t * 1.3 + aSeed.y * 9.0), cos(t * 1.1 + aSeed.x * 7.0), sin(t * 0.7 + aSeed.z * 5.0)) * 0.6;
  np.xy += uPointer * (np.z + 4.0) * 0.035;

  // Laid: a place in the mark, wherever the visitor put its beam.
  vec2 m = aTarget.xy; m.x *= mix(1.0, -1.0, uMirror);
  vec3 mp = vec3(uMark.x * m.x - uMark.y * m.y + uMark.z, uMark.y * m.x + uMark.x * m.y + uMark.w, aTarget.z * uScale);
  float eM = smoothstep(0.0, 1.0, (uOrder * 1.75 - aMeta.y) / 0.75);
  eM *= 1.0 - smoothstep(0.0, 1.0, uRelease * 1.7 - aMeta.z * 0.7);

  // Weighed: a place under the price line, if that part of the history was observed.
  float seen = mix(aChart.z, aChart.w, uRaised) * smoothstep(uWindow - 0.012, uWindow + 0.012, aChart.x) * step(0.0, aChart.x);
  float eC = seen * smoothstep(0.0, 1.0, uCase * 1.7 - aMeta.w * 0.7);
  vec3 cp = vec3(uChart.x + aChart.x * uChart.z, uChart.y + aChart.y * uChart.w, (aMeta.z - 0.5) * 0.05);
  cp.xy += uAgit * 0.05 * vec2(sin(uTime * 9.0 + aSeed.x * 30.0), cos(uTime * 8.0 + aSeed.y * 30.0));

  float e = max(eM, eC);
  vec3 p = mix(mix(np, mp, eM), cp, eC);
  float flight = sin(3.14159 * eM) * (1.0 - eC) + sin(3.14159 * eC);
  p.z += flight * 1.8 * (aMeta.z - 0.25);
  p.xy += flight * 0.4 * vec2(cos(aSeed.w * 6.283), sin(aSeed.w * 6.283));

  vec3 laid = uBrick * uScale * 0.93;
  vec3 size = mix(mix(laid * (0.4 + aSeed.w * 0.8), laid, eM), vec3(uCell * 0.86, uCell.y * 1.6), eC);
  float lean = atan(uMark.y, uMark.x) * eM * (1.0 - eC);
  vec3 q = position * size;
  q = vec3(cos(lean) * q.x - sin(lean) * q.y, sin(lean) * q.x + cos(lean) * q.y, q.z);
  q = spin(normalize(aSeed.xyz - 0.5), (1.0 - e) * (aSeed.w * 6.283 + uTime * (0.15 + aSeed.x * 0.5))) * q;

  vWorld = p + q;
  // The same bricks are drawn twice more: flattened onto the floor as their shadow, and mirrored in it.
  if (uMode > 0.5 && uMode < 1.5) { vWorld -= uSun * ((vWorld.y - uFloor) / uSun.y); vWorld.y = uFloor + 0.004; }
  if (uMode > 1.5) vWorld.y = 2.0 * uFloor - vWorld.y;
  vInfo = vec4(aMeta.x, e, eC, aSeed.w);
  vLaid = eM;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}`;

const BRICK_FRAGMENT = /* glsl */ `
uniform vec3 uBeamA, uBeamB, uBeamColor, uCaseColor, uTorch;
uniform float uBeamPower, uTorchPower, uLoose, uDark, uMode, uFloor;
varying vec3 vWorld;
varying vec4 vInfo;
varying float vLaid;
void main() {
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  vec3 view = normalize(cameraPosition - vWorld);
  if (dot(n, view) < 0.0) n = -n;
  vec3 ceramic = mix(vec3(0.86, 0.25, 0.07), vec3(1.0, 0.4, 0.15), vInfo.w);
  // In the lit hall the beam of the mark is ink; in the dark room it is pale stone.
  vec3 stone = mix(mix(vec3(0.035, 0.04, 0.05), vec3(0.11, 0.11, 0.125), vInfo.w), mix(vec3(0.5, 0.49, 0.46), vec3(0.74, 0.72, 0.67), vInfo.w), uDark);
  vec3 base = mix(vInfo.x < 0.5 ? stone : ceramic, uCaseColor * (0.7 + vInfo.w * 0.45), vInfo.z);
  vec3 sun = normalize(vec3(-0.45, 0.75, 0.55));
  float key = max(dot(n, sun), 0.0);
  float gloss = pow(max(dot(n, normalize(sun + view)), 0.0), 38.0);

  // The dark room: loose bricks are almost black, the beam and the cursor are the light.
  vec3 col = base * (0.03 + 0.1 * key) * uLoose + base * (0.05 + 0.42 * key) * vInfo.y + base * (0.15 + 0.3 * key) * vInfo.z;
  vec3 toTorch = uTorch - vWorld;
  col += base * vec3(1.0, 0.8, 0.62) * uTorchPower * (0.25 + 0.75 * max(dot(n, normalize(toTorch)), 0.0)) / (1.0 + 2.2 * dot(toTorch, toTorch));
  vec3 ab = uBeamB - uBeamA;
  vec3 d = uBeamA + ab * clamp(dot(vWorld - uBeamA, ab) / max(dot(ab, ab), 0.0001), 0.0, 1.0) - vWorld;
  float near = uBeamPower / (1.0 + 1.5 * dot(d, d));
  col += base * uBeamColor * near * (0.3 + 0.9 * max(dot(n, normalize(d + vec3(0.0, 0.0, 0.6))), 0.0));
  col += uBeamColor * near * near * 0.06;
  col = mix(vec3(0.016, 0.017, 0.02), col, exp(-max(-vWorld.z, 0.0) * 0.17));

  // The lit hall: daylight from the upper left, a sheen on the glaze, and distance dissolving into the air.
  vec3 lit = base * (0.3 + 0.62 * key + 0.1 * (0.5 + 0.5 * n.y)) + vec3(1.0, 0.96, 0.9) * gloss * 0.35 * step(0.5, vInfo.x)
    + vec3(1.0, 0.42, 0.12) * near * (0.5 + 1.4 * step(0.5, vInfo.x)) * 0.16 * vInfo.y;
  float there = mix(exp(-max(-vWorld.z, 0.0) * 0.2) * 0.34, 1.0, smoothstep(0.55, 0.95, max(vInfo.y, vInfo.z)));
  lit = mix(vec3(0.86, 0.82, 0.75), lit, there);

  vec4 result = vec4(mix(lit, col, uDark), 1.0);
  if (uMode > 1.5) result.a *= 0.3 * vLaid * (1.0 - uDark) * exp(-max(uFloor - vWorld.y, 0.0) * 1.1);
  gl_FragColor = result;
  #include <colorspace_fragment>
}`;

const SHADOW_FRAGMENT = /* glsl */ `
uniform float uDark;
varying float vLaid;
void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 0.34 * vLaid * (1.0 - uDark)); }`;

const BEAM_VERTEX = /* glsl */ `
uniform vec3 uA, uB;
uniform float uWidth;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 dir = uB - uA, mid = mix(uA, uB, uv.x);
  vec3 side = normalize(cross(dir, cameraPosition - mid)) * uWidth;
  gl_Position = projectionMatrix * viewMatrix * vec4(mid + side * (uv.y - 0.5), 1.0);
}`;
const BEAM_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uPower, uTime, uThin, uDark;
varying vec2 vUv;
void main() {
  float a = abs(vUv.y - 0.5) * 2.0;
  float core = exp(-a * a * mix(2600.0, 9000.0, uThin));
  float halo = exp(-a * a * 60.0) * 0.5 + exp(-a * a * 7.0) * 0.16;
  float run = 0.82 + 0.18 * sin(vUv.x * 46.0 - uTime * 5.0) * sin(vUv.x * 17.0 + uTime * 2.3);
  float ends = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.97, vUv.x);
  // Brighter than white on purpose: the glow pass picks up whatever exceeds it.
  vec3 c = (mix(vec3(3.2, 0.8, 0.12), vec3(2.6, 2.4, 2.1), uDark) * core + uColor * halo * run * (1.0 - uThin * 0.8) * mix(0.55, 1.0, uDark)) * ends * uPower;
  gl_FragColor = vec4(c, clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0));
}`;

const QUAD_VERTEX = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const GLOW_FRAGMENT = /* glsl */ `
uniform sampler2D tMap;
uniform vec2 uStep;
uniform float uCut;
varying vec2 vUv;
void main() {
  vec3 sum = vec3(0.0);
  float total = 0.0;
  for (int i = -5; i <= 5; i++) {
    float w = exp(-float(i * i) / 9.0);
    vec3 c = texture2D(tMap, vUv + uStep * float(i) * 1.5).rgb;
    if (uCut > 0.5) c = max(c - 0.92, 0.0);
    sum += c * w; total += w;
  }
  gl_FragColor = vec4(sum / total, 1.0);
}`;

const FINAL_FRAGMENT = /* glsl */ `
uniform sampler2D tScene, tGlow, tHall, tHaze;
uniform vec4 uTear;
uniform float uTearOn;
uniform float uDark, uVeil, uMelt, uFlash, uTime, uAspect, uHallAspect, uHaze;
uniform vec3 uBreath;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; } return v; }
vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }
vec3 film(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
vec2 cover(vec2 uv, float aspect) { float r = uAspect / aspect; return r > 1.0 ? vec2(uv.x, (uv.y - 0.5) / r + 0.5) : vec2((uv.x - 0.5) * r + 0.5, uv.y); }
// The world as the camera sees it, over the hall it stands in.
vec3 world(vec2 uv) {
  vec3 day = mix(lin(vec3(0.886, 0.855, 0.8)), lin(vec3(0.972, 0.957, 0.928)), smoothstep(0.95, 0.0, distance(uv * vec2(uAspect, 1.0), vec2(0.6 * uAspect, 0.62))));
  vec3 night = texture2D(tHall, cover(uv, uHallAspect)).rgb * 0.9;
  vec3 haze = texture2D(tHaze, cover(uv, 1.7778)).rgb * uHaze;
  night = night * 0.75 + haze * 0.32 * (1.0 - night);
  night *= mix(0.35, 1.0, smoothstep(1.05, 0.25, distance(uv, vec2(0.55, 0.55))));
  vec4 s = texture2D(tScene, uv);
  return mix(day, night, uDark) * (1.0 - s.a) + film(s.rgb + texture2D(tGlow, uv).rgb * 0.9);
}
void main() {
  vec3 col = world(vUv);
  if (uVeil > 0.002) {
    vec2 p = vUv * vec2(uAspect, 1.0);
    float coarse = fbm(p * 3.2 + 3.0), fine = fbm(p * 19.0 - uTime * 0.012);
    // How far the glass has melted here: the stroke, the warmth of the cursor, and the thaw once the beam is cast.
    vec2 away = (vUv - uBreath.xy) * vec2(uAspect, 1.0);
    vec2 pa = (vUv - uTear.xy) * vec2(uAspect, 1.0), ba = (uTear.zw - uTear.xy) * vec2(uAspect, 1.0);
    float reach = length(pa - ba * clamp(dot(pa, ba) / max(dot(ba, ba), 0.00001), 0.0, 1.0));
    float warm = uTearOn * (1.02 * exp(-reach * reach / 0.011) + 0.3 * exp(-reach * reach / 0.5)) + uBreath.z * exp(-dot(away, away) / 0.006);
    float thaw = warm + uMelt * 1.9 - 0.5 + (coarse - 0.5) * 0.62 + (fine - 0.5) * 0.2;
    float open = smoothstep(0.0, 0.07, thaw);
    float rim = exp(-thaw * thaw / 0.0012) + 0.3 * exp(-thaw * thaw / 0.016);
    // What is behind the glass: bent by the frost and blurred.
    vec2 bend = (vec2(coarse, fine) - 0.5) * 0.085;
    vec3 behind = vec3(0.0);
    for (int i = 0; i < 7; i++) {
      float a = float(i) * 0.897;
      behind += world(vUv + bend + vec2(cos(a), sin(a)) * 0.022 * (0.4 + fract(float(i) * 0.37)));
    }
    behind /= 7.0;
    float crystal = pow(fine, 3.0) * 0.55 + pow(max(noise(p * 70.0) - 0.72, 0.0) * 3.4, 2.0);
    vec3 glass = behind * behind * 0.085 + lin(vec3(0.07, 0.075, 0.09)) * (0.5 + coarse * 1.1) + vec3(0.2, 0.21, 0.25) * crystal * 0.32 + texture2D(tHall, cover(vUv, uHallAspect)).rgb * 0.55;
    vec3 veiled = mix(glass, col, open) + vec3(1.0, 0.5, 0.18) * rim * 1.15 * (1.0 - open * 0.6);
    col = mix(col, veiled, uVeil);
  }
  col = mix(col, vec3(1.0, 0.965, 0.91), uFlash);
  col *= mix(1.0, 0.86, smoothstep(0.45, 1.05, distance(vUv, vec2(0.5))));
  col += (hash(vUv * 913.0 + uTime) - 0.5) * 0.022;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export function createScene(canvas: HTMLCanvasElement, options: { compact: boolean; reduced: boolean; veiled: boolean }) {
  const { compact, reduced } = options;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  const ratio = Math.min(devicePixelRatio, compact ? 1.5 : 1.75);
  renderer.setPixelRatio(ratio);

  const scene = new THREE.Scene();
  const CAM = 10, FOV = 35;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);
  camera.position.set(0, 0, CAM);
  let W = 1, H = 1;
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  /** A point of the page on the z = 0 plane of the scene, through the camera as it is now. */
  const rest = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);
  const world = (x: number, y: number, through: THREE.Camera = camera) => {
    ray.setFromCamera(new THREE.Vector2((x / W) * 2 - 1, 1 - (y / H) * 2), through);
    return ray.ray.intersectPlane(plane, new THREE.Vector3()) ?? new THREE.Vector3();
  };

  // Bricks: every one has a place in the mark, most also have one in the chart.
  const BW = compact ? 1.5 : 1.06, BH = BW * 0.5, LAYERS = compact ? 3 : 5, BD = 13 / LAYERS;
  const parts = [pts(paths.beam), ...paths.strata.map(pts)];
  const axis = [AXIS.bottom[0] - AXIS.top[0], AXIS.bottom[1] - AXIS.top[1]], axisLength = Math.hypot(axis[0], axis[1]);
  const bricks: { x: number; y: number; z: number; part: number; delay: number }[] = [];
  parts.forEach((poly, part) => {
    const ys = poly.map(p => p[1]), xs = poly.map(p => p[0]);
    let row = 0;
    for (let y = Math.min(...ys) + BH / 2; y < Math.max(...ys); y += BH, row++) {
      for (let x = Math.min(...xs) + (row % 2 ? BW / 2 : 0); x < Math.max(...xs); x += BW) {
        if (!inside(poly, x, y)) continue;
        const along = ((x - AXIS.top[0]) * axis[0] + (y - AXIS.top[1]) * axis[1]) / (axisLength * axisLength);
        const off = Math.abs((x - AXIS.top[0]) * axis[1] - (y - AXIS.top[1]) * axis[0]) / axisLength / 34;
        for (let layer = 0; layer < LAYERS; layer++) {
          bricks.push({ x: x - 32, y: 32 - y, z: (layer - (LAYERS - 1) / 2) * BD + (Math.random() - 0.5) * 0.9, part, delay: Math.min(1, Math.max(0, 0.45 * along + 0.4 * off + 0.15 * Math.random())) });
        }
      }
    }
  });
  const dust = Math.round(bricks.length * 0.16);
  const count = bricks.length + dust;
  bricks.sort((a, b) => a.x - b.x);

  const NC = compact ? 62 : 112, NR = compact ? 40 : 58;
  const level = (series: typeof SERIES, u: number) => (priceAt(series, u * DAYS) - LOW) / (HIGH - LOW);
  const cells: [number, number, number, number][] = [];
  for (let c = 0; c < NC; c++) for (let r = 0; r < NR; r++) {
    const u = (c + 0.5) / NC, v = (r + 0.5) / NR, a = v <= level(SERIES, u) ? 1 : 0, b = v <= level(RAISED, u) ? 1 : 0;
    if (a || b) cells.push([u, v, a, b]);
  }
  const aTarget = new Float32Array(count * 3), aMeta = new Float32Array(count * 4), aSeed = new Float32Array(count * 4), aChart = new Float32Array(count * 4).fill(-1);
  for (let i = 0; i < count; i++) {
    const brick = bricks[i];
    aSeed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    if (brick) {
      aTarget.set([brick.x, brick.y, brick.z], i * 3);
      aMeta.set([brick.part, brick.delay, Math.random(), Math.random()], i * 4);
    } else aMeta.set([Math.random() < 0.3 ? 0 : 1, 9, Math.random(), Math.random()], i * 4); // dust never settles
  }
  const taken = Math.min(cells.length, bricks.length);
  for (let k = 0; k < taken; k++) aChart.set(cells[Math.floor((k * cells.length) / taken)], Math.floor((k * bricks.length) / taken) * 4);

  const box = new THREE.BoxGeometry(1, 1, 1);
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.index = box.index;
  geometry.setAttribute("position", box.getAttribute("position"));
  geometry.setAttribute("aTarget", new THREE.InstancedBufferAttribute(aTarget, 3));
  geometry.setAttribute("aMeta", new THREE.InstancedBufferAttribute(aMeta, 4));
  geometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(aSeed, 4));
  geometry.setAttribute("aChart", new THREE.InstancedBufferAttribute(aChart, 4));
  geometry.instanceCount = count;

  const beamColor = new THREE.Color(), hot = new THREE.Color(1, 0.5, 0.2), cool = new THREE.Color(0.93, 0.95, 0.86);
  const shared = {
    uTime: { value: 0 }, uOrder: { value: 0 }, uRelease: { value: 0 }, uCase: { value: 0 }, uRaised: { value: 0 }, uWindow: { value: 0 }, uAgit: { value: 0 },
    uMirror: { value: 0 }, uScale: { value: 0.05 }, uArrive: { value: reduced ? 1 : 0 }, uFloor: { value: -3 }, uSun: { value: new THREE.Vector3(0.42, -1, -0.5).normalize() },
    uMark: { value: new THREE.Vector4(0.05, 0, 0, 0) }, uChart: { value: new THREE.Vector4(0, -50, 1, 1) },
    uCell: { value: new THREE.Vector2(0.03, 0.03) }, uView: { value: new THREE.Vector2(1, 1) }, uPointer: { value: new THREE.Vector2() }, uBrick: { value: new THREE.Vector3(BW, BH, BD) },
    uBeamA: { value: new THREE.Vector3(0, 99, 0) }, uBeamB: { value: new THREE.Vector3(0, 100, 0) }, uBeamColor: { value: beamColor }, uBeamPower: { value: 0 },
    uCaseColor: { value: new THREE.Color(0.7, 0.9, 0.2) }, uTorch: { value: new THREE.Vector3(0, 0, 0.7) }, uTorchPower: { value: 0 }, uLoose: { value: 1.8 }, uDark: { value: 0 },
  };
  const layer = (mode: number, fragmentShader: string, extra: THREE.ShaderMaterialParameters, order: number) => {
    const material = new THREE.ShaderMaterial({ vertexShader: BRICK_VERTEX, fragmentShader, uniforms: { ...shared, uMode: { value: mode } }, transparent: true, ...extra });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = order;
    scene.add(mesh);
    return material;
  };
  const materials = [
    // The shadow never stacks: the darkest brick wins, so the mark throws one clean shape.
    layer(1, SHADOW_FRAGMENT, { depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.MaxEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquationAlpha: THREE.MaxEquation, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor }, -2),
    ...(compact ? [] : [layer(2, BRICK_FRAGMENT, { depthWrite: false, side: THREE.DoubleSide }, -1)]),
    layer(0, BRICK_FRAGMENT, { transparent: false }, 0),
  ];

  const beamUniforms = { uA: shared.uBeamA, uB: shared.uBeamB, uWidth: { value: 3 }, uColor: { value: beamColor }, uPower: { value: 0 }, uTime: shared.uTime, uThin: { value: 0 }, uDark: shared.uDark };
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), new THREE.ShaderMaterial({ vertexShader: BEAM_VERTEX, fragmentShader: BEAM_FRAGMENT, uniforms: beamUniforms, transparent: true, depthWrite: false, depthTest: false, premultipliedAlpha: true, side: THREE.DoubleSide }));
  beam.frustumCulled = false;
  beam.renderOrder = 2;
  scene.add(beam);

  // The plumb bob: modelled in Blender, lit by a small studio so the brass has something to reflect.
  const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  scene.environmentIntensity = 0.85;
  room.dispose();
  pmrem.dispose();
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9953a, metalness: 1, roughness: 0.27 });
  const bob = new THREE.Group();
  bob.visible = false;
  scene.add(bob, new THREE.DirectionalLight(0xfff0dd, 1.6));
  let disposed = false;
  new GLTFLoader().load("/prototypes/feixe/prumo.glb", gltf => {
    if (disposed) return;
    gltf.scene.traverse(node => { if (node instanceof THREE.Mesh) node.material = brass; });
    bob.add(gltf.scene);
  }, undefined, () => { /* Without the model the line still ends at the price. */ });

  // The passes ---------------------------------------------------------------------------------------------------
  const target = (w: number, h: number, depth: boolean, samples = 0) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: depth, samples });
  let rtScene = target(2, 2, true), rtA = target(2, 2, false), rtB = target(2, 2, false);
  const hall = new THREE.TextureLoader().load("/prototypes/feixe/hall.jpg");
  hall.colorSpace = THREE.SRGBColorSpace;
  const clip = document.querySelector<HTMLVideoElement>(".fx-haze");
  const haze = clip ? new THREE.VideoTexture(clip) : hall;
  haze.colorSpace = THREE.SRGBColorSpace;
  const glowUniforms = { tMap: { value: null as THREE.Texture | null }, uStep: { value: new THREE.Vector2() }, uCut: { value: 1 } };
  const finalUniforms = {
    tScene: { value: null as THREE.Texture | null }, tGlow: { value: null as THREE.Texture | null }, uTear: { value: new THREE.Vector4(0.5, 0.5, 0.5, 0.5) }, uTearOn: { value: 0 }, tHall: { value: hall }, tHaze: { value: haze },
    uDark: shared.uDark, uVeil: { value: options.veiled && !reduced ? 1 : 0 }, uMelt: { value: 0 }, uFlash: { value: 0 }, uTime: shared.uTime, uAspect: { value: 1 }, uHallAspect: { value: 1672 / 941 },
    uHaze: { value: clip ? 1 : 0 }, uBreath: { value: new THREE.Vector3(0.5, 0.5, 0) },
  };
  const glowMaterial = new THREE.ShaderMaterial({ vertexShader: QUAD_VERTEX, fragmentShader: GLOW_FRAGMENT, uniforms: glowUniforms, depthTest: false, depthWrite: false });
  const finalMaterial = new THREE.ShaderMaterial({ vertexShader: QUAD_VERTEX, fragmentShader: FINAL_FRAGMENT, uniforms: finalUniforms, depthTest: false, depthWrite: false });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), finalMaterial as THREE.ShaderMaterial), flat = new THREE.Scene(), still = new THREE.Camera();
  quad.frustumCulled = false;
  flat.add(quad);

  // State --------------------------------------------------------------------------------------------------------
  const strokeA = new THREE.Vector3(), strokeB = new THREE.Vector3(1, 1, 0); // the cast beam, upper end first
  const mark = { a: 0.05, b: 0, tx: 0, ty: 0, mirror: 0 }, next = { ...mark };
  let preview: [THREE.Vector3, THREE.Vector3] | null = null, previewPower = 0;
  let order = 0, orderGoal = 0, swap = false, flash = 0, cast = false, melting = 0, kick = 0;
  let held = false, hold = 0, scroll = 0, scrollPx = 0, time = 0, raised = 0, windowStart = 0, agit = 0, lastSwing = 0, torch = 0, torchSeen = false, breath = 0;
  const pointer = new THREE.Vector2(), pointerGoal = new THREE.Vector2();
  const chartEl = document.querySelector<HTMLElement>("[data-fx-chart]");

  const fit = () => {
    W = canvas.clientWidth || innerWidth;
    H = canvas.clientHeight || innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    rest.aspect = W / H;
    rest.position.set(0, 0.9, CAM);
    rest.lookAt(0, 0, 0);
    rest.updateProjectionMatrix();
    rest.updateMatrixWorld();
    const half = CAM * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    shared.uView.value.set(half * camera.aspect, half);
    const w = Math.round(W * ratio), h = Math.round(H * ratio), small = compact ? 4 : 3;
    for (const rt of [rtScene, rtA, rtB]) rt.dispose();
    rtScene = target(w, h, true, compact ? 0 : 4);
    rtA = target(Math.round(w / small), Math.round(h / small), false);
    rtB = target(Math.round(w / small), Math.round(h / small), false);
    finalUniforms.uAspect.value = W / H;
  };

  /** Maps the mark onto a stroke given in screen pixels. The higher end becomes the top of the beam. */
  const solve = (ax: number, ay: number, bx: number, by: number) => {
    if (ay > by) [ax, ay, bx, by] = [bx, by, ax, ay];
    const mirror = ax > bx ? 1 : 0, sign = mirror ? -1 : 1;
    const A = world(ax, ay, rest), B = world(bx, by, rest);
    const t = [(AXIS.top[0] - 32) * sign, 32 - AXIS.top[1]], u = [(AXIS.bottom[0] - 32) * sign, 32 - AXIS.bottom[1]];
    const dx = u[0] - t[0], dy = u[1] - t[1], len2 = dx * dx + dy * dy, ex = B.x - A.x, ey = B.y - A.y;
    const a = (ex * dx + ey * dy) / len2, b = (ey * dx - ex * dy) / len2;
    return { a, b, tx: A.x - (a * t[0] - b * t[1]), ty: A.y - (b * t[0] + a * t[1]), mirror, A, B };
  };

  let last = performance.now(), frame = 0, visible = true;
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (document.hidden || !visible) { last = now; return; }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!reduced) time += dt;
    const k = (rate: number) => (reduced ? 1 : 1 - Math.exp(-dt * rate));

    // Casting again: let go first, move the mark while nothing holds, then lay the bricks anew.
    if (swap) {
      order += (0 - order) * k(9);
      if (order < 0.06) { Object.assign(mark, next); swap = false; flash = 1; }
    } else order += (orderGoal - order) * k(1.5);
    flash += (0 - flash) * k(2.2);
    kick += (0 - kick) * k(1.6);
    previewPower += ((preview ? 1 : 0) - previewPower) * k(10);
    pointer.lerp(pointerGoal, k(3));
    shared.uArrive.value += (1 - shared.uArrive.value) * k(1.15);

    const lift = scrollPx * ((2 * CAM * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / H) * 0.45; // the mark rides up with the page, slower than the text
    const scale = Math.hypot(mark.a, mark.b);
    shared.uMark.value.set(mark.a, mark.b, mark.tx, mark.ty + lift);
    shared.uMirror.value = mark.mirror;
    shared.uScale.value = scale;
    // The floor is wherever the mark's lowest corner stands.
    let low = Infinity;
    for (const [x, y] of [[-27, -26], [27, -26], [-27, 26], [27, 26]]) low = Math.min(low, mark.b * x + mark.a * y + mark.ty + lift);
    shared.uFloor.value = low - BH * scale * 0.5;
    const release = smooth(0.04, 0.62, scroll), toCase = smooth(0.5, 1, scroll), turn = smooth(0.12, 0.9, scroll), dark = dusk(scroll);

    // The camera: it arrives from further back, stands a little above the floor, swings round and up over the mark
    // on the way down, and is square to the page again when the chart arrives.
    hold += ((held ? 1 : 0) - hold) * k(8);
    const round = orbit(scroll), front = smooth(0.5, 0.85, scroll), free = (1 - hold) * (1 - dark);
    const yaw = (compact ? 0.62 : 0.82) * round + pointer.x * 0.09 * free;
    const far = CAM * (1 - 0.3 * round) + (1 - shared.uArrive.value) * 5 - kick * 1.1;
    const cx = mark.tx * round, cy = (mark.ty + lift) * round * 0.5;
    camera.position.set(cx + Math.sin(yaw) * far, cy + 0.9 + 2.1 * round + pointer.y * 0.3 * free, Math.cos(yaw) * far).lerp(new THREE.Vector3(0, 0, CAM), front);
    camera.lookAt(cx * (1 - front), cy * (1 - front), 0);
    camera.updateMatrixWorld();

    // The beam: the visitor's stroke in the hero, the plumb line in the case.
    const A = preview ? preview[0].clone() : strokeA.clone().setY(strokeA.y + lift), B = preview ? preview[1].clone() : strokeB.clone().setY(strokeB.y + lift);
    if (chartEl) {
      const r = chartEl.getBoundingClientRect();
      const origin = world(r.left, r.bottom), corner = world(r.right, r.top);
      shared.uChart.value.set(origin.x, origin.y, corner.x - origin.x, corner.y - origin.y);
      shared.uCell.value.set((corner.x - origin.x) / NC, (corner.y - origin.y) / NR);
      const height = corner.y - origin.y, bobSize = Math.min(height * 0.24, compact ? 0.66 : 1.1);
      const anchor = new THREE.Vector3(corner.x, corner.y + height * 0.14, 0);
      const drop = anchor.y - (origin.y + link.price * height); // from the anchor down to the tip of the bob
      const dir = new THREE.Vector3(Math.sin(link.swing), -Math.cos(link.swing), 0);
      const end = anchor.clone().addScaledVector(dir, Math.max(drop - bobSize, 0.05));
      A.lerp(anchor, turn);
      B.lerp(end, turn);
      bob.position.copy(end).addScaledVector(dir, bobSize);
      bob.rotation.z = link.swing;
      bob.scale.setScalar(bobSize * smooth(0.72, 1, scroll));
      bob.visible = scroll > 0.72;
    }
    shared.uBeamA.value.copy(A);
    shared.uBeamB.value.copy(B);
    const lit = Math.max(cast && !swap ? 1 : 0, previewPower);
    beamColor.copy(hot).lerp(cool, toCase);
    shared.uBeamPower.value = lit * (0.85 + flash * 2.1) * (1 - toCase * 0.3);
    shared.uLoose.value = Math.max(0.22, 1.8 - order * 1.05 - toCase * 0.55);
    torch += ((torchSeen ? 0.9 : 0) * (1 - toCase * 0.7) - torch) * k(4);
    shared.uTorchPower.value = torch;
    beamUniforms.uPower.value = lit * (1 + flash * 1.6) * (1 - toCase * 0.25);
    beamUniforms.uThin.value = toCase;
    beamUniforms.uWidth.value = (compact ? 2.2 : 3.2) * (1 + flash * 0.6);

    raised += (link.raised - raised) * k(4);
    windowStart += (link.window - windowStart) * k(5);
    agit += ((Math.abs(link.swing - lastSwing) > 0.0004 ? Math.min(1, Math.abs(link.swing) * 5 + 0.25) : 0) - agit) * k(6);
    lastSwing = link.swing;
    shared.uDark.value = dark;
    shared.uTime.value = time;
    shared.uOrder.value = order;
    shared.uRelease.value = release;
    shared.uCase.value = toCase;
    shared.uRaised.value = raised;
    shared.uWindow.value = windowStart;
    shared.uAgit.value = agit;
    shared.uPointer.value.copy(pointer).multiplyScalar(1 - toCase);

    // The glass: it thaws from the stroke outwards once the beam is cast, with a moment of glare on the way.
    if (melting) {
      const t = Math.min(1, (now - melting) / 1500);
      finalUniforms.uMelt.value = t * t * (3 - 2 * t);
      finalUniforms.uFlash.value = Math.sin(Math.min(1, t * 1.7) * Math.PI) * 0.5;
      if (t >= 1) { melting = 0; finalUniforms.uVeil.value = 0; finalUniforms.uFlash.value = 0; }
    }
    breath += ((torchSeen && !melting ? 0.62 : 0) - breath) * k(5);
    finalUniforms.uBreath.value.z = breath;

    renderer.setRenderTarget(rtScene);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, camera);
    quad.material = glowMaterial;
    glowUniforms.tMap.value = rtScene.texture;
    glowUniforms.uStep.value.set(1 / rtA.width, 0);
    glowUniforms.uCut.value = 1;
    renderer.setRenderTarget(rtA);
    renderer.render(flat, still);
    glowUniforms.tMap.value = rtA.texture;
    glowUniforms.uStep.value.set(0, 1 / rtA.height);
    glowUniforms.uCut.value = 0;
    renderer.setRenderTarget(rtB);
    renderer.render(flat, still);
    quad.material = finalMaterial;
    finalUniforms.tScene.value = rtScene.texture;
    finalUniforms.tGlow.value = rtB.texture;
    renderer.setRenderTarget(null);
    renderer.render(flat, still);
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    pointerGoal.set((event.clientX / W) * 2 - 1, 1 - (event.clientY / H) * 2);
    shared.uTorch.value.copy(world(event.clientX, event.clientY)).setZ(0.7);
    finalUniforms.uBreath.value.set(event.clientX / W, 1 - event.clientY / H, breath);
    torchSeen = true;
  };
  const onResize = () => fit();
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("resize", onResize);
  const sight = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  sight.observe(canvas);
  fit();
  frame = requestAnimationFrame(tick);

  return {
    /** Lays the mark along a stroke, in screen pixels. `instant` skips the flight. */
    cast(ax: number, ay: number, bx: number, by: number, instant = false) {
      const s = solve(ax, ay, bx, by);
      Object.assign(next, { a: s.a, b: s.b, tx: s.tx, ty: s.ty, mirror: s.mirror });
      const dir = s.B.clone().sub(s.A);
      strokeA.copy(s.A).addScaledVector(dir, -0.2);
      strokeB.copy(s.B).addScaledVector(dir, 0.12);
      preview = null;
      orderGoal = 1;
      if (!cast || instant || reduced) { Object.assign(mark, next); cast = true; flash = instant ? 0 : 1; if (instant || reduced) order = 1; }
      else swap = true;
      if (instant || reduced) { finalUniforms.uVeil.value = 0; shared.uArrive.value = 1; }
      else kick = 1;
    },
    /** The stroke while it is still being drawn. `null` drops it. */
    preview(ax?: number, ay?: number, bx?: number, by?: number) {
      preview = ax === undefined ? null : [world(ax, ay!, rest), world(bx!, by!, rest)];
    },
    /** Where the glass has been touched: the path of the stroke so far, in screen pixels. An empty path heals it. */
    tear(path: [number, number][]) {
      const first = path[0], end = path[path.length - 1];
      finalUniforms.uTearOn.value = first ? 1 : 0;
      if (first) finalUniforms.uTear.value.set(first[0] / W, 1 - first[1] / H, end[0] / W, 1 - end[1] / H);
    },
    /** Lets the whole pane go. */
    melt() { if (finalUniforms.uVeil.value > 0 && !melting) melting = performance.now(); },
    get veiled() { return finalUniforms.uVeil.value > 0; },
    /** How much of the mark is standing, 0..1, for the page to read. */
    get order() { return order * (1 - smooth(0.04, 0.62, scroll)); },
    scroll(progress: number, pixels: number) { scroll = progress; scrollPx = pixels; },
    /** While a stroke is being drawn the camera stays put, so the beam lands under the pointer. */
    hold(on: boolean) { held = on; },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", onResize);
      sight.disconnect();
      geometry.dispose();
      box.dispose();
      for (const material of materials) material.dispose();
      for (const rt of [rtScene, rtA, rtB]) rt.dispose();
      for (const texture of [hall, haze]) texture.dispose();
      glowMaterial.dispose();
      finalMaterial.dispose();
      quad.geometry.dispose();
      beam.geometry.dispose();
      (beam.material as THREE.Material).dispose();
      brass.dispose();
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
}
export type Scene = ReturnType<typeof createScene>;
