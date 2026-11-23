import paths from "@/components/site/scene/mark-paths.json";
import { labels, points } from "../shared";

/**
 * The mark as a specimen on a plinth, drawn as an oblique elevation on the server from the logo's own path data.
 * No canvas and no script: this is the museum's object, and it is the same in every browser.
 */
type P2 = [number, number];
const DEPTH = 13;
// The front stays true to the logo; depth runs back to the right and up.
const iso = (x: number, y: number, z: number): P2 => [x - z * 0.62, y + z * 0.36];
const d = (pts: P2[]) => "M" + pts.map(([x, y]) => x.toFixed(2) + " " + y.toFixed(2)).join("L") + "Z";

/** One extruded solid: the faces that look towards the viewer, then the front. */
function Solid({ pts, z0 = 0, z1 = DEPTH, tone }: { pts: P2[]; z0?: number; z1?: number; tone: "stone" | "copper" | "plinth" }) {
  const area = pts.reduce((sum, [x, y], i) => { const [nx, ny] = pts[(i + 1) % pts.length]; return sum + x * ny - nx * y; }, 0);
  const sides = pts.map(([x, y], i) => {
    const [x2, y2] = pts[(i + 1) % pts.length];
    const sign = area > 0 ? 1 : -1, nx = (y2 - y) * sign, ny = -(x2 - x) * sign, len = Math.hypot(nx, ny) || 1;
    // In this projection the viewer sees faces that point right or up.
    if (nx * 0.62 - ny * 0.36 <= 0.001) return null;
    return <path className={`m-${tone}-${-ny / len > 0.5 ? "top" : "side"}`} d={d([iso(x, y, z0), iso(x2, y2, z0), iso(x2, y2, z1), iso(x, y, z1)])} key={i} />;
  });
  return <g>{sides}<path className={`m-${tone}-front`} d={d(pts.map(([x, y]) => iso(x, y, z1)))} /></g>;
}

export default function Plinth({ caption }: { caption: string }) {
  const strata = paths.strata.map(points) as P2[][];
  const beam = points(paths.beam) as P2[];
  const base: P2[] = [[-4, 58], [68, 58], [68, 76], [-4, 76]];
  const label = (text: string, at: P2, to: P2, anchor: "start" | "end" = "end") => (
    <g className="m-note" key={text}>
      <path d={`M${at[0]} ${at[1]}L${to[0]} ${to[1]}`} /><circle cx={at[0]} cy={at[1]} r="0.7" />
      <text x={to[0] + (anchor === "end" ? -1.5 : 1.5)} y={to[1] + 0.9} textAnchor={anchor}>{text}</text>
    </g>
  );
  const mid = (pts: P2[]): P2 => { const [x, y] = pts.reduce(([sx, sy], [px, py]) => [sx + px, sy + py], [0, 0]); return iso(x / pts.length - 2, y / pts.length, DEPTH); };
  return (
    <figure className="m-plinth">
      <svg viewBox="-52 2 132 92" role="img" aria-label={caption}>
        <Solid pts={base} z0={-7} z1={DEPTH + 7} tone="plinth" />
        {[...strata].reverse().map((pts, i) => <Solid pts={pts} tone="copper" key={i} />)}
        <Solid pts={beam} tone="stone" />
        {strata.map((pts, i) => label(`${String(3 - i).padStart(2, "0")} ${labels.layers[i]}`, mid(pts), [-22, 36 + i * 13]))}
        {label(labels.beam, iso(29, 14, DEPTH), [-22, 16])}
      </svg>
      <figcaption><b>Fig. 01</b>{caption}</figcaption>
    </figure>
  );
}
