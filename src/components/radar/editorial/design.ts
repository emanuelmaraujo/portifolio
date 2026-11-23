import type { RecordDraft } from "../content";
import { creator, guide, sources } from "./helpers";

export const design = [
  {
    slug: "storybook", area: "design-desenvolvimento", kind: "projetos", title: "Storybook",
    summary: "Desenvolva e documente componentes de interface em isolamento, com histórias para cada estado importante.",
    creator: creator("Storybook", "storybookjs", "storybook"), license: "MIT", tags: ["Design system", "Componentes", "Acessibilidade"], featured: true,
    sources: sources(["Repositório oficial", "https://github.com/storybookjs/storybook"], ["Como escrever stories", "https://storybook.js.org/docs/writing-stories"], ["Testes de acessibilidade", "https://storybook.js.org/docs/writing-tests/accessibility-testing"]),
    sections: [
      { title: "Uma história representa um estado", body: "Uma story descreve um estado de interface com entradas reproduzíveis. Isso ajuda design, engenharia e QA a discutir o mesmo componente antes de publicá-lo. Use nomes que descrevam o cenário, como campo vazio, carregando, sem resultados ou erro recuperável." },
      { title: "Quando vale montar um catálogo", body: "Storybook é útil quando o componente tem vários estados, reaparece em diferentes fluxos ou muda junto de um design system. Uma tela única de baixo risco pode ser revisada na própria aplicação. Os dois ambientes ajudam em coisas diferentes: o catálogo facilita isolar o estado, enquanto a aplicação mostra como o estado surge dentro da jornada." },
      { title: "Piloto para uma busca", body: "Crie stories para entrada vazia, consulta em andamento, erro e resultados de nomes longos. Exercite tabulação, foco visível e mensagens de estado. Também confira se texto e ações ficam legíveis com largura menor e nos temas usados pelo produto." },
      { title: "Critério para publicar o componente", body: "Uma segunda pessoa deve conseguir localizar o estado, reproduzi-lo e conferir a diferença da mudança. Use as verificações automatizadas como apoio e valide a jornada real quando o foco, as permissões ou os dados de outra tela influenciam no componente." },
    ],
  },
  {
    slug: "wai-aria-apg", area: "design-desenvolvimento", kind: "repositorios", title: "WAI-ARIA Authoring Practices",
    summary: "Padrões e exemplos de navegação por teclado, estados e semântica para componentes de interface.",
    creator: creator("W3C WAI", "w3c", "aria-practices"), tags: ["Acessibilidade", "Teclado", "Componentes"],
    sources: sources(["Guia de padrões WAI-ARIA", "https://www.w3.org/WAI/ARIA/apg/"], ["Como ler os exemplos", "https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/"], ["Padrão de diálogo modal", "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"], ["Repositório dos exemplos", "https://github.com/w3c/aria-practices"]),
    sections: [
      { title: "Use o guia para especificar comportamento", body: "Escolha o padrão pela tarefa que a pessoa precisa cumprir. Um link navega, enquanto um controle de ação normalmente é um botão. Em componentes mais complexos, consulte as regras de foco, teclado e semântica do padrão correspondente. Elementos HTML nativos já entregam parte desse comportamento." },
      { title: "Exemplo de verificação com um diálogo", body: "Abra um diálogo de confirmação usando apenas o teclado. Confira título e nome acessível, destino inicial do foco, navegação entre os controles, fechamento por Escape e para onde o foco retorna. Para uma confirmação importante, avalie qual controle deve receber o foco inicial e como a pessoa entende as consequências da ação." },
      { title: "O que conta como evidência", body: "Registre rota, navegador, tecnologia assistiva, sequência de teclas e comportamento observado. Exemplos do APG são pontos de partida e variam em suporte. Valide o fluxo real com as combinações de navegador e tecnologia assistiva que atendem seu público." },
    ],
  },
  {
    slug: "nextjs", area: "design-desenvolvimento", kind: "repositorios", title: "Next.js",
    summary: "Explore o código e os exemplos do framework React que sustenta este portfólio.",
    creator: creator("Vercel", "vercel", "next.js"), license: "MIT", tags: ["Next.js", "React", "Performance", "Padrões e frameworks"],
    sources: sources(["Repositório oficial", "https://github.com/vercel/next.js"], ["Curso Next.js Learn", "https://nextjs.org/learn"], ["Componentes de servidor e cliente", "https://nextjs.org/docs/app/getting-started/server-and-client-components"], ["Checklist de produção", "https://nextjs.org/docs/app/guides/production-checklist"]),
    sections: [
      { title: "O que o App Router organiza", body: "Layouts compartilham navegação e estrutura. Páginas descrevem o conteúdo de cada rota. Componentes de servidor podem buscar dados e renderizar conteúdo perto da fonte. Componentes de cliente atendem interações que dependem de estado, eventos e APIs do navegador. O Radar usa essa divisão nas fichas, busca e laboratórios." },
      { title: "Quando vale escolher Next.js", body: "O framework ajuda quando o produto combina páginas públicas indexáveis, navegação React e dados preparados no servidor. Se a página só publica um documento estático com pouca interação, compare com um gerador de sites simples. O custo de hospedagem e depuração depende das rotas dinâmicas e das decisões de cache." },
      { title: "Experimento de leitura e busca", body: "Use uma ficha que entrega texto em HTML e uma busca com sugestões. Confira leitura e submissão do formulário com JavaScript desativado. Depois meça o comportamento da interação com JavaScript e teste uma navegação por teclado. Verifique se os controles ficam locais e se parâmetros da URL permitem compartilhar o resultado." },
      { title: "O que conferir na prévia", body: "Confirme rotas válidas, não encontradas e redirecionamentos antigos. Confira se versões recentes do conteúdo chegam no momento planejado e se uma mudança de cache não causa dados antigos. Use a documentação correspondente à versão do projeto e registre o comando de build e os testes de aceitação." },
    ],
  },
  {
    slug: "frontend-design-skill", area: "design-desenvolvimento", kind: "skills", title: "Frontend Design",
    summary: "Skill de direção visual para orientar composição, tipografia e implementação de interfaces com identidade.",
    creator: creator("Anthropic", "anthropics", "skills/tree/main/skills/frontend-design"), tags: ["Skills", "Direção de arte", "Componentes"],
    sources: sources(["Skill oficial no GitHub", "https://github.com/anthropics/skills/tree/main/skills/frontend-design"]),
    sections: guide("A skill conduz o agente a escolher uma direção visual com intenção e traduzi-la em decisões de tipografia, cor, proporção e movimento.", "Dê ao agente o público, a marca, três tarefas reais e restrições de acessibilidade. Avalie se a interface ajuda a resolver as tarefas e se o sistema visual permanece reconhecível em mobile.", "Compare os componentes com os tokens e com o conteúdo real. Uma imagem de referência é ponto de partida para decisões, com identidade própria para o novo trabalho."),
  },
  {
    slug: "vercel-react-best-practices", area: "design-desenvolvimento", kind: "skills", title: "React Best Practices",
    summary: "Skill da Vercel para guiar revisões de componentes React e Next.js com foco em desempenho e carregamento.",
    creator: creator("Vercel", "vercel-labs", "agent-skills/tree/main/skills/react-best-practices"), tags: ["Skills", "React", "Next.js", "Performance"], level: "Intermediário",
    sources: sources(["Skill oficial no GitHub", "https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices"], ["Documentação Next.js", "https://nextjs.org/docs"]),
    sections: guide("O conjunto de regras ajuda a identificar problemas como requisições encadeadas, conteúdo hidratado sem necessidade e bibliotecas de tamanho desproporcional.", "Escolha uma rota de leitura. Compare o tamanho do JavaScript e a resposta a um clique antes e depois de isolar uma interação pequena.", "Priorize observações mensuráveis e compatíveis com a versão do framework e os casos já suportados pela página."),
  },
  {
    slug: "lottiefiles-motion-design", area: "design-desenvolvimento", kind: "skills", title: "Motion Design Skill",
    summary: "Material da LottieFiles para planejar o objetivo do movimento e explicitar duração, easing e hierarquia.",
    creator: creator("LottieFiles", "LottieFiles", "motion-design-skill"), tags: ["Skills", "Motion", "Direção de arte"],
    sources: sources(["Skill oficial no GitHub", "https://github.com/LottieFiles/motion-design-skill"], ["WCAG 2.2", "https://www.w3.org/TR/WCAG22/"]),
    sections: guide("Uma animação pode orientar o foco, confirmar uma ação ou revelar a relação entre elementos. Decidir sua função ajuda a escolher duração e amplitude.", "Esboce a passagem de busca vazia para resultados e preserve a posição do campo. Compare a versão animada com a versão estática em teclado e toque.", "Em páginas densas, gestos breves por seção preservam o ritmo de leitura. Prefira uma alternativa sem deslocamento quando o visitante pede movimento reduzido."),
  },
  {
    slug: "trilha-interfaces", area: "design-desenvolvimento", kind: "estudos", title: "Trilha de interfaces e motion",
    summary: "Construa um componente da primeira decisão visual à revisão responsiva e por teclado.",
    creator: { name: "Curadoria de Emanuel Araújo" }, tags: ["Design system", "Motion", "Acessibilidade", "Aprendizagem"],
    sources: sources(["Storybook", "https://storybook.js.org/docs"], ["WCAG 2.2", "https://www.w3.org/TR/WCAG22/"], ["WAI-ARIA APG", "https://www.w3.org/WAI/ARIA/apg/"]),
    sections: guide("Defina tokens para superfícies, bordas, contraste e foco. Mapeie os estados do componente antes de desenhar a transição entre eles.", "Implemente uma busca acessível com estado vazio, resultado e erro. Teste texto comprido, zoom e teclado. Adicione movimentos curtos que ajudem a reconhecer mudança de estado.", "Valide contraste nos dois temas, navegação sem ponteiro e movimento reduzido. Registre os pontos em que comportamento e apresentação precisam evoluir juntos."),
  },
  {
    slug: "laboratorio-estados", area: "design-desenvolvimento", kind: "laboratorios", title: "Um componente, vários estados", demo: "interface",
    summary: "Explore uma interface de busca em foco, carregando e em erro, com mensagens e ações correspondentes.",
    creator: { name: "Emanuel Araújo" }, tags: ["Componentes", "Motion", "Acessibilidade"],
    sources: sources(["Histórias no Storybook", "https://storybook.js.org/docs/writing-stories"], ["WCAG 2.2", "https://www.w3.org/TR/WCAG22/"]),
    sections: guide("Um componente muda em resposta a interação, espera e resultado. A interface precisa sinalizar diferença visual e oferecer um próximo passo compreensível.", "Percorra os estados. Observe se o foco permanece previsível e se é possível reconhecer o erro pelo texto e pela ação oferecida.", "Este exemplo simula estados. Em uma busca real, mensagens de status e regras de foco precisam corresponder à interação e ao tempo de espera."),
  },
] satisfies RecordDraft[];
