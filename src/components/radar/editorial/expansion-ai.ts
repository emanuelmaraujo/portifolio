import type { RecordDraft } from "../content";
import { creator, sources } from "./helpers";

type AIDraft = Omit<RecordDraft, "area" | "sections"> & {
  decision: string;
  action: string;
  limits: string;
};

const standards = "Padrões e frameworks";
const reports = "Relatórios e estudos";
const geminiSkills = "https://github.com/google-gemini/gemini-skills";
const anthropicSkills = "https://github.com/anthropics/skills";
const hydrogenAnnouncement = "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/";

function maintainer(name: string, handle: string, repository: string) {
  return { ...creator(name, handle, repository), remoteAvatar: true };
}

function aiEntry({ decision, action, limits, ...item }: AIDraft): RecordDraft {
  return {
    ...item,
    area: "ia",
    sections: [
      { title: "Quando consultar", body: decision },
      { title: "Próxima ação", body: action },
      { title: "O que verificar", body: limits },
    ],
  };
}

export const expansionAI: RecordDraft[] = ([
  {
    slug: "anthropic-claude-api-skill", title: "Claude API · skill da Anthropic", kind: "skills", level: "Intermediário",
    creator: maintainer("Anthropic", "anthropics", "skills/tree/main/skills/claude-api"), tags: ["Claude", "API", "SDK", "Integração"],
    summary: "Skill oficial para escrever e revisar integrações com a API Claude, consultando contratos, exemplos por linguagem e documentação atual.",
    decision: "Use ao iniciar uma integração com a Claude API ou atualizar um projeto que já usa os SDKs da Anthropic. Ela reúne orientações sobre chamadas de ferramenta, streaming, cache e migração em um ponto de entrada consultável pelo agente de código.",
    action: "Peça ao agente para localizar a referência da linguagem já usada no projeto e criar dois casos pequenos. Um deve gerar a resposta esperada e o outro deve cobrir parada, erro ou ausência de resultado da ferramenta. Revise o contrato retornado antes de conectar uma fila ou conta real.",
    limits: "Valores de preço, nomes de modelos e compatibilidade mudam com o tempo. Cheque a documentação em vigor e o changelog antes de publicar. Ao instalar uma skill, revise instruções e arquivos de apoio e registre o commit adotado.",
    sources: sources(["SKILL.md oficial", `${anthropicSkills}/blob/main/skills/claude-api/SKILL.md`], ["Coleção Anthropic Skills", anthropicSkills], ["Documentação Claude", "https://platform.claude.com/docs/"]),
  },
  {
    slug: "google-gemini-api-dev-skill", title: "Gemini API Development · skill do Google", kind: "skills", level: "Intermediário",
    creator: maintainer("Google Gemini", "google-gemini", "gemini-skills/tree/main/skills/gemini-api-dev"), license: "Apache-2.0", tags: ["Gemini", "API", "SDK", "Saída estruturada"],
    summary: "Skill oficial para agentes que escrevem integrações Gemini em Python ou TypeScript e precisam consultar exemplos por capacidade e versão.",
    decision: "Use para adicionar geração, extração estruturada ou análise multimodal a uma aplicação existente. Se o trabalho exige entrada e saída em tempo real, consulte a skill Gemini Live, que cobre sessões e turnos de mídia.",
    action: "Escolha uma única entrada de teste e peça à skill um exemplo usando o SDK já instalado. Adicione uma resposta esperada, um caso em que falta uma informação e a validação da estrutura na aplicação. Registre o modelo e a versão usados no teste.",
    limits: "O arquivo traz exemplos e identificadores que podem mudar. Confira os modelos com suporte ao recurso, período de migração, limites de mídia e cobrança na documentação atual antes de colocar a integração em produção.",
    sources: sources(["SKILL.md oficial", `${geminiSkills}/blob/main/skills/gemini-api-dev/SKILL.md`], ["Coleção Gemini Skills", geminiSkills], ["Google AI Studio · documentação", "https://aistudio.google.com/docs/"]),
  },
  {
    slug: "google-gemini-live-api-skill", title: "Gemini Live API Development · skill do Google", kind: "skills", level: "Avançado",
    creator: maintainer("Google Gemini", "google-gemini", "gemini-skills/tree/main/skills/gemini-live-api-dev"), license: "Apache-2.0", tags: ["Gemini", "Áudio", "Tempo real", "Streaming"],
    summary: "Skill oficial para trabalhar com sessões de mídia em tempo real, incluindo conexão, turnos, interrupções e retomada.",
    decision: "Use para um protótipo que conversa com áudio ou recebe vídeo enquanto a pessoa interage. Quando o caso só precisa transcrever um arquivo pronto, a API convencional simplifica o fluxo e reduz os estados que a interface precisa manter.",
    action: "Simule uma fala interrompida e uma queda de conexão usando áudio de teste. Verifique se a interface indica envio, resposta e retomada, evita duplicar turnos e descarta trechos que ficaram fora da janela de resposta.",
    limits: "Tempo até o primeiro áudio, qualidade da transcrição em português, limites de sessão e gerenciamento de mídia devem ser testados na região e no dispositivo alvo. Revise consentimento e retenção antes de trabalhar com áudio de pessoas.",
    sources: sources(["SKILL.md oficial", `${geminiSkills}/blob/main/skills/gemini-live-api-dev/SKILL.md`], ["Coleção Gemini Skills", geminiSkills], ["Google · gestão de sessões Live", "https://aistudio.google.com/docs/live-api/session-management.md"]),
  },
  {
    slug: "google-gemini-api-cli-skill", title: "Gemini API CLI · skill do Google", kind: "skills", level: "Intermediário",
    creator: maintainer("Google Gemini", "google-gemini", "gemini-skills/tree/main/skills/gemini-api-cli"), license: "Apache-2.0", tags: ["Gemini", "Terminal", "API", "Prototipagem"],
    summary: "Skill oficial para trabalhar com o cliente de linha de comando da API Gemini em tarefas pequenas e reproduzíveis.",
    decision: "É útil para reproduzir uma chamada sem iniciar a aplicação inteira ou transformar uma prova de conceito em uma verificação local. A skill documenta comandos para consumir a API, enquanto o Gemini CLI é um agente de desenvolvimento completo.",
    action: "Execute um exemplo isolado com conteúdo público, grave a saída no formato esperado e registre a versão da CLI. Adicione um caso que deve falhar e confira código de saída, mensagens e quais partes uma rotina posterior precisa validar.",
    limits: "Revise scripts de instalação e permissões do agente antes de executar. Mantenha credenciais sem exposição em argumentos, histórico ou logs. O teste em terminal ajuda a verificar a API e precisa ser complementado por testes completos da sua aplicação.",
    sources: sources(["SKILL.md oficial", `${geminiSkills}/blob/main/skills/gemini-api-cli/SKILL.md`], ["Repositório do cliente", "https://github.com/google-gemini/gemini-api-cli"], ["Coleção Gemini Skills", geminiSkills]),
  },
  {
    slug: "openai-jupyter-notebooks-skill", title: "Jupyter Notebooks · skill da OpenAI", kind: "skills", level: "Intermediário",
    creator: maintainer("OpenAI", "openai", "plugins/tree/main/plugins/data-analytics/skills/jupyter-notebooks"), tags: ["Jupyter", "Python", "Avaliação", "Reprodutibilidade"],
    summary: "Skill do plugin oficial de análise de dados para criar, revisar e executar notebooks de forma reprodutível.",
    decision: "Use quando a saída que outras pessoas precisam conferir é o próprio notebook e ele precisa executar do início ao fim. É um bom formato para documentar uma comparação de modelos, com conjunto de exemplos, resultado e gráficos junto do código.",
    action: "Monte um notebook curto com entradas de teste, etapas separadas e uma tabela de erros por categoria. Execute a partir de um kernel limpo e confira se os resultados dependem só das células, arquivos e versões indicados.",
    limits: "Revise acesso ao ambiente e aos arquivos antes da execução, limpe saídas com dados internos e documente limitações da amostra. Um notebook reprodutível permite repetir a análise e interpretar até onde os resultados se aplicam.",
    sources: sources(["SKILL.md oficial", "https://github.com/openai/plugins/blob/main/plugins/data-analytics/skills/jupyter-notebooks/SKILL.md"], ["Repositório OpenAI Plugins", "https://github.com/openai/plugins"], ["Jupyter · nbconvert", "https://nbconvert.readthedocs.io/en/latest/"]),
  },
  {
    slug: "google-adk-python", title: "Google Agent Development Kit · Python", kind: "projetos", level: "Intermediário",
    creator: maintainer("Google", "google", "adk-python"), license: "Apache-2.0", tags: [standards, "Agentes", "Python", "Orquestração", "Avaliação"],
    summary: "Framework em código para construir, testar e operar agentes com ferramentas, sessões e fluxos explícitos.",
    decision: "Considere quando a equipe quer modelar etapas e ferramentas em Python e acompanhar o comportamento de vários passos. Para a primeira versão de uma tarefa previsível, um único agente ou um fluxo explícito é uma base útil para medir se mais agentes compensam.",
    action: "Crie um assistente que recebe uma pergunta e encontra uma informação em documentos já selecionados. Valide argumentos, saída da ferramenta, estado de sessão e se o agente delegou às etapas previstas. Meça tempo e acerto antes de adicionar paralelismo.",
    limits: "O framework ajuda a estruturar o sistema. Permissões, retenção de estado, limites de execução e integração com observabilidade precisam ser definidos para o seu ambiente. Compare a ergonomia com Pydantic AI se a prioridade for contratos tipados.",
    sources: sources(["Repositório Google ADK", "https://github.com/google/adk-python"], ["Documentação ADK", "https://google.github.io/adk-docs/"]),
  },
  {
    slug: "pydantic-ai", title: "Pydantic AI", kind: "projetos", level: "Intermediário",
    creator: maintainer("Pydantic", "pydantic", "pydantic-ai"), license: "MIT", tags: [standards, "Python", "Validação", "Agentes", "Observabilidade"],
    summary: "Framework Python para agentes que precisam de dependências, ferramentas e respostas tipadas, com suporte a diferentes provedores.",
    decision: "Escolha para integrar modelos a um sistema Python que já usa Pydantic e depende de contratos verificáveis. É especialmente útil quando o resultado segue para outros serviços e o time precisa tratar saídas inválidas de forma previsível.",
    action: "Defina um esquema de triagem pequeno com categoria, justificativa curta e indicação de dados ausentes. Teste a resposta esperada, uma categoria fora do contrato e o comportamento quando o provedor estoura o prazo. Use um provedor de teste para isolar a lógica da rede.",
    limits: "Validação de tipos garante a forma do resultado. Os dados dentro dela ainda exigem validação de regras e, quando pertinente, conferência das fontes. Confirme recursos por provedor antes de incluir voz, ferramentas ou streaming na interface.",
    sources: sources(["Repositório Pydantic AI", "https://github.com/pydantic/pydantic-ai"], ["Documentação Pydantic AI", "https://pydantic.dev/docs/ai/"]),
  },
  {
    slug: "mlx-lm", title: "MLX LM", kind: "projetos", level: "Intermediário",
    creator: maintainer("ML Explore", "ml-explore", "mlx-lm"), license: "MIT no código", tags: ["Inferência local", "Apple Silicon", "Quantização", "Modelos abertos"],
    summary: "Ferramentas para rodar e ajustar modelos de linguagem no Apple Silicon usando MLX, com conversão e opções de quantização.",
    decision: "Consulte quando você tem um Mac compatível e quer experimentar um modelo de pesos disponíveis localmente. Serve para decidir se uma rotina pequena pode rodar no equipamento, quais modelos cabem em memória e onde uma API remota ainda apresenta vantagem operacional.",
    action: "Selecione um modelo com licença apropriada e teste as mesmas entradas curtas e longas em duas quantizações. Registre memória, tempo até a primeira saída, taxa de geração e fidelidade da resposta em português. Repita com o aplicativo real aberto para simular a disponibilidade de memória.",
    limits: "Os resultados dependem do chip, da memória, da quantização e do comprimento do contexto. Confira a licença do checkpoint separadamente da licença do código e lembre que arquivos distribuídos por terceiros podem ter políticas próprias.",
    sources: sources(["Repositório MLX LM", "https://github.com/ml-explore/mlx-lm"], ["Documentação do framework MLX", "https://ml-explore.github.io/mlx/build/html/index.html"]),
  },
  {
    slug: "dspy", title: "DSPy", kind: "projetos", level: "Avançado",
    creator: maintainer("Stanford NLP", "stanfordnlp", "dspy"), license: "MIT", tags: [standards, "Avaliação", "Python", "RAG", "Otimização"],
    summary: "Framework Python para declarar tarefas de linguagem, ligar etapas de processamento e otimizar o sistema contra uma métrica de avaliação.",
    decision: "Use quando o problema tem casos suficientes para medir qualidade e você precisa melhorar repetidamente um fluxo de classificação, extração ou RAG. É possível comparar um programa simples com uma versão otimizada usando o mesmo conjunto de referência.",
    action: "Comece com uma tarefa pequena, como classificar documentos em categorias conhecidas. Separe exemplos de ajuste dos exemplos de teste. Compare tarefa, custo, latência e taxa de erro por categoria antes de manter o otimizador no fluxo de trabalho.",
    limits: "O otimizador melhora o que a métrica consegue medir. Separe exemplos difíceis e diferentes da distribuição de ajuste, inclua revisão humana em casos de impacto e guarde a configuração para repetir a comparação.",
    sources: sources(["Repositório DSPy", "https://github.com/stanfordnlp/dspy"], ["Documentação e tutoriais DSPy", "https://dspy.ai/"]),
  },
  {
    slug: "mozilla-any-llm", title: "any-llm · Mozilla.ai", kind: "projetos", level: "Intermediário",
    creator: maintainer("Mozilla.ai", "mozilla-ai", "any-llm"), license: "Apache-2.0", tags: ["API", "SDK", "Portabilidade", "Python"],
    summary: "Biblioteca para chamar diferentes provedores de modelos por uma interface comum em Python, incluindo opções de inferência local.",
    decision: "Considere quando a aplicação precisa experimentar mais de um provedor com a mesma interface. A biblioteca é adequada para isolar a chamada e padronizar parte da utilização quando a equipe ainda está avaliando compatibilidade e qualidade.",
    action: "Teste a mesma conversa e a mesma ferramenta em dois provedores. Compare como cada um retorna a identificação da chamada, argumentos, erros, tokens e resposta em streaming. Registre recursos específicos em uma matriz de compatibilidade.",
    limits: "A API comum cobre um conjunto de operações. Recursos recentes, formatos multimodais e tratamento de erros podem variar. Crie testes por provedor antes de habilitar troca automática em produção.",
    sources: sources(["Repositório Mozilla.ai", "https://github.com/mozilla-ai/any-llm"], ["Documentação any-llm", "https://docs.mozilla.ai/any-llm/"]),
  },
  {
    slug: "a2a-protocolo", title: "A2A · interoperabilidade entre agentes", kind: "referencias", level: "Avançado",
    creator: maintainer("A2A Project", "a2aproject", "A2A"), tags: [standards, "Agentes", "A2A", "MCP", "Interoperabilidade"],
    summary: "Especificação aberta para agentes independentes anunciarem capacidades, trocarem mensagens e acompanharem tarefas entre serviços.",
    decision: "Escolha quando dois agentes implantados por equipes diferentes precisam cooperar por um contrato público. Na mesma arquitetura, MCP pode padronizar a relação entre um aplicativo de IA, ferramentas e fontes de contexto.",
    action: "Faça dois serviços de teste trocarem uma tarefa com resultado simples. Documente a versão, a descoberta de capacidades, identidade, erros, cancelamento e o que acontece se a conexão cai antes de receber o resultado final.",
    limits: "A interoperabilidade depende da versão e do suporte de cada implementação. Antes de conectar dados internos ou delegar trabalho real, defina permissões por identidade, prazo de tarefa e como a pessoa responsável recupera ou encerra uma execução.",
    sources: sources(["Projeto e versões A2A", "https://a2a-protocol.org/"], ["Especificação A2A", "https://a2a-protocol.org/latest/specification/"], ["Repositório oficial", "https://github.com/a2aproject/A2A"]),
  },
  {
    slug: "nist-ai-rmf-governanca", title: "NIST AI RMF · governança de sistemas de IA", kind: "referencias", level: "Intermediário",
    creator: { name: "NIST" }, tags: [standards, reports, "Governança de IA", "Risco", "IA generativa", "NIST"],
    summary: "Framework voluntário para identificar, medir e gerenciar riscos ao longo do ciclo de vida de sistemas de IA, com um perfil focado em IA generativa.",
    decision: "Consulte quando uma equipe precisa decidir se um caso de uso pode sair do piloto, quais riscos precisam de dono e quais evidências a revisão deve exigir. O perfil NIST AI 600-1 aproxima o framework de problemas como informações inventadas, privacidade e dependências de terceiros.",
    action: "Escolha um fluxo em produção ou homologação. Registre quem responde pela decisão, quem pode sofrer impacto, em que cenários o sistema falha, como mensurar os riscos e qual ação encerra ou suspende o uso. Volte ao registro após trocar o modelo ou uma fonte.",
    limits: "O guia é voluntário e organiza o processo. Requisitos legais, contratuais e controles setoriais dependem do contexto da implantação. Use o Playbook para escolher ações e documente por que cada uma cabe no caso.",
    sources: sources(["NIST · AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework"], ["Perfil de IA generativa NIST AI 600-1", "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence"], ["NIST · AI RMF Playbook", "https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook"]),
  },
  {
    slug: "openai-metodologia-evals", title: "OpenAI · avaliações para aplicações de IA", kind: "referencias", level: "Intermediário",
    creator: { name: "OpenAI", handle: "openai", remoteAvatar: true }, tags: [standards, "Avaliação", "Regressão", "RAG", "Métricas"],
    summary: "Guia para definir avaliações repetíveis de qualidade, com objetivos mensuráveis e casos que representem o uso real da aplicação.",
    decision: "Consulte quando a equipe quer escolher entre modelos, comparar prompts ou acompanhar regressões. Exemplos reais e critérios observáveis ajudam a distinguir melhoria geral, mudança de formato e perda de acerto em cenários importantes.",
    action: "Selecione casos comuns, limites e falhas registradas. Escreva critérios de correção, revise uma amostra manualmente e compare a versão de produção com uma candidata sob a mesma configuração. Para um RAG, registre se os documentos foram recuperados e se o texto final os sustenta.",
    limits: "Valide a avaliação automática contra revisões humanas e registre a versão usada para pontuar. A metodologia é aplicável fora da plataforma Evals da OpenAI, cujo desligamento consta no cronograma oficial para 30 de novembro de 2026.",
    sources: sources(["OpenAI · boas práticas para avaliações", "https://developers.openai.com/api/docs/guides/evaluation-best-practices"], ["OpenAI · cronograma de descontinuação", "https://developers.openai.com/api/docs/deprecations"]),
  },
  {
    slug: "anthropic-workflows-agentes", title: "Anthropic · desenho de workflows e agentes", kind: "referencias", level: "Intermediário",
    creator: { name: "Anthropic", handle: "anthropics", remoteAvatar: true }, tags: [standards, "Agentes", "Orquestração", "Arquitetura", "Ferramentas"],
    summary: "Guia de arquitetura com encadeamento, roteamento, paralelização, delegação e ciclos de avaliação para aplicações com modelos de linguagem.",
    decision: "Consulte quando estiver decidindo quanto controle delegar ao modelo. Cadeias com passos conhecidos são fáceis de inspecionar. Roteamento ajuda a separar categorias. Um agente com ferramentas atende tarefas cujo caminho muda conforme o que encontra.",
    action: "Escolha uma tarefa, escreva a sequência prevista e implemente primeiro o fluxo mínimo. Meça acerto, custo, tempo e frequência de revisão. Compare a mesma entrada com uma versão que escolhe suas ferramentas e veja onde a autonomia resolve um caso que de fato falhava.",
    limits: "Mais caminhos aumentam os cenários de erro e tornam rastros de execução mais importantes. Registre argumentos, ações e condições de parada. Peça aprovação humana quando uma ação tiver efeito relevante fora do ambiente de teste.",
    sources: sources(["Anthropic · Building effective agents", "https://www.anthropic.com/research/building-effective-agents"]),
  },
  {
    slug: "model-cards-guia", title: "Model Cards · como documentar e escolher modelos", kind: "referencias", level: "Inicial",
    creator: { name: "Google Research e colaboradores" }, tags: [standards, reports, "Modelos", "Governança de IA", "Hugging Face", "Avaliação"],
    summary: "Referência de pesquisa e implementação para ler ou escrever fichas de modelos com uso previsto, dados, avaliações, licença e limitações.",
    decision: "Use quando precisar justificar a escolha de um modelo para uma aplicação, distribuir um checkpoint ou comparar licenças. A ficha oferece pontos de partida para examinar como o fabricante mediu o desempenho e quais casos ficaram de fora.",
    action: "Para dois modelos candidatos, organize uma tabela com versão, licença, dados declarados, entradas aceitas, limitações, línguas avaliadas e métricas relevantes. Marque campos sem evidência e defina quais precisam ser validados com um teste próprio.",
    limits: "Cada projeto controla o nível de detalhe da sua ficha. Víncule resultados à versão exata do modelo e compare condições de avaliação antes de tratar dois números como equivalentes.",
    sources: sources(["Google Research · artigo original", "https://research.google/pubs/model-cards-for-model-reporting/"], ["Hugging Face Hub · Model Cards", "https://huggingface.co/docs/hub/en/model-cards"]),
  },
  {
    slug: "mlperf-inference-benchmarks", title: "MLPerf Inference · comparar infraestrutura", kind: "referencias", level: "Avançado",
    creator: maintainer("MLCommons", "mlcommons", "inference"), tags: [standards, reports, "Benchmark", "Inferência", "GPU", "Infraestrutura de IA"],
    summary: "Suíte e resultados de referência para comparar o desempenho de sistemas executando cargas de inferência com regras publicadas.",
    decision: "Consulte para avaliar hardware e plataformas de inferência quando precisa de medições reproduzíveis. Combine configuração, versão, cenário, prazo de resposta e restrições de qualidade antes de comparar resultados.",
    action: "Selecione a carga mais parecida com a sua, como atendimento interativo ou processamento em lote. Leia a configuração completa das submissões escolhidas. Depois reproduza a comparação essencial com comprimento de entrada, pico de concorrência e metas de latência da aplicação.",
    limits: "Custo operacional, qualidade do atendimento ao seu domínio e energia fora do cenário medido exigem informações próprias. Trate o benchmark como evidência de desempenho dentro das regras publicadas.",
    sources: sources(["MLCommons · documentação MLPerf Inference", "https://docs.mlcommons.org/inference/"], ["MLCommons · resultados da versão 6.1", "https://mlcommons.org/2026/09/mlperf-inference-v6-1-results/"], ["Implementações de referência", "https://github.com/mlcommons/inference"]),
  },
  {
    slug: "saidas-estruturadas-apis-ia", title: "Saídas estruturadas · OpenAI e Google Gemini", kind: "referencias", level: "Intermediário",
    creator: { name: "OpenAI e Google Gemini" }, tags: [standards, "JSON Schema", "API", "Ingestão", "Validação"],
    summary: "Guias oficiais para extrair dados, classificar textos ou alimentar uma aplicação com um contrato de resposta validável.",
    decision: "Consulte quando um resultado precisa chegar como cadastro, planilha ou objeto interpretado por código. Um esquema delimita a forma e os campos esperados. Aplicações que só exibem um resumo podem manter texto livre quando for mais legível.",
    action: "Defina um esquema para título, tipo e evidências. Teste fontes incompletas, números ambíguos, respostas recusadas e entradas no limite de contexto. Faça validação no servidor e determine se uma saída incompleta será reprocessada, revisada ou descartada.",
    limits: "Cada API documenta um subconjunto de JSON Schema e situações em que o resultado pode sair do caminho esperado. A forma válida ainda admite fatos ou datas errados. Registre a fonte e confira valores antes de gravar registros importantes.",
    sources: sources(["OpenAI · Structured Outputs", "https://developers.openai.com/api/docs/guides/structured-outputs"], ["Google Gemini · Structured outputs", "https://aistudio.google.com/docs/structured-output"]),
  },
  {
    slug: "anthropic-avalie-agentes", title: "Anthropic · como avaliar agentes de IA", kind: "estudos", level: "Intermediário",
    creator: { name: "Anthropic", handle: "anthropics", remoteAvatar: true }, tags: [standards, reports, "Avaliação", "Agentes", "Rastros de execução"],
    summary: "Material técnico sobre como criar tarefas de avaliação, repetir execuções e pontuar o estado final e o caminho de um agente.",
    decision: "Consulte quando a resposta do agente pode parecer correta e a tarefa ainda assim terminar incompleta. Em uma rotina de pesquisa, a pontuação pode avaliar a cobertura de fontes e o vínculo entre cada afirmação e sua evidência. Em uma rotina com ferramentas, verifique também a mudança de estado esperada.",
    action: "Selecione uma tarefa curta, defina o resultado verificável e repita com as mesmas condições iniciais. Compare testes executados em código, uma rubrica com exemplos e revisão de uma amostra humana. Leia os rastros das falhas e revise os critérios quando duas soluções válidas forem pontuadas de modo diferente.",
    limits: "Casos escolhidos só por conveniência deixam de fora interações comuns e falhas importantes. Separe testes de melhoria dos testes de regressão e inclua dados reais autorizados ou amostras que representem os casos em português.",
    sources: sources(["Anthropic · Demystifying evals for AI agents", "https://www.anthropic.com/research/demystifying-evals-for-ai-agents"]),
  },
  {
    slug: "opentelemetry-genai-convencoes", title: "OpenTelemetry · convenções para IA generativa", kind: "referencias", level: "Avançado",
    creator: maintainer("OpenTelemetry", "open-telemetry", "semantic-conventions-genai"), tags: [standards, "Observabilidade", "Telemetria", "MCP", "Operação"],
    summary: "Convenções de nomes e atributos para rastros, métricas e eventos de clientes de IA generativa, provedores e MCP.",
    decision: "Consulte quando é difícil comparar latência, erros e uso de tokens de modelos, integrações ou versões da aplicação. Usar os nomes do ecossistema OpenTelemetry simplifica a análise entre serviços e reduz a quantidade de alternativas internas para a mesma medida.",
    action: "Mapeie uma chamada de modelo e uma chamada de ferramenta em homologação. Confira quais spans, atributos e métricas a sua instrumentação realmente emite, quanto aumenta o volume de telemetria e se duas execuções podem ser comparadas no mesmo painel.",
    limits: "A equipe de OpenTelemetry transferiu essas convenções para um repositório específico. Confirme a versão do esquema e a estabilidade de cada atributo. Guarde conteúdo de mensagens e argumentos somente quando a política de dados e a finalidade do monitoramento permitirem.",
    sources: sources(["OpenTelemetry · repositório GenAI", "https://github.com/open-telemetry/semantic-conventions-genai"], ["OpenTelemetry · aviso de migração", "https://opentelemetry.io/docs/specs/semconv/gen-ai/"]),
  },
  {
    slug: "gemma-4-modelos-locais", title: "Gemma 4 · modelos de pesos abertos para inferência local", kind: "modelos", level: "Intermediário",
    creator: { name: "Google DeepMind", handle: "google-gemma", github: "https://github.com/google-gemma", remoteAvatar: true }, license: "Apache-2.0", tags: [reports, "Modelos abertos", "Inferência local", "Multimodal", "Google"],
    summary: "Família de modelos com diferentes tamanhos e combinações de entrada, útil para comparar execução local, serviços próprios e dispositivos com memória limitada.",
    decision: "Consulte quando você precisa rodar um modelo em uma máquina própria ou quer medir o custo de manter a própria infraestrutura. A variante compacta E4B tem ficha oficial com modalidades e benchmarks. O catálogo da família permite comparar variantes maiores conforme o hardware e a tarefa.",
    action: "Escolha uma variante e o runtime compatível disponíveis para a máquina. Use uma amostra em português com texto e, se útil, imagens. Registre memória, latência, modelo exato, quantização e erros de extração antes de comparar com outro checkpoint.",
    limits: "Suporte a modalidades e contexto varia entre variantes e runtimes. Para conversar ou seguir instruções, confira se o checkpoint escolhido foi ajustado para esse uso. Leia a ficha dos pesos e reproduza a avaliação na configuração final do produto.",
    sources: sources(["Google DeepMind · Gemma 4", "https://deepmind.google/models/gemma/gemma-4/"], ["Google · pesos e ficha E4B no Hugging Face", "https://huggingface.co/google/gemma-4-E4B"], ["Google DeepMind · relatório técnico Gemma 4", "https://arxiv.org/abs/2607.02770"], ["Google Gemma · projetos no GitHub", "https://github.com/google-gemma"]),
  },
  {
    slug: "panorama-padroes-frameworks-ia", title: "Qual padrão ou framework de IA escolher?", kind: "estudos", level: "Inicial",
    creator: { name: "Curadoria de Emanuel Araújo" }, tags: [standards, "Governança de IA", "Avaliação", "Interoperabilidade", "Arquitetura"],
    summary: "Seleção por problema com caminhos práticos para governança, qualidade, integração entre serviços e comparação de infraestrutura.",
    decision: "Para organizar riscos e responsáveis, comece pelo NIST AI RMF. Para documentar escopo e limitações de um modelo, use Model Cards. Para medir regressões do produto, use avaliações por tarefa. Para comparar máquinas em um cenário controlado, consulte MLPerf Inference.",
    action: "Use A2A se serviços de agentes independentes precisam entregar tarefas entre si. Use MCP se um aplicativo precisa de acesso uniforme a ferramentas e contexto. Ao escolher o framework da aplicação, compare ADK para orquestração em Python, Pydantic AI para contratos tipados e DSPy para otimização guiada por exemplos e métricas.",
    limits: "Escolha um problema, um cenário de teste e um critério de aceitação antes de adotar a ferramenta. Um atendimento a documentos pode usar NIST para risco, uma ficha para registrar a versão e avaliações para medir citações. Protocolos entram quando existe uma necessidade concreta de integração.",
    sources: sources(["NIST · AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework"], ["Google Research · Model Cards for Model Reporting", "https://research.google/pubs/model-cards-for-model-reporting/"], ["OpenAI · metodologia de avaliações", "https://developers.openai.com/api/docs/guides/evaluation-best-practices"], ["MLCommons · MLPerf Inference", "https://docs.mlcommons.org/inference/"], ["A2A · especificações e ferramentas", "https://a2a-protocol.org/"], ["Model Context Protocol · visão geral", "https://modelcontextprotocol.io/docs/getting-started/intro"]),
  },
  {
    slug: "stanford-ai-index-2026", title: "Stanford HAI · AI Index 2026", kind: "estudos", level: "Inicial",
    creator: { name: "Stanford HAI" }, tags: ["Relatórios e estudos", "Avaliação", "Governança de IA"],
    summary: "Relatório com séries e dados públicos sobre desempenho técnico, adoção, economia e governança de IA.",
    decision: "Consulte quando precisar de evidência para uma decisão ou apresentação que ultrapasse os resultados de um único fornecedor. Os capítulos separam o desempenho em benchmarks de adoção e de impactos na sociedade.",
    action: "Escolha uma pergunta, como o quanto um benchmark melhorou entre duas edições. Abra o capítulo e a base pública, confirme a definição da métrica e guarde a fonte e a janela do dado ao citar o resultado.",
    limits: "As coletas e medições variam por capítulo. Um avanço num teste público pode ter pouco efeito no seu produto. Inclua evidência do seu contexto antes de tomar decisões de adoção.",
    sources: sources(["Relatório 2026 e capítulos", "https://hai.stanford.edu/ai-index/2026-ai-index-report"], ["Programa de pesquisa e dados públicos", "https://hai.stanford.edu/ai-index"]),
  },
  {
    slug: "gemini-4-hydrogen-novembro-2026", title: "Google lança Gemini 4 Hydrogen para tarefas do dia a dia", kind: "novidades", eventDate: "2026-11-12",
    creator: { name: "Google Gemini", handle: "google-gemini", remoteAvatar: true }, tags: ["Gemini", "Modelos", "Produtividade", "Programação"],
    summary: "O Google anunciou o Gemini 4 Hydrogen para trabalho cotidiano, programação e fluxos com agentes, com distribuição pelo aplicativo e pela API.",
    decision: "Para quem usa o Gemini, o lançamento traz um modelo voltado a tarefas que precisam de resposta rápida. Para quem desenvolve, a mudança permite comparar Hydrogen com os modelos já usados em extração, classificação, pesquisa e geração de código.",
    action: "Teste uma tarefa frequente com as mesmas entradas e configurações. Compare tempo de resposta, acurácia em português, citações e quantidade de correções. Em uma integração paga, registre o consumo e o custo de uma tarefa concluída.",
    limits: "O anúncio do Google descreve diferenças de acordo com produto, plano e níveis de raciocínio. Métricas divulgadas pelo fornecedor devem ser comparadas com o uso na sua região e aplicação.",
    sources: sources(["Google · anúncio de 12 de novembro", hydrogenAnnouncement], ["Google AI Studio · documentação", "https://aistudio.google.com/docs/"]),
  },
  {
    slug: "microsoft-mai-imagem-voz-novembro-2026", title: "Microsoft amplia família MAI com imagem, voz e transcrição", kind: "novidades", eventDate: "2026-11-17",
    creator: { name: "Microsoft AI", handle: "microsoft", remoteAvatar: true }, tags: ["Modelos", "Imagem", "Áudio", "Transcrição", "Microsoft Foundry"],
    summary: "A Microsoft apresentou MAI Image 2.7 e Flash para imagem e edição, MAI Realtime 1 para conversas ao vivo e MAI Transcribe 2 para transcrição.",
    decision: "A atualização interessa a quem compara fornecedores por mídia. Imagem e edição têm critérios diferentes de voz em tempo real e de transcrição de gravações. A publicação da Microsoft informa canais de acesso distintos de acordo com o modelo.",
    action: "Para imagem, prepare um conjunto com instruções de edição, texto localizado e consistência visual. Para voz, meça primeiras respostas, interrupções e retomadas. Em transcrição, compare sotaques, nomes e pontuação com um gabarito revisado.",
    limits: "Confira disponibilidade e condições por produto e região antes de integrar. A Microsoft também anunciou um programa separado para pesos licenciados, destinado a clientes elegíveis. Verifique os termos de distribuição para cada modelo.",
    sources: sources(["Microsoft AI · novidades de modelos no Ignite", "https://microsoft.ai/news/microsoft-ignite-2026/"], ["Microsoft · anúncio de 17 de novembro", "https://blogs.microsoft.com/blog/2026/11/17/ignite-2026-building-the-frontier-ecosystem/"]),
  },
] satisfies AIDraft[]).map(aiEntry);
