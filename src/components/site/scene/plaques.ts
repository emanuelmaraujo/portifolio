import * as THREE from "three";

/**
 * Torvya plaques as real geometry: a 100 x 100 mm acrylic block with rounded corners and a printed face.
 * The faces are drawn in code from the product layout. The QR pattern is decorative and does not resolve,
 * and the Review face uses a neutral star badge in place of the third-party logo printed on the real product.
 */

const BLUE = "#3345e6", INK = "#0b1020", TEAL = "#3dd6c1";

function canvasFace(draw: (c: CanvasRenderingContext2D, s: number) => void) {
  const size = 768, canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#fff";
  c.fillRect(0, 0, size, size);
  draw(c, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function qr(c: CanvasRenderingContext2D, x: number, y: number, size: number, frame: string) {
  const n = 21, cell = size / n;
  let seed = 42;
  const next = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  c.fillStyle = INK;
  const finder = (i: number, j: number) => (i < 7 && j < 7) || (i > 13 && j < 7) || (i < 7 && j > 13);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const centre = i > 7 && i < 13 && j > 7 && j < 13;
    if (!finder(i, j) && !centre && next() > 0.52) c.fillRect(x + i * cell, y + j * cell, cell + 0.5, cell + 0.5);
  }
  for (const [i, j] of [[0, 0], [14, 0], [0, 14]]) {
    c.fillRect(x + i * cell, y + j * cell, cell * 7, cell * 7);
    c.fillStyle = "#fff"; c.fillRect(x + (i + 1) * cell, y + (j + 1) * cell, cell * 5, cell * 5);
    c.fillStyle = INK; c.fillRect(x + (i + 2) * cell, y + (j + 2) * cell, cell * 3, cell * 3);
  }
  symbol(c, x + size / 2 - cell * 2, y + size / 2 - cell * 2, cell * 4, BLUE);
  // Scanner corners
  c.strokeStyle = frame; c.lineWidth = size * 0.035; c.lineCap = "round";
  const o = size * 0.13, l = size * 0.2;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const cx = x + size / 2 + sx * (size / 2 + o), cy = y + size / 2 + sy * (size / 2 + o);
    c.beginPath(); c.moveTo(cx - sx * l, cy); c.lineTo(cx, cy); c.lineTo(cx, cy - sy * l); c.stroke();
  }
}

/** The Torvya symbol, redrawn from the brand SVG (viewBox 48). */
function symbol(c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const k = size / 48;
  c.save(); c.translate(x, y); c.scale(k, k);
  c.strokeStyle = color; c.lineWidth = 8; c.lineCap = "round";
  c.beginPath(); c.moveTo(7, 13); c.lineTo(41, 13); c.stroke();
  c.beginPath(); c.moveTo(18, 13); c.lineTo(18, 25.5); c.bezierCurveTo(18, 31, 21.5, 35, 27, 35); c.stroke();
  c.fillStyle = TEAL; c.beginPath(); c.arc(39.5, 35, 5, 0, Math.PI * 2); c.fill();
  c.restore();
}

function tap(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  c.strokeStyle = color; c.lineWidth = r * 0.09; c.lineCap = "round";
  c.beginPath(); c.ellipse(x, y, r, r * 0.72, 0, 0, Math.PI * 2); c.stroke();
  for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x - r * 0.42, y, r * (0.14 + i * 0.15), -0.75, 0.75); c.stroke(); }
}

function byline(c: CanvasRenderingContext2D, s: number, y: number) {
  c.fillStyle = INK; c.textAlign = "center";
  c.font = `600 ${s * 0.03}px system-ui, sans-serif`;
  c.fillText("by", s * 0.44, y);
  symbol(c, s * 0.465, y - s * 0.034, s * 0.045, BLUE);
  c.font = `700 ${s * 0.04}px system-ui, sans-serif`;
  c.fillText("torvya", s * 0.575, y);
}

function reviewFace() {
  return canvasFace((c, s) => {
    c.fillStyle = BLUE;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(s, 0); c.lineTo(s, s * 0.47);
    c.bezierCurveTo(s * 0.72, s * 0.58, s * 0.42, s * 0.36, 0, s * 0.5); c.closePath(); c.fill();
    // Neutral review badge
    c.fillStyle = "#fff"; c.beginPath(); c.arc(s * 0.22, s * 0.22, s * 0.11, 0, Math.PI * 2); c.fill();
    star(c, s * 0.22, s * 0.222, s * 0.07, BLUE);
    c.fillStyle = "#fff"; c.textAlign = "left";
    c.font = `800 ${s * 0.088}px system-ui, sans-serif`;
    c.fillText("Avalie", s * 0.39, s * 0.2);
    c.fillText("nossa loja", s * 0.39, s * 0.29);
    for (let i = 0; i < 5; i++) star(c, s * (0.43 + i * 0.085), s * 0.37, s * 0.036, "#ffd21f");
    c.fillStyle = INK; c.font = `700 ${s * 0.037}px system-ui, sans-serif`; c.textAlign = "center";
    c.fillText("Aproxime seu celular", s * 0.27, s * 0.6);
    c.fillText("Escaneie o QR Code", s * 0.72, s * 0.58);
    tap(c, s * 0.25, s * 0.74, s * 0.1, INK);
    c.fillText("ou", s * 0.47, s * 0.75);
    qr(c, s * 0.61, s * 0.64, s * 0.22, INK);
    byline(c, s, s * 0.955);
  });
}

