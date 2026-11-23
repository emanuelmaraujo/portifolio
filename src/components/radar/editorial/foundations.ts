import type { RecordDraft } from "../content";
import { creator, guide, sources } from "./helpers";

type Entry = Omit<RecordDraft, "area">;
type Link = [string, string];

function framework(slug: string, title: string, owner: string, repo: string, license: string, theme: string, docs: string, context: string, practice: string, check: string): Entry {
  const [handle, name] = repo.split("/");
  return {
    slug, title, kind: "projetos", summary: context, license,
    creator: creator(owner, handle, name), tags: ["Padrões e frameworks", theme],
    sources: sources(["Documentação oficial", docs], ["Código e licença", `https://github.com/${repo}`]),
    sections: guide(context, practice, check),
  };
}

function reference(slug: string, title: string, publisher: string, theme: string, context: string, practice: string, check: string, ...links: Link[]): Entry {
  return {
    slug, title, kind: "estudos", summary: context, creator: { name: publisher },
    tags: ["Relatórios e estudos", theme], sources: sources(...links), sections: guide(context, practice, check),
  };
}

const aiEntries = [
  framework("llamaindex-framework-rag", "LlamaIndex · conexão entre dados e aplicações de IA", "LlamaIndex", "run-llama/llama_index", "MIT", "RAG",
    "https://developers.llamaindex.ai/python/framework/",
    "Framework em Python para carregar acervos, indexar documentos e recuperar trechos para responder com contexto.",
    "Use um acervo público pequeno com perguntas que dependam de duas fontes. Registre quais trechos entraram no contexto e abra as fontes ao lado de cada resposta.",
    "Meça separadamente a qualidade da busca e da geração. Compare com uma linha de base simples antes de adicionar índices ou etapas."),
  framework("haystack-framework-rag", "Haystack · pipelines modulares para busca e RAG", "deepset", "deepset-ai/haystack", "Apache-2.0", "RAG",
    "https://docs.haystack.deepset.ai/",
    "O Haystack divide busca, armazenamento e geração em componentes conectados, úteis quando a equipe quer comparar alternativas sem reescrever o fluxo.",
    "Monte primeiro um percurso previsível de indexação e consulta. Troque somente a recuperação ou somente o modelo de resposta e compare o efeito num conjunto de perguntas revisado.",
    "Observe também tempo de resposta, uso de memória e facilidade de atribuir erros a um componente."),
  framework("vllm-inferencia-servidor", "vLLM · servidor de inferência para LLMs", "vLLM", "vllm-project/vllm", "Apache-2.0", "Inferência",
    "https://docs.vllm.ai/en/latest/",
    "Motor de inferência voltado a servir modelos sob concorrência, com suporte a formatos e arquiteturas documentados pelo projeto.",
    "Fixe modelo, hardware e quantização. Meça tempo até o primeiro token, tokens por segundo e erro sob a concorrência esperada.",
    "Confira compatibilidade de modelo e acelerador antes de comparar resultados. O regime de fila tem efeito direto na latência."),
  framework("sglang-framework-geracao", "SGLang · serving e geração estruturada", "SGLang", "sgl-project/sglang", "Apache-2.0", "Inferência",
    "https://docs.sglang.io/",
    "Um servidor para modelos de linguagem e visão, com recursos de cache e saída estruturada para integrações que usam contratos definidos.",
    "Compare duas configurações com o mesmo modelo e entradas. Conte violações de esquema, tempo de resposta e memória com e sem reaproveitamento de prefixo.",
    "Teste também mensagens longas e respostas interrompidas. Compatibilidade de formatos e desempenho dependem do modelo e do hardware."),
  framework("docling-documentos-rag", "Docling · preparação de documentos para RAG", "Docling Project", "docling-project/docling", "MIT", "RAG",
    "https://docling-project.github.io/docling/",
    "Converte documentos em representações estruturadas que preservam elementos como tabelas e títulos para consulta posterior.",
    "Escolha PDFs públicos com tabelas, cabeçalhos em duas colunas e páginas escaneadas. Compare a ordem dos parágrafos e as relações entre células com os originais.",
    "Confirme a qualidade para os idiomas e tipos de arquivo do seu acervo. Registre a referência à página para facilitar a revisão de citações."),
  framework("hf-transformers-framework", "Transformers · modelos e pipelines do Hugging Face", "Hugging Face", "huggingface/transformers", "Apache-2.0", "Modelos",
    "https://huggingface.co/docs/transformers/index",
    "Biblioteca de modelos pré-treinados e fluxos de inferência para texto, visão e áudio, com integração ao ecossistema Hugging Face.",
    "Compare duas fichas de modelo para a mesma tarefa. Rode exemplos curtos no idioma do produto e anote versão, licença e resultados.",
    "A licença da biblioteca e a dos pesos são contratos diferentes. Verifique o cartão do modelo e os requisitos de memória."),
  reference("google-agents-whitepaper-radar", "Google Cloud · guia para agentes em produção", "Google Cloud", "Agentes",
    "Whitepapers sobre o percurso de desenvolvimento de agentes, da integração de ferramentas à operação e avaliação.",
    "Use o capítulo de avaliação para transformar uma tarefa frequente em casos de teste. Inclua ferramenta indisponível, evidência insuficiente e ação que exige confirmação.",
    "Separe decisões reaproveitáveis de recomendações específicas aos produtos Google. Compare com os controles já disponíveis no seu ambiente.",
    ["Whitepapers e guia oficial", "https://cloud.google.com/blog/products/ai-machine-learning/a-devs-guide-to-production-ready-ai-agents"]),
  reference("anthropic-agentes-padroes-radar", "Anthropic · padrões para agentes eficazes", "Anthropic", "Agentes",
    "O artigo organiza padrões como encadeamento, roteamento e orquestração, com critérios para escolher o nível de autonomia que o problema exige.",
    "Modele a versão simples do fluxo e meça em quais casos ela falha. Adicione uma forma de delegação somente se os erros justificarem o custo e a complexidade.",
    "Compare qualidade, latência, chamadas e possibilidade de retomar tarefas. Observe efeitos de entradas ambíguas antes de usar dados reais.",
    ["Building effective agents", "https://www.anthropic.com/engineering/building-effective-agents"]),
  reference("openai-guia-agentes-radar", "OpenAI · guia prático para construir agentes", "OpenAI", "Agentes",
    "Material sobre escolha de ferramentas, instruções, orquestração e controles para tarefas compostas.",
    "Desenhe a tarefa em etapas e anote o que pode ser automatizado, o que exige revisão e quem pode cancelar. Valide as transições com uma ferramenta simulada.",
    "Avalie o fluxo com casos de erro e com entradas inesperadas. Teste custo e qualidade com tarefas representativas antes de ampliar o escopo.",
    ["Guia oficial", "https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/"]),
  reference("google-agentes-seguros-radar", "Google · abordagem para agentes de IA seguros", "Google", "Governança de IA",
    "Documento de engenharia sobre decisões de confiança, uso de ferramentas e limites de agentes que operam sobre dados e serviços.",
    "Liste ações e dados por ferramenta. Valide um caminho de entrada não confiável em ambiente de teste e confira as confirmações exigidas para ações sensíveis.",
    "Defina responsáveis por auditoria, tratamento de incidentes e revisão periódica de permissões.",
    ["Introdução técnica oficial", "https://services.google.com/fh/files/misc/googles_approach_for_secure_ai_agents.pdf"]),
];

