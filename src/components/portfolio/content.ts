export type Locale = "en" | "pt-BR";

export const siteUrl = process.env.NEXT_PUBLIC_PORTFOLIO_SITE_URL!;
export const links = {
  github: "https://github.com/emanuelmaraujo",
  linkedin: "https://www.linkedin.com/in/emanuel-rx/",
  email: "mailto:emanuel-morais@outlook.com",
  skills: "https://github.com/emanuelmaraujo/skills",
};

const projectsEn = [
  {
    name: "Prumo", type: "Commerce intelligence", status: "Public product",
    summary: "An offer engine that turns marketplace data into deals worth sharing.",
    challenge: "Marketplace feeds are noisy. A listed discount alone tells you little about whether a price is worth acting on.",
    approach: "Marketplace adapters feed Python workers and PostgreSQL. Price history and publishing rules help filter repeated offers, while AI helps draft copy for Telegram and WhatsApp within a usage budget.",
    evidence: "A public Telegram channel shows the output of the publishing workflow.",
    stack: ["Python", "PostgreSQL", "Claude", "Telegram"], url: "https://t.me/prumo_tudo",
  },
  {
    name: "Torvya", type: "NFC & digital experiences", status: "Public product",
    summary: "Physical touchpoints that businesses can update after installation.",
    challenge: "A printed QR code or NFC tag should stay useful when a business changes its destination.",
    approach: "Torvya Review directs customers to a review page. Torvya Connect shares digital destinations. Next.js and Supabase manage configuration, and a Cloudflare Worker resolves published redirects at the edge.",
    evidence: "The public product site presents both Review and Connect.",
    stack: ["Next.js", "Supabase", "Cloudflare Workers", "Vercel"], url: "https://torvya.app.br/",
  },
  {
    name: "Marcos Krep’s", type: "Point of sale & operations", status: "Operational software",
    summary: "A mobile-first POS that connects orders, checkout and store operations.",
    challenge: "A food business needs a consistent order flow across checkout, preparation and delivery.",
    approach: "Next.js and Supabase support order and branch workflows. The code includes checkout, Pix payment, delivery confirmation, role-based data access and a thermal printing worker.",
    evidence: "Checkout and payment rules have dedicated repository tests. This case study covers implemented flows.",
    stack: ["Next.js", "TypeScript", "Supabase", "Vitest"],
  },
];

const projectsPt: typeof projectsEn = [
  {
    name: "Prumo", type: "Inteligência para comércio", status: "Produto público",
    summary: "Uma plataforma que transforma dados de marketplaces em ofertas que valem a pena compartilhar.",
    challenge: "Feeds de marketplaces trazem muito ruído. O desconto anunciado diz pouco sobre a qualidade real do preço.",
    approach: "Adaptadores de marketplace alimentam workers em Python e PostgreSQL. O histórico de preços e as regras de publicação ajudam a filtrar ofertas repetidas, enquanto a IA adapta o texto para Telegram e WhatsApp dentro de um orçamento de uso.",
    evidence: "O canal público no Telegram mostra o resultado do fluxo de publicação.",
    stack: projectsEn[0].stack, url: projectsEn[0].url,
  },
  {
    name: "Torvya", type: "NFC e experiências digitais", status: "Produto público",
    summary: "Pontos de contato físicos que as empresas podem atualizar depois da instalação.",
    challenge: "Um QR Code impresso ou uma tag NFC precisa continuar útil quando o destino muda.",
    approach: "O Torvya Review direciona clientes à página de avaliações. O Torvya Connect compartilha destinos digitais. Next.js e Supabase gerenciam a configuração, e um Cloudflare Worker resolve os redirecionamentos publicados na borda.",
    evidence: "O site público apresenta os dois produtos, Review e Connect.",
    stack: projectsEn[1].stack, url: projectsEn[1].url,
  },
  {
    name: "Marcos Krep’s", type: "Ponto de venda e operações", status: "Software operacional",
    summary: "Um PDV pensado para celular que conecta pedidos, checkout e operação de loja.",
    challenge: "Uma operação de alimentação precisa de um fluxo consistente do checkout ao preparo e à entrega.",
    approach: "Next.js e Supabase dão suporte aos fluxos de pedidos e filiais. O código inclui checkout, Pix, confirmação de entrega, acesso a dados por função e um worker de impressão térmica.",
    evidence: "O repositório inclui testes dedicados a regras de checkout e pagamento. O estudo descreve os fluxos implementados.",
    stack: projectsEn[2].stack,
  },
];

