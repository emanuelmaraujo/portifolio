import { RadarTrends, radarMetadata } from "@/components/radar/views";

export const metadata = radarMetadata("Repositórios em alta", "Descobertas do GitHub Trending, com contexto e aplicação prática.", "/radar/em-alta");

export default function Page() {
  return <RadarTrends />;
}
