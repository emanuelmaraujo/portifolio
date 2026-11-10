import {
  BoxGeometry, CanvasTexture, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  PlaneGeometry, SRGBColorSpace,
} from "three";
import type { Model } from "./types";

function face(label: string, review: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 352;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Texture unavailable");
  ctx.fillStyle = review ? "#dff0fa" : "#152939";
  ctx.fillRect(0, 0, 512, 352);
  ctx.fillStyle = review ? "#102532" : "#dff3ff";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText("TORVYA", 37, 74);
  ctx.font = "28px monospace";
  ctx.fillText(label, 39, 122);
  ctx.fillRect(39, 142, 140, 3);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = 6;
  for (const offset of [0, 15, 30]) {
    ctx.beginPath();
    ctx.arc(103, 241, 25 + offset, -.63, .63);
    ctx.stroke();
  }
  for (let y = 0; y < 13; y++) for (let x = 0; x < 13; x++) {
    if ((x * 21 + y * 37 + x * y * 13) % 17 > 7) ctx.fillRect(339 + x * 9, 190 + y * 9, 8, 8);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export const buildTorvya: Model = scene => {
  const rig = new Group();
  const plaques = [true, false].map((review, index) => {
    const plaque = new Group();
    const frame = new Mesh(new BoxGeometry(2.86, 1.96, .15), new MeshStandardMaterial({
      color: review ? "#b9e3fa" : "#233650", roughness: .33, metalness: .45,
    }));
    const cover = new Mesh(new PlaneGeometry(2.78, 1.89), new MeshBasicMaterial({ map: face(review ? "REVIEW" : "CONNECT", review) }));
    cover.position.z = .076;
    plaque.add(frame, cover);
    plaque.position.set(index ? .88 : -.88, index ? -.35 : .35, index ? .38 : -.35);
    plaque.rotation.z = index ? -.16 : .17;
    rig.add(plaque);
    return plaque;
  });
  scene.add(rig);
  return ({ time, x, y, turn }) => {
    rig.rotation.set(.16 - y * .22, -.32 + turn + x * .26, -.11);
    plaques[0].position.y = .38 + Math.sin(time * .8) * .09;
    plaques[1].position.y = -.38 - Math.sin(time * .8) * .09;
  };
};
