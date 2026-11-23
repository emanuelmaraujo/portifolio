import type { RecordDraft } from "../content";
import { creator, guide, sources } from "./helpers";

type Reference = {
  slug: string;
  title: string;
  author: string;
  tags: string[];
  summary: string;
  links: [string, string][];
  use: string;
  evidence: string;
  kind?: "referencias" | "guias" | "estudos";
};

function reference({ slug, title, author, tags, summary, links, use, evidence, kind = "referencias" }: Reference): RecordDraft {
  return {
    slug, title, area: "ciberseguranca", kind, tags, summary, creator: { name: author }, sources: sources(...links),
    sections: [
      { title: "Quando consultar", body: use },
      { title: "Como aplicar e registrar evidência", body: evidence },
    ],
  };
}

type DefensiveProject = {
  slug: string;
  title: string;
  owner: string;
  repo: string;
  license?: string;
  tags: string[];
  summary: string;
  docs: string;
  context: string;
  pilot: string;
  validation: string;
};

function defensiveProject({ slug, title, owner, repo, license, tags, summary, docs, context, pilot, validation }: DefensiveProject): RecordDraft {
  const maintainer = { ...creator(owner, owner, repo), remoteAvatar: true };
  return {
    slug, title, area: "ciberseguranca", kind: "repositorios", tags: [...tags, "Blue Team"], summary, creator: maintainer, license,
    sources: [{ title: "Repositório oficial", url: maintainer.github }, ...(docs === maintainer.github ? [] : [{ title: "Documentação oficial", url: docs }])], sections: guide(context, pilot, validation),
  };
}

const framework = "Frameworks de segurança";

