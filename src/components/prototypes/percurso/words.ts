import type { LAYERS } from "./take";

/** Everything the take says outside the picture, in both languages. The words written on the table are rendered. */
export type Lang = "pt" | "en";
type Layer = (typeof LAYERS)[number];

export const words = {
  pt: {
    home: "/", classicHref: "/portifolio/pt", classic: "Versão clássica", otherHref: "/en", other: "English", otherLang: "en",
    verbs: ["projeto", "protejo", "orquestro"],
    sentence: ["Eu ", "projeto", ", ", "protejo", " e ", "orquestro", " ", "sistemas inteligentes", "."],
    systems: "sistemas", stops: "Paradas",
    scale: "Maquete 1:1 · renderizada", loading: "carregando a mesa", summary: "Resumo do percurso", articles: "Artigos",
    poster: "Uma folha de desenho vista de cima, com círculos de construção a grafite, uma linha laranja, um compasso e um prumo de latão.",
    keys: "Role a página ou use as paradas para percorrer a mesa. Em cada parada, os botões desenhados na mesa podem ser acionados.",
    layers: {
      firewall: ["Firewall", "a barreira em volta de tudo: o que vem de fora para nela."],
      identity: ["Identidade", "o único portão, que só abre para quem prova quem é, com MFA."],
      uem: ["UEM", "cada dispositivo gerenciado e em conformidade, com o seu selo."],
      edr: ["EDR", "uma segunda camada, que detecta e isola o que passou da primeira."],
      servers: ["Servidores", "a base onde os serviços rodam, atualizada e endurecida."],
      backup: ["Backup", "uma cópia ligada ao ambiente, mas isolada dele, pronta para restaurar."],
      monitor: ["Monitoramento", "a varredura que não para, para ver antes de virar incidente."],
      govern: ["Governança", "políticas e auditoria que mantêm o conjunto fechado."],
    } as Record<Layer, [string, string]>,
    on: "ligado", off: "desligado",
    acts: ["", "Eu projeto: cada sistema começa no papel e sobe em camadas, da fundação ao topo.", "", "Eu orquestro: agentes levam cada peça pelas etapas, verificam e só então encaixam. A última entra com a minha aprovação."],
    protejo: {
      enter: "Eu protejo: a mesa vira o console de segurança. Continue rolando para ligar as camadas, uma de cada vez.",
      arming: (n: number, name: string, text: string) => `${n} de 8 · ${name}: ${text}`,
      full: "Eu protejo: oito camadas ligadas, ambiente 100% protegido. Toque em uma camada para ver o que ela faz.",
      some: (n: number) => `Eu protejo: ${n} de 8 camadas ligadas. Segurança é o conjunto, nenhuma segura sozinha.`,
    },
    stopsCopy: [
      { name: "Prumo", keys: ["Menor preço", "Desconto inflado", "Histórico curto"], states: [
        "Prumo: o preço de hoje é o menor da janela observada. É a afirmação que a oferta pode fazer.",
        "Prumo: o preço subiu pouco antes do desconto. O motor vê e não apresenta como economia.",
        "Prumo: histórico curto demais para comparar. O motor diz isso em vez de arriscar.",
      ] },
      { name: "Torvya", keys: ["Avaliações", "Links", "Campanha"], states: [
        "Torvya: um toque na placa leva à página de avaliações do negócio.",
        "Torvya: a mesma placa, agora levando à central de links. Só o destino mudou.",
        "Torvya: a mesma placa, agora em uma campanha nova, sem trocar nada no balcão.",
      ] },
      { name: "Marcos Krep's", keys: ["Voltar", "Avançar pedido", "Novo pedido"], states: [
        "Marcos Krep's: o pedido saiu do celular do cliente e aguarda o pagamento.",
        "Marcos Krep's: pago. O pedido entra na fila e o tíquete sai na impressora da cozinha.",
        "Marcos Krep's: parte do pedido está pronta.",
        "Marcos Krep's: pedido pronto.",
        "Marcos Krep's: saiu para entrega, com o entregador.",
        "Marcos Krep's: entregue, e o caixa fecha a conta.",
      ] },
    ],
    links: ["E-mail", "LinkedIn", "GitHub", "Artigos", "Notion · skills", "Radar · atualizações"],
    radar: "Radar",
    soon: "em breve",
    end: {
      paper: "Saiu do papel. Toque em um item da mesa. Continue rolando, ou toque na maquete, para ligar a mesa.",
      lit: "Modo mesa: toque em um item para abrir. Role para cima, ou toque na maquete, para voltar ao papel.",
      between: "Saiu do papel.", toLit: "Ligar a mesa", toPaper: "Voltar ao papel",
    },
  },
  en: {
    home: "/en", classicHref: "/portifolio", classic: "Classic version", otherHref: "/", other: "Português", otherLang: "pt-BR",
    verbs: ["design", "secure", "orchestrate"],
    sentence: ["I ", "design", ", ", "secure", " and ", "orchestrate", " ", "intelligent systems", "."],
    systems: "systems", stops: "Stops",
    scale: "Model 1:1 · rendered", loading: "loading the table", summary: "Summary of the walk", articles: "Articles",
    poster: "A drawing sheet seen from above, with construction circles in graphite, an orange line, a pair of compasses and a brass plumb.",
    keys: "Scroll the page or use the stops to walk the table. At each stop, the keys drawn on the table can be pressed.",
    layers: {
      firewall: ["Firewall", "the barrier round everything: what comes from outside stops there."],
      identity: ["Identity", "the only gate, which opens only to those who prove who they are, with MFA."],
      uem: ["UEM", "every device managed and compliant, carrying its seal."],
      edr: ["EDR", "a second layer, which detects and isolates what got past the first."],
      servers: ["Servers", "the base the services run on, patched and hardened."],
      backup: ["Backup", "a copy tied to the environment but isolated from it, ready to restore."],
      monitor: ["Monitoring", "the sweep that never stops, to see it before it becomes an incident."],
      govern: ["Governance", "policies and audit that keep the whole thing closed."],
    } as Record<Layer, [string, string]>,
    on: "on", off: "off",
    acts: ["", "I design: every system starts on paper and rises in layers, from the foundation to the top.", "", "I orchestrate: agents carry each piece through the stages, verify it and only then fit it. The last one goes in with my approval."],
    protejo: {
      enter: "I secure: the table becomes the security console. Keep scrolling to switch the layers on, one at a time.",
      arming: (n: number, name: string, text: string) => `${n} of 8 · ${name}: ${text}`,
      full: "I secure: eight layers on, environment 100% protected. Tap a layer to see what it does.",
      some: (n: number) => `I secure: ${n} of 8 layers on. Security is the whole set; no layer holds on its own.`,
    },
    stopsCopy: [
      { name: "Prumo", keys: ["Lowest price", "Inflated discount", "Short history"], states: [
        "Prumo: today's price is the lowest in the observed window. That is the claim the offer can make.",
        "Prumo: the price went up shortly before the discount. The engine sees it and does not present it as a saving.",
        "Prumo: the history is too short to compare. The engine says so instead of guessing.",
      ] },
      { name: "Torvya", keys: ["Reviews", "Links", "Campaign"], states: [
        "Torvya: one tap on the plate leads to the business's reviews page.",
        "Torvya: the same plate, now leading to the link hub. Only the destination changed.",
        "Torvya: the same plate, now on a new campaign, with nothing replaced on the counter.",
      ] },
      { name: "Marcos Krep's", keys: ["Back", "Advance order", "New order"], states: [
        "Marcos Krep's: the order left the customer's phone and awaits payment.",
        "Marcos Krep's: paid. The order joins the queue and the ticket prints in the kitchen.",
        "Marcos Krep's: part of the order is ready.",
        "Marcos Krep's: order ready.",
        "Marcos Krep's: out for delivery, with the courier.",
        "Marcos Krep's: delivered, and the till closes the bill.",
      ] },
    ],
    links: ["Email", "LinkedIn", "GitHub", "Articles", "Notion · skills", "Radar · updates, in Portuguese"],
    radar: "Radar (in Portuguese)",
    soon: "coming soon",
    end: {
      paper: "Off the paper. Tap an item on the table. Keep scrolling, or tap the model, to switch the table on.",
      lit: "Table mode: tap an item to open it. Scroll up, or tap the model, to go back to paper.",
      between: "Off the paper.", toLit: "Switch the table on", toPaper: "Back to paper",
    },
  },
};
