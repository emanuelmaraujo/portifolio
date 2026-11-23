import { searchIndex } from "@/components/radar/search-index";
import { filterRecords } from "@/components/radar/search";

export function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 160) ?? "";
  const matches = q.length > 1 ? filterRecords(searchIndex, { q, area: "", tipo: "" }).slice(0, 4) : [];
  return Response.json(matches.map(({ slug, title, kind }) => ({ slug, title, kind })), { headers: { "Cache-Control": "private, max-age=60" } });
}
