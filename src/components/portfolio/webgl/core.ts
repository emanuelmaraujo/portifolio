import {
  BufferGeometry, Color, EdgesGeometry, ExtrudeGeometry, Group, IcosahedronGeometry,
  LineBasicMaterial, LineLoop, LineSegments, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  OctahedronGeometry, Path, Points, PointsMaterial, Shape, Vector3,
} from "three";
import type { Model } from "./types";

const tau = Math.PI * 2;

function plate(inner: number, outer: number, start: number, end: number, depth: number) {
  const shape = new Shape();
  shape.moveTo(Math.cos(start) * outer, Math.sin(start) * outer);
  shape.lineTo(Math.cos(end) * outer, Math.sin(end) * outer);
  shape.lineTo(Math.cos(end) * inner, Math.sin(end) * inner);
  shape.lineTo(Math.cos(start) * inner, Math.sin(start) * inner);
  shape.closePath();
  return new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: .04, bevelSize: .045, bevelSegments: 1, steps: 1 });
}

function mark() {
  const draw = <T extends Path>(path: T, points: number[][]) => {
    points.forEach(([x, y], i) => {
      if (i === 0) path.moveTo((x - 30) * .047, (25 - y) * .047);
      else path.lineTo((x - 30) * .047, (25 - y) * .047);
    });
    path.closePath();
    return path;
  };
  const e = draw(new Shape(), [[9,12],[28,12],[24,18],[15,18],[15,22],[23,22],[20,27],[15,27],[15,32],[22,32],[19,38],[9,38]]);
  const a = draw(new Shape(), [[21,38],[33,12],[39,12],[51,38],[44,38],[41,31],[32,31],[29,38]]);
  a.holes.push(draw(new Path(), [[34,26],[39,26],[36.5,20]]));
  return new ExtrudeGeometry([e, a], { depth: .17, bevelEnabled: true, bevelThickness: .018, bevelSize: .015, bevelSegments: 1, steps: 1 });
}

function orbit(radius: number, tint: string) {
  const points = Array.from({ length: 64 }, (_, i) => new Vector3(Math.cos(i / 64 * tau) * radius, Math.sin(i / 64 * tau) * radius, 0));
  return new LineLoop(new BufferGeometry().setFromPoints(points), new LineBasicMaterial({ color: tint, transparent: true, opacity: .5 }));
}

export const buildCore: Model = scene => {
  const assembly = new Group();
  scene.add(assembly);
  const steel = new MeshStandardMaterial({ color: "#899db9", roughness: .29, metalness: .86 });
  const graphite = new MeshStandardMaterial({ color: "#28374e", roughness: .35, metalness: .68 });
  const enamel = new MeshStandardMaterial({ color: "#ff9a7b", roughness: .34, metalness: .39, emissive: "#b23d14", emissiveIntensity: .24 });
  const glass = new MeshStandardMaterial({ color: "#68ccfa", roughness: .24, metalness: .22, transparent: true, opacity: .36, depthWrite: false, emissive: "#225575", emissiveIntensity: .38 });
  const ice = new LineBasicMaterial({ color: "#a5eaff", transparent: true, opacity: .52 });
  const outer = new Group(), inner = new Group(), badge = new Group();
  assembly.add(outer, inner, badge);
  const segments = Array.from({ length: 8 }, (_, i) => {
    const start = i * tau / 8 + .026;
    const end = (i + 1) * tau / 8 - .026;
    const housing = new Group();
    const panel = new Mesh(plate(1.97, 2.67, start, end, .22), i % 3 === 1 ? graphite : steel);
    panel.position.z = -.15;
    const insert = new Mesh(plate(1.78, 1.94, start + .015, end - .015, .39), glass);
    insert.position.z = -.18;
    const rear = new Mesh(plate(2.2, 2.5, start - .04, end - .04, .16), graphite);
    rear.position.z = -.61;
    const accent = new Mesh(plate(2.12, 2.49, start + .12, start + .27, .045), i % 3 === 0 ? enamel : steel);
    accent.position.z = .12;
    housing.add(panel, insert, rear, accent);
    outer.add(housing);
    return { housing, angle: (start + end) / 2 };
  });
  const crystalline = new IcosahedronGeometry(1.48, 0);
  inner.add(new Mesh(crystalline, glass), new LineSegments(new EdgesGeometry(crystalline), ice));
  const fragment = new Mesh(new IcosahedronGeometry(.94, 0), new MeshStandardMaterial({
    color: "#709dbb", emissive: "#2479a0", emissiveIntensity: .34, metalness: .64, roughness: .26, flatShading: true,
  }));
  inner.add(fragment);
  const emblem = new Mesh(mark(), new MeshStandardMaterial({ color: "#effaff", roughness: .27, metalness: .46, emissive: "#81bbd7", emissiveIntensity: .28 }));
  emblem.position.z = 1.38;
  badge.add(emblem);

  const rails = new Group();
  const node = new OctahedronGeometry(.068);
  const nodeMaterial = new MeshBasicMaterial({ color: "#a9efff" });
  [2.9, 3.18, 3.33].forEach((radius, i) => {
    const track = new Group();
    track.rotation.set(.22 + i * .27, -.35 + i * .4, i * .48);
    track.add(orbit(radius, i === 1 ? "#795e55" : "#5b9fbc"));
    for (let j = 0; j < 6; j++) {
      const angle = j * tau / 6 + i * .76;
      const n = new Mesh(node, nodeMaterial);
      n.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      track.add(n);
    }
    rails.add(track);
  });
  assembly.add(rails);

  const field = Array.from({ length: 240 }, (_, i) => {
    const radius = 2.6 + ((i * 71) % 239) / 41;
    const angle = i * 2.399963;
    return new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, -1 - (i % 15) / 4);
  });
  const particles = new Points(new BufferGeometry().setFromPoints(field), new PointsMaterial({ size: .024, color: new Color("#a6c9e4"), transparent: true, opacity: .52, depthWrite: false }));
  scene.add(particles);

  return ({ time, x, y, scroll }) => {
    const eased = (value: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, value)), 3);
    const settle = eased(time / 1.28);
    for (const [index, { housing, angle }] of segments.entries()) {
      const entry = 1 - eased((time - index * .043) / 1.03);
      const travel = entry * 3.4 + scroll * (.2 + (index % 2) * .22);
      housing.position.set(Math.cos(angle) * travel, Math.sin(angle) * travel, entry * (index % 2 ? -2.1 : 1.25));
      housing.rotation.z = entry * .72 - scroll * (index % 2 ? .15 : -.09);
      housing.scale.setScalar(.74 + .26 * (1 - entry));
    }
    inner.scale.setScalar(.45 + .55 * settle);
    fragment.rotation.set(time * .16, time * .21, -.15);
    badge.scale.setScalar(.64 + .36 * settle);
    rails.rotation.z = time * .043 + scroll * .43;
    assembly.rotation.set(.32 - y * .3 + scroll * .61, -.37 + x * .36 + scroll * .76 + Math.sin(time * .62) * .055, -.2 + scroll * .29);
    assembly.position.set(x * .14 - scroll * .37, y * .12 + Math.sin(time * .72) * .095 - scroll * .68, -scroll * .75);
    assembly.scale.setScalar(1 - scroll * .19);
    particles.rotation.z = time * .015;
  };
};
