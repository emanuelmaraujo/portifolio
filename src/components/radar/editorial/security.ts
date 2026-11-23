import type { RecordDraft } from "../content";
import { creator, guide, sources } from "./helpers";

export const security = [
  {
    slug: "wazuh", area: "ciberseguranca", kind: "projetos", title: "Wazuh",
    summary: "Plataforma de monitoramento defensivo para coletar telemetria, correlacionar eventos e investigar alertas.",
    creator: creator("Wazuh", "wazuh", "wazuh"), tags: ["SIEM", "Telemetria", "Detecção"], featured: true,
    sources: sources(["Repositório oficial", "https://github.com/wazuh/wazuh"], ["Documentação oficial", "https://documentation.wazuh.com/current/"], ["Arquitetura do Wazuh", "https://documentation.wazuh.com/current/getting-started/architecture.html"]),
    sections: [
      { title: "Da coleta à investigação", body: "Os agentes dos endpoints coletam dados. A arquitetura central reúne servidor, indexador e painel para analisar, armazenar e consultar eventos. Essa separação ajuda a localizar falhas. Se um evento de teste não aparece, confira primeiro a coleta e depois o processamento e a indexação." },
      { title: "Quando adotar", body: "O Wazuh faz sentido quando a operação precisa reunir telemetria de segurança de endpoints e tem um fluxo claro para investigar alertas. Comece pelas fontes de dados que a equipe consegue interpretar. Se o objetivo é só acompanhar disponibilidade de um serviço, um monitor de disponibilidade atende uma necessidade mais estreita com menos dados para operar." },
      { title: "Piloto defensivo", body: "Registre dois endpoints autorizados e gere um evento benigno já previsto no piloto. Confira se hora, identificação do agente e categoria batem com o evento original. Faça a equipe classificar o alerta e registrar a justificativa. Compare o tempo entre coleta e visualização, o volume diário e os falsos positivos." },
      { title: "Custo de operação", body: "Documente retenção, responsáveis pela triagem, permissões de consulta e procedimento para atualizar agentes e componentes centrais. Acompanhe quais alertas resultaram em uma ação ou decisão. Use esses dados para ajustar cobertura e volume antes de ampliar a implantação." },
    ],
  },
  {
    slug: "sigma", area: "ciberseguranca", kind: "repositorios", title: "SigmaHQ Rules",
    summary: "Repositório de regras portáveis para detecção, com metadados sobre eventos e fontes de logs.",
    creator: creator("SigmaHQ", "SigmaHQ", "sigma"), tags: ["Detecção", "SIEM", "YAML"], level: "Intermediário",
    sources: sources(["Coleção oficial", "https://github.com/SigmaHQ/sigma"], ["Documentação do padrão", "https://sigmahq.io/docs/"], ["Especificação das regras", "https://sigmahq.io/sigma-specification/specification/sigma-rules-specification.html"]),
    sections: [
      { title: "O que é portável", body: "A regra descreve quais eventos procurar e de qual fonte de log dependem. A tradução da regra para a consulta do SIEM e o mapeamento de campos ainda são específicos do ambiente. Escolha regras com fontes efetivamente coletadas e documente a correspondência de cada campo de que elas dependem." },
      { title: "Onde começa o piloto", body: "Pegue uma regra defensiva adequada ao inventário e teste com logs sintéticos ou eventos benignos de um sistema autorizado. Confira se os campos chegam completos e se a consulta equivalente encontra o evento esperado. Registre também um evento fora do critério para verificar se a seleção não está ampla demais." },
      { title: "Evidência para colocar em operação", body: "Guarde a versão da regra, o mapeamento, o resultado do teste e a justificativa das exceções. Meça alarmes repetidos e investigue se o volume é compatível com a equipe. Se a fonte de log ou o esquema mudar, refaça a verificação antes de assumir que a cobertura continua igual." },
    ],
  },
  {
    slug: "dfir-iris", area: "ciberseguranca", kind: "projetos", title: "DFIR-IRIS",
    summary: "Gestão colaborativa de casos de resposta a incidentes, com evidências, tarefas e linha do tempo.",
    creator: creator("DFIR-IRIS", "dfir-iris", "iris-web"), tags: ["Incidentes", "Triagem", "Evidências"],
    sources: sources(["Repositório oficial", "https://github.com/dfir-iris/iris-web"], ["Documentação", "https://docs.dfir-iris.org/"]),
    sections: [
      { title: "O que ganha ao usar um gestor de casos", body: "O IRIS reúne atribuição de tarefas, evidências e sequência de eventos numa interface compartilhada. Comece por uma política de registro: quem abre um caso, quais sinais precisam de revisão e o que deve ficar registrado ao concluir. A ferramenta acompanha esse processo e ajuda na passagem de trabalho entre pessoas." },
      { title: "Piloto de triagem até encerramento", body: "Crie um caso fictício com um alerta e uma amostra de log sanitizada. Separe fatos observados de hipóteses, atribua uma tarefa de confirmação e registre por que a equipe decidiu encerrar ou escalar. Peça a uma pessoa que não participou da investigação para refazer a sequência usando a linha do tempo." },
      { title: "Critério de adoção e governança", body: "Compare o esforço de manter o caso atualizado com a prática anterior e confira se a passagem entre equipes ficou mais clara. Valide perfis de acesso com contas de teste. Defina retenção, exportação e restauração de casos e anexos, especialmente quando podem incluir dados pessoais ou detalhes internos." },
    ],
  },
  {
    slug: "trivy", area: "ciberseguranca", kind: "projetos", title: "Trivy",
    summary: "Scanner de imagens e projetos usado para apontar vulnerabilidades conhecidas e problemas de configuração.",
    creator: creator("Aqua Security", "aquasecurity", "trivy"), license: "Apache-2.0", tags: ["DevSecOps", "Dependências", "SBOM"],
    sources: sources(["Repositório oficial", "https://github.com/aquasecurity/trivy"], ["Manual do Trivy", "https://trivy.dev/latest/docs/"], ["Análise de imagens de contêiner", "https://trivy.dev/docs/latest/target/container_image/"]),
    sections: [
      { title: "O que a análise cobre", body: "Uma análise de imagem inspeciona componentes presentes no artefato construído e os compara com dados de avisos. A cobertura depende do ecossistema, da forma de empacotamento e do tipo de análise selecionado. Um inventário de componentes do artefato responde a uma pergunta diferente de uma lista de dependências declaradas nos arquivos do projeto." },
      { title: "Como usar na revisão de um release", body: "Analise uma imagem interna de teste e registre seu digest, a plataforma e a data da consulta. Compare a SBOM com o inventário esperado e classifique diferenças. Priorize resultados por exposição, impacto no serviço, versão corrigida disponível e responsável pelo componente." },
      { title: "O que fazer com exceções", body: "Uma exceção precisa de justificativa e data de revisão. Quando for possível atualizar, construa a imagem revisada e confira o inventário e o aviso específico. Mantenha evidência do artefato original e do corrigido para que outra pessoa consiga reconstruir a decisão." },
    ],
  },
  {
    slug: "security-best-practices", area: "ciberseguranca", kind: "skills", title: "Security Best Practices",
    summary: "Skill do catálogo OpenAI para revisar código e orientar padrões seguros nas linguagens cobertas.",
    creator: creator("OpenAI", "openai", "skills/tree/main/skills/.curated/security-best-practices"), tags: ["Skills", "Revisão de código", "DevSecOps"], level: "Intermediário",
    sources: sources(["Skill no catálogo oficial", "https://github.com/openai/skills/tree/main/skills/.curated/security-best-practices"], ["Catálogo oficial", "https://github.com/openai/skills"]),
    sections: guide("Uma revisão defensiva pode levantar problemas de validação, autorização ou exposição de dados já visíveis no código de um projeto sob seu controle.", "Para um PR autorizado, peça evidência no diff, impacto e uma correção verificável. Confirme os achados usando o código e as configurações reais da aplicação.", "Garanta que a edição da skill suporta a linguagem e o framework do projeto. Uma revisão automatizada precisa levar em conta o contexto de implantação."),
  },
  {
    slug: "skill-triagem-defensiva", area: "ciberseguranca", kind: "guias", title: "Roteiro de triagem defensiva",
    summary: "Um procedimento reutilizável para transformar um aviso público em uma ação de correção rastreável.",
    creator: { name: "Curadoria de Emanuel Araújo" }, tags: ["Skills", "Triagem", "Vulnerabilidades"],
    sources: sources(["Catálogo KEV da CISA", "https://www.cisa.gov/known-exploited-vulnerabilities-catalog"], ["CERT.br", "https://cert.br/"], ["Especificação Agent Skills", "https://agentskills.io/specification"]),
    sections: guide("Comece com o identificador do aviso, o texto do fornecedor e o inventário de versões do ambiente autorizado. O catálogo KEV complementa a priorização com ocorrências conhecidas de exploração.", "Para cada ativo afetado, registre versão, exposição, responsável, correção recomendada e data de validação. Marque versões incertas como pendência de inventário.", "Mantenha o princípio da menor permissão no acesso ao inventário e remova dados internos antes de compartilhar a ficha editorial."),
  },
  {
    slug: "trilha-defesa", area: "ciberseguranca", kind: "estudos", title: "Trilha de detecção e resposta",
    summary: "Aprenda a coletar sinais, validar contexto, decidir prioridade e documentar a mitigação.",
    creator: { name: "Curadoria de Emanuel Araújo" }, tags: ["Triagem", "Telemetria", "Aprendizagem"],
    sources: sources(["NIST SP 800-61 Rev. 3", "https://csrc.nist.gov/pubs/sp/800/61/r3/final"], ["CERT.br", "https://cert.br/"], ["Documentação Wazuh", "https://documentation.wazuh.com/current/"]),
    sections: guide("Comece por distinguir evento, alerta e incidente. Estabeleça de quais ativos e fontes de log você precisa para fazer uma primeira classificação.", "Simule um alerta com dados benignos. Abra o caso, contextualize o ativo, registre as evidências e descreva qual confirmação mudaria a prioridade.", "Na revisão, confira se a conclusão é reproduzível a partir da linha do tempo e se a verificação da mitigação possui um responsável."),
  },
  {
    slug: "laboratorio-triagem", area: "ciberseguranca", kind: "laboratorios", title: "Da telemetria à decisão", demo: "triagem",
    summary: "Mude o contexto de um mesmo evento benigno e veja quando ele deve virar um caso de investigação.",
    creator: { name: "Emanuel Araújo" }, tags: ["Triagem", "Incidentes", "Telemetria"],
    sources: sources(["NIST SP 800-61 Rev. 3", "https://csrc.nist.gov/pubs/sp/800/61/r3/final"], ["Wazuh", "https://github.com/wazuh/wazuh"]),
    sections: guide("Um conjunto de tentativas de autenticação precisa de contexto. Uma janela de manutenção e um ativo sensível mudam o risco associado ao mesmo sinal.", "Alterne o cenário. Contraste a evidência disponível, a prioridade e a próxima ação de quem investiga.", "Os dados são fictícios. A decisão real exige histórico do ativo, qualidade de telemetria e critérios de escalonamento da sua operação."),
  },
] satisfies RecordDraft[];
