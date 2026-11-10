import SignalMotion from "./SignalMotion";
import { signalLines } from "./signalGeometry";

export default function Signal({ title, description, meta }: { title: string; description: string; meta: string }) {
  return <figure className="signal" aria-label={description}>
    <div className="signal-grid" aria-hidden="true" />
    <span className="signal-code mono" aria-hidden="true">FIG. 01 <b>+</b></span>
    <div className="signal-stage">
      <SignalMotion />
      <svg className="signal-poster" viewBox="0 0 620 540" aria-hidden="true">
        {signalLines().map(({ points, color, weight, opacity, nodes }, i) =>
          <g key={i} opacity={opacity}>
            <polyline points={points.map(point => point.join(",")).join(" ")} fill="none" stroke={color} strokeWidth={weight} strokeLinejoin="round" />
            {nodes && points.map(([x, y], j) => <circle key={j} cx={x} cy={y} r={weight === 4 ? 4.2 : 2.1} fill={color} />)}
          </g>
        )}
      </svg>
    </div>
    <figcaption><span>{title}</span><small className="mono">{meta}</small></figcaption>
  </figure>;
}
