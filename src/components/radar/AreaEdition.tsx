import Link from "next/link";
import { ArrowDown, ArrowUpRight, Box, Braces, Fingerprint, FolderGit2, Layers3, Network, Radio, Sparkles, type LucideIcon } from "lucide-react";
import { areas, type Area } from "./taxonomy";

type Edition = {
  headings: [string, string, string];
  icons: [LucideIcon, LucideIcon, LucideIcon];
  destinations: [string, string, string];
  frameworkPath: string;
  frameworks: string[];
  reports: string[];
};

export const editions: Record<Area, Edition> = {
  ia: {
    headings: ["Modelos", "Contexto", "Agentes"], icons: [Sparkles, Layers3, Network],
    destinations: ["modelos-inferencia", "rag-avaliacao", "agentes"],
    frameworkPath: "padroes",
    frameworks: ["langgraph", "google-adk-python", "llamaindex-framework-rag", "vllm-inferencia-servidor", "nist-ai-rmf-governanca", "openai-metodologia-evals"],
    reports: ["google-agents-whitepaper-radar", "anthropic-avalie-agentes", "openai-guia-agentes-radar", "stanford-ai-index-2026", "gemma-4-modelos-locais"],
  },
  ciberseguranca: {
    headings: ["AppSec", "Blue Team", "Red Team"], icons: [Fingerprint, Radio, Network],
    destinations: ["appsec", "blue-team", "red-team"],
    frameworkPath: "frameworks",
    frameworks: ["nist-csf-governanca", "cis-controls-priorizacao", "owasp-asvs-verificacao", "mitre-attack-cobertura", "nist-800-61-resposta", "iso-iec-27001-sgsi-radar"],
    reports: ["mandiant-m-trends-2026", "anthropic-transparencia-seguranca", "kaspersky-security-bulletin", "crowdstrike-threat-report-2026", "unit42-incident-response-2026", "microsoft-digital-defense-2026"],
  },
  "design-desenvolvimento": {
    headings: ["Interfaces", "Motion", "Infraestrutura"], icons: [Box, Layers3, Braces],
    destinations: ["interfaces", "motion", "plataforma"],
    frameworkPath: "padroes",
    frameworks: ["nextjs", "wcag-22-padrao", "dtcg-design-tokens", "baseline-compatibilidade-web", "core-web-vitals-medicao", "opentelemetry-especificacao"],
    reports: ["cncf-pesquisa-anual-cloud-native-2025", "web-almanac-2025-acessibilidade", "web-almanac-2025-desempenho", "google-sre-slos"],
  },
};

export function AreaHero({ area, title, intro, count, overview, skillSpotlight }: { area: Area; title: string; intro: string; count: number; overview?: boolean; skillSpotlight?: boolean }) {
  const edition = editions[area];
  return <header className="r-page-hero r-edition-hero" data-overview={overview || undefined}>
    <div className="r-edition-copy">
      {!overview && <Link className="r-edition-label" href={`/radar/${area}`}>{areas[area].name}</Link>}
      <h1>{title}</h1><p>{intro}</p>
      <div className="r-author-line">
        <a className="r-action r-action-primary" href="#catalogo"><FolderGit2 size={16} aria-hidden /> Catálogo <span>{count}</span><ArrowDown size={14} aria-hidden /></a>
        {overview && <Link className="r-action r-action-muted" href={`/radar/${area}/novidades`}>Novidades <ArrowUpRight size={15} aria-hidden /></Link>}
        {skillSpotlight && <a className="r-action r-action-muted" href="#skills-area">Skills em destaque <ArrowDown size={15} aria-hidden /></a>}
      </div>
    </div>
    <nav className="r-edition-visual" aria-label={`Atalhos de ${areas[area].name}`}>
      <div className="r-edition-field" aria-hidden="true"><i /><i /><i /></div>
      {edition.headings.map((label, index) => {
        const Icon = edition.icons[index];
        return <Link className="r-edition-node" key={label} href={`/radar/${area}/${edition.destinations[index]}`} style={{ "--node": index } as React.CSSProperties}><Icon size={20} aria-hidden /><span>{label}</span></Link>;
      })}
    </nav>
  </header>;
}
