import type { RecordDraft } from "../content";
import { creator, guide, sources } from "./helpers";

type DesignEntry = Omit<RecordDraft, "area">;
type Reference = [title: string, url: string];

const standards = "Padrões e frameworks";

function reference(
  slug: string, title: string, owner: DesignEntry["creator"], tags: string[],
  links: Reference[], summary: string, nextStep: string, evidence: string,
): DesignEntry {
  return {
    slug, title, kind: "referencias", creator: owner, tags: [standards, ...tags],
    sources: sources(...links), summary,
    sections: [
      { title: "Quando consultar", body: summary },
      { title: "Próximo passo", body: nextStep },
      { title: "Como avaliar o resultado", body: evidence },
    ],
  };
}

function skill(
  slug: string, title: string, name: string, handle: string, repo: string, folder: string,
  tags: string[], summary: string, nextStep: string, evidence: string, docs: Reference,
): DesignEntry {
  const author = creator(name, handle, `${repo}/tree/main/skills/${folder}`);
  return {
    slug, title, kind: "skills", creator: { ...author, remoteAvatar: true }, tags: ["Skills", ...tags],
    summary, sources: sources(["Pasta da skill e SKILL.md", author.github], docs),
    sections: guide(summary, nextStep, evidence),
  };
}

function project(
  slug: string, title: string, author: ReturnType<typeof creator>, license: string, tags: string[],
  docs: Reference, summary: string, nextStep: string, evidence: string,
): DesignEntry {
  return {
    slug, title, kind: "projetos", creator: { ...author, remoteAvatar: true }, license, tags,
    summary, sources: sources(docs, ["Repositório oficial", author.github]),
    sections: guide(summary, nextStep, evidence),
  };
}

