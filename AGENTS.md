# Instruções para agentes

## Skills
- As skills do projeto ficam em `.agents/skills/` (fonte única). `.claude/skills/` é uma cópia para Claude Code e GitHub Copilot.
- Ao alterar uma skill, edite em `.agents/skills/` e rode `npm run skills:sync`. `npm run skills:check` confere se as cópias estão iguais.
- `estudio-de-posts`: posts diários de LinkedIn e Instagram (09:30 leve, 14:30 aprofundado). Histórico, pauta e edições em `conteudo/`.
