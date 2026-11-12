import mark from "./mark-paths.json";
import { sigil } from "./sigil";

/** A form is one arrangement of the particle field: positions, a tone (0 bone, 1 accent) and a group id used for highlighting. */
export type Form = { pos: Float32Array; tone: Float32Array; group: Float32Array; anchors: Record<string, [number, number, number]> };
export type FormName = "mark" | "strata" | "graph" | "orchestra" | "prumo" | "torvya" | "kreps" | "horizon" | "orbit" | "sigil";

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function builder(n: number, seed: number) {
  const form: Form = { pos: new Float32Array(n * 3), tone: new Float32Array(n), group: new Float32Array(n), anchors: {} };
  const r = rng(seed);
  let i = 0;
  const put = (x: number, y: number, z: number, tone = 0, group = 0) => {
    if (i >= n) return;
    form.pos.set([x, y, z], i * 3);
    form.tone[i] = tone;
    form.group[i] = group;
    i++;
  };
  /** Spends a share of the particle budget on one part of the figure. */
  const fill = (share: number, fn: (k: number, count: number) => void) => {
    const count = Math.min(n - i, Math.round(n * share));
    for (let k = 0; k < count; k++) fn(k, count);
  };
  const rest = (fn: (k: number, count: number) => void) => {
    const count = n - i;
    for (let k = 0; k < count; k++) fn(k, count);
  };
  const sphere = (radius: number): [number, number, number] => {
    const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    return [s * Math.cos(a) * radius, u * radius, s * Math.sin(a) * radius];
  };
  return { form, r, put, fill, rest, sphere };
}

const polygon = (d: string) => d.slice(1, -1).split("L").map(p => p.split(" ").map(Number) as [number, number]);
const MARK_SCALE = 2.9 / 64;
const toWorld = ([x, y]: [number, number]): [number, number] => [(x - 32) * MARK_SCALE, (32 - y) * MARK_SCALE];

function markForm(n: number): Form {
  const { form, r, put, fill, rest } = builder(n, 11);
  const shapes = [mark.beam, ...mark.strata].map(polygon);
  const areas = shapes.map(s => Math.abs(s.reduce((a, p, j) => a + p[0] * s[(j + 1) % s.length][1] - s[(j + 1) % s.length][0] * p[1], 0)) / 2);
  const total = areas.reduce((a, b) => a + b, 0);
  const pick = () => {
    let t = r() * total, s = 0;
    while (s < shapes.length - 1 && t > areas[s]) t -= areas[s++];
    return s;
  };
  const inside = (s: [number, number][]): [number, number] => {
    // The shapes are convex: choose a fan triangle, then a uniform point inside it.
    const tri = 1 + Math.floor(r() * (s.length - 2));
    let u = r(), v = r();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const [a, b, c] = [s[0], s[tri], s[tri + 1]];
    return [a[0] + (b[0] - a[0]) * u + (c[0] - a[0]) * v, a[1] + (b[1] - a[1]) * u + (c[1] - a[1]) * v];
  };
  const emit = (s: number, p: [number, number], depth: number) => {
    const [x, y] = toWorld(p);
    put(x, y, depth, s === 0 ? 0 : 1, s);
  };
  // Edges first so the silhouette stays crisp, then the volume.
  fill(0.36, () => {
    const s = pick(), shape = shapes[s], e = Math.floor(r() * shape.length), t = r();
    const a = shape[e], b = shape[(e + 1) % shape.length];
    emit(s, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], (r() < 0.5 ? -1 : 1) * 0.13);
  });
  rest(() => { const s = pick(); emit(s, inside(shapes[s]), (r() - 0.5) * 0.26); });
  return form;
}

export const STRATA_LAYERS = 5;

function strataForm(n: number): Form {
  const { form, r, put, fill, rest } = builder(n, 23);
  for (let l = 0; l < STRATA_LAYERS; l++) form.anchors["layer" + l] = [-1.3, -1.1 + l * 0.55, 0.75];
  fill(0.1, (k, count) => {
    // The beam: one diagonal vector crossing every layer, as in the mark.
    const t = k / count;
    put(-0.9 + t * 1.6 + (r() - 0.5) * 0.03, -1.3 + t * 2.6, 0.35 - t * 0.7 + (r() - 0.5) * 0.03, 1, 9);
  });
  rest((k) => {
    const l = k % STRATA_LAYERS, w = 1.3 - l * 0.1, d = 0.78 - l * 0.05;
    let x = (r() * 2 - 1) * w, z = (r() * 2 - 1) * d;
    if (r() < 0.3) { if (r() < 0.5) x = Math.sign(x) * w; else z = Math.sign(z) * d; }
    else { x = Math.round(x * 14) / 14; z = Math.round(z * 14) / 14; }
    put(x, -1.1 + l * 0.55 + (r() - 0.5) * 0.012, z, 0, l);
  });
  return form;
}