const cyberStandards: [string, string, string, string, string, string, string, string][] = [
  ["iso-iec-27001-sgsi-radar", "ISO/IEC 27001 · gestão de segurança da informação", "ISO e IEC", "Governança de segurança", "https://www.iso.org/standard/27001",
    "Norma de requisitos para estabelecer, manter e melhorar um sistema de gestão de segurança da informação.",
    "Delimite o escopo, registre riscos, atribua responsáveis e associe evidências aos controles aplicáveis.",
    "Para auditoria ou implementação formal, consulte a edição aplicável e a documentação oficial de certificação."],
  ["nist-800-53-controles-radar", "NIST SP 800-53 · catálogo de controles", "NIST", "Governança de segurança", "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
    "Catálogo de controles de segurança e privacidade que ajuda a traduzir requisitos de alto nível em controles documentados.",
    "Comece por uma família, como controle de acesso ou auditoria. Associe cada requisito a responsável, evidência e frequência de verificação.",
    "Escolha os controles segundo risco, contexto e obrigações do seu sistema."],
  ["nist-rmf-800-37-radar", "NIST RMF · risco no ciclo de vida de sistemas", "NIST", "Governança de segurança", "https://csrc.nist.gov/pubs/sp/800/37/r2/final",
    "Organiza decisões de categorização, seleção, implementação, avaliação, autorização e monitoramento de controles.",
    "Escolha um serviço e documente quem decide a aceitação de risco, como as evidências chegam até essa pessoa e o que dispara uma revisão.",
    "Use referências de controles como complemento. O processo também precisa contemplar mudanças após a autorização."],
  ["nist-nice-competencias-radar", "NICE Framework · competências em cibersegurança", "NIST", "Capacitação", "https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center",
    "Estrutura competências e atividades em cibersegurança, útil para organizar trilhas de estudo, responsabilidades e contratação.",
    "Parta da atividade que sua equipe precisa executar. Vincule conhecimentos, habilidades e uma evidência prática de que a competência foi desenvolvida.",
    "As atividades podem atravessar vários cargos. Ajuste a trilha ao trabalho cotidiano e ao nível de responsabilidade."],
  ["csa-cloud-controls-matrix-radar", "CSA Cloud Controls Matrix · controles em nuvem", "Cloud Security Alliance", "Segurança em nuvem", "https://cloudsecurityalliance.org/research/cloud-controls-matrix",
    "Organiza controles para avaliar serviços em nuvem e explicitar as responsabilidades do provedor e do cliente.",
    "Escolha uma conta ou serviço SaaS. Registre responsável, documentação, evidência e lacunas para os controles mais relevantes.",
    "Confira quais controles o contrato e a arquitetura realmente cobrem. Revalide após mudanças de serviço ou de integração."],
  ["first-cvss-v4-radar", "FIRST CVSS v4.0 · gravidade técnica", "FIRST", "Gestão de riscos", "https://www.first.org/cvss/v4.0/",
    "Especificação para registrar a gravidade técnica de vulnerabilidades de forma consistente e comparável.",
    "Leia o vetor completo e documente o impacto no seu ambiente. Cruze a gravidade com exposição, inventário e exploração conhecida para definir prioridade.",
    "A pontuação técnica é um dos insumos. Identifique também os serviços críticos e os controles compensatórios existentes."],
  ["cisa-kev-triagem-radar", "CISA KEV · exploração conhecida e triagem", "CISA", "Gestão de riscos", "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
    "Catálogo defensivo de vulnerabilidades com evidência de exploração real, útil para validar prioridades de correção.",
    "Cruze os registros com seu inventário e as versões em uso. Defina responsável, prazo e evidência do tratamento para itens aplicáveis.",
    "Mantenha uma trilha para outros riscos relevantes que ainda não aparecem no catálogo."],
  ["owasp-samm-maturidade-radar", "OWASP SAMM · maturidade de segurança de software", "OWASP", "AppSec", "https://owaspsamm.org/model/",
    "Modelo de maturidade para planejar melhorias em governança, design, implementação, verificação e operação do software.",
    "Avalie uma prática por vez com o time responsável. Escolha uma melhoria que possa ser observada no próximo ciclo e registre a evidência.",
    "Compare a evolução dentro do mesmo contexto, com critérios estáveis e evidência atualizada."],
];

