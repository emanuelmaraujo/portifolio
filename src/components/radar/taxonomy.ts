export const areas = {
  ia: { name: "Inteligência Artificial", short: "IA", description: "Agentes, modelos e sistemas que usam informação para responder melhor.", icon: "orbit" },
  ciberseguranca: { name: "Cibersegurança", short: "Cibersegurança", description: "Detecção, resposta a incidentes e segurança de software na prática.", icon: "shield" },
  "design-desenvolvimento": { name: "Design & Desenvolvimento", short: "Design & Dev", description: "Interfaces, motion, acessibilidade e engenharia para a web.", icon: "layers" },
} as const;

export const kinds = {
  projetos: { name: "Projetos open source", singular: "Projeto" },
  repositorios: { name: "Repositórios", singular: "Repositório" },
  skills: { name: "Skills", singular: "Skill" },
  guias: { name: "Guias e roteiros", singular: "Guia" },
  modelos: { name: "Modelos", singular: "Modelo" },
  ferramentas: { name: "Ferramentas e serviços", singular: "Ferramenta" },
  sistemas: { name: "Sistemas Linux", singular: "Sistema operacional" },
  referencias: { name: "Referências", singular: "Referência" },
  estudos: { name: "Estudos", singular: "Estudo" },
  laboratorios: { name: "Laboratórios", singular: "Laboratório" },
  novidades: { name: "Novidades", singular: "Novidade" },
} as const;

export type Area = keyof typeof areas;
export type Kind = keyof typeof kinds;
export const areaIds = Object.keys(areas) as Area[];
export const kindIds = Object.keys(kinds) as Kind[];
export const entryPath = (slug: string) => `/radar/p/${slug}`;
export const trendingUrl = "https://github.com/trending?since=weekly";
export const snapshotDate = "2026-11-23";

export function shortDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(iso));
}

export function fullDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(iso));
}
