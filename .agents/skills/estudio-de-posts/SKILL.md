---
name: estudio-de-posts
description: Estúdio de posts diários do Emanuel Araújo para LinkedIn e Instagram — vídeos animados com capa na identidade dele, sobre assuntos do momento em IA, cibersegurança, infraestrutura e desenvolvimento, alternando posts leves e aprofundados. Cobre sugerir o tema do dia, aceitar um tema livre indicado por ele, apurar em fontes confiáveis, escrever roteiro e legenda, renderizar MP4 + GIF de prévia, hospedar, agendar no Buffer após aprovação e registrar o histórico. Use sempre que ele pedir um post, vídeo, animação, carrossel ou GIF, perguntar o que postar hoje, trouxer um tema, notícia ou relatório para virar conteúdo, quiser divulgar um projeto dele, ou quando a tarefa agendada de conteúdo disparar.
---

# Estúdio de Posts

Posts diários para o perfil do Emanuel: **conhecimento técnico de verdade sobre o que está acontecendo agora**, sem foco em gestão. Identidade, canais e foco estão em `config/perfil.json` (leia no início).

## Regras de base

1. **Nunca publicar sem aprovação explícita.**
2. **Dois posts por dia, intercalando o peso**: **09:30 leve** e **14:30 aprofundado** (horários e pesos em `ritmo` no perfil), nos dois canais. Post avulso fora da rotina: peso oposto ao último do `historico.md`. Se ele pedir um peso, vale o pedido.
3. **Atualidade primeiro**: o tema vem do que está em discussão agora. Sem assunto forte no momento, use um princípio ou fundamento importante (`references/pautas.md`).
4. **Tema livre é bem-vindo**: se ele indicar um assunto, use-o — só defina o peso e o ângulo.
5. **Fontes confiáveis e relevantes**: busque a origem da informação (quem publicou o dado, o anúncio, a pesquisa), confira números e guarde os links. Não invente dados nem citações.
6. **Voz humana**: situação concreta, sem slogan, sem tom de palestra (`references/editorial.md`).

## Os dois pesos

| | Leve | Aprofundado |
|---|---|---|
| Para quem | Qualquer pessoa interessada em tecnologia | Quem trabalha com tecnologia |
| Pergunta | "O que é, o que mudou e o que isso muda para mim?" | "Como funciona por dentro, onde falha e o que fazer tecnicamente?" |
| Conteúdo | Exemplo do dia a dia, 1–3 ações | Mecanismo, trade-offs, limitações, detalhes técnicos |
| Vocabulário | Termos explicados na hora | Técnico, sem explicar o básico |
| Duração | 5–7 cenas, 30–40 s | 8–10 cenas, 50–70 s |

## Fluxo

### 1. Tema
- **Ele indicou um tema** → siga para a apuração.
- **"O que posto hoje?"** → busque o que está em pauta agora (`references/pautas.md` §1) e entregue **3 opções para cada horário** (leve às 09:30, aprofundado às 14:30), de pilares diferentes e sem os dois posts do dia no mesmo assunto:
  `Título · peso · pilar · formato · gancho (1 frase) · por que agora · fonte principal`. Recomende uma e espere a escolha.

### 2. Apuração e roteiro
```bash
SK=<caminho desta skill>
python3 $SK/scripts/novo_post.py <pasta-de-edicoes> "<título>" --peso aprofundado --formato novidade
```
Cria a pasta com `apuracao.md`, `roteiro.md`, `legenda.md` e `cenas.py` (modelo do formato: `explicador`, `novidade`, `comparativo`, `checklist`, `caso`).

Anote cada dado com a fonte em `apuracao.md`. Escreva o roteiro e a legenda seguindo `references/editorial.md`. Pedido aberto → mostre roteiro e legenda antes de renderizar; conteúdo já definido → siga direto. Confira a legenda:
```bash
python3 $SK/scripts/checar_legenda.py <edicao>/legenda.md
```

### 3. Animação
```bash
cd <edicao> && python3 cenas.py
bash $SK/scripts/render.sh post.html . <slug> --revisao   # folha com o fim de cada cena
bash $SK/scripts/render.sh post.html . <slug>             # MP4 + GIF
```
- Abre sempre com `capa_reel` (estática, ~2,2 s): vira a capa do Reel e a miniatura do LinkedIn.
- Componentes em `scripts/estudio.py`: `capa_reel`, `capa`, `topo`, `titulo`, `legenda`, `numero`, `card`, `pilula`, `lista_check`, `navegador`, `fechamento` + `fade`, `pop`, `kf`, `tipo`, `conta`. Cores pelas constantes (`DESTAQUE`, `CARD`, `TEXTO`…).
- Revise a folha (texto sobreposto, cortado, vão vazio) e os avisos do `capture.js` antes de mostrar. Layout: `references/identidade.md`.

### 4. Aprovação
Mande o GIF (anexo), a legenda, o peso, as fontes e a data/hora sugerida. Ele aprova, pede ajuste ou descarta.

### 5. Publicação
`references/publicacao.md`: MP4 hospedado em link permanente; LinkedIn como vídeo com link na legenda; Instagram como Reel com `thumbnailOffset: 1000`; conferir status e duplicatas depois.

### 6. Histórico
Registre cada post em `historico.md` (é o que garante a alternância e evita repetir tema):

| Data | Título | Peso | Pilar | Canais | Alcance | Reações | Comentários |
|---|---|---|---|---|---|---|---|

Cerca de 3 dias depois, complete as métricas com `list_posts` (`includeMetrics`) ou `get_aggregated_post_metrics`.

## Tarefa agendada (diária)
Escolha os dois temas do dia (um leve, um aprofundado, assuntos diferentes) → produza os dois → hospede os vídeos → crie no Buffer como **rascunho** (`saveToDraft: true`) com `dueAt` 09:30 e 14:30 do dia nos dois canais → avise com o GIF, a legenda e as fontes de cada um. Nada é publicado sem a aprovação dele; se a aprovação chegar depois do horário, proponha o próximo horário livre.

## Onde guardar
No repositório do portfólio, se disponível: `conteudo/pauta.md`, `conteudo/historico.md`, `conteudo/edicoes/AAAA-MM-DD-slug/`. Sem ele, numa pasta de trabalho — e diga onde ficou.