const cyberReports = [
  reference("verizon-dbir-2026-radar", "Verizon · Data Breach Investigations Report 2026", "Verizon Business", "Blue Team",
    "Relatório internacional que distingue incidentes e violações confirmadas e detalha recortes por tipo de organização e setor.",
    "Escolha um recorte compatível com o seu contexto e compare com outra fonte. Transforme uma observação em pergunta sobre cobertura, resposta ou recuperação.",
    "Use o período de observação e os critérios de inclusão para interpretar diferenças entre relatórios.",
    ["DBIR 2026 e resumo executivo", "https://www.verizon.com/business/resources/reports/dbir/"]),
  reference("google-cloud-threat-horizons-radar", "Google Cloud · Threat Horizons H1 2026", "Google Cloud / Office of the CISO", "Blue Team",
    "Relatório de riscos em nuvem com recomendações sobre telemetria, preparo para investigação e resposta.",
    "Escolha um serviço crítico e verifique se a equipe consegue reunir registros de identidade, eventos administrativos e trilha de mudança para o mesmo período.",
    "Adapte as recomendações às fontes disponíveis e à política de retenção da organização. Separe mecanismos de um fornecedor de práticas aplicáveis a qualquer nuvem.",
    ["Relatório oficial", "https://cloud.google.com/security/report/resources/cloud-threat-horizons-report-h1-2026"]),
  reference("microsoft-zero-trust-adocao-radar", "Microsoft · adoção de Zero Trust", "Microsoft", "Blue Team",
    "Material estruturado para discutir adoção de Zero Trust em identidade, endpoints, aplicativos, infraestrutura e dados.",
    "Crie um cenário piloto com um grupo de usuários, um serviço e critérios claros de acesso. Verifique presença de sinais, tratamento de exceções e reversão.",
    "Separe o princípio de segurança dos recursos de produto e valide os planos disponíveis no ambiente real.",
    ["Diretrizes oficiais", "https://learn.microsoft.com/en-us/security/zero-trust/"]),
];

export const foundations: RecordDraft[] = [
  ...aiEntries.map(item => ({ ...item, area: "ia" as const })),
  ...cyberStandards.map(([slug, title, name, theme, url, context, practice, check]) => ({
    slug, title, area: "ciberseguranca" as const, kind: "referencias" as const, summary: context, creator: { name },
    tags: ["Frameworks de segurança", theme], sources: sources(["Referência oficial", url]), sections: guide(context, practice, check),
  })),
  ...cyberReports.map(item => ({ ...item, area: "ciberseguranca" as const })),
];