const frameworks = [
  reference({
    slug: "nist-csf-governanca", title: "NIST Cybersecurity Framework 2.0", author: "NIST", tags: [framework, "Governança de segurança", "Gestão de riscos"],
    summary: "Estruture um programa de segurança por resultados esperados e compare o estado atual com o perfil que a organização quer atingir.",
    links: [["Página oficial do NIST CSF", "https://www.nist.gov/cyberframework"]],
    use: "Comece pelo CSF quando precisar alinhar objetivos de segurança entre operação, produto e liderança. As funções Govern, Identify, Protect, Detect, Respond e Recover ajudam a localizar responsabilidades e conversar sobre resultados em uma linguagem comum.",
    evidence: "Escolha um serviço, descreva o estado atual e o resultado esperado em cada função relevante. Registre responsáveis, evidência disponível, lacuna e data de revisão. Priorize as lacunas pelo impacto no serviço e pela capacidade real de mudança.",
  }),
  reference({
    slug: "nist-800-61-resposta", title: "NIST SP 800-61 Rev. 3", author: "NIST", tags: [framework, "Blue Team", "Detecção e resposta"],
    summary: "Perfil do CSF para incorporar preparação, resposta e aprendizado com incidentes à gestão contínua de risco.",
    links: [["Publicação final do NIST", "https://csrc.nist.gov/pubs/sp/800/61/r3/final"]],
    use: "Use para revisar quem decide, qual informação precisa ser preservada e como as áreas se coordenam antes, durante e depois de um incidente. As recomendações ajudam a conectar a rotina do SOC com continuidade e gestão de risco.",
    evidence: "Faça um exercício de mesa com um serviço fictício indisponível. Documente a decisão de declarar o incidente, as responsabilidades, as comunicações necessárias e os critérios para retomar a operação. Ao terminar, atribua donos e prazos para corrigir as lacunas observadas.",
  }),
  reference({
    slug: "nist-zero-trust", title: "NIST SP 800-207 · Zero Trust Architecture", author: "NIST", tags: [framework, "Identidade e segredos", "Governança de segurança"],
    summary: "Arquitetura de referência para decidir acesso a recursos com base no contexto de pessoas, dispositivos e serviços.",
    links: [["Publicação final do NIST", "https://csrc.nist.gov/pubs/sp/800/207/final"]],
    use: "É útil quando aplicações e pessoas atravessam redes, dispositivos e provedores diferentes. Use para desenhar onde uma decisão de acesso ocorre, quais sinais ela consulta e como a política é aplicada ao recurso.",
    evidence: "Modele o acesso a um recurso fictício. Registre o requisito de identidade, o estado esperado do dispositivo e a ação permitida. Compare o comportamento em sessões comuns, com papel alterado e após revogação. Documente a diferença entre uma política escrita e a decisão que o teste realmente observou.",
  }),
  reference({
    slug: "nist-ssdf", title: "NIST SP 800-218 · Secure Software Development Framework", author: "NIST", tags: [framework, "Cadeia de suprimentos", "Segurança de aplicações"],
    summary: "Práticas para preparar equipes, proteger software, produzir releases seguros e responder a vulnerabilidades identificadas.",
    links: [["Publicação final do SSDF", "https://csrc.nist.gov/pubs/sp/800/218/final"]],
    use: "Use ao revisar um processo de desenvolvimento e abastecimento de software. O SSDF fornece um vocabulário para relacionar controles de engenharia, papéis, proteção de código e evidência produzida por cada release.",
    evidence: "Pegue um componente próprio e associe a cada prática escolhida uma evidência, como revisão de mudanças, configuração do pipeline ou registro de atualização de dependência. Destaque quais lacunas exigem uma decisão de projeto e quais podem ser tratadas pelo processo de entrega.",
  }),
  reference({
    slug: "nist-ai-rmf", title: "NIST AI Risk Management Framework", author: "NIST", tags: [framework, "Segurança de IA", "Governança de segurança"],
    summary: "Estrutura para governar, mapear, medir e gerenciar riscos de sistemas de IA ao longo do ciclo de vida.",
    links: [["Página oficial do AI RMF", "https://www.nist.gov/itl/ai-risk-management-framework"]],
    use: "Considere para decidir quando um sistema de IA pode ser adotado, quem é responsável e como mudanças serão avaliadas. A estrutura permite discutir impacto do uso, qualidade da evidência e acompanhamento após a implantação.",
    evidence: "Escolha um assistente de leitura de documentos. Registre usuário, tarefa, dados permitidos, consequência de uma resposta errada e limite de autoridade. Monte casos de avaliação, documente resultados e defina quem pode aceitar ou reabrir o risco.",
  }),
  reference({
    slug: "cis-controls-priorizacao", title: "CIS Critical Security Controls", author: "Center for Internet Security", tags: [framework, "Blue Team", "Governança de segurança"],
    summary: "Conjunto priorizado de salvaguardas agrupadas para orientar programas com níveis diferentes de maturidade.",
    links: [["CIS Controls", "https://www.cisecurity.org/controls"]],
    use: "Consulte quando precisar transformar uma conversa ampla sobre segurança em mudanças verificáveis. Os grupos de implantação ajudam a selecionar um ponto de partida compatível com a capacidade e o perfil de exposição da organização.",
    evidence: "Escolha uma classe de ativos. Registre inventário, gestão de contas, recuperação, registros e atualização em uma amostra pequena. Para cada salvaguarda adotada, guarde como foi verificada e quando a evidência precisa ser atualizada.",
  }),
  reference({
    slug: "mitre-attack-cobertura", title: "MITRE ATT&CK para mapear cobertura", author: "MITRE", tags: [framework, "Blue Team", "Detecção e resposta"],
    summary: "Base de conhecimento de comportamentos observados para organizar anotações de incidentes e discutir lacunas de telemetria.",
    links: [["MITRE ATT&CK", "https://attack.mitre.org/"]],
    use: "Para o time defensivo, é uma linguagem comum de classificação. Use ao relacionar alertas já produzidos pela operação a comportamentos descritos e ao distinguir o que consegue observar do que ainda está fora da sua cobertura.",
    evidence: "Pegue três alertas sanitizados e registre em cada um o comportamento alegado, a fonte de dados e a evidência disponível. Classifique cobertura como observada, parcial ou pendente. Dê prioridade à qualidade do vínculo entre alerta e evidência.",
  }),
  reference({
    slug: "mitre-d3fend", title: "MITRE D3FEND", author: "MITRE", tags: [framework, "Blue Team", "Detecção e resposta"],
    summary: "Vocabulário de técnicas defensivas para descrever o que um controle faz e comparar mecanismos com a mesma finalidade.",
    links: [["Matriz MITRE D3FEND", "https://d3fend.mitre.org/"]],
    use: "Consulte ao explicar como dois controles reduzem um risco ou geram telemetria. A biblioteca ajuda a ser preciso sobre a função de um controle, especialmente quando produtos com promessa semelhante atuam em pontos diferentes.",
    evidence: "Escolha um risco conhecido e escreva uma hipótese de proteção para cada controle avaliado. Registre onde ele atua, o dado de que depende e a evidência que provaria seu funcionamento. Use o resultado para discutir cobertura e redundância.",
  }),
  reference({
    slug: "owasp-asvs-verificacao", title: "OWASP ASVS · Verificação de segurança", author: "OWASP", tags: [framework, "Segurança de aplicações", "QA e testes"],
    summary: "Requisitos verificáveis para planejar e demonstrar segurança de aplicações, de autenticação à proteção de dados.",
    links: [["OWASP ASVS", "https://asvs.owasp.org/"]],
    use: "Use quando o produto precisa traduzir requisitos de segurança em critérios de entrega e revisão. Uma referência comum melhora a comunicação com pessoas que escrevem o código, realizam testes e decidem sobre exceções.",
    evidence: "Escolha um fluxo, mapeie requisitos pertinentes e associe exemplos de teste em ambiente autorizado. Guarde a versão do ASVS, a evidência por requisito e o responsável por exceções ou lacunas. Repita a revisão quando o fluxo mudar.",
  }),
  reference({
    slug: "owasp-top-ten-riscos", title: "OWASP Top 10 para aplicações web", author: "OWASP", tags: [framework, "Segurança de aplicações", "Estudos"],
    summary: "Referência de conscientização sobre classes de risco em aplicações para orientar conversas de engenharia e treinamento.",
    links: [["Página oficial do OWASP Top 10", "https://owasp.org/projects/top-ten"]],
    use: "Use para introduzir categorias de risco, escolher temas para revisão de código e facilitar a conversa entre produto e engenharia. Combine o material com requisitos verificáveis do ASVS na hora de definir critérios de aceite.",
    evidence: "Selecione um fluxo próprio e relacione classes pertinentes aos controles que o produto já aplica. Para cada uma, documente um teste defensivo que confirme a regra planejada e uma ação para os casos cuja cobertura ainda é incerta.",
  }),
  reference({
    slug: "cisa-performance-goals", title: "CISA Cross-Sector Cybersecurity Performance Goals", author: "CISA", tags: [framework, "Blue Team", "Governança de segurança"],
    summary: "Metas práticas para priorizar controles básicos de segurança em organizações de diferentes setores.",
    links: [["Metas de desempenho da CISA", "https://www.cisa.gov/cross-sector-cybersecurity-performance-goals"], ["Relatório oficial", "https://www.cisa.gov/sites/default/files/2023-03/CISA_CPG_REPORT_v1.0.1_FINAL.pdf"]],
    use: "Considere como ponto de partida para uma operação pequena ou como referência para detectar lacunas em controles fundamentais. Compare a seleção com o risco real e a capacidade de manter os controles ativos.",
    evidence: "Escolha metas relevantes para um serviço e registre a prova atual de implantação, o resultado esperado e o dono. Defina o que pode ser testado de forma segura no próximo ciclo e quais mudanças dependem de orçamento ou integração.",
  }),
  reference({
    slug: "slsa-proveniencia", title: "SLSA · Integridade de artefatos de software", author: "OpenSSF / SLSA", tags: [framework, "Cadeia de suprimentos", "DevSecOps"],
    summary: "Estrutura para melhorar controles de origem, construção e verificação de artefatos de software.",
    links: [["Especificação SLSA", "https://slsa.dev/"]],
    use: "Use quando precisar explicar de onde vem um artefato, como foi construído e que informação sua equipe consegue conferir antes de promovê-lo. Compare os requisitos relevantes com a cadeia de entrega efetiva.",
    evidence: "Escolha um release interno e documente origem, revisão, processo de build e identificação do artefato. Registre quais dessas informações podem ser verificadas por um consumidor e quais ainda dependem de declaração manual.",
  }),
  reference({
    slug: "ncsc-caf", title: "NCSC Cyber Assessment Framework", author: "NCSC UK", tags: [framework, "Governança de segurança", "Resiliência e recuperação"],
    summary: "Referência britânica para avaliar resultados de segurança e resiliência em funções críticas.",
    links: [["Cyber Assessment Framework", "https://www.ncsc.gov.uk/collection/cyber-assessment-framework"]],
    use: "Consulte quando a unidade de análise precisa ser uma função importante para a organização, e quando equipes diferentes precisam descrever o que acontece em operação e quais resultados conseguem demonstrar.",
    evidence: "Defina o serviço, suas dependências e o nível de impacto de indisponibilidade. Relacione os objetivos do framework a controles e evidências de operação. Registre lacunas que exigem mudanças técnicas e aquelas que pedem decisão organizacional.",
  }),
  reference({
    slug: "acsc-essential-eight", title: "ASD Essential Eight", author: "Australian Signals Directorate", tags: [framework, "Blue Team", "Governança de segurança"],
    summary: "Oito estratégias priorizadas de mitigação para avaliar controles de estações, identidades e recuperação.",
    links: [["Essential Eight e modelo de maturidade", "https://www.cyber.gov.au/essential-eight"]],
    use: "Consulte para organizar ações de higiene de segurança, como atualização, redução de privilégios, autenticação e backups. O modelo de maturidade ajuda a escolher um nível proporcional aos riscos da operação.",
    evidence: "Escolha uma classe de estações e revise a evidência real de adoção das ações selecionadas. Registre exceções por sistema, avalie quando as configurações são reaplicadas e confirme que a equipe consegue testar recuperação.",
  }),
  reference({
    slug: "microsoft-sdl", title: "Microsoft Security Development Lifecycle", author: "Microsoft", tags: [framework, "Segurança de aplicações", "DevSecOps"],
    summary: "Práticas para incorporar requisitos, revisão de arquitetura e evidências de segurança ao ciclo de desenvolvimento.",
    links: [["Microsoft SDL", "https://www.microsoft.com/en-us/securityengineering/sdl/"]],
    use: "É útil para organizar pontos de revisão em produtos que mudam frequentemente. Combine o SDL com requisitos do ASVS e evidência de release do SSDF de acordo com as necessidades da equipe.",
    evidence: "Acompanhe uma mudança de escopo da especificação à publicação. Registre requisitos de segurança, decisão da revisão e confirmação após deploy. Cada controle deve ter um responsável e uma evidência que possa ser repetida.",
  }),
];

