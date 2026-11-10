type Point = [number, number, number];
type Path = Point[];
const ink = ["#367170", "#52aaa1", "#8af6d0"];
const glyph = [
  [[-154, 108], [-154, -106], [-32, -106]],
  [[-154, 0], [-54, 0]],
  [[-154, 108], [-49, 108]],
  [[-10, 108], [80, -106], [171, 108]],
  [[25, 25], [137, 25]],
];
const frame = [[-230, -110], [-148, -181], [166, -181], [237, -109], [237, 104], [155, 179], [-151, 179], [-230, 104], [-230, -110]];

function project([x, y, z]: Point, yaw: number, pitch: number) {
  const width = x * Math.cos(yaw) + z * Math.sin(yaw);
  const depth = z * Math.cos(yaw) - x * Math.sin(yaw);
  const height = y * Math.cos(pitch) - depth * Math.sin(pitch);
  const scale = 710 / (710 - y * Math.sin(pitch) - depth * Math.cos(pitch));
  return [310 + width * scale, 270 + height * scale];
}

export function signalLines(yaw = -0.49, pitch = 0.26) {
  const layers = [-88, -16, 56];
  const paths: { points: Path; color: string; weight: number; opacity: number; nodes?: boolean }[] = [];
  const add = (coords: number[][], z: number, color: string, weight: number, opacity: number, nodes = false) =>
    paths.push({ points: coords.map(([x, y]) => [x, y, z]), color, weight, opacity, nodes });
  for (const [x, y] of [...frame.slice(0, -1), ...glyph.flat()]) {
    paths.push({ points: [[x, y, layers[0]], [x, y, layers[2]]], color: "#66c6b8", weight: 0.85, opacity: 0.42 });
  }
  layers.forEach((z, i) => {
    add(frame, z, ink[i], 1, 0.65, true);
    for (const points of glyph) add(points, z, ink[i], i === 2 ? 4 : 2, i === 2 ? 1 : 0.74, true);
    add([[-225, 69], [-203, 69], [-190, 56], [-190, -57]], z, ink[i], 1, 0.65);
    add([[195, -68], [216, -68], [216, 56], [195, 77]], z, ink[i], 1, 0.65);
  });
  return paths.map(line => ({ ...line, points: line.points.map(point => project(point, yaw, pitch)) }));
}

export function drawSignal(context: CanvasRenderingContext2D, yaw: number, pitch: number) {
  for (const { points, color, weight, opacity, nodes } of signalLines(yaw, pitch)) {
    context.globalAlpha = opacity;
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = weight;
    context.lineJoin = "round";
    context.beginPath();
    points.forEach(([x, y], i) => i ? context.lineTo(x, y) : context.moveTo(x, y));
    context.stroke();
    if (nodes) for (const [x, y] of points) {
      context.beginPath();
      context.arc(x, y, weight === 4 ? 4.2 : 2.1, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;
}