function connectFace() {
  return canvasFace((c, s) => {
    c.fillStyle = BLUE;
    const blob = (x: number, y: number, r: number) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
    blob(s * 0.98, s * 0.03, s * 0.25); blob(s * 0.82, -s * 0.02, s * 0.14);
    blob(s * 0.02, s * 0.97, s * 0.22); blob(s * 0.17, s * 1.02, s * 0.13);
    blob(s * 0.98, s * 0.99, s * 0.2);
    c.textAlign = "left"; c.fillStyle = INK;
    c.font = `800 ${s * 0.092}px system-ui, sans-serif`;
    c.fillText("APROXIME", s * 0.13, s * 0.3);
    const w = c.measureText("APROXIME ").width;
    c.font = `500 ${s * 0.07}px system-ui, sans-serif`;
    c.fillText("ou", s * 0.13 + w, s * 0.3);
    c.fillStyle = BLUE; c.font = `800 ${s * 0.118}px system-ui, sans-serif`;
    c.fillText("ESCANEIE", s * 0.13, s * 0.41);
    c.fillStyle = INK; c.font = `500 ${s * 0.036}px system-ui, sans-serif`;
    c.fillText("Conecte-se em segundos", s * 0.13, s * 0.47);
    tap(c, s * 0.3, s * 0.7, s * 0.11, BLUE);
    c.fillStyle = INK; c.fillRect(s * 0.5, s * 0.59, s * 0.004, s * 0.22);
    qr(c, s * 0.6, s * 0.59, s * 0.22, BLUE);
    byline(c, s, s * 0.94);
  });
}

function star(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  c.fillStyle = color; c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r * 0.42 : r;
    c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  c.closePath(); c.fill();
}

function roundedSquare(size: number, radius: number) {
  const h = size / 2, shape = new THREE.Shape();
  shape.moveTo(-h + radius, -h);
  shape.lineTo(h - radius, -h); shape.quadraticCurveTo(h, -h, h, -h + radius);
  shape.lineTo(h, h - radius); shape.quadraticCurveTo(h, h, h - radius, h);
  shape.lineTo(-h + radius, h); shape.quadraticCurveTo(-h, h, -h, h - radius);
  shape.lineTo(-h, -h + radius); shape.quadraticCurveTo(-h, -h, -h + radius, -h);
  return shape;
}

export function createPlaques() {
  const group = new THREE.Group();
  group.visible = false;
  const size = 1.12, depth = 0.11;
  const shape = roundedSquare(size, 0.09);
  const block = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 3, curveSegments: 10 });
  block.translate(0, 0, -depth / 2);
  const acrylic = new THREE.MeshPhysicalMaterial({ color: 0xcfe0ff, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 });
  const faceShape = new THREE.ShapeGeometry(roundedSquare(size - 0.035, 0.08), 10);
  // ShapeGeometry UVs are in shape units; remap them to 0..1 for the printed face.
  const uv = faceShape.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / (size - 0.035) + 0.5, uv.getY(i) / (size - 0.035) + 0.5);
  const back = new THREE.MeshStandardMaterial({ color: 0xf4f6fb, roughness: 0.6 });

  const textures: THREE.Texture[] = [];
  const make = (name: string, texture: THREE.Texture) => {
    textures.push(texture);
    const plaque = new THREE.Group();
    plaque.name = name;
    const print = new THREE.Mesh(faceShape, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.35 }));
    print.position.z = depth / 2 + 0.014;
    const rear = new THREE.Mesh(faceShape, back);
    rear.rotation.y = Math.PI;
    rear.position.z = depth / 2 + 0.008;
    const body = new THREE.Mesh(block, acrylic);
    body.renderOrder = 2;
    plaque.add(rear, print, body);
    group.add(plaque);
    return plaque;
  };
  const review = make("review", reviewFace()), connect = make("connect", connectFace());
  const state = { review: { x: -1, focus: 0 }, connect: { x: 1, focus: 0 } };

  return {
    group,
    update(presence: number, time: number, selected: string, still: boolean) {
      group.visible = presence > 0.01;
      if (!group.visible) return;
      const ease = presence * presence * (3 - 2 * presence);
      for (const [plaque, key] of [[review, "review"], [connect, "connect"]] as const) {
        const s = state[key], on = selected === key ? 1 : 0;
        s.focus += (on - s.focus) * (still ? 1 : 0.08);
        const side = Math.sign(s.x);
        const bob = still ? 0 : Math.sin(time * 0.9 + s.x) * 0.018;
        plaque.position.set(side * (0.98 - s.focus * 0.62), -0.28 + s.focus * 0.08 + bob, s.focus * 0.6 - (1 - s.focus) * 0.35);
        plaque.rotation.set(-0.05, -side * (0.62 - s.focus * 0.48) + (still ? 0 : Math.sin(time * 0.5 + s.x * 2) * 0.06), 0);
        plaque.scale.setScalar(ease * (1.05 + s.focus * 0.3));
      }
    },
    dispose() {
      block.dispose(); faceShape.dispose(); acrylic.dispose(); back.dispose();
      for (const t of textures) t.dispose();
      for (const p of [review, connect]) ((p.children[1] as THREE.Mesh).material as THREE.Material).dispose();
    },
  };
}
