# Identidade visual e regras de layout

A marca (cores, fontes, logo, assinatura) vem de `config/perfil.json` → `marca`. O motor gera variáveis CSS a partir dela (`--fundo`, `--texto`, `--destaque`, `--card`, `--borda`, `--apoio`, `--apoio-escuro`, `--claro`, `--sobre-destaque`, `--fonte-titulo`, `--fonte-texto`) e expõe as mesmas cores em Python (`FUNDO`, `TEXTO`, `DESTAQUE`, `CARD`, `BORDA`, `APOIO`, `APOIO_ESCURO`, `CLARO`, `SOBRE_DESTAQUE`). Nos roteiros, use sempre essas constantes, nunca um hexadecimal escrito à mão, para que trocar uma cor no perfil atualize todos os posts.

## Sumário
1. Grade
2. Ritmo de animação
3. Capa do Reel
4. Armadilhas de layout
5. GIF x vídeo
6. Ajustar a marca

## 1. Grade
- Canvas **1080 × 1350** (4:5). Serve para LinkedIn (vídeo/documento) e Instagram (Reel no feed).
- Margens laterais de 80 px (conteúdo em 920 px). Kicker em `top:92`, título em `top:160`, rodapé em `top:1260`.
- Título: fonte de título do perfil, 84 px, até 3 linhas. Texto: fonte de texto, 26–42 px.
- Destaque (`--destaque`) só para o que deve ser lido primeiro: uma palavra do título, o número, a ação.

## 2. Ritmo de animação
- Cena de 4,5–6,5 s. Título entra em 0,1 s, visual em 0,6–1,2 s, apoio em ~2 s.
- Transição automática de 0,35 s entre cenas.
- Contadores (`numero`) de 1,2 a 1,6 s; texto digitado (`tipo`) de 0,6 a 1,5 s.

## 3. Capa do Reel (`capa_reel`)
- Primeira cena, estática, ~2,2 s. O quadro em 1 s vira a capa no Instagram (`thumbnailOffset: 1000`) e a miniatura no LinkedIn.
- Título em 120 px: linha principal em **até 2 linhas** (~22 caracteres por linha) e linha de destaque em **1 linha**. Se passar, encurte o texto — não reduza a fonte, porque a capa é lida pequena no grid do perfil.
- Conteúdo importante entre 80 e 1000 px na horizontal (o grid corta as laterais).

## 4. Armadilhas de layout
- **Atributo `class` duplicado**: `build()` já junta `kf` com a classe do elemento; escreva `class` uma vez só.
- **Título de 3 linhas** termina por volta de `top:420`; nada acima de 450 depois dele.
- **Número grande com rótulo ao lado**: um número de 3 dígitos em 200–220 px ocupa ~290 px; rótulo em `left:360–390`.
- **Quebra de linha extra** invadindo o bloco seguinte: reduza a fonte (ex.: 104 → 92) ou desça o bloco.
- **Vão vazio** entre título e conteúdo: suba o conteúdo (cards a partir de ~350).
- **Chips empilhados** em card: ≥ 46 px entre eles e altura com folga.

## 5. GIF x vídeo
- O GIF serve para revisão e arquivo. Para publicar, use o MP4.
- O LinkedIn recusa GIF grande (limite de ~250 quadros e ~36 milhões de pixels somados). `scripts/gif_linkedin.py` gera um GIF otimizado, mas vídeo é a escolha segura.

## 6. Ajustar a marca
Troque cores, fontes ou logo em `config/perfil.json` → `marca` (o logo é SVG com `{principal}` e `{destaque}` no lugar das cores). O `capture.cjs` avisa se alguma fonte listada em `nomes_para_checagem` não carregar.
