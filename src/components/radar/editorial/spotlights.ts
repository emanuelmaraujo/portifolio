import type { RecordDraft } from "../content";
import { creator, sources } from "./helpers";

const nightly = { ...creator("Nightly Labs", "nightly-labs", "openbot"), remoteAvatar: true };

export const nightshift = [
  {
    slug: "openbot", area: "ia", kind: "ferramentas", title: "OpenBot · Nightly Labs",
    summary: "Workspace de desktop local-first para organizar sessões de agentes em espaços de trabalho, filas e conversas persistentes.",
    creator: nightly, license: "PolyForm Noncommercial 1.0.0 na versão atual · até 0.1.11 sob Apache-2.0", tags: ["Agentes e orquestração", "Agentes", "Desktop", "OpenBot"], featured: true,
    sources: sources(["Repositório da Nightly Labs", "https://github.com/nightly-labs/openbot"], ["Licença e versões anteriores", "https://github.com/nightly-labs/openbot#license-and-attribution"], ["Site do projeto", "https://openbot.run/"], ["Discussão da comunidade no Reddit", "https://www.reddit.com/r/BestGitHubRepos/comments/1xiddcg/openbot_a_localfirst_desktop_workspace_for/"]),
    sections: [
      { title: "Para quem faz sentido", body: "Para quem gerencia várias sessões de agentes no desktop e precisa separar arquivos, tarefas e conversas. O workspace ajuda a retomar uma tarefa e a encontrar os artefatos deixados pelo agente. Local-first descreve a organização do trabalho. O processamento pode depender do provedor que você conecta." },
      { title: "Como se compara ao Cezar", body: "Use OpenBot como candidato quando a prioridade é acompanhar agentes persistentes em um workspace pessoal. Avalie Cezar quando a necessidade principal é coordenar sessões de agentes de código com tarefas, revisão e um fluxo de execução em servidor." },
      { title: "Primeiro teste", body: "Crie um workspace para um projeto público ou fictício. Configure apenas um provedor, separe duas tarefas curtas e simule uma interrupção. Confira se você consegue retomar o histórico, localizar o diff e revisar as permissões após reabrir o aplicativo." },
      { title: "Licença e limites", body: "O repositório atual é de código disponível com restrição comercial. O mantenedor indica que as versões até 0.1.11 seguem Apache-2.0. Verifique o texto da licença da versão selecionada, as condições do provedor conectado e o escopo de ferramentas liberadas antes de usar em equipe." },
    ],
  },
  {
    slug: "openbot-nightly-0-76-1", area: "ia", kind: "novidades", title: "OpenBot da Nightly Labs 0.76.1 ajusta controle e revisão no desktop", eventDate: "2026-11-21",
    summary: "O release inclui prévia de documentos Word, acesso ao workspace pela área de arquivos e ajustes ao interromper sessões do Claude.",
    creator: nightly, tags: ["Agentes", "Desktop", "OpenBot"],
    sources: sources(["Notas do release 0.76.1", "https://github.com/nightly-labs/openbot/releases/tag/v0.76.1"], ["Repositório e licença", "https://github.com/nightly-labs/openbot#license-and-attribution"]),
    sections: [
      { title: "O que mudou", body: "As notas registram prévia de Word, acesso ao workspace pela aba Files e correção do comportamento de parada em um turno que o Claude já deixou de executar. Há também um ajuste na janela do navegador do agente." },
      { title: "O que testar", body: "Abra um arquivo de teste, encontre o workspace associado e interrompa uma tarefa simples. O objetivo é verificar se a interface reflete o estado real da sessão e mantém uma trilha de revisão." },
    ],
  },
] satisfies RecordDraft[];

