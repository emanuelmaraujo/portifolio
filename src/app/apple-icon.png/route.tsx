import { ImageResponse } from "next/og";
import paths from "@/components/site/scene/mark-paths.json";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#08090b" }}>
        <svg width={128} height={128} viewBox="0 0 64 64">
          <path fill="#ede8df" d={paths.beam} />
          <path fill="#ff5b22" d={paths.strata.join("")} />
        </svg>
      </div>
    ),
    { width: 180, height: 180 },
  );
}
