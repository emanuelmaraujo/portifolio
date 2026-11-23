import { RadarHome, radarDescription, radarMetadata, radarTitle } from "@/components/radar/views";

export const metadata = { ...radarMetadata(radarTitle, radarDescription, "/radar"), title: { absolute: radarTitle } };

export default function Page() {
  return <RadarHome />;
}