const reports = [
  reference({
    slug: "mandiant-m-trends-2026", title: "Mandiant M-Trends 2026", author: "Google Cloud / Mandiant", tags: ["Inteligência de ameaças", "Blue Team", "Detecção e resposta"],
    summary: "Relatório anual baseado no trabalho de resposta a incidentes da Mandiant, útil para comparar tendências e hipóteses defensivas.",
    links: [["M-Trends 2026", "https://cloud.google.com/security/resources/m-trends"], ["Síntese do relatório", "https://cloud.google.com/blog/topics/threat-intelligence/m-trends-2026"]],
    use: "Consulte para questionar se a organização conseguiria identificar e responder a padrões recorrentes nos casos investigados. Separe recorte e período de observação do fornecedor ao comparar com seu setor.",
    evidence: "Escolha um achado e traduza em uma hipótese de cobertura, como fonte de registro ou tempo de escalonamento. Verifique a hipótese em uma amostra de casos sanitizados. Registre a origem, o recorte e a resposta adotada.",
  }),
  reference({
    slug: "mandiant-resiliencia-ia", title: "AI Risk and Resilience in 2026", author: "Google Cloud / Mandiant", tags: ["Segurança de IA", "Inteligência de ameaças", "Governança de segurança"],
    summary: "Relatório da Mandiant sobre adoção e risco de IA, útil para desenhar práticas de governança e resposta.",
    links: [["Relatório especial da Mandiant", "https://cloud.google.com/security/resources/ai-risk-and-resilience-2026"]],
    use: "Use para reunir perguntas operacionais sobre inventário de agentes, risco de integrações, supervisão e capacidade de recuperação. Compare as observações com os limites do sistema que a própria equipe controla.",
    evidence: "Liste os agentes em operação, os dados que consomem, seus responsáveis e as ações que podem realizar. Defina onde ficam registros e como suspender operações quando houver comportamento inesperado. Exercite a intervenção com dados fictícios.",
  }),
  reference({
    slug: "anthropic-transparencia-seguranca", title: "Anthropic · relatos de uso indevido e governança", author: "Anthropic", tags: ["Segurança de IA", "Governança de segurança", "Inteligência de ameaças"],
    summary: "Publicações da Anthropic para acompanhar práticas de detecção, resposta e governança de riscos em sistemas de IA.",
    links: [["Central de inteligência de ameaças", "https://www.anthropic.com/threat-intelligence"], ["Responsible Scaling Policy", "https://www.anthropic.com/responsible-scaling-policy"]],
    use: "Consulte para discutir o papel de monitoramento, limites de acesso e resposta a uso indevido. Relacione as observações aos dados e às permissões que os assistentes realmente têm no seu produto.",
    evidence: "Em um assistente de teste, confirme como uma ação sensível é autorizada, o que fica auditável e quem pode interromper o fluxo. Documente evidência de controle e risco residual para revisão periódica.",
  }),
  reference({
    slug: "kaspersky-security-bulletin", title: "Kaspersky Security Bulletin · estatísticas", author: "Kaspersky / Securelist", tags: ["Inteligência de ameaças", "Blue Team", "Pesquisa em segurança"],
    summary: "Série de estatísticas de segurança da Securelist, com observações de telemetria e recortes por tipo de ameaça.",
    links: [["Kaspersky Security Bulletin 2025 · Statistics", "https://securelist.com/kaspersky-security-bulletin-2025-statistics/118189/"], ["Portal Securelist", "https://securelist.com/"]],
    use: "É útil como um ponto de comparação com relatórios de outros fornecedores e com dados da própria organização. Confira período, população observada e como categorias e percentuais foram definidos.",
    evidence: "Escolha uma hipótese defensiva e compare com outra fonte primária. Registre os denominadores, as regiões cobertas e as diferenças na coleta. Use o resultado para sugerir uma revisão de controle, com evidência proporcional ao contexto local.",
  }),
  reference({
    slug: "crowdstrike-threat-report-2026", title: "CrowdStrike Global Threat Report 2026", author: "CrowdStrike", tags: ["Inteligência de ameaças", "Blue Team", "Detecção e resposta"],
    summary: "Resumo executivo anual com observações da CrowdStrike sobre ameaças, identidade e velocidade da resposta.",
    links: [["Resumo executivo oficial de 2026", "https://www.crowdstrike.com/en-us/resources/reports/global-threat-report-executive-summary-2026/"]],
    use: "Consulte para testar hipóteses sobre ponto de entrada, abuso de identidade e velocidade de investigação. Considere quais observações podem aparecer na telemetria de um serviço que a organização realmente opera.",
    evidence: "Faça uma revisão de casos fictícios de identidade. Registre de onde chega o alerta, tempo de decisão, responsável e critério de contenção. Compare com outra fonte e preserve as diferenças metodológicas em qualquer conclusão pública.",
  }),
  reference({
    slug: "unit42-incident-response-2026", title: "Unit 42 Global Incident Response Report 2026", author: "Palo Alto Networks / Unit 42", tags: ["Inteligência de ameaças", "Blue Team", "Detecção e resposta"],
    summary: "Estudo global da Unit 42 a partir de incidentes investigados, para orientar revisão de visibilidade e processos de resposta.",
    links: [["Página oficial do relatório", "https://www2.paloaltonetworks.com/resources/research/unit-42-incident-response-report"], ["Central Unit 42", "https://unit42.paloaltonetworks.com/"]],
    use: "Use quando quiser comparar as etapas em que equipes perderam visibilidade e revisar dependências entre sistemas de identidade, nuvem e endpoints. Um relatório de casos observados é uma fonte para formular perguntas operacionais.",
    evidence: "Selecione uma observação relevante ao serviço, associe a ela uma fonte de registro e verifique se há responsáveis e prazos documentados. Mantenha o recorte do relatório separado dos resultados dos exercícios internos.",
  }),
  reference({
    slug: "microsoft-digital-defense-2026", title: "Microsoft Digital Defense Report 2026", author: "Microsoft", tags: ["Inteligência de ameaças", "Blue Team", "Identidade e segredos"],
    summary: "Relatório anual da Microsoft sobre ameaças e riscos em serviços digitais, identidades e sistemas interconectados.",
    links: [["Digital Defense Report 2026", "https://www.microsoft.com/en-us/corporate-responsibility/topics/cybersecurity/reports/microsoft-digital-defense-report/"]],
    use: "Consulte para revisar prioridades de identidade, nuvem e governança. Compare as observações com a arquitetura e os dados disponíveis na organização, especialmente quando o relatório cobre serviços que o ambiente utiliza.",
    evidence: "Anote período, fonte de telemetria e contexto do achado. Escreva uma pergunta testável sobre autenticação, autorização ou retomada. Confirme a resposta em ambiente autorizado e guarde evidência para outra equipe repetir o teste.",
  }),
  reference({
    slug: "enisa-threat-landscape", title: "ENISA Threat Landscape 2025", author: "European Union Agency for Cybersecurity", tags: ["Inteligência de ameaças", "Governança de segurança", "Blue Team"],
    summary: "Panorama europeu de ameaças com categorias e setores observados, útil para comparação internacional.",
    links: [["ENISA Threat Landscape 2025", "https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025"]],
    use: "Use para ampliar a leitura além de um fornecedor ou região e para discutir impacto em setores como administração pública, serviços digitais e infraestrutura.",
    evidence: "Identifique setor, região, período e fonte de dados antes de comparar com relatórios do Brasil ou de outros fornecedores. Registre se os relatórios medem ocorrências, casos investigados ou telemetria, pois isso muda o significado dos números.",
  }),
  reference({
    slug: "certbr-cartilha-seguranca", title: "CERT.br · Cartilha de Segurança para Internet", author: "CERT.br / NIC.br", tags: ["Blue Team", "Estudos", "Resiliência e recuperação"],
    summary: "Referência em português para orientar pessoas sobre proteção de contas, equipamentos e informação.",
    links: [["Cartilha de Segurança para Internet", "https://cartilha.cert.br/"], ["Centro de Estudos, Resposta e Tratamento de Incidentes", "https://cert.br/"]],
    use: "Consulte para materiais internos de conscientização e para construir orientações em português que a equipe possa aplicar a contas, dispositivos e processos de atendimento.",
    evidence: "Escolha um assunto para uma sessão curta e encerre com uma atividade observável, como revisar os métodos de recuperação de conta em ambiente de treinamento. Guarde dúvidas frequentes para ajustar o material.",
  }),
  reference({
    slug: "first-epss-priorizacao", title: "FIRST EPSS · Priorização de vulnerabilidades", author: "FIRST", tags: ["Detecção e resposta", "Gestão de riscos", "Blue Team"],
    summary: "Modelo de estimativa de probabilidade de exploração observada, para combinar com impacto e exposição na triagem defensiva.",
    links: [["Exploit Prediction Scoring System", "https://www.first.org/epss/"]],
    use: "Consulte quando o volume de vulnerabilidades supera a capacidade de correção imediata. Cruze a estimativa com criticidade do ativo, exposição, evidência de exploração e medidas de mitigação já existentes.",
    evidence: "Registre a data da pontuação, sua origem e o inventário afetado. Compare dois avisos com o mesmo impacto técnico e níveis diferentes de exposição. Documente por que a equipe escolheu a ordem de correção e qual mudança reabriria a prioridade.",
  }),
];