const webStandards = [
  reference("wcag-22-padrao", "WCAG 2.2 · critérios de acessibilidade", creator("W3C WAI", "w3c", "wcag"), ["Acessibilidade", "Interfaces"],
    [["Recomendação do W3C", "https://www.w3.org/TR/WCAG22/"], ["Como atender à WCAG", "https://www.w3.org/WAI/WCAG22/quickref/"]],
    "A recomendação do W3C define critérios verificáveis para acessibilidade, por exemplo foco, contraste, autenticação, acionamento por teclado e tamanho de alvos. Consulte a referência ao definir aceitação para componentes ou avaliar uma jornada.",
    "Escolha um fluxo essencial, como buscar e abrir uma ficha. Percorra-o por teclado, com zoom e com leitor de tela. Para cada obstáculo, anote a etapa, o comportamento observado e o critério de sucesso envolvido.",
    "Mantenha o resultado vinculado ao critério, à versão da página e ao ambiente de teste. Combine verificações automatizadas com inspeção humana de nomes, foco e ordem de leitura."),
  reference("dtcg-design-tokens", "Design Tokens Format Module 2025.10", creator("Design Tokens Community Group", "design-tokens", "community-group"), ["Design system", "Interfaces"],
    [["Formato oficial 2025.10", "https://www.designtokens.org/tr/2025.10/format/"], ["Grupo comunitário no W3C", "https://www.w3.org/community/design-tokens/"]],
    "O DTCG publicou um formato de intercâmbio para tokens de design com tipos, valores, grupos e referências. Serve para transportar decisões como cor, tipografia e espaçamento entre ferramentas.",
    "Modele os tokens de fundo e texto dos temas claro e escuro e publique uma amostra JSON. Transforme essa amostra em variáveis CSS e compare o resultado com as variáveis de design.",
    "Confira aliases, unidades e tipos compostos nas ferramentas escolhidas. É um relatório final do grupo comunitário hospedado pelo W3C."),
  reference("core-web-vitals-medicao", "Core Web Vitals · LCP, INP e CLS", creator("Google Chrome", "GoogleChrome", "web-vitals"), ["Performance", "Interfaces"],
    [["Guia oficial de Web Vitals", "https://web.dev/articles/vitals"], ["Biblioteca de medição", "https://github.com/GoogleChrome/web-vitals"]],
    "Core Web Vitals reúne métricas de carregamento do conteúdo principal, resposta a interações e estabilidade visual. É uma base para investigar onde um site parece lento ou instável durante o uso.",
    "Escolha duas páginas críticas, separe mobile de desktop e acompanhe o percentil 75 de LCP, INP e CLS quando houver amostras suficientes. Use perfis de laboratório para reproduzir o pior cenário.",
    "Anote período, volume de amostras e versão implantada. Compare dados reais da mesma rota e do mesmo tipo de dispositivo. Um teste isolado no computador da equipe serve para diagnóstico."),
  reference("baseline-compatibilidade-web", "Web Platform Baseline · compatibilidade dos navegadores", creator("WebDX Community Group", "web-platform-dx", "web-features"), ["Compatibilidade", "Interfaces", "CSS"],
    [["Baseline no web.dev", "https://web.dev/baseline"], ["Dataset web-features", "https://github.com/web-platform-dx/web-features"]],
    "Baseline resume o suporte de recursos da web nos navegadores que compõem seu conjunto principal. Ajuda a decidir se um recurso CSS ou API já pode virar padrão no projeto ou se pede aprimoramento progressivo.",
    "Antes de aprovar um recurso novo, consulte sua classificação no Baseline e a tabela do MDN. Se parte do público estiver em versões antigas, teste HTML e CSS de base e acrescente a melhoria sob detecção de suporte.",
    "Cruze os dados com a matriz de navegadores do produto. Dispositivos embarcados, webviews e ambientes corporativos podem ter ciclos diferentes dos navegadores cobertos."),
  reference("mdn-dados-compatibilidade", "MDN Browser Compatibility Data", creator("MDN Web Docs", "mdn", "browser-compat-data"), ["Compatibilidade", "Interfaces", "JavaScript"],
    [["Guia de compatibilidade do MDN", "https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Compatibility_tables"], ["Repositório de dados", "https://github.com/mdn/browser-compat-data"]],
    "O conjunto de dados do MDN registra suporte por recurso e versão, incluindo notas, implementações parciais ou opções experimentais. Ajuda a resolver dúvidas que envolvem um detalhe da API.",
    "Encontre a propriedade na documentação do MDN, leia as notas de cada implementação e anote a primeira versão que atende aos requisitos. Reproduza o comportamento no aparelho e no motor disponíveis ao seu público.",
    "Registre a versão do pacote de dados e o caso reproduzido. Um recurso disponível pode ainda ter diferenças relevantes em uma combinação particular de browser e dispositivo."),
  reference("opentelemetry-especificacao", "OpenTelemetry Specification", creator("OpenTelemetry", "open-telemetry", "opentelemetry-specification"), ["Observabilidade", "Infraestrutura", "Backend"],
    [["Especificação oficial", "https://opentelemetry.io/docs/specs/otel/"], ["Convenções semânticas", "https://opentelemetry.io/docs/specs/semconv/"]],
    "O projeto especifica APIs, SDKs e convenções para instrumentar serviços com sinais interoperáveis. Consulte quando estiver definindo atributos ou conectando ferramentas diferentes de métricas, logs e rastreamento.",
    "Instrumente uma operação pequena que atravessa dois serviços. Propague o contexto, siga as convenções HTTP e confirme se a mesma transação aparece nas duas pontas com o mesmo identificador de rastreamento.",
    "Verifique estabilidade por sinal e linguagem, custos de amostragem e política de dados. Remova segredos e conteúdo pessoal antes da exportação."),
  reference("google-sre-slos", "Google SRE Workbook · objetivos de nível de serviço", { name: "Google SRE" }, ["Observabilidade", "Infraestrutura", "SRE", "Relatórios e estudos"],
    [["Implementing SLOs", "https://sre.google/workbook/implementing-slos/"]],
    "O guia relaciona indicadores de nível de serviço, objetivos, período de observação e orçamento de erro. É útil para estabelecer confiabilidade em termos de uma jornada que importa para o usuário.",
    "Escolha uma operação real e escreva a fração de eventos bem-sucedidos em uma janela acordada. Compare o orçamento de erro restante com o histórico de mudanças antes de decidir a próxima melhoria.",
    "Defina claramente o que conta como evento válido e como sucesso. Revise a janela e o objetivo com responsáveis de produto e operação quando o comportamento observado divergir da experiência relatada."),
  reference("nng-heuristicas-usabilidade", "10 heurísticas de usabilidade · Nielsen Norman Group", { name: "Nielsen Norman Group" }, ["UX", "Interfaces", "Pesquisa"],
    [["Heurísticas e exemplos oficiais", "https://www.nngroup.com/articles/ten-usability-heuristics/"]],
    "As heurísticas dão uma linguagem comum para problemas de interação como estado invisível, controle insuficiente e recuperação de erros difícil. São úteis em revisões rápidas de fluxos antes de testes com usuários.",
    "Peça a duas pessoas que avaliem separadamente o mesmo fluxo. Registre a etapa, a evidência e a severidade de cada achado e reúna as observações por jornada.",
    "Use os achados para criar hipóteses e medir o impacto depois da correção. Se a tarefa for crítica, observe pessoas reais executando-a."),
  reference("govuk-padroes-servicos", "GOV.UK Design System · padrões para serviços", creator("Government Digital Service", "alphagov", "govuk-design-system"), ["Design system", "Interfaces", "UX"],
    [["Padrões do GOV.UK Design System", "https://design-system.service.gov.uk/patterns/"], ["Componentes oficiais", "https://design-system.service.gov.uk/components/"]],
    "O Design System do governo britânico explica como organizar tarefas recorrentes, como pedir dados, ajudar o usuário a corrigir erros ou confirmar uma ação. Os padrões registram decisões além da aparência.",
    "Pegue um formulário do seu serviço, compare a forma de apresentar nome, erros e confirmação com os exemplos e aplique o princípio em uma página.",
    "Confirme o significado dos dados e as expectativas do seu público. A validação precisa refletir os documentos e convenções locais."),
  reference("microsoft-fluent-2", "Microsoft Fluent 2 · fundamentos, tokens e componentes", creator("Microsoft", "microsoft", "fluentui"), ["Design system", "Interfaces", "Componentes"],
    [["Documentação Fluent 2", "https://fluent2.microsoft.design/"], ["Código Fluent UI", "https://github.com/microsoft/fluentui"]],
    "Fluent 2 documenta como Microsoft organiza linguagem visual, tokens, componentes e estados para experiências em diferentes plataformas.",
    "Compare botões e campos existentes com os estados de foco, erro, carregamento e desabilitado apresentados na documentação. Crie a mesma tabela de estados para seu próprio sistema.",
    "Teste os estados em teclado, contraste alto e tema escuro. Use a versão do pacote correspondente ao componente adotado e preserve a identidade do produto."),
  reference("figma-code-connect-handoff", "Figma Code Connect · componentes e código", creator("Figma", "figma", "code-connect"), ["Design system", "Interfaces", "Componentes"],
    [["Guia oficial do Code Connect", "https://developers.figma.com/docs/code-connect/quickstart-guide/"], ["Integração com Figma MCP", "https://developers.figma.com/docs/figma-mcp-server/code-connect-integration/"]],
    "Code Connect estabelece o vínculo entre um componente no Figma e trechos da biblioteca real. O vínculo ajuda designers, desenvolvedores e agentes a falar sobre as mesmas propriedades.",
    "Mapeie um botão já publicado, documente as variantes principais e abra o componente em Dev Mode para comparar o exemplo com o código usado pelo aplicativo.",
    "Confira se os nomes, a versão da biblioteca e os valores das propriedades estão atualizados. Submeta o código a testes de estado e acessibilidade."),
  reference("vercel-speed-insights-uso", "Vercel Speed Insights · performance em produção", { name: "Vercel" }, ["Performance", "Observabilidade", "Interfaces"],
    [["Documentação da Vercel", "https://vercel.com/docs/speed-insights"]],
    "Speed Insights reúne medições de experiência na aplicação em produção. É útil para descobrir quais rotas e dispositivos devem receber atenção antes de investigar otimizações.",
    "Selecione um fluxo de alto uso, acompanhe a métrica de campo e registre a implantação em que o problema apareceu. Use Chrome DevTools para reproduzir o gargalo daquele fluxo.",
    "Avalie volume de dados, segmentos e período antes de atribuir uma mudança a uma implantação. Observe também rotas menos acessadas por meio de testes controlados."),
  reference("motion-react-acessibilidade", "Motion for React · animação acessível", creator("Motion", "motiondivision", "motion"), ["Motion", "Acessibilidade", "Interfaces"],
    [["Guia de acessibilidade do Motion", "https://motion.dev/docs/react-accessibility"]],
    "O guia cobre como responder à preferência por movimento reduzido e manter a compreensão de mudanças de estado. Ajuda a decidir quando uma transição precisa de uma variante mais discreta.",
    "Escolha uma animação de entrada ou rolagem. Ative a preferência por movimento reduzido, reduza movimento espacial e compare o entendimento da interação com as duas configurações.",
    "Verifique o foco ao trocar de tela e teste se alertas, expansão e carregamento continuam perceptíveis em ambas as versões."),
];

