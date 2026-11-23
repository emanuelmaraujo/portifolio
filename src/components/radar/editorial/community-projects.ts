import type { RecordDraft } from "../content";
import { creator, sources } from "./helpers";

type Project = {
  slug: string;
  title: string;
  area: RecordDraft["area"];
  owner: [name: string, handle: string, repo: string];
  license: string;
  tags: string[];
  summary: string;
  fit: string;
  pilot: string;
  limits: string;
  documentation: string;
  signal: [label: string, url: string, description: string];
};

function project(item: Project): RecordDraft {
  const maintainer = creator(...item.owner);
  return {
    slug: item.slug,
    title: item.title,
    area: item.area,
    kind: "projetos",
    creator: { ...maintainer, remoteAvatar: true },
    license: item.license,
    tags: item.tags,
    summary: item.summary,
    sources: sources(["Repositório do projeto", maintainer.github], ["Documentação e versões", item.documentation], [item.signal[0], item.signal[1]]),
    sections: [
      { title: "Quando faz sentido", body: item.fit },
      { title: "Como avaliar", body: item.pilot },
      { title: "Limites e manutenção", body: item.limits },
      { title: "Sinal da comunidade", body: item.signal[2] },
    ],
  };
}

export const communityProjects = ([
  {
    slug: "sglang", title: "SGLang", area: "ia", owner: ["SGLang Project", "sgl-project", "sglang"], license: "Apache-2.0 no servidor",
    tags: ["Inferência local", "Servir modelos", "GPU"],
    summary: "Servidor de inferência para modelos de linguagem e multimodais com otimizações de execução e atendimento simultâneo.",
    fit: "Considere SGLang quando a aplicação já tem um modelo escolhido e você precisa servir várias requisições com latência observável. Compare com vLLM usando o mesmo checkpoint, as mesmas GPUs, o mesmo contexto e uma carga que represente os picos reais.",
    pilot: "Separe entradas curtas, longas e repetitivas. Meça tempo até o primeiro token, taxa de geração, p95, memória de GPU e falhas quando aumenta a concorrência. Registre as configurações do runtime para repetir o resultado.",
    limits: "A aceleração depende de compatibilidade do modelo, hardware e forma da carga. O licenciamento dos pesos e dos dados segue a distribuição do modelo utilizado.",
    documentation: "https://docs.sglang.io/", signal: ["Hugging Face · motores de inferência", "https://huggingface.co/docs/inference-endpoints/engines/sglang", "A Hugging Face documenta o SGLang como opção dos Inference Endpoints. Essa integração confirma uso no ecossistema. O desempenho para o seu caso precisa de medição própria."],
  },
  {
    slug: "dragonfly-distribuicao", title: "Dragonfly", area: "ia", owner: ["Dragonfly OSS", "dragonflyoss", "dragonfly"], license: "Apache-2.0",
    tags: ["Distribuição de modelos", "Kubernetes", "Infraestrutura de IA"],
    summary: "Distribuição de imagens OCI e artefatos de IA por pares para reduzir gargalos quando vários nós baixam o mesmo conteúdo.",
    fit: "É uma opção quando atualizações de um modelo ou imagem sobrecarregam o registro e atrasam o início de muitos workloads. O projeto atua na chegada dos artefatos, antes de o servidor de inferência gerenciar texto, imagem ou outras respostas.",
    pilot: "Em um cluster de teste, faça vários nós carregarem o mesmo artefato com e sem distribuição por pares. Observe tráfego no registro, tempo até o workload ficar disponível, sucesso de pulls e comportamento após limpar o cache.",
    limits: "Se os artefatos são pequenos ou as atualizações são esporádicas, o cache já disponível pode ser suficiente. Verifique integridade dos artefatos, acesso ao conteúdo e isolamento entre equipes.",
    documentation: "https://d7y.io/", signal: ["CNCF · distribuição de modelos, abril de 2026", "https://www.cncf.io/blog/2026/04/06/peer-to-peer-acceleration-for-ai-model-distribution-with-dragonfly/", "O relato técnico da CNCF de 6 de abril de 2026 trata especificamente de distribuição de pesos. Ele oferece um ponto de partida para comparar tempos de inicialização e tráfego do registro."],
  },
  {
    slug: "kserve", title: "KServe", area: "ia", owner: ["KServe", "kserve", "kserve"], license: "Apache-2.0",
    tags: ["Servir modelos", "Kubernetes", "Infraestrutura de IA"],
    summary: "Camada Kubernetes para implantar serviços de inferência com interfaces e operação mais consistentes entre runtimes.",
    fit: "É útil para uma plataforma que compartilha infraestrutura entre várias equipes e modelos. Compare com operar diretamente SGLang ou vLLM quando você precisa decidir se vale manter uma camada adicional de orquestração.",
    pilot: "Pegue o modelo e o endpoint mais previsíveis da equipe. Valide disponibilidade, atualização, rollback, escala e exportação de métricas. Compare o esforço de operação com o deploy direto do runtime.",
    limits: "O resultado depende do modo de deployment, runtime, armazenamento e capacidade do cluster. Um serviço que funciona com um único modelo pode não demonstrar vantagens de padronização ou compartilhamento.",
    documentation: "https://kserve.github.io/website/", signal: ["CNCF · incubação do KServe", "https://www.cncf.io/blog/2025/11/11/kserve-becomes-a-cncf-incubating-project/", "A CNCF anunciou a entrada em incubação em 11 de novembro de 2025. Use esse marco como evidência de evolução de governança e comunidade."],
  },
  {
    slug: "psalm", title: "Psalm", area: "ciberseguranca", owner: ["Psalm", "vimeo", "psalm"], license: "MIT",
    tags: ["PHP", "Segurança de aplicações", "Análise estática"],
    summary: "Analisador estático de PHP para revisar tipos, fluxos de dados e possíveis problemas no código sob sua responsabilidade.",
    fit: "É útil para equipes que precisam manter um projeto PHP enquanto aumentam cobertura de revisão. Uma linha de base ajuda a acompanhar regressões em código novo e manter a dívida anterior em uma fila explícita.",
    pilot: "Rode o analisador no seu repositório autorizado, escolha um módulo com testes e compare achados entre duas revisões. Confirme falsos positivos e acompanhe se uma regra consegue detectar as regressões que interessam à equipe.",
    limits: "Configurações e anotações influenciam os resultados. Combine os achados com testes de comportamento, revisão de mudanças e triagem humana.",
    documentation: "https://psalm.dev/docs/", signal: ["Hacker News · discussão sobre a série 7", "https://news.ycombinator.com/item?id=50406107", "A discussão pública sobre a série 7 reúne perguntas de desenvolvedores sobre integração e cobertura. Consulte as notas da versão do mantenedor para decidir o que habilitar."],
  },
  {
    slug: "spire", title: "SPIRE", area: "ciberseguranca", owner: ["SPIFFE Project", "spiffe", "spire"], license: "Apache-2.0",
    tags: ["Identidade de workload", "Segurança em nuvem", "mTLS"],
    summary: "Implementação de SPIFFE para emitir identidades verificáveis a workloads e reduzir a dependência de credenciais estáticas entre serviços.",
    fit: "Considere a ferramenta quando uma mesma aplicação opera em vários ambientes e a equipe precisa provar a identidade de um serviço ao outro. Ela pode integrar a malha ou a camada de aplicação responsáveis pela decisão de acesso.",
    pilot: "Em homologação, registre dois serviços de teste. Confirme a identidade atribuída, a renovação das credenciais e o comportamento de um cliente que não atende à política. Documente como recuperar a operação se o emissor ficar indisponível.",
    limits: "Ter uma identidade resolve parte da autenticação entre workloads. Defina a autorização, a proteção do emissor e o procedimento para recuperação independentemente da emissão de credenciais.",
    documentation: "https://spiffe.io/docs/latest/spire-about/", signal: ["CNCF · histórico do SPIRE", "https://presentations.cncf.io/projects/spire/", "O histórico da CNCF registra graduação em 22 de agosto de 2022. É uma ficha de projeto consolidado, com maturidade comunitária documentada."],
  },
  {
    slug: "in-toto", title: "in-toto", area: "ciberseguranca", owner: ["in-toto Project", "in-toto", "in-toto"], license: "Apache-2.0",
    tags: ["Cadeia de suprimentos", "Proveniência", "CI"],
    summary: "Framework para atestar quais etapas e identidades participaram da produção de um artefato de software.",
    fit: "É útil para verificar que etapas previstas aconteceram antes de promover um artefato. Assinar somente o binário final e registrar a origem de cada etapa respondem a perguntas diferentes de auditoria.",
    pilot: "Escolha um pipeline em homologação e declare quem pode produzir o artefato, quais materiais entram e quais evidências serão armazenadas. Compare uma execução esperada com uma em que uma evidência obrigatória está ausente.",
    limits: "As garantias dependem das identidades adotadas, da confiança no runner e da verificação no momento de consumir o artefato. Confirme quem armazena e consegue consultar as evidências ao longo do tempo.",
    documentation: "https://in-toto.io/", signal: ["CNCF · cobertura da graduação", "https://www.cncf.io/news/2025/04/25/itops-times-cncf-announces-graduation-of-in-toto-security-framework-for-software-supply-chain-integrity/", "A CNCF reuniu cobertura especializada da graduação em abril de 2025. O marco complementa a ficha técnica com evidência de governança e adoção."],
  },
  {
    slug: "incus", title: "Incus", area: "design-desenvolvimento", owner: ["Linux Containers", "lxc", "incus"], license: "Apache-2.0",
    tags: ["Redes e homelab", "Containers de sistema", "Máquinas virtuais"],
    summary: "Gerencia containers de sistema e máquinas virtuais Linux para laboratórios, homelab e infraestrutura privada.",
    fit: "Compare Incus com uma camada para containers de aplicação, como Compose, quando o serviço precisa de um ambiente semelhante a uma máquina completa. Use a virtualização quando o caso exige kernel separado ou uma fronteira de isolamento diferente.",
    pilot: "Crie ambientes de teste sem dados sensíveis, anote recursos e redes, tire uma cópia e restaure. Compare consumo, esforço de manutenção e tempo de recuperação entre um container de sistema e uma VM.",
    limits: "O nível de isolamento depende da configuração, do kernel e do tipo de instância. Trate gerenciamento do host, atualizações, perfis e backups como parte da adoção.",
    documentation: "https://linuxcontainers.org/incus/docs/main/", signal: ["LWN · boletim Debian sobre Incus", "https://lwn.net/Articles/1105012/", "O boletim Debian republicado pelo LWN em 2 de novembro de 2026 exemplifica por que alguém operando o projeto deve acompanhar também os avisos da distribuição."],
  },
  {
    slug: "dbdelve", title: "DBDelve", area: "design-desenvolvimento", owner: ["Shayan Abbas", "ShayanAbbas1", "dbdelve"], license: "GPL-3.0 no projeto atual, com aviso MIT para contribuições anteriores",
    tags: ["Dados e backends", "PostgreSQL", "Rust", "Desktop"],
    summary: "Cliente nativo de bancos de dados em Rust e GPUI para consultar diferentes motores com uma interface dirigida por teclado.",
    fit: "Pode interessar quem abre várias conexões durante o dia e prefere um aplicativo nativo compacto. O projeto lista Postgres, SQLite, DuckDB e outros motores, então confira os recursos disponíveis para o dialeto de que você depende.",
    pilot: "Use uma conexão de leitura para medir inicialização, consumo de memória, navegação em resultados e qualidade de exportação. Compare com sua ferramenta atual na mesma máquina e com o mesmo volume de dados.",
    limits: "Os números do README são medições do mantenedor em um cenário definido. Examine a assinatura dos instaladores, o tratamento das credenciais e os recursos de administração que precisa antes de migrar.",
    documentation: "https://github.com/ShayanAbbas1/dbdelve/releases", signal: ["Show HN · DBDelve, novembro de 2026", "https://news.ycombinator.com/item?id=50427934", "A apresentação de novembro de 2026 no Hacker News discute comparação com outros clientes nativos e pontos operacionais como instalação. Serve para levantar hipóteses de teste."],
  },
  {
    slug: "jj-musubi", title: "jj-musubi", area: "design-desenvolvimento", owner: ["Bryan O’Sullivan", "bos", "jj-musubi"], license: "Apache-2.0",
    tags: ["Engenharia de software", "Jujutsu", "Controle de versão"],
    summary: "Sincronização contínua de repositórios Jujutsu entre máquinas, incluindo o trabalho em andamento.",
    fit: "Faz sentido para quem já trabalha com Jujutsu e alterna entre uma estação, um laptop ou uma máquina de desenvolvimento. O valor está em retomar o trabalho atual sem depender apenas de publicar uma branch a cada pausa.",
    pilot: "Comece por um repositório descartável em duas máquinas suas. Compare latência de sincronização, comportamento quando as máquinas divergem e retomada após uma janela offline. Mantenha um backup independente durante a avaliação.",
    limits: "Trabalho ainda não revisado pode circular entre máquinas. Planeje quais repositórios podem entrar nesse modelo, como limitar o pareamento e como recuperar alterações inesperadas.",
    documentation: "https://www.serpentine.com/posts/2026/announcing-jj-musubi/", signal: ["Lobsters · anúncio de 20 de novembro de 2026", "https://lobste.rs/s/tj1j4b/announcing_jj_musubi_live_sync_for", "A discussão do anúncio no Lobsters trouxe perguntas de uso e respostas do mantenedor. É um sinal inicial de atenção técnica, com espaço para comparar expectativas e limitações."],
  },
  {
    slug: "postgresql", title: "PostgreSQL", area: "design-desenvolvimento", owner: ["PostgreSQL Global Development Group", "postgres", "postgres"], license: "PostgreSQL License",
    tags: ["Dados e backends", "SQL", "PostgreSQL"],
    summary: "Banco de dados relacional aberto com transações, extensões e ferramentas de análise de consultas e operação.",
    fit: "Considere PostgreSQL quando as relações e a integridade dos dados importam, ou quando uma equipe precisa de SQL, migrações e transações confiáveis. Compare custo de operação próprio e serviço gerenciado levando em conta backup, atualizações e plantão.",
    pilot: "Use uma cópia sintética representativa. Meça latência de consultas importantes, confira planos, simule a janela de migração e teste rollback e recuperação de backup. Para a série 19, confira quais novas capacidades resolvem um problema efetivo do seu ambiente.",
    limits: "Mudanças de versão podem afetar extensões e escolhas do otimizador. Confirme a compatibilidade com drivers e provedores antes de migrar e registre o estado atualizado de réplicas e backups.",
    documentation: "https://www.postgresql.org/docs/19/", signal: ["Lobsters · discussão do PostgreSQL 19", "https://lobste.rs/s/pqyuhk/postgresql_19_released", "A discussão remete ao anúncio oficial de 19 de novembro de 2026. O grupo mantenedor documenta mudanças como manutenção concorrente de tabelas e novos controles de planejamento."],
  },
  {
    slug: "typst", title: "Typst", area: "design-desenvolvimento", owner: ["Typst", "typst", "typst"], license: "Apache-2.0 no compilador",
    tags: ["Documentação e mídia", "Relatórios", "Design editorial"],
    summary: "Compilador de documentos por marcação para gerar relatórios, trabalhos técnicos e PDFs repetíveis a partir de conteúdo versionado.",
    fit: "Use quando a mesma estrutura precisa gerar várias edições de um relatório e o controle visual exige mais do que Markdown básico. A fonte do documento pode ser revisada com o restante do projeto.",
    pilot: "Escolha um relatório com sumário, tabela e imagem. Gere duas versões com os mesmos arquivos e confira paginação, fontes, links e legibilidade em leitura digital e impressão.",
    limits: "Confirme suporte a fontes, pacotes, formatos e acessibilidade exigidos pela instituição ou cliente. A licença do compilador não define a licença de um template ou serviço hospedado.",
    documentation: "https://typst.app/docs/", signal: ["heise · diretório alemão de software", "https://www.heise.de/download/product/typst", "O diretório especializado heise descreve usos como pesquisas, relatórios e apresentações. A página indica atualização em 12 de agosto de 2026 e complementa a ficha mantida pelo projeto."],
  },
  {
    slug: "kdenlive", title: "Kdenlive", area: "design-desenvolvimento", owner: ["KDE", "KDE", "kdenlive"], license: "GPL-3.0",
    tags: ["Documentação e mídia", "Edição de vídeo", "Motion"],
    summary: "Editor de vídeo não linear do ecossistema KDE para cortes, montagem em trilhas e exportação de material audiovisual.",
    fit: "Pode entrar no fluxo de produto para montar uma gravação, sincronizar narração e mídia e revisar a sequência antes da publicação. Compare com a sua ferramenta atual usando o material e o formato de entrega que realmente utiliza.",
    pilot: "Monte um vídeo curto com gravação, locução e legenda. Valide o fluxo de edição, os proxies quando usados e o arquivo exportado no reprodutor de destino. Registre o tempo de renderização para discutir capacidade da máquina.",
    limits: "A fluidez depende de codecs, resolução e hardware. Confira também os direitos dos arquivos de mídia, das fontes e de componentes de terceiros do projeto.",
    documentation: "https://kdenlive.org/news/releases/26.08.0/", signal: ["LinuxFr · referências francófonas de software livre", "https://linuxfr.org/users/funix/liens", "O Kdenlive apareceu na curadoria comunitária francófona do LinuxFr. A publicação primária do KDE registra o release 26.08.0 em 31 de agosto de 2026."],
  },
  {
    slug: "bazzite", title: "Bazzite", area: "design-desenvolvimento", owner: ["Universal Blue", "ublue-os", "bazzite"], license: "Apache-2.0 no repositório de imagens",
    tags: ["Linux", "Sistemas operacionais", "Desktop"],
    summary: "Sistema de desktop do Universal Blue baseado em tecnologia Fedora, com imagens voltadas também a jogos e computadores portáteis.",
    fit: "É uma alternativa quando a equipe quer avaliar desktops baseados em imagem e precisa testar compatibilidade de hardware. A escolha da variante importa tanto quanto o nome do sistema, sobretudo em dispositivos com diferentes GPUs ou modos de uso.",
    pilot: "Avalie em uma máquina secundária. Teste suspensão e retorno, monitores, rede, entrada, atualizações e as aplicações de que depende. Inclua recuperação de uma alteração malsucedida e documente as exceções de hardware.",
    limits: "O resultado depende da variante e da plataforma. Confira o catálogo de dispositivos e aplicações. Software presente na imagem pode seguir licenças diferentes da do repositório do projeto.",
    documentation: "https://docs.bazzite.gg/", signal: ["Fedora Magazine · ecossistema Atomic", "https://fedoramagazine.org/whats-new-fedora-atomic-desktops-in-fedora-linux-44/", "A publicação de abril de 2026 cita Bazzite entre os projetos do Universal Blue preparando a atualização ao Fedora 44. O contexto ajuda a entender sua relação com Fedora Atomic."],
  },
  {
    slug: "karmada", title: "Karmada", area: "design-desenvolvimento", owner: ["Karmada Project", "karmada-io", "karmada"], license: "Apache-2.0",
    tags: ["DevOps e hospedagem", "Kubernetes", "Multicluster"],
    summary: "Orquestra workloads Kubernetes em vários clusters com políticas de distribuição e operação multiambiente.",
    fit: "Faz sentido quando várias regiões ou clusters são uma necessidade operacional. Compare políticas de distribuição, dependências entre serviços e responsabilidades de incidentes antes de escolher uma camada de orquestração central.",
    pilot: "Use dois clusters descartáveis e um serviço simples. Valide distribuição por política, atualização e retirada de um cluster de teste. Registre o que o plano de controle mostra durante a transição.",
    limits: "A distribuição de manifests é só uma parte da continuidade. Valide dados, identidade, roteamento, observabilidade e operação dos clusters separadamente.",
    documentation: "https://karmada.io/docs/", signal: ["CNCF · graduação anunciada na China", "https://www.cncf.io/announcements/2026/09/07/cloud-native-computing-foundation-announces-karmada-graduation/", "A CNCF anunciou a graduação em setembro de 2026, na conferência de Shanghai. É um marco de maturidade comunitária e operacional da fundação."],
  },
  {
    slug: "openfeature", title: "OpenFeature", area: "design-desenvolvimento", owner: ["OpenFeature", "open-feature", "spec"], license: "Apache-2.0 na especificação",
    tags: ["Engenharia de software", "Feature flags", "Entrega contínua"],
    summary: "Especificação aberta para avaliar flags no código e trocar a integração responsável por resolver o valor de cada flag.",
    fit: "É útil quando aplicações em várias linguagens precisam da mesma convenção de flags ou quando a troca de provedor não deveria exigir reescrever o código de negócio.",
    pilot: "Escolha uma flag com valor padrão explícito. Compare o comportamento em duas integrações ou em dois ambientes. Teste a ausência de configuração e registre se a resposta mantém a operação esperada.",
    limits: "A especificação dá uma interface comum. Segurança dos dados de contexto, retenção e uso de condições específicas ainda dependem do provedor e das políticas da aplicação.",
    documentation: "https://openfeature.dev/", signal: ["CNCF e SlashData · Technology Radar 2026", "https://www.cncf.io/announcements/2026/11/10/cncf-and-slashdata-report-finds-platform-engineering-strategies-are-shaping-ai-infrastructure-adoption/", "O relatório do terceiro trimestre, divulgado em 10 de novembro de 2026, colocou OpenFeature na faixa de adoção. A avaliação registra confiança entre respondentes, com método e população próprios."],
  },
  {
    slug: "perses", title: "Perses", area: "design-desenvolvimento", owner: ["Perses Project", "perses", "perses"], license: "Apache-2.0",
    tags: ["Observabilidade", "Dashboards", "Prometheus"],
    summary: "Projeto de visualização para manter painéis de observabilidade versionados e consultar fontes como Prometheus, Tempo e Loki.",
    fit: "Pode ser avaliado para equipes que querem revisar painéis como código, ligando indicadores operacionais ao histórico de mudanças. Compare a cobertura de fontes e fluxos de trabalho com o conjunto que já utiliza.",
    pilot: "Reconstrua um painel com taxa de erros, latência e saturação. Revise filtros, rótulos, disponibilidade das fontes e quanto trabalho é necessário para levar o painel a outro ambiente.",
    limits: "Um painel completo depende do que as fontes de dados coletam e retêm. Confira a maturidade dos conectores relevantes e o modo como usuários recebem acesso a consultas e painéis.",
    documentation: "https://perses.dev/docs/perses/latest/", signal: ["CNCF · ficha do projeto Perses", "https://www.cncf.io/projects/perses/", "A CNCF registra aceitação no nível Sandbox em 29 de agosto de 2024. O radar de observabilidade do terceiro trimestre de 2026 posicionou Perses como tecnologia a avaliar."],
  },
] satisfies Project[]).map(project) satisfies RecordDraft[];
