import { accents, copy, links } from "@/components/site/content";

/**
 * Both prototype directions read the same copy, the same information architecture and the same assets from here,
 * so the comparison is about authorship and not about content. Nothing in this file is new copy except the labels
 * marked as such below.
 */
export const t = copy["pt-BR"];
export const root = "/prototipos";
export type Direction = "estratos" | "museu";
export { links };

export const directions: Record<Direction, { letter: string; name: string }> = {
  estratos: { letter: "A", name: "Estratos de Precisão" },
  museu: { letter: "B", name: "Museu do Sistema" },
};

/** New labels the prototypes need. Everything else comes from content.ts. */
export const labels = {
  nav: [["work", "Projetos"], ["trajectory", "Trajetória"], ["contact", "Contato"]] as [string, string][],
  role: "Papel", roleValue: "Projeto, construção e operação",
  kind: "Tipo", status: "Estado", stack: "Stack", source: "Endereço",
  study: "Abrir o estudo de caso", back: "Projetos", next: "Próximo projeto",
  verdicts: "O que o motor pode afirmar", sitesAlt: "Páginas do site do Prumo, uma por categoria de ofertas",
  layers: ["Inteligência", "Proteção", "Infraestrutura"], beam: "Feixe",
};

export const cases = [
  { id: "prumo", n: "01", name: "Prumo", accent: accents.prumo, href: links.prumo, study: true, ...pick(t.work.prumo) },
  { id: "torvya", n: "02", name: "Torvya", accent: accents.torvya, href: links.torvya, study: false, ...pick(t.work.torvya) },
  { id: "kreps", n: "03", name: "Marcos Krep’s", accent: accents.kreps, href: undefined, study: false, ...pick(t.work.kreps) },
];
export type Case = (typeof cases)[number];

function pick(work: { kind: string; status: string; title: string; text: string; stack: string[] }) {
  return { kind: work.kind, status: work.status, title: work.title, text: work.text, stack: work.stack };
}

/** The hero sentence, with the two verbs the brand sets in italic. */
export function Title() {
  return <>{t.hero.title.map(([text, strong]) => strong ? <em key={text}>{text}</em> : text)}</>;
}

/** The image that stands for each project. Real brand assets only: no mock-ups. */
export function CaseImage({ item, eager = false }: { item: Case; eager?: boolean }) {
  const loading = eager ? "eager" : "lazy";
  /* eslint-disable @next/next/no-img-element */
  if (item.id === "prumo") return <img src="/work/prumo/card-oferta-prumo.png" alt={t.work.prumo.cardAlt} width="1080" height="1350" loading={loading} />;
  if (item.id === "torvya") return <img className="is-logo" src="/work/torvya/torvya-logo.svg" alt="Torvya" width="176" height="48" loading={loading} />;
  return <img src="/work/kreps/menu.png" alt={t.work.kreps.shots[0][0] + " · Marcos Krep’s"} width="390" height="2081" loading={loading} />;
  /* eslint-enable @next/next/no-img-element */
}

/** A strip above each prototype: which direction this is, and the way to the other one. */
export function ProtoBar({ direction, page }: { direction: Direction; page: "" | "/prumo" }) {
  const other: Direction = direction === "estratos" ? "museu" : "estratos";
  return (
    <aside className="protobar" aria-label="Protótipo">
      <span><b>Protótipo {directions[direction].letter}</b> · {directions[direction].name}</span>
      <span>
        <a href={`${root}/${other}${page}`}>Ver {directions[other].letter} · {directions[other].name}</a>
        <a href={root}>Comparação</a>
      </span>
    </aside>
  );
}

/** Points of one closed path of the mark, as [x, y] pairs in its 64 × 64 box. */
export function points(d: string): [number, number][] {
  const n = (d.match(/-?\d+(\.\d+)?/g) || []).map(Number);
  return Array.from({ length: n.length / 2 }, (_, i) => [n[i * 2], n[i * 2 + 1]]);
}
