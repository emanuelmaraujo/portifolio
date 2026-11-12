import paths from "./scene/mark-paths.json";

/** The personal mark: three strata rising into one beam. `animated` plays the assembly once on load. */
export default function Mark({ animated = false, title }: { animated?: boolean; title?: string }) {
  return (
    <svg className={animated ? "mark mark--animated" : "mark"} viewBox="0 0 64 64" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path className="mark-beam" d={paths.beam} />
      {paths.strata.map((d, i) => <path className="mark-stratum" style={{ "--i": 2 - i } as React.CSSProperties} d={d} key={d} />)}
    </svg>
  );
}
