export default function ChapterBridge({ index, title }: { index: number; title: string }) {
  return <div className="chapter-bridge wrap" aria-hidden="true">
    <span className="mono chapter-number">0{index}</span>
    <svg viewBox="0 0 600 36" preserveAspectRatio="none" aria-hidden="true">
      <path className="chapter-trace" d="M0 28H165L200 9H403L439 28H600" vectorEffect="non-scaling-stroke" />
      <path className="chapter-signal" d="M0 28H165L200 9H403L439 28H600" pathLength={100} vectorEffect="non-scaling-stroke" />
    </svg>
    <span className="mono chapter-label">{title}</span>
  </div>;
}
