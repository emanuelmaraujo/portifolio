import type { Area } from "./taxonomy";

export const subareas = {
  ia: [
    { id: "agentes", title: "Agentes, Skills e MCP", description: "Orquestração, extensões e integração com ferramentas.", terms: /agentes?|agents?|skills?|mcp/i },
    { id: "modelos-inferencia", title: "Modelos e inferência", description: "Modelos, execução local e infraestrutura de inferência.", terms: /modelo|modelos|llm|inferência|inferência local|embeddings/i },
    { id: "rag-avaliacao", title: "RAG e avaliação", description: "Busca em documentos, qualidade de respostas e avaliação de sistemas.", terms: /rag\b|avaliação|evals?|retrieval|busca semântica/i },
    { id: "padroes", title: "Padrões e frameworks", description: "Compare referências para avaliar modelos, governar riscos e integrar sistemas.", terms: /^padrões e frameworks$/i },
    { id: "relatorios", title: "Relatórios e estudos", description: "Pesquisas e publicações técnicas para embasar escolhas.", terms: /^relatórios e estudos$/i },
  ],
  ciberseguranca: [
    { id: "blue-team", title: "Blue Team", description: "Detecção, monitoramento, resposta a incidentes e perícia digital.", terms: /blue team|soc\b|detecção|telemetria|siem|dfir|forense|incidentes/i },
    { id: "red-team", title: "Red Team", description: "Escopo, estudos de segurança, Kali Linux e verificação de fontes abertas.", terms: /^red team$/i },
    { id: "frameworks", title: "Frameworks de segurança", description: "Referências oficiais para decidir, priorizar controles e organizar a defesa.", terms: /^frameworks de segurança$/i },
    { id: "appsec", title: "Segurança de aplicações", description: "Desenvolvimento seguro, dependências e cadeia de suprimentos.", terms: /appsec|owasp|dependências|supply chain|sbom|devsecops/i },
    { id: "relatorios", title: "Relatórios e estudos", description: "Publicações de equipes como Mandiant, CrowdStrike, Securelist, Unit 42 e CERT.br.", terms: /^relatórios e estudos$/i },
  ],
  "design-desenvolvimento": [
    { id: "interfaces", title: "Interfaces e acessibilidade", description: "Design systems, componentes e acesso inclusivo.", terms: /acessibilidade|accessibility|design system|interface|ui\b|ux\b|component/i },
    { id: "motion", title: "Motion e visualização", description: "Animação para interfaces e visualização de dados.", terms: /motion|animaç|remotion|lottie|visualização/i },
    { id: "plataforma", title: "Engenharia e infraestrutura", description: "Ambientes de desenvolvimento, Linux, entregas e operações.", terms: /infraestrut|linux|containers?|devops|engenharia|backend|implantação|deploy/i },
    { id: "padroes", title: "Padrões e frameworks", description: "Decida por onde começar em acessibilidade, compatibilidade, desempenho e observabilidade.", terms: /^padrões e frameworks$/i },
    { id: "relatorios", title: "Relatórios e estudos", description: "Dados sobre a web, acessibilidade, desempenho e engenharia de plataformas.", terms: /^relatórios e estudos$/i },
  ],
} satisfies Record<Area, { id: string; title: string; description: string; terms: RegExp }[]>;

export function recordSubareas(area: Area, tags: string[], title: string) {
  return subareas[area].filter(group => [...tags, title].some(value => group.terms.test(value))).map(group => group.id);
}

export type Subarea = (typeof subareas)[Area][number];
