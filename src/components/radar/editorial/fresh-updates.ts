import type { RecordDraft } from "../content";
import { creator, guide, sources } from "./helpers";

export const freshUpdates = [
  {
    slug: "ag-ui-langgraph-novembro-2026", area: "ia", kind: "novidades", title: "AG-UI atualiza a integração com LangGraph", eventDate: "2026-11-21",
    summary: "A publicação do adaptador TypeScript inclui uma opção de durabilidade para as execuções com LangGraph.",
    creator: creator("AG-UI Protocol", "ag-ui-protocol", "ag-ui"), tags: ["Agentes", "LangGraph", "AG-UI", "Streaming"],
    sources: sources(["Notas e versões dos pacotes", "https://github.com/ag-ui-protocol/ag-ui/releases/tag/release/2026-11-21"]),
    sections: guide("A versão 0.0.47 do adaptador @ag-ui/langgraph passa uma configuração de durabilidade às execuções. As notas descrevem a integração com os pontos de controle da execução.", "Se você usa LangGraph com uma interface que acompanha o estado de tarefas, simule uma interrupção e verifique o que é retomado e o que aparece para a pessoa usuária.", "O anúncio se refere ao adaptador TypeScript citado. Fixe e confirme a versão de cada integração usada num ambiente real."),
  },
  {
    slug: "kimi-code-desktop-1-4-2", area: "ia", kind: "novidades", title: "Kimi Code Desktop 1.4.2 corrige a aplicação de uma preferência", eventDate: "2026-11-20",
    summary: "A versão corrige a preferência de esforço de raciocínio quando um rascunho herda a opção global.",
    creator: creator("Moonshot AI", "MoonshotAI", "kimi-code"), tags: ["Kimi", "Agentes de código", "Desktop"],
    sources: sources(["Notas da versão Desktop", "https://github.com/MoonshotAI/kimi-code/releases/tag/kimi-code-desktop%401.4.2"], ["Repositório ativo do Kimi Code", "https://github.com/MoonshotAI/kimi-code"]),
    sections: guide("O erro descrito no release afetava o envio de um rascunho cuja preferência de raciocínio vinha da configuração global. O envio podia acabar usando o padrão do modelo.", "Se você usa a aplicação Desktop, confira se uma nova sessão conserva a opção escolhida. Isso importa ao comparar qualidade e custo de respostas em tarefas semelhantes.", "A correção é da versão Desktop anunciada. O repositório antigo kimi-cli está arquivado e possui seu próprio histórico."),
  },
  {
    slug: "zizmor-1-33-1", area: "ciberseguranca", kind: "novidades", title: "zizmor 1.33.1 amplia a cobertura em workflows com serviços", eventDate: "2026-11-22",
    summary: "A análise volta a cobrir um caso em que o corpo de services é definido por uma expressão no GitHub Actions.",
    creator: creator("zizmor", "zizmorcore", "zizmor"), tags: ["CI", "GitHub Actions", "Revisão defensiva"],
    sources: sources(["Release 1.33.1", "https://github.com/zizmorcore/zizmor/releases/tag/v1.33.1"], ["Documentação oficial", "https://docs.zizmor.sh/"]),
    sections: guide("As notas registram uma correção para entradas que antes deixavam de ser analisadas quando o campo services era uma expressão.", "Se seus workflows usam essa forma de configuração, atualize a ferramenta de auditoria em um PR separado. Compare a cobertura e revise achados recém-detectados.", "A atualização melhora a análise do workflow. Permissões e configuração do repositório ainda exigem verificação no ambiente em que o CI roda."),
  },
  {
    slug: "openssf-scorecard-5-7", area: "ciberseguranca", kind: "novidades", title: "OpenSSF Scorecard 5.7 considera releases imutáveis", eventDate: "2026-11-19",
    summary: "A revisão passa a incorporar releases imutáveis nas verificações de releases assinados e dependências fixadas.",
    creator: creator("OpenSSF", "ossf", "scorecard"), tags: ["Cadeia de suprimentos", "Dependências", "Releases"],
    sources: sources(["Notas do Scorecard 5.7.0", "https://github.com/ossf/scorecard/releases/tag/v5.7.0"]),
    sections: guide("A imutabilidade de um release é um sinal adicional para duas verificações do Scorecard. Ela ajuda a explicar mudanças de pontuação entre execuções com versões diferentes da ferramenta.", "Se o Scorecard orienta sua seleção de dependências, compare as verificações individuais antes e depois do upgrade. Registre quais indicadores mudaram e por qual regra.", "A imutabilidade também precisa ser interpretada junto à origem do código e às assinaturas ou atestações que sua equipe exige."),
  },
  {
    slug: "penpot-2-19-4", area: "design-desenvolvimento", kind: "novidades", title: "Penpot 2.19.4 corrige importação de arquivos grandes", eventDate: "2026-11-23",
    summary: "A atualização de manutenção corrige um problema de importação de arquivos .penpot de grande porte no Chrome.",
    creator: creator("Penpot", "penpot", "penpot"), tags: ["Design", "Prototipagem", "Importação"],
    sources: sources(["Notas da versão", "https://github.com/penpot/penpot/releases/tag/2.19.4"]),
    sections: guide("O release resolve um caso de importação de arquivos grandes no Chrome. A correção interessa a quem migra ou restaura documentos com várias páginas e componentes.", "Teste a importação em um projeto separado com uma cópia de um arquivo grande. Compare quantidade de páginas, componentes e mídias antes de usar o processo em uma migração.", "A mudança é de importação. Reserve tempo para conferir fontes, vínculos e componentes no arquivo restaurado."),
  },
  {
    slug: "hyperframes-0-9-85", area: "design-desenvolvimento", kind: "novidades", title: "HyperFrames 0.9.85 ajusta edição e prévias do Studio", eventDate: "2026-11-23",
    summary: "A versão melhora a integração de prévias do Studio e corrige comportamentos de desfazer e redimensionar.",
    creator: creator("HeyGen", "heygen-com", "hyperframes"), tags: ["Motion", "Vídeo programático", "Studio"],
    sources: sources(["Notas da versão", "https://github.com/heygen-com/hyperframes/releases/tag/v0.9.85"]),
    sections: guide("As notas indicam que aplicações que incorporam o Studio podem obter a marcação de uma prévia selada. Também há ajustes de edição para importação e redimensionamento.", "Em um projeto que incorpora o Studio, compare a edição e a prévia com um material de teste antes de atualizar. Verifique especialmente desfazer uma ação feita após a importação.", "A série 0.x pode mudar rápido. Fixe a versão que produziu o projeto e confira fontes, mídia e formato do vídeo na renderização final."),
  },
  {
    slug: "docker-compose-5-8", area: "design-desenvolvimento", kind: "novidades", title: "Docker Compose 5.8 adiciona jobs agendados", eventDate: "2026-11-17",
    summary: "O Compose passa a descrever tarefas pontuais que podem rodar por agendamento com Engine e extensão compatíveis.",
    creator: creator("Docker", "docker", "compose"), tags: ["Docker", "Containers", "Compose", "Automação"],
    sources: sources(["Lançamento Compose 5.8.0", "https://github.com/docker/compose/releases/tag/v5.8.0"], ["Docker Engine 29", "https://docs.docker.com/engine/release-notes/29/"]),
    sections: guide("A nova versão documenta tarefas declaradas em jobs. O agendamento depende do Engine 29.10 ou posterior e da extensão correspondente, que vem desativada por padrão.", "Avalie um job benigno de relatório em um ambiente de teste. Confirme logs, política de repetição e previsão de horário antes de transferir uma rotina operacional.", "A compatibilidade depende da versão do serviço que executa a tarefa. Para implantação distribuída, confira como seu ambiente lida com repetição e perda de conexão."),
  },
  {
    slug: "fedora-45", area: "design-desenvolvimento", kind: "novidades", title: "Fedora Linux 45 chega às edições oficiais", eventDate: "2026-11-03",
    summary: "O Fedora Project publicou a edição 45, com mudanças em desktop, ferramentas e diversas variantes da distribuição.",
    creator: { name: "Fedora Project" }, tags: ["Linux", "Distro", "Desktop", "Infraestrutura"],
    sources: sources(["Anúncio oficial do Fedora Project", "https://fedoramagazine.org/announcing-fedora-linux-45/"], ["Documentação das versões", "https://docs.fedoraproject.org/en-US/releases/"]),
    sections: guide("O anúncio reúne mudanças das diferentes edições. Use o recorte da edição que você efetivamente instala, como Workstation, Server ou um desktop atômico.", "Valide rede, armazenamento, periféricos e ferramentas de trabalho numa máquina de teste. Registre também o procedimento de recuperação para a versão atual.", "A mudança de versão do sistema pode afetar extensões e dependências de terceiros. Confira as notas da edição e os mantenedores dos complementos críticos."),
  },
] satisfies RecordDraft[];