const designSkills = [
  skill("shadcn-ui-skill-oficial", "shadcn/ui · skill oficial", "shadcn/ui", "shadcn-ui", "ui", "shadcn",
    ["Design system", "Componentes", "Interfaces"],
    "A skill oficial ajuda o agente a descobrir o registry e a configuração do projeto e a compor componentes seguindo os padrões do shadcn/ui.",
    "Peça que o agente implemente um estado vazio usando o componente já presente no projeto. Inspecione a configuração do registry e os arquivos alterados.",
    "Revise comportamento de teclado, rótulos e tokens de tema. Compare o diff com os componentes existentes para evitar duplicação.",
    ["Documentação oficial das skills", "https://ui.shadcn.com/docs/skills"]),
  skill("shadcn-migracao-base-ui-skill", "shadcn/ui · migração de Radix para Base UI", "shadcn/ui", "shadcn-ui", "ui", "migrate-radix-to-base",
    ["Design system", "Componentes", "Interfaces"],
    "A skill orienta a migração de componentes shadcn/ui entre as variantes baseadas em Radix UI e Base UI. Serve para revisar diferenças de APIs e composição em uma migração já decidida.",
    "Experimente com um diálogo e um menu em uma branch. Identifique usos de partes compostas e compare teclado, retorno de foco, fechamento e portais antes e depois.",
    "Rode os testes do fluxo, observe os imports efetivamente modificados e compare o tema visual nos dois modos. Preserve alterações locais dos componentes.",
    ["Documentação oficial das skills", "https://ui.shadcn.com/docs/skills"]),
  skill("antfu-vitest-skill", "Vitest · skill da coleção de Anthony Fu", "Anthony Fu", "antfu", "skills", "vitest",
    ["Testes", "JavaScript", "Frontend"],
    "A skill organiza referências de Vitest sobre execução, expectativas, configurações, mocks e cobertura. É mantida como parte da coleção de Anthony Fu.",
    "Use a skill para propor um teste de regressão em uma função com bug conhecido. Peça a execução antes e depois da correção e preserve as convenções locais.",
    "Valide o teste contra a versão instalada e observe se ele falha pelo comportamento que motivou a correção. Confira se mocks conservam o contrato importante.",
    ["Guia oficial do Vitest", "https://vitest.dev/guide/"]),
  skill("antfu-simplify-skill", "Simplificação incremental · skill de Anthony Fu", "Anthony Fu", "antfu", "skills", "antfu-simplify",
    ["Manutenção", "Testes", "Engenharia"],
    "A skill sugere reduzir mudanças recentes investigando quais partes realmente sustentam o comportamento esperado, com verificação a cada remoção.",
    "Escolha um PR pequeno com testes claros. Compare cada abstração proposta com os usos reais e remova uma peça por vez em uma branch de revisão.",
    "Confira critérios de aceitação, efeitos colaterais e usos fora do teste principal. Revise o diff final mantendo a justificativa das mudanças que ficaram.",
    ["Coleção mantida pelo autor", "https://github.com/antfu/skills"]),
  skill("web-accessibility-testing-skill", "Web Accessibility Testing · skill de Daniel Hall", "Daniel Hall", "danielhall", "agent-skills", "web-accessibility-testing",
    ["Acessibilidade", "Testes", "Interfaces"],
    "A skill comunitária orienta a preparação de verificações automatizadas de acessibilidade com Playwright e axe-core. Pode ajudar a transformar critérios de teclado e semântica em uma verificação recorrente.",
    "Comece por uma rota de teste com formulário e um modal. Rode verificações com o modal aberto e fechado e documente separadamente os casos que exigem avaliação humana.",
    "Valide scripts e dependências sugeridos, confira as regras que foram executadas e faça uma revisão manual de foco, navegação e compreensão das mensagens.",
    ["Axe-core · repositório oficial", "https://github.com/dequelabs/axe-core"]),
];

