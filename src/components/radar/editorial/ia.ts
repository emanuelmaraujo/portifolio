import type { RecordDraft } from "../content";
import { creator, guide, sources } from "./helpers";

export const ai = [
  {
    slug: "cezar", area: "ia", kind: "projetos", title: "Cezar",
    summary: "Orquestre sessões de agentes de código como Codex e Claude Code com acompanhamento e revisão de cada etapa.",
    creator: creator("Open Mercato", "open-mercato", "cezar"), license: "MIT", tags: ["Agentes", "Orquestração", "Revisão"], featured: true,
    sources: sources(["Repositório oficial", "https://github.com/open-mercato/cezar"], ["Site oficial", "https://cezar.run/"]),
    sections: guide("Cezar reúne sessões e fluxos de agentes de desenvolvimento em uma interface de operação. É uma referência para coordenar trabalhos que precisam de entradas, artefatos e decisões rastreáveis.", "Use um piloto de documentação. Uma etapa levanta fontes, outra escreve e uma terceira revisa o diff usando os critérios do pedido original. Registre quais sessões deram evidência para a decisão.", "Ambiente, credenciais, isolamento e permissões continuam dependendo da configuração de quem opera. Compare o tempo de revisão com o de um fluxo de agente único."),
  },
  {
    slug: "openbot-copilotkit", area: "ia", kind: "ferramentas", title: "OpenBot da CopilotKit",
    summary: "Workspace auto-hospedável para reunir agentes, modelos e ferramentas sob controles de acesso e auditoria.",
    creator: creator("CopilotKit", "CopilotKit", "OpenBot"), license: "MIT no template · Intelligence com licença própria", tags: ["Agentes", "Orquestração", "MCP", "Self-host"],
    sources: sources(["Licenciamento e arquitetura", "https://github.com/CopilotKit/OpenBot#open-source-local-operation-and-licensing"], ["Recursos oficiais", "https://open.bot/resources"]),
    sections: guide("O template fornece o espaço de trabalho para agentes persistentes. A documentação trata a aplicação e o componente CopilotKit Intelligence como partes com condições de licenciamento próprias.", "Avalie um fluxo restrito a consultar documentos públicos e montar um rascunho. Trace quais recursos o agente acessa e em que momento a ação pede aprovação.", "Antes de um uso em equipe, confirme quais componentes precisam operar na sua infraestrutura e leia as condições de licença de cada um."),
  },
  {
    slug: "langgraph", area: "ia", kind: "repositorios", title: "LangGraph",
    summary: "Biblioteca para montar fluxos de agentes com estado, ramificações e pontos de interrupção para revisão.",
    creator: creator("LangChain", "langchain-ai", "langgraph"), license: "MIT", tags: ["Agentes", "Orquestração", "Python", "Padrões e frameworks"], level: "Intermediário",
    sources: sources(["Repositório oficial", "https://github.com/langchain-ai/langgraph"], ["Documentação", "https://docs.langchain.com/oss/python/langgraph/overview"], ["Persistência e checkpoints", "https://docs.langchain.com/oss/python/langgraph/persistence"]),
    sections: [
      { title: "O que o grafo modela", body: "Modele como nós as partes da execução que precisam tomar uma decisão ou atualizar dados. O estado torna explícito o que passa entre uma busca, uma resposta e sua revisão. A persistência preserva resultados intermediários e ajuda a retomar o fluxo em um ponto conhecido." },
      { title: "Quando vale o custo", body: "Use um grafo quando a ordem varia de acordo com o resultado, quando a execução precisa pausar para revisão humana ou quando recomeçar do zero é caro. Um procedimento curto com começo e fim previsíveis pode ficar mais fácil de acompanhar numa sequência simples de funções." },
      { title: "Piloto de revisão", body: "Modele coleta, síntese e revisão. Faça a revisão rejeitar um rascunho e verifique se o fluxo retorna ao ponto correto, preserva as fontes já recuperadas e produz a justificativa da mudança. Defina de antemão quais partes podem ser repetidas e quais ações precisam de uma identificação que impeça duplicação." },
      { title: "Como saber se funciona", body: "Exercite o caso de sucesso, uma falha no serviço externo e uma retomada após pausa. Compare o histórico com os estados esperados e confirme se a equipe consegue explicar por que tomou cada caminho sem depender da resposta final do modelo." },
    ],
  },
  {
    slug: "ollama", area: "ia", kind: "projetos", title: "Ollama",
    summary: "Uma forma prática de executar e comparar modelos de linguagem no seu computador.",
    creator: creator("Ollama", "ollama", "ollama"), license: "MIT no runtime · pesos com licenças próprias", tags: ["Modelos locais", "Inferência", "LLM"],
    sources: sources(["Repositório oficial", "https://github.com/ollama/ollama"], ["Documentação", "https://docs.ollama.com/"]),
    sections: [
      { title: "Runtime, pesos e aplicação", body: "Ollama facilita distribuir e executar modelos por linha de comando ou API. O runtime é a camada que carrega pesos e serve a resposta. A variante selecionada determina o que ela consegue receber e devolver, como texto, imagem ou embeddings. Registre a revisão e quantização do modelo, além da versão do runtime." },
      { title: "Quando a execução local ajuda", body: "Um piloto local é útil para comparar modelos em um equipamento real, entender a latência sem rede e prototipar com controle sobre o ambiente. Avalie outra forma de servir o modelo quando várias pessoas precisarem usar o sistema ao mesmo tempo ou quando o tamanho do modelo ultrapassar o que a máquina consegue executar." },
      { title: "Comparação reproduzível", body: "Use as mesmas perguntas em português, parâmetros de geração e arquivos públicos em duas variantes. Separe a primeira execução, que pode carregar o modelo, das seguintes. Registre tempo até o primeiro token, uso de memória e um erro concreto de cada resultado. Inclua um contexto longo se esse for o cenário de uso." },
      { title: "Custo e licenciamento", body: "Identifique se é possível atender o volume esperado com a memória e disponibilidade do equipamento. Confira a licença do runtime e de cada checkpoint separadamente e verifique quais chamadas da aplicação vão para o processo local." },
    ],
  },
  {
    slug: "agent-skills", area: "ia", kind: "skills", title: "Agent Skills",
    summary: "Formato aberto para empacotar instruções e recursos reutilizáveis em torno de uma tarefa.",
    creator: creator("Agent Skills", "agentskills", "agentskills"), tags: ["Skills", "SKILL.md", "Agentes"],
    sources: sources(["Especificação oficial", "https://agentskills.io/specification"], ["Repositório do padrão", "https://github.com/agentskills/agentskills"]),
    sections: guide("A descrição de uma skill ajuda o agente a escolher quando usar as instruções. O corpo do SKILL.md orienta a tarefa e pode remeter a recursos que só são abertos quando necessários.", "Escreva um procedimento curto para conferir fontes de uma ficha. Teste com uma referência completa, outra incompleta e uma tarefa fora de escopo.", "O runtime decide como disponibilizar a skill e quais permissões valem para os recursos. Revisionar instruções e scripts antes de instalar reduz o risco de executar comportamento inesperado."),
  },
  {
    slug: "anthropic-skill-creator", area: "ia", kind: "skills", title: "Skill Creator",
    summary: "Fluxo de autoria e avaliação de skills com tarefas reais e comparação entre versões.",
    creator: creator("Anthropic", "anthropics", "skills/tree/main/skills/skill-creator"), tags: ["Skills", "Avaliação", "Agentes"], level: "Intermediário",
    sources: sources(["Skill oficial no GitHub", "https://github.com/anthropics/skills/tree/main/skills/skill-creator"], ["Formato Agent Skills", "https://agentskills.io/specification"]),
    sections: guide("O material reúne instruções para transformar um procedimento em skill, observar seu uso e ajustar a descrição ou as instruções a partir de evidência.", "Escolha três tarefas que exigem o procedimento e duas que parecem próximas. Guarde as respostas e avalie se houve ganho de cobertura, fidelidade e consistência.", "Uma descrição que casa com muitas tarefas pode ativar o procedimento fora do escopo. Compare custo e saída em um conjunto reservado de casos."),
  },
  {
    slug: "qwen3-4b", area: "ia", kind: "modelos", title: "Qwen3-4B",
    summary: "Modelo de geração de texto para explorar inferência local, qualidade em português e limites de modelos compactos.",
    creator: creator("Qwen", "QwenLM", "Qwen3"), license: "Apache-2.0 na variante Qwen3-4B", tags: ["Modelos locais", "Geração de texto", "LLM"], level: "Intermediário",
    sources: sources(["Ficha do modelo", "https://huggingface.co/Qwen/Qwen3-4B"], ["Projeto Qwen3", "https://github.com/QwenLM/Qwen3"]),
    sections: [
      { title: "Quando avaliar um modelo de 4B", body: "Um checkpoint compacto é um ponto de partida para testar inferência em um equipamento próprio e tarefas bem delimitadas, como resumo de texto ou extração de campos. Para decisões com dependências longas ou consequência operacional, inclua um modelo maior como referência e planeje revisão humana conforme o risco." },
      { title: "Como preparar uma comparação justa", body: "Fixe a variante, a revisão dos pesos, o runtime, a quantização e o formato da conversa indicado pelo mantenedor. Use o mesmo conjunto de entradas em português nos modelos comparados. Inclua resumos com fatos obrigatórios, extração com esquema fixo e perguntas em que faltam dados para responder." },
      { title: "Como interpretar a evidência", body: "Registre o tempo até o primeiro token, o pico de memória e a taxa de tarefas corretas por categoria. Inclua uma resposta que perdeu um fato, inventou informação ou quebrou o formato. Compare separadamente a latência de carregamento inicial e as chamadas seguintes. Repita o teste se mudar quantização ou backend." },
    ],
  },
  {
    slug: "bge-m3", area: "ia", kind: "modelos", title: "BGE-M3",
    summary: "Modelo multilíngue de embeddings para comparar recuperação de trechos por significado e termos.",
    creator: creator("BAAI · FlagOpen", "FlagOpen", "FlagEmbedding"), license: "MIT conforme a ficha do modelo", tags: ["RAG", "Busca semântica", "Embeddings"], level: "Intermediário",
    sources: sources(["Ficha do modelo", "https://huggingface.co/BAAI/bge-m3"], ["Código FlagEmbedding", "https://github.com/FlagOpen/FlagEmbedding"]),
    sections: [
      { title: "O que testar na recuperação", body: "BGE-M3 oferece representações densas, esparsas e multivetoriais. Uma busca densa pode aproximar paráfrases. Sinais por termos ajudam quando a consulta contém siglas, códigos ou nomes específicos. Use uma busca lexical simples como ponto de comparação antes de acrescentar novas etapas." },
      { title: "Monte uma amostra representativa", body: "Liste perguntas em português e indique o documento ou trecho que sustenta cada resposta. Misture nomes exatos, expressões equivalentes e perguntas sem evidência no acervo. Fixe a divisão dos documentos, a versão do índice e a quantidade de resultados para comparar as técnicas." },
      { title: "Meça antes de ligar o gerador", body: "Para cada pergunta com fonte conhecida, confira se o trecho correto está entre os primeiros resultados. Registre a posição, a latência e os casos em que apareceu um trecho parecido, mas insuficiente. Se duas buscas recuperam evidência com frequência semelhante, compare custo de memória e esforço operacional antes de escolher." },
      { title: "Diagnóstico de erros", body: "Se a fonte não aparece em nenhuma abordagem, confira se o documento está indexado e se o trecho preserva a informação necessária. Se a fonte aparece mas a resposta final não a usa, investigue a montagem do contexto e a geração antes de trocar o modelo de recuperação." },
    ],
  },
  {
    slug: "trilha-engenharia-ia", area: "ia", kind: "estudos", title: "Trilha de Engenharia de IA",
    summary: "Do primeiro conjunto de avaliação a um fluxo com recuperação, ferramentas e supervisão humana.",
    creator: { name: "Curadoria de Emanuel Araújo" }, tags: ["RAG", "Avaliação", "Agentes", "Aprendizagem"],
    sources: sources(["Paper de RAG", "https://arxiv.org/abs/2005.11401"], ["Hugging Face Learn", "https://huggingface.co/learn"], ["Arquitetura MCP", "https://modelcontextprotocol.io/docs/learn/architecture"]),
    sections: [
      { title: "Fundamentos e avaliação", body: "Defina dez perguntas e descreva a resposta esperada, inclusive casos sem informação suficiente. Compare um modelo em duas versões de prompt e registre erros por categoria." },
      { title: "Busca e geração", body: "Adicione documentos de um tema pequeno. Meça primeiro quais trechos são encontrados. Depois verifique se cada afirmação na resposta pode ser sustentada por esses trechos." },
      { title: "Skills, ferramentas e agentes", body: "Transforme a revisão em uma skill, experimente um único recurso MCP de leitura e desenhe um ponto de aprovação após o rascunho. Entregue um registro da execução e um caso de falha recuperável." },
    ],
  },
  {
    slug: "como-funciona-rag", area: "ia", kind: "laboratorios", title: "RAG por dentro", demo: "rag",
    summary: "Acompanhe a pergunta até a resposta e descubra o que acontece quando a busca deixa a evidência de fora.",
    creator: { name: "Emanuel Araújo" }, tags: ["RAG", "Busca semântica", "Citações"], featured: true,
    sources: sources(["Paper de Lewis et al.", "https://arxiv.org/abs/2005.11401"], ["BGE-M3 · exemplo de recuperação", "https://huggingface.co/BAAI/bge-m3"], ["Como organizar avaliações", "https://developers.openai.com/api/docs/guides/evals"]),
    sections: [
      { title: "O caminho da consulta até a resposta", body: "Um sistema RAG recupera informações relevantes para a pergunta e coloca os trechos selecionados no contexto de geração. O índice depende de como você divide os documentos e registra sua origem. A resposta fica mais fácil de conferir quando a aplicação preserva o documento, o trecho e a versão usados em cada afirmação relevante." },
      { title: "Quando usar uma camada de recuperação", body: "A abordagem ajuda quando respostas dependem de um acervo que muda ou quando é importante apontar fontes. Em um conjunto pequeno e estável de informações, experimente fornecer os próprios documentos diretamente e use esse resultado como referência. Se a pergunta se resolve com uma consulta estruturada a um campo exato, compare com uma busca tradicional." },
      { title: "O que observar na demonstração", body: "A pergunta sobre o horário exige duas informações no acervo. Altere quantos trechos entram na geração e veja quando a resposta fica incompleta. Em seguida, pergunte sobre estacionamento. Nesse caso, aumentar o número de trechos não produz uma boa resposta porque a informação não foi registrada. A demonstração usa ordenação fixa para isolar a diferença entre falha de busca e ausência de dados." },
      { title: "Como medir em um acervo real", body: "Monte perguntas com fonte conhecida, perguntas ambíguas e perguntas sem resposta no material. Primeiro verifique se a evidência esperada foi recuperada. Depois confira se ela chegou ao contexto e se a resposta cita o trecho que sustenta a afirmação. Guarde resultados por etapa para saber se o ajuste deve ser na indexação, na busca, no contexto ou no gerador." },
    ],
  },
  {
    slug: "como-funcionam-skills", area: "ia", kind: "laboratorios", title: "Anatomia de uma Skill", demo: "skills",
    summary: "Veja como o agente escolhe um procedimento, carrega instruções e checa a entrega.",
    creator: { name: "Emanuel Araújo" }, tags: ["Skills", "SKILL.md", "Agentes"],
    sources: sources(["Especificação Agent Skills", "https://agentskills.io/specification"], ["Exemplos de skills", "https://github.com/anthropics/skills"]),
    sections: guide("Uma skill documenta uma tarefa reutilizável. A descrição ajuda na descoberta, o arquivo principal carrega as instruções e recursos adicionais aprofundam pontos específicos.", "Alterne entre verificar uma referência e revisar uma interface. Observe como o procedimento adequado muda a evidência esperada antes de entregar.", "A skill orienta o processo. Permissões e validação precisam ser aplicadas pelo ambiente de execução."),
  },
  {
    slug: "como-funciona-mcp", area: "ia", kind: "laboratorios", title: "O caminho de uma chamada MCP", demo: "mcp",
    summary: "Siga a solicitação entre host, cliente e servidor e compare um acesso permitido com um pedido bloqueado.",
    creator: { name: "Emanuel Araújo" }, tags: ["MCP", "Agentes", "Permissões"],
    sources: sources(["Arquitetura oficial", "https://modelcontextprotocol.io/docs/learn/architecture"], ["Repositório do protocolo", "https://github.com/modelcontextprotocol/modelcontextprotocol"]),
    sections: guide("O host abriga a aplicação de IA e gerencia conexões via clientes. O servidor oferece capacidades como recursos e ferramentas, conforme a integração.", "Peça a leitura de uma ficha de acervo e acompanhe quem descobre, autoriza e devolve o resultado. Depois envie o pedido de escrita que a política do exemplo barra.", "A regra de acesso do laboratório é ilustrativa. Em uma implantação, a política e os escopos precisam corresponder ao risco do recurso e às permissões reais."),
  },
] satisfies RecordDraft[];