const blue = [
  defensiveProject({
    slug: "zeek-rede", title: "Zeek", owner: "zeek", repo: "zeek", license: "BSD-3-Clause", tags: ["Telemetria de rede", "Detecção e resposta"],
    summary: "Monitor de rede que converte tráfego observado em registros estruturados para investigação.", docs: "https://docs.zeek.org/en/current/",
    context: "Zeek é útil ao investigar perguntas sobre conexões, resolução de nomes, serviços e intervalos observados. A saída oferece contexto de rede para correlacionar com outras fontes de inventário e alertas.",
    pilot: "Use eventos benignos ou captura sintética em ambiente autorizado. Defina uma pergunta, como quais serviços foram consultados durante um teste de disponibilidade. Compare os registros gerados com o que estava previsto no cenário.",
    validation: "Avalie visibilidade, perdas, volume e retenção. Documente os segmentos onde a coleta existe e quais metadados ficam disponíveis quando há tráfego criptografado. Defina quem pode consultar os registros.",
  }),
  defensiveProject({
    slug: "suricata-monitoramento", title: "Suricata", owner: "OISF", repo: "suricata", license: "GPL-2.0", tags: ["Telemetria de rede", "Detecção e resposta"],
    summary: "Motor de monitoramento e detecção de rede da OISF, com registros de eventos e regras gerenciáveis.", docs: "https://docs.suricata.io/en/latest/",
    context: "Considere usar para produzir e encaminhar alertas de rede. A cobertura depende da posição do sensor, das fontes que chegam até ele e da adequação das regras ao contexto observado.",
    pilot: "Use uma sequência de eventos sintéticos autorizados para conferir a integração de registros com o coletor. Analise o formato, meça a latência com eventos benignos e verifique o que a pessoa que investiga consegue concluir a partir do alerta.",
    validation: "Acompanhe perda de eventos, filas e taxa de alertas repetidos. Ajuste o conjunto de regras à capacidade de revisão e registre limites de captura e privacidade antes de adotar no ambiente real.",
  }),
  defensiveProject({
    slug: "osquery-inventario", title: "osquery", owner: "osquery", repo: "osquery", tags: ["Inventário", "Detecção e resposta"],
    summary: "Expõe entidades de sistemas operacionais como tabelas consultáveis, úteis para inventário e verificação de estado de endpoints.", docs: "https://osquery.io/",
    context: "Use para perguntas de inventário em estações autorizadas, como verificar versão do sistema, software instalado e estado de configuração. A disponibilidade e a forma dos campos variam por plataforma.",
    pilot: "Em dispositivos de homologação, selecione apenas o mínimo de informações necessário para responder uma pergunta de inventário. Compare com uma fonte conhecida, explique divergências e registre a frequência de atualização.",
    validation: "Teste consumo, comportamento sem conectividade e consistência entre sistemas, além dos limites de consulta. Preserve o menor conjunto de dados úteis e defina quem pode executar consultas e ler resultados.",
  }),
  defensiveProject({
    slug: "timesketch-forense", title: "Timesketch", owner: "google", repo: "timesketch", license: "Apache-2.0", tags: ["Evidências", "Detecção e resposta"],
    summary: "Análise colaborativa de linhas do tempo forenses, com importação de eventos e anotações sobre evidências.", docs: "https://timesketch.org/",
    context: "É adequado quando a equipe precisa combinar registros de várias fontes e explicar a sequência dos fatos. O valor aparece ao organizar observações, hipóteses e conclusões sobre a mesma cronologia.",
    pilot: "Use eventos sintéticos de origem conhecida. Importe registros com carimbo de tempo, fuso e identificador de fonte. Em seguida, construa uma narrativa e peça a outra pessoa que indique quais entradas sustentam cada afirmação.",
    validation: "Confira normalização de horário, duplicações, permissões de compartilhamento e capacidade de exportar a evidência necessária para revisão. Mantenha amostras sanitizadas para reproduzir o teste.",
  }),
  defensiveProject({
    slug: "velociraptor-dfir", title: "Velociraptor", owner: "Velocidex", repo: "velociraptor", tags: ["Evidências", "Detecção e resposta"],
    summary: "Ferramenta de investigação e coleta forense em endpoints administrados, com registro de artefatos e resultados de análise.", docs: "https://docs.velociraptor.app/",
    context: "Avalie quando investigações exigem coletar evidências em equipamentos previamente inscritos e gerenciados. Defina autorizações de coleta, classes de evidência e regras de retenção antes de iniciar um piloto.",
    pilot: "Modele uma investigação fictícia que exija somente dados benignos de inventário. Acompanhe a coleta em dispositivos de teste e confira atribuição a caso, operador e horário, usando os controles já autorizados no ambiente.",
    validation: "Documente quais informações foram realmente armazenadas, quem pode recuperá-las e quando serão descartadas. Revise a cobertura dos ativos autorizados e exercite o processo de auditoria das coletas.",
  }),
  defensiveProject({
    slug: "prowler-postura", title: "Prowler OSS", owner: "prowler-cloud", repo: "prowler", license: "Apache-2.0", tags: ["Segurança em nuvem", "Governança de segurança"],
    summary: "Avaliação de postura de segurança e conformidade de infraestrutura em nuvem, com verificações agrupadas por serviços e referências.", docs: "https://docs.prowler.com/introduction",
    context: "Considere para transformar configurações de nuvem em uma lista de achados revisáveis. Compare a cobertura da edição OSS e do provedor de interesse com os serviços e contas que realmente estão no escopo.",
    pilot: "Em uma conta de teste, use um perfil autorizado de leitura. Escolha poucas verificações, valide manualmente uma conformidade e uma lacuna e vincule cada achado ao responsável pela configuração.",
    validation: "Revise as permissões mínimas exigidas, os serviços sem cobertura e o formato de relatório necessário. Registre o contexto de configuração e confirme mudanças em uma nova execução, com o mesmo escopo.",
  }),
  defensiveProject({
    slug: "owasp-cheat-sheets", title: "OWASP Cheat Sheet Series", owner: "OWASP", repo: "CheatSheetSeries", license: "CC-BY-SA-4.0", tags: ["Segurança de aplicações", "Estudos"],
    summary: "Guias práticos para implementar e revisar controles de autenticação, autorização, sessão e proteção de dados.", docs: "https://cheatsheetseries.owasp.org/",
    context: "Use quando o ASVS aponta um requisito e o time precisa de práticas de implementação específicas. Escolha a folha pelo controle que pretende verificar e compare com as abstrações oferecidas pelo framework.",
    pilot: "Para uma aplicação própria, documente a política de acesso a um recurso de teste e compare comportamento observado com os requisitos esperados para pessoas de diferentes papéis. Registre o que pode ser verificado no código e o que depende de configuração.",
    validation: "Vincule o resultado à folha e à versão consultadas. Revise exemplos no contexto da stack real e mantenha a evidência que demonstra a aplicação do controle.",
  }),
  defensiveProject({
    slug: "mitre-navigator-cobertura", title: "ATT&CK Navigator", owner: "mitre-attack", repo: "attack-navigator", license: "Apache-2.0", tags: ["Detecção e resposta", "Telemetria"],
    summary: "Permite anotar camadas sobre a matriz ATT&CK para apresentar cobertura de controles e fontes de telemetria.", docs: "https://mitre-attack.github.io/attack-navigator/",
    context: "Use como visualização de uma avaliação defensiva. Uma camada pode destacar evidências observadas, cobertura pendente e pontos que precisam de telemetria adicional.",
    pilot: "Crie uma camada em ambiente de teste a partir de incidentes sanitizados e controles conhecidos. Inclua fonte, data e grau de evidência para cada item. Revise a interpretação com a equipe que investigaria os alertas.",
    validation: "Guarde a exportação e a versão da matriz. Diferencie a presença de uma regra de detecção da evidência de que uma ocorrência relevante foi observada e investigada.",
  }),
  defensiveProject({
    slug: "microsoft-sentinel-conteudo", title: "Microsoft Sentinel · conteúdo defensivo", owner: "microsoft", repo: "Sentinel", license: "MIT", tags: ["Detecção e resposta", "Telemetria"],
    summary: "Repositório de conteúdo técnico para Microsoft Sentinel, incluindo exemplos de análise, conectores e materiais de investigação.", docs: "https://learn.microsoft.com/en-us/azure/sentinel/overview",
    context: "Consulte para entender como uma fonte de registro se relaciona com o conteúdo analítico. O código no repositório e o serviço gerenciado têm formas de adoção distintas; confirme as condições de uso de cada parte.",
    pilot: "Escolha um caso benigno que tenha registros completos em uma instância autorizada de teste. Verifique a disponibilidade de campos, o comportamento da análise e como os resultados chegam à revisão de um operador.",
    validation: "Documente dependências de tabela, permissão, retenção e custos observados para cada conjunto de registros usado. Valide mudanças na configuração com evidências reproduzíveis.",
  }),
  defensiveProject({
    slug: "misp-inteligencia", title: "MISP", owner: "MISP", repo: "MISP", license: "AGPL-3.0", tags: ["Inteligência de ameaças", "Detecção e resposta"],
    summary: "Plataforma para registrar, correlacionar e compartilhar inteligência de ameaças com contexto e origem.", docs: "https://www.misp-project.org/",
    context: "Considere quando várias equipes precisam compartilhar observações de segurança com classificação e regras de distribuição. O valor de um indicador depende da confiabilidade da fonte, data, contexto e relevância para o consumidor.",
    pilot: "Use um evento inteiramente sintético, registre autoria, validade e restrições de compartilhamento e teste uma revisão por outra equipe. Confirme se os consumidores enxergam o contexto necessário para interpretar a entrada.",
    validation: "Cheque políticas de distribuição, revogação, correção e descarte de registros antigos. Antes de automatizar decisões, confirme a qualidade dos indicadores e os efeitos de um falso positivo.",
  }),
  defensiveProject({
    slug: "cisa-scubagear", title: "CISA ScubaGear", owner: "cisagov", repo: "ScubaGear", license: "CC0-1.0", tags: ["Segurança em nuvem", "Governança de segurança"],
    summary: "Avalia configurações de Microsoft 365 em relação às referências do projeto SCuBA da CISA.", docs: "https://github.com/cisagov/ScubaGear",
    context: "É uma referência para documentar diferenças entre uma configuração atual de Microsoft 365 e uma linha de base pública. Escolha primeiro os serviços do tenant que estão formalmente no escopo.",
    pilot: "Em um tenant de laboratório autorizado, confronte poucas recomendações com seus responsáveis e a evidência de configuração. Registre se cada diferença é um achado confirmado, uma exceção documentada ou uma checagem sem dados suficientes.",
    validation: "Revise permissões, escopo, data da avaliação e condições de compartilhamento do relatório. Depois de corrigir uma configuração, repita a checagem e mantenha as evidências do antes e do depois.",
  }),
  defensiveProject({
    slug: "opensearch-security-analytics", title: "OpenSearch Security Analytics", owner: "opensearch-project", repo: "security-analytics", license: "Apache-2.0", tags: ["Detecção e resposta", "Telemetria"],
    summary: "Componente de análise de registros de segurança com detecção, alertas e acompanhamento de descobertas no OpenSearch.", docs: "https://docs.opensearch.org/latest/security-analytics/",
    context: "Considere quando eventos já estão indexados em OpenSearch e a equipe precisa vincular uma análise à sua fonte de telemetria. Defina quais fatos um alerta deve preservar para permitir triagem.",
    pilot: "Use um pequeno conjunto de registros sintéticos, com campos completos e casos de borda. Compare a análise com a expectativa registrada e examine a leitura do resultado em uma simulação de triagem.",
    validation: "Revise consistência dos campos, volume esperado, permissões e retenção. Registre diferenças por tipo de evento e repita o teste quando a indexação ou as regras mudarem.",
  }),
];

