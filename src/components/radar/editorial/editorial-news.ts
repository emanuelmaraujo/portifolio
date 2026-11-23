import type { RecordDraft } from "../content";
import { creator, guide, sources } from "./helpers";

export const editorialNews = [
  {
    slug: "gpt-6-2-astra-e-sol", area: "ia", kind: "novidades", featured: true, eventDate: "2026-11-17",
    title: "GPT-6.2 Astra e Sol chegam à API",
    summary: "A OpenAI lançou duas opções para raciocínio e programação. Astra é voltado a tarefas mais exigentes e Sol a fluxos em que velocidade e custo pesam mais.",
    creator: { name: "OpenAI", handle: "openai", remoteAvatar: true }, tags: ["Modelos", "OpenAI", "Avaliação"],
    sources: sources(["Notas oficiais de lançamento", "https://help.openai.com/en/articles/9624314-model-release-notes"], ["Histórico da API", "https://developers.openai.com/api/docs/changelog"]),
    sections: guide("A API aceita texto e imagens como entrada e devolve texto para os dois modelos. O changelog documenta o suporte aos endpoints Responses e Chat Completions.", "Avalie os dois modelos nas mesmas tarefas, com exemplos que já representem seu trabalho. Compare correção, tempo de resposta e custo por tarefa aprovada antes de escolher uma opção padrão.", "Consulte a documentação do endpoint e as condições de preço do seu projeto. Um ganho em tarefas de raciocínio pode ter pouco efeito numa aplicação cujo maior custo seja buscar dados ou chamar serviços externos."),
  },
  {
    slug: "microsoft-entra-passkey-primeiro-fator", area: "ciberseguranca", kind: "novidades", featured: true, eventDate: "2026-11-06",
    title: "Microsoft Entra libera passkeys como primeiro método de MFA",
    summary: "Organizações podem começar o cadastro de novos usuários com uma opção resistente a phishing. A liberação é gradual e continua até fevereiro de 2027.",
    creator: { name: "Microsoft Entra", handle: "microsoft", remoteAvatar: true }, tags: ["Identidade e segredos", "Passkeys", "Blue Team"],
    sources: sources(["Novidades oficiais do Microsoft Entra", "https://techcommunity.microsoft.com/blog/microsoft-entra-blog/what%E2%80%99s-new-in-microsoft-entra-november-2026/4556457"]),
    sections: guide("O anúncio de novembro do Entra inclui o cadastro de passkeys ou de uma opção sem senha como primeiro método de autenticação multifator. Isso muda o fluxo de entrada de novas contas nas organizações que adotarem a opção.", "Confirme a disponibilidade no seu tenant e teste o cadastro com um grupo piloto. Inclua perda de aparelho, formato de credencial aceito e recuperação da conta sem abrir uma exceção permanente na política.", "O anúncio informa um calendário de liberação progressivo. A escolha do método e as condições para exigi-lo dependem das políticas da organização."),
  },
  {
    slug: "project-zero-prazos-correcao-2026", area: "ciberseguranca", kind: "novidades", eventDate: "2026-11-13",
    title: "Google Project Zero anuncia prazos menores para divulgação",
    summary: "A política começa em 90 dias e prevê redução para 60 dias em fevereiro de 2027 e 30 dias em janeiro de 2028.",
    creator: { name: "Google Project Zero", handle: "google", remoteAvatar: true }, tags: ["Governança de segurança", "Divulgação coordenada", "Gestão de riscos"],
    sources: sources(["Anúncio oficial do Project Zero", "https://projectzero.google/2026/11/disclosure-policy.html"], ["Política vigente", "https://projectzero.google/vulnerability-disclosure-policy.html"]),
    sections: guide("O Project Zero atualizou o calendário de divulgação aplicável a falhas comunicadas por sua equipe e publicou as condições gerais da política.", "Se você mantém software, confira quem recebe avisos privados, de quem depende a aprovação de uma correção e como usuários ficam sabendo que há uma atualização disponível.", "O calendário pertence ao Project Zero e prevê exceções. Para lidar com um aviso concreto, confirme o contato e prazo informados no caso."),
  },
  {
    slug: "nodejs-26-lts-migracao", area: "design-desenvolvimento", kind: "novidades", eventDate: "2026-10-28",
    title: "Node.js 26 entra na linha LTS",
    summary: "A série 26 passa a ter suporte de longo prazo. É um ponto de partida para revisar a próxima versão de Node usada em projetos e CI.",
    creator: creator("Node.js", "nodejs", "node"), tags: ["Node.js", "Engenharia", "Atualizações"],
    sources: sources(["Calendário de versões do Node.js", "https://nodejs.org/en/about/previous-releases"], ["Notas do Node.js 26.13.0", "https://nodejs.org/en/blog/release/v26.13.0"]),
    sections: guide("A página de lançamentos lista a série 26 como LTS, ao lado de outras séries que ainda recebem manutenção.", "Se você pretende migrar, fixe a versão no ambiente de desenvolvimento e adicione uma execução em Node 26 ao CI. Compare dependências nativas, testes, build e imagem de produção antes de atualizar tudo.", "Confira o suporte na plataforma de hospedagem e a linha de manutenção da sua versão atual. A atualização pode ser feita em etapas."),
  },
] satisfies RecordDraft[];