const designProjects = [
  project("react-aria-adobe", "React Aria · Adobe", creator("Adobe React Spectrum", "adobe", "react-spectrum"), "Apache-2.0", ["Acessibilidade", "Componentes", "Interfaces"],
    ["Documentação do React Aria", "https://react-aria.adobe.com/"],
    "React Aria oferece componentes sem estilo final e hooks para criar padrões de interação acessíveis em React. É especialmente útil para equipes que precisam de identidade visual própria.",
    "Monte uma caixa de seleção pesquisável com itens desabilitados e navegação por teclado. Teste a versão em uma lista longa e em uma tela de toque.",
    "Inspecione as mensagens anunciadas por leitores de tela. Confira também localização, conteúdo vazio e retorno de foco quando o controle fecha."),
  project("axe-core-acessibilidade", "axe-core · motor de testes de acessibilidade", creator("Deque Systems", "dequelabs", "axe-core"), "MPL-2.0", ["Acessibilidade", "Testes", "Interfaces"],
    ["Documentação da API", "https://github.com/dequelabs/axe-core/blob/develop/doc/API.md"],
    "O axe-core executa verificações de acessibilidade em páginas renderizadas. É integrável em testes de navegador e em catálogos de componentes.",
    "Execute uma verificação em estados de sucesso, erro e diálogo aberto. Registre as violações por rota e inclua o caso corrigido como regressão na CI.",
    "Revise manualmente ordem de foco, clareza de nomes e execução da tarefa. O motor cobre propriedades avaliáveis por automação e aponta casos que precisam de revisão."),
  project("biome-formatador-linter", "Biome · formatação e análise estática", creator("Biome", "biomejs", "biome"), "MIT ou Apache-2.0", ["Ferramentas de desenvolvimento", "JavaScript", "Engenharia"],
    ["Guia de instalação e primeiro uso", "https://biomejs.dev/installation/quick-start/"],
    "Biome reúne formatação e lint em uma ferramenta para projetos web, utilizável no terminal e no editor. Pode reduzir a manutenção de configurações duplicadas.",
    "Migre um diretório pequeno e separe alterações mecânicas do restante do código. Compare os resultados com as regras atuais e documente exceções intencionais.",
    "Confira suporte para as linguagens, extensões e regras específicas do projeto. Use o mesmo comando e a mesma versão no editor e na CI."),
  project("rolldown-bundler", "Rolldown · empacotador JavaScript e TypeScript", creator("Rolldown", "rolldown", "rolldown"), "MIT", ["Ferramentas de desenvolvimento", "Build", "JavaScript"],
    ["Documentação do Rolldown", "https://rolldown.rs/"],
    "O Rolldown é um bundler escrito em Rust com API alinhada ao ecossistema Rollup. Tornou-se o empacotador do Vite 8 e pode ser avaliado separadamente em projetos com necessidades específicas.",
    "Use uma branch para comparar o build atual com o que usa Rolldown. Cubra plugins de CSS, importações dinâmicas, sourcemaps e execução do artefato final.",
    "Meça tamanho, duração e comportamento da saída em um ambiente equivalente ao de produção. Teste os plugins realmente utilizados durante a migração."),
  project("opentelemetry-astronomy-shop", "OpenTelemetry Demo · Astronomy Shop", creator("OpenTelemetry", "open-telemetry", "opentelemetry-demo"), "Apache-2.0", ["Observabilidade", "Infraestrutura", "Aprendizagem"],
    ["Guia do ambiente de demonstração", "https://opentelemetry.io/docs/demo/"],
    "É uma aplicação distribuída de referência com microsserviços instrumentados. Permite observar como rastros, métricas e logs explicam o caminho de uma requisição.",
    "Suba a demonstração em ambiente local e acompanhe o checkout pelos serviços. Escolha um cenário de erro da própria demonstração e identifique onde o tempo ou a falha aparece.",
    "Use dados fictícios. Compare a etiqueta da operação, o contexto propagado e o comportamento de amostragem antes de transportar a configuração para o seu serviço."),
  project("nasa-horizon-design-system", "NASA Horizon Design System · HDS Core", creator("NASA", "nasa", "hds-core"), "CC0-1.0 no núcleo, com exceções para fontes e marcas", ["Design system", "Acessibilidade", "Interfaces"],
    ["Documentação e catálogo da NASA", "https://nasa.github.io/hds-core/"],
    "Horizon Design System é uma camada de temas da NASA para o U.S. Web Design System. É uma referência para aplicar uma identidade institucional sobre componentes e padrões existentes.",
    "Compare os tokens e os exemplos públicos com o sistema de origem. Observe quais mudanças ocorrem na camada de marca e quais dependem do comportamento dos componentes.",
    "Confira a maturidade da versão e os termos separados para fontes, marcas e insígnias. Use a arquitetura de temas como referência para o seu próprio sistema."),
];