const responsibility = [
  reference({
    slug: "red-team-escopo-responsabilidade", title: "Red Team · escopo e responsabilidade", author: "Curadoria do Radar · NIST", kind: "guias", tags: ["Red Team", "Governança de segurança", "Estudos"],
    summary: "Guia de preparação para exercícios autorizados, com objetivos, limites, responsabilidades e critérios de interrupção.",
    links: [["NIST SP 800-115 · visão geral", "https://csrc.nist.gov/pubs/sp/800/115/final"], ["NIST Cybersecurity Framework", "https://www.nist.gov/cyberframework"]],
    use: "Use antes de decidir se um exercício faz sentido. O trabalho começa com autorização formal por responsáveis, serviços incluídos, equipes avisadas, calendário acordado e regras para lidar com dados e impacto operacional.",
    evidence: "Revise um escopo fictício com segurança, operação e responsáveis pelo serviço. Registre quem aprova mudanças, quem pode interromper o exercício, como contatos ficam disponíveis e como recomendações serão acompanhadas ao fim.",
  }),
  reference({
    slug: "red-team-kali-linux-contexto", title: "Kali Linux · contexto e público", author: "Kali Linux", tags: ["Red Team", "Estudos", "Governança de segurança"],
    summary: "Introdução oficial da distribuição para entender o público pretendido e avaliar se o ambiente é adequado ao estudo.",
    links: [["Should I Use Kali Linux?", "https://www.kali.org/docs/introduction/should-i-use-kali-linux/"]],
    use: "Consulte para distinguir uma plataforma especializada de uma distribuição voltada a administração geral. Planeje estudos com instrutor, laboratório isolado e ativos de treinamento explicitamente autorizados.",
    evidence: "Antes de um curso, confira objetivo pedagógico, regras do laboratório, isolamento dos ativos, limites de acesso e pessoa responsável pela supervisão. Registre que conceitos serão discutidos e como será avaliado o aprendizado.",
  }),
  reference({
    slug: "red-team-osint-evidencias-abertas", title: "Bellingcat · verificação de fontes públicas", author: "Bellingcat", tags: ["Red Team", "OSINT", "Evidências"],
    summary: "Padrões editoriais para verificar fontes abertas, comparar evidências e documentar incertezas antes de publicar uma conclusão.",
    links: [["Standards and Practices", "https://www.bellingcat.com/app/uploads/2022/05/Bellingcat-Standards-and-Practices-2022.pdf"], ["Erros frequentes em pesquisa de fontes abertas", "https://www.bellingcat.com/resources/2024/04/25/oshit-seven-deadly-sins-of-bad-open-source-research/"]],
    use: "Use para estudar metodologia de verificação de material já publicado, por exemplo quando duas notícias atribuem datas diferentes ao mesmo evento. Priorize procedência, relevância, minimização de dados e distinção entre observação e interpretação.",
    evidence: "Monte uma ficha de verificação usando apenas as publicações fornecidas. Cite fonte e data, compare duas descrições independentes e sinalize lacunas. Preserve a identidade de pessoas privadas e revise se o que você pretende publicar é proporcional à finalidade.",
  }),
  reference({
    slug: "red-team-divulgacao-responsavel", title: "Divulgação coordenada de achados", author: "Curadoria do Radar · HackerOne", kind: "guias", tags: ["Red Team", "Governança de segurança", "Evidências"],
    summary: "Roteiro para comunicar achados por um canal autorizado, com escopo claro, proteção de dados e acompanhamento de correções.",
    links: [["HackerOne Vulnerability Disclosure Guidelines", "https://www.hackerone.com/terms/disclosure-guidelines"]],
    use: "Use para entender quem recebe uma comunicação e quais regras de confidencialidade, autorização e escopo valem no programa em questão. Antes de fazer qualquer atividade, obtenha o escopo aprovado diretamente do responsável.",
    evidence: "Pratique com um achado fictício. Escreva impacto em linguagem clara, preserve evidências mínimas necessárias e identifique canal, responsável e estado da comunicação. Combine o próximo contato e siga a política aplicável a qualquer divulgação pública.",
  }),
  reference({
    slug: "purple-team-revisao-cobertura", title: "Purple Team · revisão conjunta de cobertura", author: "Curadoria do Radar · MITRE", kind: "guias", tags: ["Red Team", "Blue Team", "Detecção e resposta"],
    summary: "Roteiro de mesa para equipes de segurança compararem hipóteses de detecção, evidências e prioridades de melhoria.",
    links: [["MITRE D3FEND", "https://d3fend.mitre.org/"], ["MITRE ATT&CK", "https://attack.mitre.org/"]],
    use: "Ideal quando equipes usam termos diferentes para as mesmas lacunas. Organize a sessão com casos fictícios ou eventos históricos sanitizados. Concentre a conversa na proteção esperada, na telemetria e na decisão do time responsável.",
    evidence: "Para cada caso, registre o sinal previsto, quem o recebe, o dado que sustenta a decisão e a lacuna observada. Priorize melhorias de cobertura, responsáveis e datas de revisão em conjunto.",
  }),
];

