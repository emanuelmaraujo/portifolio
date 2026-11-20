import { badges, copy, links, type Locale } from "../content";
import type { Topic } from "./match";

/**
 * What the site's guide knows. Everything here is derived from the copy already published on the page, so the guide
 * cannot say more than the site does. The same topics serve two modes:
 *
 *   guided  the visitor's words are matched to a topic (match.ts) and its text is shown as written. No model, no cost
 *   live    the topics become the facts handed to Claude, which answers free questions from them
 */
export type { Topic };

const list = (items: string[]) => items.join("; ");

export function topics(locale: Locale): Topic[] {
  const t = copy[locale], en = locale === "en";
  const [security, ai, leadership] = t.pillars.items;
  const pillar = (p: typeof security) => `${p.thesis} ${t.pillars.practiceLabel}: ${list(p.practice)}.`;
  return [
    { id: "who", form: "mark", href: "#top", title: en ? "Who Emanuel is" : "Quem é o Emanuel",
      text: `${t.hero.lead} ${t.trajectory.intro}`,
      keywords: ["who", "about", "emanuel", "quem", "sobre", "resumo", "summary", "perfil", "profile", "faz", "does"] },
    { id: "trajectory", form: "strata", href: "#trajectory", title: t.trajectory.label,
      text: t.trajectory.layers.map(layer => `${layer.when}: ${layer.name} (${layer.role}).`).join(" "),
      keywords: ["trajectory", "career", "experience", "history", "trajetoria", "carreira", "experiencia", "historico", "anos", "years", "cooperativa", "cooperative"] },
    { id: "security", form: "aegis", href: "#pillars", title: security.name, text: pillar(security),
      keywords: ["security", "seguranca", "cyber", "ciber", "governance", "governanca", "iam", "identidade", "identity", "risk", "risco", "iso", "27001", "audit", "auditoria", "vulnerab", "incident", "grc", "mfa"] },
    { id: "ai", form: "lattice", href: "#pillars", title: ai.name, text: pillar(ai),
      keywords: ["ai", "ia", "data", "dados", "llm", "mcp", "pipeline", "python", "typescript", "engineering", "engenharia", "model", "modelo", "claude", "stack", "tecnologia", "technology"] },
    { id: "leadership", form: "keystone", href: "#pillars", title: leadership.name, text: pillar(leadership),
      keywords: ["leadership", "lideranca", "architecture", "arquitetura", "coordinator", "coordenador", "coordenacao", "team", "equipe", "management", "gestao", "vendor", "fornecedor", "infra", "infraestrutura", "infrastructure"] },
    { id: "agents", form: "orchestra", href: "#orchestration", title: t.orchestration.label,
      text: `${t.orchestration.intro} ${t.orchestration.principles.map(([name, text]) => `${name}: ${text}`).join(" ")}`,
      keywords: ["agent", "agente", "orchestr", "orquestr", "skills", "workflow", "fluxo", "codex", "gemini", "review", "revisao", "autonom"] },
    { id: "prumo", form: "prumo", href: "#work", title: "Prumo",
      text: `${t.work.prumo.text} ${t.work.prumo.stages.map(([name, text]) => `${name}: ${text}`).join(" ")}`,
      keywords: ["prumo", "price", "preco", "oferta", "offer", "deal", "desconto", "discount", "veredito", "verdict", "marketplace"] },
    { id: "torvya", form: "torvya", href: "#torvya", title: "Torvya",
      text: `${t.work.torvya.text} ${t.work.torvya.products.map(p => `${p.name}: ${p.text}`).join(" ")} ${t.work.torvya.spec}.`,
      keywords: ["torvya", "nfc", "qr", "placa", "plaque", "acrilico", "acrylic"] },
    { id: "kreps", form: "kreps", href: "#kreps", title: "Marcos Krep’s",
      text: `${t.work.kreps.text} ${t.work.kreps.points.map(([name, text]) => `${name}: ${text}`).join(" ")}`,
      keywords: ["krep", "pdv", "pos", "restaurant", "restaurante", "creperia", "pedido", "order", "pix", "pagamento", "payment"] },
    { id: "projects", form: "horizon", href: "#work", title: t.work.label,
      text: `${t.work.title} Prumo, Torvya, Marcos Krep’s. ${t.work.labTitle}: ${t.work.lab.map(item => `${item.name} (${item.status}): ${item.text}`).join(" ")}`,
      keywords: ["project", "projeto", "product", "produto", "work", "trabalho", "portfolio", "built", "construiu", "riftscore", "videofactory", "promos"] },
    { id: "credentials", form: "orbit", href: "#credentials", title: t.credentials.label,
      text: `${badges.map(([name, issuer]) => `${name} (${issuer})`).join("; ")}. ${t.credentials.educationLabel}: ${t.credentials.education.map(([name, detail]) => `${name}, ${detail}`).join("; ")}.`,
      keywords: ["certif", "credential", "credencial", "badge", "education", "formacao", "degree", "graduacao", "pos", "postgraduate", "faculdade", "university", "universidade", "curso", "course"] },
    { id: "writing", form: "horizon", href: "/blog", title: t.writing.label,
      text: `${t.writing.intro} ${en ? "Latest: an interactive article on prioritising vulnerabilities beyond CVSS." : "O mais recente: um artigo interativo sobre priorização de vulnerabilidades além do CVSS."}`,
      keywords: ["article", "artigo", "blog", "write", "escreve", "texto", "cvss", "post"] },
    { id: "contact", form: "mark", href: "#contact", title: t.contact.label,
      text: `${t.contact.text} E-mail: ${links.email.replace("mailto:", "")}. LinkedIn: ${links.linkedin}. GitHub: ${links.github}. ${t.contact.place}.`,
      keywords: ["contact", "contato", "email", "mail", "linkedin", "github", "hire", "contratar", "falar", "talk", "reach", "vaga", "job", "oportunidade", "opportunity"] },
  ];
}

/** Live mode: the facts handed to the model, one section per topic. */
export function facts(locale: Locale) {
  const t = copy[locale];
  const extra = [
    `## ${t.trajectory.label}\n${t.trajectory.layers.map(layer => `${layer.when} · ${layer.name} · ${layer.role}. ${layer.text}`).join("\n")}`,
    `## ${t.orchestration.label}\n${t.orchestration.stats.map(([value, text]) => `${value} ${text}`).join("; ")}. ${t.orchestration.tools}`,
  ];
  return [...topics(locale).map(topic => `## ${topic.title} [${topic.id}]\n${topic.text}`), ...extra].join("\n\n");
}
