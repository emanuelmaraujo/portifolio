import type { RecordDraft } from "../content";
import { creator, guide, sources } from "./helpers";

export const updates = [
  {
    slug: "openbot-1-1-3", area: "ia", kind: "novidades", title: "OpenBot da CopilotKit 1.1.3 amplia os controles por organização", eventDate: "2026-11-21",
    summary: "A versão estável traz mudanças no vínculo com o Intelligence, nos espaços de aprendizagem e na trilha de auditoria.",
    creator: creator("CopilotKit", "CopilotKit", "OpenBot"), tags: ["Agentes", "Self-host", "Governança"],
    sources: sources(["Notas da versão 1.1.3", "https://github.com/CopilotKit/OpenBot/releases/tag/v1.1.3"], ["Licenciamento", "https://github.com/CopilotKit/OpenBot#open-source-local-operation-and-licensing"]),
    sections: guide("O release documenta mudanças no esquema de dados para ligar organizações aos respectivos espaços e credenciais no Intelligence e registrar eventos de auditoria da instalação.", "Se você já opera OpenBot em equipe, confira backup e preparação das migrações. Revalide a separação entre organizações e a visibilidade das ações com usuários de teste.", "A migração é parte da atualização. Consulte os requisitos da versão e confirme os termos do componente Intelligence para o seu ambiente."),
  },
  {
    slug: "cezar-0-20", area: "ia", kind: "novidades", title: "Cezar 0.20 introduz o modo Manager", eventDate: "2026-11-15",
    summary: "Agentes gerenciadores acompanham tarefas e encaminham decisões, com configuração de leitura ou escrita por repositório.",
    creator: creator("Open Mercato", "open-mercato", "cezar"), tags: ["Agentes", "Orquestração", "Revisão"],
    sources: sources(["Notas da versão 0.20.0", "https://github.com/open-mercato/cezar/releases/tag/v0.20.0"]),
    sections: guide("O release adiciona um modo para coordenar tarefas e acompanhar itens que aguardam ação humana. O projeto também descreve como as permissões são configuradas por repositório.", "Experimente um projeto público com permissões de leitura. Peça um levantamento de documentação e confira se toda a saída aponta para tarefas, fontes ou artefatos que você consegue auditar.", "A matriz de suporte depende do runner e do modo de execução. Leia as notas antes de habilitar automações em código privado."),
  },
  {
    slug: "wazuh-4-14-11-rc2", area: "ciberseguranca", kind: "novidades", title: "Wazuh publica a segunda prévia da versão 4.14.11", eventDate: "2026-11-18",
    summary: "O release candidate inclui melhorias de validação no manager e ajustes no fluxo de cadastro de agentes.",
    creator: creator("Wazuh", "wazuh", "wazuh"), tags: ["SIEM", "Telemetria", "Prévia"],
    sources: sources(["Notas da prévia", "https://github.com/wazuh/wazuh/releases/tag/v4.14.11-rc2"], ["Documentação de upgrade", "https://documentation.wazuh.com/current/upgrade-guide/index.html"]),
    sections: guide("A prévia descreve alterações de validação no manager, tratamento de erros no cluster e uma correção no processo de cadastro de agentes.", "Em homologação, valide cadastro, reconexão e chegada de eventos. Compare sinais de saúde e alertas com a versão usada no seu ambiente.", "A edição é um release candidate. Para produção, acompanhe a publicação estável e confira compatibilidade e recuperação antes da mudança."),
  },
  {
    slug: "trivy-0-76-2", area: "ciberseguranca", kind: "novidades", title: "Trivy 0.76.2 atualiza imagens e dependências", eventDate: "2026-11-05",
    summary: "A atualização defensiva reconstrói as imagens oficiais com uma base Alpine atualizada e novas versões de bibliotecas.",
    creator: creator("Aqua Security", "aquasecurity", "trivy"), tags: ["DevSecOps", "Dependências", "Correções"],
    sources: sources(["Comunicado da versão", "https://github.com/aquasecurity/trivy/releases/tag/v0.76.2"]),
    sections: guide("O comunicado lista correções em dependências incorporadas ao scanner e à imagem usada para executá-lo. As recomendações abrangem atualizar a versão e redistribuir as imagens.", "Localize onde a ferramenta é utilizada no CI, revise pins e imagens derivadas e valide a atualização examinando o inventário de componentes da versão instalada.", "A ficha cobre a versão anunciada. Consulte o repositório e a política interna antes de selecionar a edição que será implantada."),
  },
  {
    slug: "storybook-10-6-8", area: "design-desenvolvimento", kind: "novidades", title: "Storybook 10.6.8 melhora o pré-carregamento de stories", eventDate: "2026-11-20",
    summary: "A manutenção melhora o pré-carregamento no Manager e inclui o grafo completo do bundler Vite nas estatísticas da prévia.",
    creator: creator("Storybook", "storybookjs", "storybook"), tags: ["Componentes", "Storybook", "Performance", "Vite"],
    sources: sources(["Notas da versão", "https://github.com/storybookjs/storybook/releases/tag/v10.6.8"], ["Documentação do builder Vite", "https://storybook.js.org/docs/builders/vite"]),
    sections: guide("A edição inclui melhorias na navegação entre histórias e nas informações sobre a prévia produzida pelo builder Vite.", "Se você mantém uma biblioteca com muitas histórias, compare navegação entre estados e tempo de abertura das páginas antes e depois da atualização, usando a mesma máquina e o mesmo projeto.", "As estatísticas adicionadas dizem respeito ao builder Vite. Meça o seu caso para saber se existe ganho relevante para a equipe."),
  },
  {
    slug: "nextjs-16-4-6", area: "design-desenvolvimento", kind: "novidades", title: "Next.js 16.4.6 recebe correções por backport", eventDate: "2026-11-09",
    summary: "A versão de manutenção inclui ajustes no Turbopack em desenvolvimento e compressão para respostas de route handlers.",
    creator: creator("Vercel", "vercel", "next.js"), tags: ["Next.js", "React", "Performance"],
    sources: sources(["Notas da versão", "https://github.com/vercel/next.js/releases/tag/v16.4.6"]),
    sections: guide("As notas listam correções selecionadas para a linha 16.4. Entre elas estão mudanças no coletor de memória do ambiente de desenvolvimento e no tratamento de respostas de rotas.", "Para projetos já nessa linha, execute build, testes de rotas e uma revisão de cabeçalhos HTTP em uma prévia. Em situações com proxy, verifique se a compressão está sendo aplicada no ponto esperado.", "O release é de manutenção da série 16.4. Planeje separadamente uma eventual migração de versão principal."),
  },
] satisfies RecordDraft[];
