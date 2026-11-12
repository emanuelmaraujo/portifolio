/**
 * A sigil is a figure generated from a piece of text, such as an article slug. The same text always gives the same
 * figure, and different texts give visibly different ones. It is used in 3D (particle field) and in 2D (list emblems),
 * so this module has no rendering dependencies.
 */

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SigilPoint = [x: number, y: number, z: number, tone: number];

/** Returns a sampler: each call gives one point of the figure. `variant` rearranges the same figure, for article sections. */
export function sigil(text: string, variant = 0) {
  const pick = rng(hash(text));
  // The identity of the figure: lobes around the axis, ripples along it, and how deep they cut.
  const lobes = 2 + Math.floor(pick() * 5), ripples = 1 + Math.floor(pick() * 4);
  const depth = 0.16 + pick() * 0.22, twist = (pick() - 0.5) * 2.4, squash = 0.72 + pick() * 0.5;
  const ring = pick() < 0.6, ringTilt = (pick() - 0.5) * 1.4, phase = pick() * Math.PI * 2;
  // A variant keeps the family resemblance and shifts the proportions.
  const v = rng(hash(text) + variant * 7919);
  const lobesV = variant ? Math.max(2, lobes + Math.round((v() - 0.5) * 3)) : lobes;
  const ripplesV = variant ? Math.max(1, ripples + Math.round((v() - 0.5) * 2)) : ripples;
  const depthV = variant ? depth * (0.7 + v() * 0.7) : depth, phaseV = phase + variant * 0.9;
  const r = rng(hash(text) * 31 + variant);

  return (): SigilPoint => {
    if (ring && r() < 0.14) {
      const a = r() * Math.PI * 2, rad = 1.42 + (r() - 0.5) * 0.03;
      const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      return [x, z * Math.sin(ringTilt) * 0.6, z * Math.cos(ringTilt), 0];
    }
    const u = r() * 2 - 1, theta = r() * Math.PI * 2, polar = Math.acos(u);
    const wave = Math.sin(lobesV * theta + twist * u * 2 + phaseV) * Math.sin(ripplesV * polar + phaseV * 0.5);
    const shell = r() < 0.82 ? 1 : Math.cbrt(r());
    const rad = (0.86 + depthV * wave) * shell, s = Math.sin(polar);
    return [rad * s * Math.cos(theta), rad * u * squash, rad * s * Math.sin(theta), wave > 0.62 && shell === 1 ? 1 : 0];
  };
}
