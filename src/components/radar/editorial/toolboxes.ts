import type { RecordDraft } from "../content";
import type { Area } from "../taxonomy";
import { creator, sources } from "./helpers";

type Tool = [slug: string, title: string, owner: string, repo: string, topic: string, summary: string, practice: string, limitation: string, docs: string];

const licenses: Record<string, string> = { openfga: "Apache-2.0", keycloak: "Apache-2.0", sops: "MPL-2.0", openbao: "MPL-2.0", cilium: "Apache-2.0", defectdojo: "BSD-3-Clause", renovate: "AGPL-3.0", mermaid: "MIT" };

function toolbox(area: Area, entries: Tool[]): RecordDraft[] {
  return entries.map(([slug, title, owner, repo, topic, summary, practice, limitation, docs]) => {
    const maintainer = { ...creator(title, owner, repo), remoteAvatar: true };
    return { slug, title, area, kind: "repositorios", summary, creator: maintainer, tags: [topic], license: licenses[slug],
      sources: sources(["Repositório oficial", maintainer.github], ["Documentação", docs]),
      sections: [{ title: "Como testar", body: practice }, { title: "O que conferir", body: limitation }] };
  });
}

export const toolboxes = [
  ...toolbox("ciberseguranca", [
    ["openfga", "OpenFGA", "openfga", "openfga", "Segurança de aplicações", "Motor de autorização baseado em relacionamentos para modelar permissões sobre recursos.", "Modele quem pode editar, ler ou compartilhar um documento fictício. Registre os casos esperados para usuário, equipe e organização e compare com as decisões retornadas.", "A decisão do motor precisa ser aplicada em todos os pontos que leem ou alteram o recurso. Teste alterações de papel, cache e isolamento entre organizações.", "https://openfga.dev/docs"],
    ["keycloak", "Keycloak", "keycloak", "keycloak", "Identidade e segredos", "Projeto de gestão de identidade para autenticar pessoas e integrar aplicações com protocolos de identidade.", "Em homologação, conecte uma aplicação de teste e confira login, logout, renovação de sessão e mudança de acesso de um usuário.", "Planeje atualização, restauração e administração independente do serviço autenticado. A aplicação ainda precisa aplicar as permissões sobre seus recursos.", "https://www.keycloak.org/documentation"],
    ["sops", "SOPS", "getsops", "sops", "Identidade e segredos", "Ferramenta para criptografar arquivos de configuração e limitar quem consegue ler campos sensíveis.", "Teste com um arquivo de exemplo e duas identidades de teste. Confirme quem consegue abrir a configuração e se o processo de deploy recupera somente os valores necessários.", "O repositório pode carregar material cifrado, mas chaves de decriptação precisam de acesso separado e política de rotação.", "https://getsops.io/docs/"],
    ["openbao", "OpenBao", "openbao", "openbao", "Identidade e segredos", "Serviço para controlar o armazenamento e a distribuição de segredos, chaves e certificados.", "Comece com uma credencial fictícia e uma política restrita a um único serviço. Verifique obtenção, expiração, revogação e trilha de auditoria.", "Defina recuperação, rotação e privilégio administrativo antes de depender do serviço em produção.", "https://openbao.org/docs/"],
    ["cilium", "Cilium", "cilium", "cilium", "Segurança em nuvem", "Projeto de rede, políticas e observabilidade para workloads em ambientes Kubernetes compatíveis.", "Num cluster de teste, descreva quais serviços devem comunicar entre si. Compare o tráfego observado com a política e valide um serviço permitido e outro fora do escopo.", "Integração depende do cluster e do dataplane. Planeje testes de compatibilidade e recuperação antes de alterar uma rede existente.", "https://docs.cilium.io/"],
    ["defectdojo", "DefectDojo", "DefectDojo", "django-DefectDojo", "Detecção e resposta", "Plataforma para consolidar achados de ferramentas de segurança, acompanhar duplicatas e manter visibilidade de correções.", "Importe resultados sintéticos de duas ferramentas sobre o mesmo serviço. Compare deduplicação, responsáveis e prazos antes de decidir o fluxo de triagem.", "Qualidade do inventário e política de retenção afetam a utilidade do painel. Guarde evidências que possam ser consultadas por quem corrige.", "https://docs.defectdojo.com/"],
  ]),
  ...toolbox("design-desenvolvimento", [
    ["renovate", "Renovate", "renovatebot", "renovate", "Engenharia de software", "Automatiza propostas de atualização de dependências em repositórios, com regras para intervalo, grupos e aprovação.", "Aplique a um repositório de teste e separe atualizações previsíveis de mudanças principais. Compare o volume de propostas e o tempo de revisão.", "Defina proteção de branches e testes. Uma alteração de dependência pode exigir nova configuração ou verificação do produto.", "https://docs.renovatebot.com/"],
    ["mermaid", "Mermaid", "mermaid-js", "mermaid", "Documentação e mídia", "Gera diagramas de arquitetura e de fluxo a partir de texto que pode ser versionado junto do código.", "Descreva uma integração em diagrama de sequência. Confirme onde começa a chamada, o que acontece quando falha e quem recebe o resultado.", "Mantenha o diagrama junto da decisão ou mudança que o justifica. Para audiências que não podem visualizar o gráfico, descreva o fluxo em texto.", "https://mermaid.js.org/intro/"],
  ]),
] satisfies RecordDraft[];