const designResearch: DesignEntry[] = [
  {
    slug: "github-desktop-varias-contas", title: "GitHub Desktop aceita várias contas no mesmo servidor",
    kind: "novidades", eventDate: "2026-11-19", featured: true,
    creator: creator("GitHub Desktop", "desktop", "desktop"), tags: ["Git", "Ferramentas de desenvolvimento", "Engenharia"],
    summary: "Quem alterna entre conta pessoal e profissional pode manter mais de uma conta autenticada no mesmo host pelo GitHub Desktop. A mudança vale para GitHub.com e hosts corporativos compatíveis.",
    sources: sources(["Anúncio oficial do GitHub", "https://github.blog/changelog/2026-11-19-github-desktop-now-supports-multiple-accounts-per-host/"]),
    sections: guide(
      "A atualização reduz o atrito de alternar identidades ao trabalhar com repositórios pessoais e da empresa no aplicativo desktop.",
      "Adicione a segunda conta nas preferências e abra um repositório de teste de cada organização. Confirme a conta usada antes de enviar uma alteração.",
      "Confira também o nome e e-mail registrados no commit. A identidade registrada no Git e a conta autenticada para publicar alterações são configurações distintas.",
    ),
  },
  {
    slug: "chrome-devtools-157-158", title: "Chrome DevTools melhora a depuração de JavaScript empacotado",
    kind: "novidades", eventDate: "2026-11-13",
    creator: creator("Chrome DevTools", "ChromeDevTools", "chrome-devtools-mcp"), tags: ["JavaScript", "Performance", "Ferramentas de desenvolvimento"],
    summary: "Os recursos de Chrome 157 e 158 mostram nomes originais em depuração com source maps compatíveis, permitem simular estados de carregamento de mídia e ampliam as auditorias do Lighthouse assistidas por IA.",
    sources: sources(["Guia oficial do DevTools", "https://developer.chrome.com/blog/new-in-devtools-december-2026"]),
    sections: guide(
      "Novos detalhes dos source maps ajudam a entender pilhas e escopos quando o JavaScript em produção passou por transformação ou minificação.",
      "Abra um build de teste com source maps, reproduza uma falha e compare nomes e arquivos exibidos no painel Sources. Para testar vídeo, simule espera no painel Elements.",
      "O suporte ao escopo original depende de como o build gera os mapas. Faça os testes em dados próprios e trate auditorias automáticas como ponto de partida.",
    ),
  },
  {
    slug: "python-315-guia-atualizacao", title: "Python 3.15 · guia oficial de atualização", kind: "guias",
    creator: creator("Python Software Foundation", "python", "cpython"), tags: ["Python", "Backend", "Engenharia"],
    summary: "O guia do Python 3.15 reúne recursos novos, como o tipo imutável frozendict, alterações da biblioteca padrão, depreciações e instruções de portabilidade.",
    sources: sources(["O que mudou no Python 3.15", "https://docs.python.org/3.15/whatsnew/3.15.html"], ["Publicação do Python 3.15.0", "https://www.python.org/downloads/release/python-3150/"]),
    sections: guide(
      "O material é voltado a quem mantém aplicações ou bibliotecas. As subseções de portabilidade ajudam a localizar mudanças que afetam código existente.",
      "Adicione 3.15 à matriz de CI e rode os testes sem alterar a versão padrão do deploy. Examine dependências nativas, serialização e verificações que assumem valores do tipo dict.",
      "Fixe a versão de manutenção escolhida e valide wheels das dependências na arquitetura usada em produção. Documente as incompatibilidades antes de migrar a versão padrão.",
    ),
  },
  {
    slug: "playwright-boas-praticas-microsoft", title: "Playwright · boas práticas oficiais de teste", kind: "guias",
    creator: creator("Microsoft Playwright", "microsoft", "playwright"), tags: ["Testes", "Frontend", "Acessibilidade"],
    summary: "Guia oficial sobre testes baseados no comportamento do usuário, isolamento de cenários, seletores acessíveis e investigação de falhas com traces.",
    sources: sources(["Best Practices", "https://playwright.dev/docs/best-practices"], ["Trace Viewer", "https://playwright.dev/docs/trace-viewer-intro"]),
    sections: guide(
      "Seletores apoiados em rótulos e papéis tornam os testes mais próximos da interface percebida. A espera automática do Playwright simplifica verificações em interfaces assíncronas.",
      "Escolha uma jornada com busca e filtro. Exercite-a por nome e papel, confirme o estado final com uma expectativa e capture o trace em falhas.",
      "Limpe estado entre cenários. Abra o trace para identificar se o erro veio de navegação, rede, seletor, sincronização ou comportamento da aplicação.",
    ),
  },
  {
    slug: "cncf-pesquisa-anual-cloud-native-2025", title: "Pesquisa anual de cloud native · CNCF", kind: "estudos",
    creator: { name: "CNCF e Linux Foundation Research" }, tags: ["Infraestrutura", "Cloud native", "Kubernetes", "Relatórios e estudos"],
    summary: "A pesquisa anual publicada em janeiro de 2026 reúne respostas de organizações sobre Kubernetes, contêineres, observabilidade e barreiras de adoção em ambientes cloud native.",
    sources: sources(["Relatório e metodologia", "https://www.cncf.io/reports/the-cncf-annual-cloud-native-survey/"]),
    sections: guide(
      "O relatório separa adoção, maturidade, mudanças organizacionais e infraestrutura de IA. Use as perguntas, a população e o recorte temporal para contextualizar os números.",
      "Compare sua necessidade com dois capítulos, um sobre operação de contêineres e outro sobre gargalos de adoção. Extraia três capacidades operacionais que precisariam existir na sua equipe.",
      "Antes de escolher uma plataforma, estime manutenção, confiabilidade, prazo e conhecimento disponível. Adoção em uma amostra da comunidade não mede adequação para todos os projetos.",
    ),
  },
  {
    slug: "cncf-radar-plataforma-novembro-2026", title: "Pesquisa da CNCF compara tecnologias de plataforma para observabilidade e IA",
    kind: "novidades", eventDate: "2026-11-10", featured: true,
    creator: { name: "CNCF e SlashData" }, tags: ["Infraestrutura", "Observabilidade", "Relatórios do setor"],
    summary: "O Technology Radar Q3 2026 compara percepções sobre confiabilidade, maturidade e utilidade de tecnologias como Prometheus, OpenTelemetry e OpenTofu. O recorte também mostra diferenças em como as equipes operam infraestrutura de IA.",
    sources: sources(["Technology Radar Q3 2026", "https://www.cncf.io/reports/the-cncf-technology-radar-q3-2026/"], ["Anúncio da CNCF", "https://www.cncf.io/announcements/2026/11/10/cncf-and-slashdata-report-finds-platform-engineering-strategies-are-shaping-ai-infrastructure-adoption/"]),
    sections: guide(
      "A edição mede opiniões dos profissionais ouvidos sobre observabilidade, infraestrutura como código e armazenamento. Contexto útil para montar uma lista curta de ferramentas para avaliar.",
      "Escolha o capítulo que corresponde ao seu gargalo. Defina uma operação que cada opção precisa sustentar e compare tempo de integração, manutenção e custo no seu ambiente.",
      "Leia o denominador de cada gráfico. Uma recomendação de usuários atuais e anteriores responde a uma pergunta diferente da taxa de adoção na comunidade.",
    ),
  },
  {
    slug: "firefox-160-matematica-pdf", title: "Firefox 160 preserva acessibilidade do conteúdo matemático ao salvar PDF",
    kind: "novidades", eventDate: "2026-11-10",
    creator: { name: "Mozilla Firefox" }, tags: ["Acessibilidade", "Compatibilidade", "Interfaces"],
    summary: "As notas da Mozilla registram que páginas salvas como PDF passaram a disponibilizar conteúdo MathML a tecnologias assistivas. A atualização também muda controles de mídia e a organização de abas.",
    sources: sources(["Notas oficiais do Firefox 160", "https://www.firefox.com/en-US/firefox/160.0/releasenotes/"], ["MathML no MDN", "https://developer.mozilla.org/en-US/docs/Web/MathML"]),
    sections: guide(
      "Em material didático e documentação científica, equações podem perder significado quando representadas apenas como imagem. MathML descreve sua estrutura.",
      "Salve uma página de teste com uma equação simples como PDF no Firefox 160. Verifique com um leitor de tela a leitura da estrutura matemática e compare com a página web.",
      "Teste no visualizador de PDF e nas tecnologias assistivas que o público usa. Registre o caminho de exportação com a versão do navegador.",
    ),
  },
  {
    slug: "safari-272-controles-acessiveis", title: "Safari 27.2 reúne melhorias para formulários e VoiceOver",
    kind: "novidades", eventDate: "2026-10-26",
    creator: { name: "WebKit" }, tags: ["Compatibilidade", "Acessibilidade", "Interfaces", "CSS"],
    summary: "O WebKit atualizou a personalização do controle nativo de seleção e corrigiu comportamentos relacionados a nomes acessíveis, anúncios do VoiceOver e controles de entrada no iOS.",
    sources: sources(["Notas oficiais do WebKit", "https://webkit.org/blog/18515/webkit-features-for-safari-27-2/"]),
    sections: guide(
      "A atualização refina o estilo do controle select personalizado e seu encaixe na área visível. Também traz correções de acessibilidade para conteúdo associado por ARIA.",
      "Abra os formulários do produto em um iPhone compatível e revise seleção, foco e mensagens dinâmicas com VoiceOver. Teste o select com texto longo e em tela estreita.",
      "Mantenha o HTML base utilizável e confira a matriz dos navegadores antes de depender de propriedades novas em toda a aplicação.",
    ),
  },
  {
    slug: "chrome-devtools-novembro-2026", title: "Chrome DevTools amplia diagnóstico de CSS e uso de memória",
    kind: "novidades", eventDate: "2026-10-20",
    creator: { name: "Chrome for Developers" }, tags: ["Performance", "CSS", "Interfaces", "Ferramentas de desenvolvimento"],
    summary: "O guia de novembro descreve novos recursos do DevTools para diagnosticar posicionamento em CSS, revisar memória e navegar por perfis de desempenho. A atualização também inclui inspeção de estilos para agentes.",
    sources: sources(["New in DevTools · novembro de 2026", "https://developer.chrome.com/blog/new-in-devtools-november-2026"]),
    sections: guide(
      "A publicação reúne mudanças que chegaram ao canal estável com Chrome 155 e 156. É uma boa referência para times que precisam reproduzir problemas de estilos e renderização.",
      "Abra um caso reduzido de interface instável e reproduza a sessão no painel Performance. Para verificar posicionamento ancorado, compare a regra aplicada com o resultado do editor no painel Elements.",
      "Registre primeiro a versão do Chrome e a largura da janela. Use as informações do DevTools para criar um teste mínimo reproduzível antes de alterar o código.",
    ),
  },
];

