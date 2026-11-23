import { existsSync } from "node:fs";
import { join } from "node:path";
import Percurso from "@/components/prototypes/percurso/Percurso";

export default function Page() {
  // The portrait take is used on tall screens once its English frames have been rendered and published.
  const portrait = existsSync(join(process.cwd(), "public", "prototypes", "percurso", "en", "p", "330.webp"));
  return <Percurso portrait={portrait} lang="en" />;
}