const skills: RecordDraft[] = [{
  slug: "trailofbits-sharp-edges", title: "Trail of Bits · Sharp Edges", area: "ciberseguranca", kind: "skills", tags: ["Segurança de aplicações", "Blue Team", "QA e testes"],
  summary: "Skill pública para revisar código e identificar interfaces ou padrões cuja complexidade favorece um uso inseguro por engano.",
  creator: { ...creator("Trail of Bits", "trailofbits", "skills/tree/main/plugins/sharp-edges/skills/sharp-edges"), remoteAvatar: true },
  sources: sources(["Skill oficial", "https://github.com/trailofbits/skills/blob/main/plugins/sharp-edges/skills/sharp-edges/SKILL.md"], ["Coleção Trail of Bits", "https://github.com/trailofbits/skills"]),
  sections: guide("Use em uma revisão defensiva de código próprio. Dê preferência a APIs em que configuração implícita ou nomes confusos permitem ignorar um controle por engano.", "Peça à skill que documente o comportamento esperado, a decisão de projeto e uma melhoria que torne o comportamento seguro mais fácil de usar. Registre a análise junto de um teste que comprove a decisão.", "Revise os resultados com quem mantém a API. Dê prioridade à evidência do código e às condições reais de chamada, e confirme que a correção mantém a finalidade da interface."),
}];

export const expansionSecurity: RecordDraft[] = [
  ...frameworks,
  ...reports.map(item => ({ ...item, tags: [...item.tags, "Relatórios e estudos"] })),
  ...blue,
  ...responsibility,
  ...skills,
];
