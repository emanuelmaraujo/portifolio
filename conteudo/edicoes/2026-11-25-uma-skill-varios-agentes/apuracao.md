# Uma skill, vários agentes

- Data: 2026-11-25 · Peso: aprofundado · Formato: explicador (experiência própria) · Horário: 14:30

## Dados e fontes
- Dado: ChatGPT aceita upload de skills (Skills → Criar → Enviar do computador); SKILL.md precisa de name e description; skills podem ser exportadas/importadas em ferramentas compatíveis com o formato Agent Skills.
  Fonte: OpenAI Help Center, "Skills in ChatGPT" — https://help.openai.com/en/articles/20001066 ; OpenAI developers, build skills.
- Dado: organização no repositório (.agents/skills como fonte, cópia em .claude/skills, npm run skills:sync / skills:check).
  Fonte: experiência própria — emanuelmaraujo/portifolio#12.
- Dado: pastas lidas por ferramenta variam e as fontes divergem (Copilot .github/skills x .claude/skills; Gemini .gemini/skills x .agents/skills).
  Fonte: comparativos de compatibilidade (vercel-labs/skills, flaviocopes, dev.to) — por isso o post não afirma regra e pede para conferir a documentação.
- Dado: "No Claude, o agente lê primeiro só o nome e a descrição" (carregamento progressivo das skills).
  Fonte: documentação de skills do Claude / skill-creator.
