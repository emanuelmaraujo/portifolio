import { ImageResponse } from "next/og";
import paths from "@/components/site/scene/mark-paths.json";

export const dynamic = "force-static";

const Mark = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path fill="#ede8df" d={paths.beam} />
    <path fill="#ff5b22" d={paths.strata.join("")} />
  </svg>
);

/** Social card, rendered at build time from the same vector paths as the mark. */
export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 80, background: "#08090b", color: "#ede8df" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 640 }}>
          <div style={{ fontSize: 30, letterSpacing: 4, color: "#98948b" }}>EMANUEL ARAÚJO</div>
          <div style={{ fontSize: 74, lineHeight: 1.02, letterSpacing: -3, marginTop: 28 }}>I design, secure and orchestrate intelligent systems.</div>
          <div style={{ fontSize: 26, color: "#ff5b22", marginTop: 36 }}>AI Engineering · Cybersecurity · IT Leadership</div>
        </div>
        <Mark size={360} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