export const GRAPH_NODES: [number, number, number][] = [[0, 1.0, 0], [-1.2, -0.25, 0.25], [1.2, -0.25, 0.25], [0, -1.0, -0.2]];

function graphForm(n: number): Form {
  const { form, r, put, fill, rest, sphere } = builder(n, 37);
  GRAPH_NODES.forEach((p, j) => (form.anchors["node" + j] = [p[0], p[1] - 0.6, p[2]]));
  const pairs: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  fill(0.3, (k) => {
    const [a, b] = pairs[k % pairs.length], t = r(), A = GRAPH_NODES[a], B = GRAPH_NODES[b];
    const sag = Math.sin(t * Math.PI) * 0.16;
    put(A[0] + (B[0] - A[0]) * t + (r() - 0.5) * 0.03, A[1] + (B[1] - A[1]) * t + (r() - 0.5) * 0.03, A[2] + (B[2] - A[2]) * t + sag, 0, 8);
  });
  rest((k) => {
    const j = k % 4, c = GRAPH_NODES[j], [x, y, z] = sphere(r() < 0.7 ? 0.42 : 0.42 * Math.cbrt(r()));
    put(c[0] + x, c[1] + y, c[2] + z, 0, j);
  });
  return form;
}

export const ORCHESTRA_NODES = 6;
export function orchestraNode(j: number): [number, number, number] {
  const a = (j / ORCHESTRA_NODES) * Math.PI * 2 - Math.PI / 2;
  return [Math.cos(a) * 1.35, -Math.sin(a) * 0.95, Math.sin(a) * 0.5];
}

function orchestraForm(n: number): Form {
  const { form, r, put, fill, rest, sphere } = builder(n, 41);
  form.anchors.core = [0, 0, 0];
  for (let j = 0; j < ORCHESTRA_NODES; j++) form.anchors["agent" + j] = orchestraNode(j);
  fill(0.2, () => { const [x, y, z] = sphere(r() < 0.75 ? 0.34 : 0.34 * r()); put(x, y, z, 1, 0); });
  fill(0.16, () => {
    const a = r() * Math.PI * 2;
    put(Math.cos(a) * 1.35 + (r() - 0.5) * 0.02, -Math.sin(a) * 0.95 + (r() - 0.5) * 0.02, Math.sin(a) * 0.5, 0, 8);
  });
  fill(0.2, (k) => {
    const p = orchestraNode(k % ORCHESTRA_NODES), t = 0.3 + r() * 0.56;
    put(p[0] * t + (r() - 0.5) * 0.02, p[1] * t + (r() - 0.5) * 0.02, p[2] * t, 0, 8);
  });
  rest((k) => {
    const j = k % ORCHESTRA_NODES, p = orchestraNode(j), [x, y, z] = sphere(r() < 0.8 ? 0.17 : 0.17 * r());
    put(p[0] + x, p[1] + y, p[2] + z, 0, j + 1);
  });
  return form;
}

function prumoForm(n: number): Form {
  // "Prumo" means plumb line: a noisy field of offers converges into one true vertical that ends in the bob.
  const { form, r, put, fill, rest } = builder(n, 53);
  fill(0.16, () => {
    const t = r(), rad = (1 - t) * 0.17 * (t < 0.12 ? t / 0.12 : 1), a = r() * Math.PI * 2;
    put(Math.cos(a) * rad, -0.78 - t * 0.52, Math.sin(a) * rad, 1, 1);
  });
  fill(0.14, () => put((r() - 0.5) * 0.02, 0.55 - r() * 1.33, (r() - 0.5) * 0.02, 1, 1));
  rest(() => {
    const t = Math.pow(r(), 0.7), a = r() * Math.PI * 2, spread = Math.pow(1 - t, 2.2) * 1.5 * (0.35 + r() * 0.65);
    put(Math.cos(a) * spread, 1.45 - t * 0.9, Math.sin(a) * spread * 0.6, 0, 0);
  });
  return form;
}

