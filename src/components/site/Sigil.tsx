import { sigil } from "./scene/sigil";

/** The 2D emblem of a text: the same generated figure the 3D field forms, drawn as dots. */
export default function Sigil({ text, points = 190 }: { text: string; points?: number }) {
  const next = sigil(text);
  const dots = Array.from({ length: points }, () => {
    const [x, y, z, tone] = next();
    // A fixed three-quarter view, so emblems are comparable across a list.
    const px = x * 0.92 + z * 0.39, py = y * 0.95 - (z * 0.92 - x * 0.39) * 0.3;
    return { x: (32 + px * 20).toFixed(1), y: (32 - py * 20).toFixed(1), tone };
  });
  return (
    <svg className="sigil" viewBox="0 0 64 64" aria-hidden="true">
      {dots.map((dot, i) => <circle className={dot.tone ? "sigil-accent" : undefined} cx={dot.x} cy={dot.y} r={dot.tone ? 0.75 : 0.55} key={i} />)}
    </svg>
  );
}