const webAlmanac = [
  {
    slug: "web-almanac-2025-acessibilidade", title: "Web Almanac · acessibilidade na web", kind: "estudos",
    creator: { name: "HTTP Archive" }, tags: ["Relatórios e estudos", "Acessibilidade", "Interfaces"],
    summary: "O estudo de 2025 analisa resultados automatizados de acessibilidade em páginas HTML e mostra onde a medição precisa de avaliação humana.",
    sources: sources(["Capítulo de acessibilidade do Web Almanac", "https://almanac.httparchive.org/en/2025/accessibility"], ["Requisitos verificáveis do W3C", "https://www.w3.org/TR/WCAG22/"]),
    sections: guide("Use os dados para identificar problemas que também merecem investigação no seu produto. O capítulo descreve a amostra, o que o teste automatizado mede e os limites da comparação.", "Revise os fluxos com mais uso para encontrar problemas de teclado, nomes e contraste. Registre achados e evidências ao lado dos resultados automatizados para acompanhar sua correção.", "Uma nota alta em Lighthouse pode coexistir com problemas no fluxo. Use também inspeção humana e testes com tecnologias assistivas."),
  },
  {
    slug: "web-almanac-2025-desempenho", title: "Web Almanac · desempenho de sites", kind: "estudos",
    creator: { name: "HTTP Archive" }, tags: ["Relatórios e estudos", "Performance", "Interfaces"],
    summary: "Compara medições de laboratório com dados de experiência real para entender carregamento, resposta e estabilidade visual de sites públicos.",
    sources: sources(["Capítulo de desempenho do Web Almanac", "https://almanac.httparchive.org/en/2025/performance"], ["Core Web Vitals", "https://web.dev/articles/vitals"]),
    sections: guide("O capítulo combina medições do HTTP Archive com informações agregadas do Chrome UX Report. O recorte permite observar diferenças entre dispositivos e tendências nas métricas LCP, INP e CLS.", "Meça páginas que compartilham o mesmo template, separe mobile e desktop e use o laboratório para reproduzir os problemas vistos em campo. Anote o tamanho da amostra e a versão publicada.", "A distribuição de sites do estudo e suas condições de medição diferem das do seu público. Use o panorama para levantar hipóteses e priorize suas próprias medições ao tomar decisões."),
  },
] satisfies DesignEntry[];

export const expansionDesign: RecordDraft[] = [...webStandards, ...designSkills, ...designProjects, ...designResearch, ...webAlmanac].map(item => ({ ...item, area: "design-desenvolvimento" }));