export const copy = {
  en: {
    skip: "Skip to content", home: "Home", nav: ["Work", "AI workflow", "About", "Contact"],
    workAction: "Explore my work", contactAction: "Get in touch",
    pillars: ["AI Engineering", "Cybersecurity", "IT Leadership", "Agent Orchestration", "Systems Architecture"],
    workLabel: "02 / SELECTED WORK", workTitle: "Products in practice.",
    workIntro: "Three systems built for distinct problems, from finding a better price to running a store.",
    projects: projectsEn, detail: "Explore the case study", caseLabels: ["Challenge", "Architecture", "Evidence"], visit: "Visit public product",
    lab: "Also in the workshop",
    experiments: [
      ["Promos", "Prototype", "An offer-monitoring prototype with purchase rules exercised against a simulated store."],
      ["Cezar", "Open-source fork", "An upstream control center I use to coordinate Claude Code, Codex and OpenCode."],
      ["VideoFactory", "Pilot", "An AI-assisted audiovisual workflow using Remotion and React Three Fiber."],
    ],
    workflowLabel: "03 / AI ENGINEERING", workflowTitle: "How I work with agents.",
    workflowIntro: "I separate planning, implementation and verification so each stage has an explicit output and a handoff someone can review.",
    steps: [
      ["Plan", "Define scope, acceptance criteria and constraints in the issue before assigning the work.", "Issue + acceptance criteria"],
      ["Orchestrate", "Use Cezar to coordinate Claude Code, Codex and OpenCode. Use Agent Skills to carry project standards across runs.", "Agent roles + context"],
      ["Agents", "Give specialized agents clear responsibilities and isolated Git worktrees. Keep each change close to the existing architecture.", "Focused diff"],
      ["Tools & Skills", "Use Agent Skills for repeatable checks and MCP for scoped tool access when a workflow needs it.", "Reusable context + tools"],
      ["Review", "Review the diff against the brief, check failure cases and capture evidence from tests and the actual user flow.", "Review findings + verification"],
      ["Deliver", "Open a pull request with the decisions, checks and remaining limitations for human review.", "Reviewable pull request"],
    ],
    output: "HANDOFF", skillsAction: "Explore my public Agent Skills",
    aboutLabel: "01 / PROFESSIONAL PRACTICE", aboutTitle: "Engineering for the systems people rely on.",
    aboutIntro: "I coordinate IT in the financial cooperative sector. That work informs how I build products, from governing access to making services easier to operate.",
    practice: [
      ["Identity & security", "IAM and identity governance with Microsoft 365, Entra ID, Active Directory, Conditional Access and MFA. Endpoint and network protection."],
      ["Infrastructure & operations", "Windows Server, Linux, virtualization, VPN, SD-WAN, network segmentation and monitoring. Cloud delivery with Vercel and Cloudflare."],
      ["AI & software engineering", "Agent Skills, TypeScript, Python, APIs, PostgreSQL, Docker, GitHub Actions, SharePoint and Power Automate."],
      ["IT leadership", "IT coordination in the financial cooperative sector, technology planning, service prioritization and business continuity."],
    ],
    credentials: "Education & certification", credentialItems: ["BSc in Computer Science", "Complementary studies in Information Security", "ISO/IEC 27001 Foundation"],
    archive: "From the archive", archiveLinks: ["Security articles", "Earlier projects"],
    contactLabel: "04 / CONTACT", contactTitle: "Let’s build something.", contactIntro: "Have a project in AI, security or digital products? I’d like to hear what you’re working on.",
    footer: "Brasília, Brazil", top: "Back to top", description: "Emanuel Araújo builds AI-enabled products and works across cybersecurity, IT leadership and systems architecture.",
  },
  "pt-BR": {
    skip: "Pular para o conteúdo", home: "Início", nav: ["Projetos", "Fluxo de IA", "Sobre", "Contato"],
    workAction: "Explorar projetos", contactAction: "Entrar em contato",
    pillars: ["Engenharia de IA", "Cibersegurança", "Liderança de TI", "Orquestração de Agentes", "Arquitetura de Sistemas"],
    workLabel: "02 / PROJETOS SELECIONADOS", workTitle: "Produtos na prática.",
    workIntro: "Três sistemas para problemas distintos, de encontrar um preço melhor a operar uma loja.",
    projects: projectsPt, detail: "Explorar o estudo de caso", caseLabels: ["Desafio", "Arquitetura", "Evidência"], visit: "Visitar o produto público",
    lab: "Outros trabalhos",
    experiments: [
      ["Promos", "Protótipo", "Protótipo de monitoramento de ofertas com regras de compra verificadas em uma loja simulada."],
      ["Cezar", "Fork de código aberto", "Central de orquestração que uso para coordenar Claude Code, Codex e OpenCode."],
      ["VideoFactory", "Piloto", "Fluxo audiovisual assistido por IA com Remotion e React Three Fiber."],
    ],
    workflowLabel: "03 / ENGENHARIA DE IA", workflowTitle: "Como trabalho com agentes.",
    workflowIntro: "Separo planejamento, implementação e verificação para que cada etapa produza uma entrega que alguém possa revisar.",
    steps: [
      ["Planejar", "Defino escopo, critérios de aceite e restrições na issue antes de distribuir o trabalho.", "Issue e critérios de aceite"],
      ["Orquestrar", "Uso o Cezar para coordenar Claude Code, Codex e OpenCode. Uso Agent Skills para reaplicar padrões do projeto.", "Papéis dos agentes e contexto"],
      ["Agentes", "Distribuo responsabilidades entre agentes especializados em worktrees Git isolados. Mantenho a mudança próxima da arquitetura existente.", "Diff focado na mudança"],
      ["Ferramentas", "Uso Agent Skills para verificações repetíveis e MCP para acesso restrito a ferramentas quando o fluxo exige.", "Contexto e ferramentas reutilizáveis"],
      ["Revisar", "Comparo o diff com o escopo, verifico modos de falha e registro evidências dos testes e do fluxo real de uso.", "Achados da revisão e evidências"],
      ["Entregar", "Abro um pull request com decisões, verificações e limitações para revisão humana.", "Pull request pronto para revisão"],
    ],
    output: "ENTREGA DA ETAPA", skillsAction: "Explorar minhas Agent Skills públicas",
    aboutLabel: "01 / ATUAÇÃO PROFISSIONAL", aboutTitle: "Engenharia para sistemas dos quais as pessoas dependem.",
    aboutIntro: "Coordeno TI no cooperativismo financeiro. Essa experiência orienta como construo produtos, da governança de acessos à operação de serviços.",
    practice: [
      ["Identidade e segurança", "Gestão e governança de identidades com Microsoft 365, Entra ID, Active Directory, Acesso Condicional e MFA. Proteção de endpoints e redes."],
      ["Infraestrutura e operações", "Windows Server, Linux, virtualização, VPN, SD-WAN, segmentação de redes e monitoramento. Entrega em nuvem com Vercel e Cloudflare."],
      ["Engenharia de IA e software", "Agent Skills, TypeScript, Python, APIs, PostgreSQL, Docker, GitHub Actions, SharePoint e Power Automate."],
      ["Liderança de TI", "Coordenação de TI no cooperativismo financeiro, planejamento tecnológico, priorização de serviços e continuidade de negócios."],
    ],
    credentials: "Formação e certificação", credentialItems: ["Bacharelado em Ciência da Computação", "Formação complementar em Segurança da Informação", "ISO/IEC 27001 Foundation"],
    archive: "Do acervo", archiveLinks: ["Artigos de segurança", "Projetos anteriores"],
    contactLabel: "04 / CONTATO", contactTitle: "Vamos construir algo.", contactIntro: "Tem um projeto de IA, segurança ou produto digital? Quero saber no que você está trabalhando.",
    footer: "Brasília, Brasil", top: "Voltar ao topo", description: "Emanuel Araújo desenvolve produtos com IA e atua em cibersegurança, liderança de TI e arquitetura de sistemas.",
  },
};