const codexSkill = (name: string) => creator("OpenAI", "openai", `skills/tree/main/skills/.curated/${name}`);
const copilotSkill = (name: string) => ({ ...creator("Awesome Copilot", "github", `awesome-copilot/tree/main/skills/${name}`), remoteAvatar: true });
export const verifiedSecuritySkills = [
  {
    slug: "dependabot-skill", area: "ciberseguranca", kind: "skills", title: "Dependabot · Awesome Copilot",
    summary: "Skill para configurar atualização defensiva de dependências, agrupamento e triagem de propostas do Dependabot.",
    creator: copilotSkill("dependabot"), tags: ["Cadeia de suprimentos", "GitHub Actions", "Skills"],
    sources: sources(["Instrução SKILL.md", "https://github.com/github/awesome-copilot/blob/main/skills/dependabot/SKILL.md"], ["Documentação do Dependabot", "https://docs.github.com/en/code-security/dependabot"]),
    sections: [
      { title: "Aplicação", body: "Use para revisar os ecossistemas de dependências presentes no projeto, o intervalo de consulta e o agrupamento que facilita a revisão. Separe ajustes de segurança prioritários de atualizações de rotina." },
      { title: "Evidência esperada", body: "Confira a configuração gerada e um PR de teste. A política deve deixar claro quando a atualização exige intervenção humana e quais testes precisam passar." },
    ],
  },
  {
    slug: "secret-scanning-skill", area: "ciberseguranca", kind: "skills", title: "Secret Scanning · Awesome Copilot",
    summary: "Skill para organizar proteção contra exposição de credenciais e triagem de alertas em repositórios autorizados.",
    creator: copilotSkill("secret-scanning"), tags: ["Identidade e segredos", "Prevenção", "Skills"],
    sources: sources(["Instrução SKILL.md", "https://github.com/github/awesome-copilot/blob/main/skills/secret-scanning/SKILL.md"], ["Guia do GitHub", "https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning"]),
    sections: [
      { title: "Aplicação", body: "Configure o controle em um repositório de teste e defina quem recebe e resolve alertas. Use apenas valores sintéticos nos testes de detecção." },
      { title: "Evidência esperada", body: "Documente o caminho do alerta até a revogação simulada e a verificação da correção. Preserve o registro sem copiar valores sensíveis." },
    ],
  },
  {
    slug: "security-ownership-map", area: "ciberseguranca", kind: "skills", title: "Security Ownership Map",
    summary: "Skill do Codex para verificar a cobertura de revisão e responsabilidade de código sensível pelo histórico do Git.",
    creator: codexSkill("security-ownership-map"), tags: ["Governança de segurança", "Code owners", "Skills"],
    sources: sources(["Instrução oficial SKILL.md", "https://github.com/openai/skills/blob/main/skills/.curated/security-ownership-map/SKILL.md"]),
    sections: [
      { title: "Quando usar", body: "Quando uma equipe precisa verificar se áreas como autenticação, pagamentos ou dados pessoais têm mantenedores ativos e revisão de mudanças. O histórico de contribuições ajuda a identificar riscos de continuidade." },
      { title: "O que conferir", body: "Confronte o resultado com a política CODEOWNERS e com quem aprova mudanças hoje. Exija evidência rastreável por diretório e anonimização quando os resultados saírem da equipe. Confirme mudanças de equipe antes de concluir que uma área está sem responsável." },
    ],
  },
  {
    slug: "security-threat-model", area: "ciberseguranca", kind: "skills", title: "Security Threat Model",
    summary: "Skill do Codex para documentar ativos, limites de confiança e controles de segurança de um sistema autorizado.",
    creator: codexSkill("security-threat-model"), tags: ["Segurança de aplicações", "Modelagem de ameaças", "Skills"],
    sources: sources(["Instrução oficial SKILL.md", "https://github.com/openai/skills/blob/main/skills/.curated/security-threat-model/SKILL.md"]),
    sections: [
      { title: "Quando usar", body: "Ao planejar uma integração com dados sensíveis ou revisar o desenho de uma rota autenticada. O modelo ajuda a registrar que dados atravessam cada fronteira e onde os controles são aplicados." },
      { title: "O que conferir", body: "Peça referências para cada afirmação sobre arquitetura, liste pressupostos e proponha controles verificáveis. A saída deve ajudar o time a decidir e rastrear mitigação em ambientes autorizados." },
    ],
  },
] satisfies RecordDraft[];