function torvyaForm(n: number): Form {
  // A platform under the plaques and tap waves rising from each of them.
  const { form, r, put, fill, rest } = builder(n, 67);
  fill(0.34, () => {
    const a = r() * Math.PI * 2, rad = 0.3 + Math.sqrt(r()) * 1.35;
    put(Math.cos(a) * rad, -0.98 + (r() - 0.5) * 0.01, Math.sin(a) * rad * 0.8, 0, 0);
  });
  rest((k) => {
    const ring = k % 4, rad = 0.36 + ring * 0.2, a = Math.PI * (0.22 + r() * 0.56);
    put(Math.cos(a) * rad + (r() - 0.5) * 0.015, 0.66 + Math.sin(a) * rad * 0.62, (r() - 0.5) * 0.3, 1, ring + 1);
  });
  return form;
}

function krepsForm(n: number): Form {
  // An order board: four lanes of tickets.
  const { form, r, put, rest } = builder(n, 71);
  const cols = 4, w = 0.58, h = 0.5, gapX = 0.14, gapY = 0.13, queue = [3, 2, 3, 1];
  rest((k) => {
    const c = k % cols, row = Math.floor(r() * queue[c]);
    const cx = (c - 1.5) * (w + gapX), cy = 0.7 - row * (h + gapY);
    if (r() < 0.1) { put(cx + (r() - 0.5) * w, 1.12, 0, 0, c + 1); return; }
    let x = (r() - 0.5) * w, y = (r() - 0.5) * h;
    const edge = r() < 0.6;
    if (edge) { if (r() < 0.55) y = Math.sign(y) * h / 2; else x = Math.sign(x) * w / 2; }
    else if (r() < 0.6) { y = h * (0.24 - Math.floor(r() * 3) * 0.2); x *= 0.75; }
    put(cx + x, cy + y, (r() - 0.5) * 0.015, edge && row === 0 ? 1 : 0, c + 1);
  });
  return form;
}

function horizonForm(n: number): Form {
  const { form, r, put, rest } = builder(n, 83);
  rest(() => {
    const x = Math.round((r() * 2 - 1) * 4.2 * 9) / 9, z = 1.2 - r() * 5.5;
    const y = -1.05 + Math.sin(x * 1.3 + z * 0.8) * 0.16 + Math.cos(z * 1.9 - x * 0.4) * 0.12;
    put(x, y, z, r() < 0.06 ? 1 : 0, 0);
  });
  return form;
}

function orbitForm(n: number): Form {
  // Two crossed orbits around a small core. The credential badges ride the wider one as real objects.
  const { form, r, put, fill, rest, sphere } = builder(n, 97);
  fill(0.16, () => { const [x, y, z] = sphere(r() < 0.8 ? 0.2 : 0.2 * r()); put(x, y, z, 1, 0); });
  fill(0.5, () => {
    const a = r() * Math.PI * 2, rad = 1.3 + (r() - 0.5) * (r() < 0.8 ? 0.03 : 0.3);
    put(Math.cos(a) * rad, (r() - 0.5) * 0.02, Math.sin(a) * rad, 0, 1);
  });
  rest(() => {
    const a = r() * Math.PI * 2, rad = 0.78 + (r() - 0.5) * 0.02;
    put(Math.cos(a) * rad * 0.5, Math.sin(a) * rad, Math.cos(a) * rad * 0.86, r() < 0.2 ? 1 : 0, 2);
  });
  return form;
}

/** `arg` is "text" or "text#variant": the text picks the figure, the variant rearranges it. */
function sigilForm(n: number, arg: string): Form {
  const { form, put, rest } = builder(n, 1);
  const [text, variant] = arg.split("#");
  const next = sigil(text, Number(variant ?? 0));
  rest(() => { const [x, y, z, tone] = next(); put(x * 1.18, y * 1.18, z * 1.18, tone, tone); });
  return form;
}

const makers: Record<Exclude<FormName, "sigil">, (n: number) => Form> = {
  mark: markForm, strata: strataForm, graph: graphForm, orchestra: orchestraForm,
  prumo: prumoForm, torvya: torvyaForm, kreps: krepsForm, horizon: horizonForm, orbit: orbitForm,
};

export function createForms(n: number) {
  const cache = new Map<string, Form>();
  /** `key` is a form name, or "sigil:text#variant" for generated figures. */
  return (key: string) => {
    if (!cache.has(key)) {
      const split = key.indexOf(":"), name = split < 0 ? key : key.slice(0, split);
      cache.set(key, name === "sigil" ? sigilForm(n, key.slice(split + 1)) : (makers[name as keyof typeof makers] ?? markForm)(n));
    }
    return cache.get(key)!;
  };
}
