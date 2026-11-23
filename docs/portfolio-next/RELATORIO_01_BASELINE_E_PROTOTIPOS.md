# Relatório 01 · baseline e protótipos A/B

21/11/2026. Trabalho local, sem publicação, sem gasto e sem conta conectada. Nada foi commitado.

## Base e diferença em relação à auditoria

| Item | Estado |
|---|---|
| Worktree | `D:/Dev/portifolio/.claude/worktrees/portfolio-next-prototypes-d3ef6d`, branch `claude/portfolio-next-prototypes-d3ef6d`. O caminho pedido, `D:/dev/portifolio-next`, não existe no disco; usei o worktree isolado desta sessão. |
| Base SHA | `51987fb` (merge do PR #6). A árvore é idêntica à do baseline auditado `4b719d2`: `git diff 4b719d2 51987fb` é vazio. |
| Checkout do proprietário | `D:/Dev/portifolio` segue em `4b719d2`, intocado. `docs/portfolio-next/` existe só lá, não rastreado; este relatório e as capturas ficam no worktree. |
| Build de referência | PASS `npm ci`, lint (0 erros, 16 avisos em JS legado), typecheck, build (29 páginas) e 9/9 testes. First Load JS 121 kB nas homes, 114 kB no acervo, 103 kB compartilhados: igual à auditoria. |
| `npm audit --omit=dev` | 15 entradas, 10 altas e 5 moderadas, nenhuma crítica: igual à auditoria. Diretas: `next` (via postcss), `postcss`, `zod`, `@tailwindcss/typography`. As demais são transitivas (glob, minimatch, brace-expansion, picomatch, js-yaml, lodash, nanoid, source-map-js, yaml, mdast-util-to-hast, postcss-selector-parser). Correções sugeridas pelo npm incluem saltos de major (`next@16`, `zod@4`). Alcance em runtime ainda não traçado. |

## Inventário do checkout

- Caminho ativo: `src/app/(english|portuguese|archive)`, `src/components/site/**` (≈4,3 mil linhas), `posts/` (14 arquivos, 7 pares), `projetos_posts/` (4, 2 pares), `public/identity`, `public/work/{prumo,torvya,kreps}`, `public/badges`.
- Legado fora do caminho ativo, candidato a limpeza em PR próprio: `src/components/*.js` (≈30 arquivos), `src/components/ui/*` (Radix), `src/hooks`, `src/lib/posts.ts` e `projetos.ts`, mais dependências só usadas por eles (Radix, framer-motion, recharts, embla, cmdk, vaul, react-hook-form, date-fns, next-themes). Falta provar por grafo de importação antes de remover.
- `build_output.txt` na raiz é resíduo rastreado.
- Não há `.github/workflows`.

## Ferramentas

Verificado nesta sessão: Node 26.13.0, npm 11.20.0, Playwright 1.65.1 com Chromium do kit (WebGL por ANGLE/D3D11), axe 4.14. Não reverificados hoje, constam do README do kit: Blender 5.2.3, glTF Transform, KTX, Lighthouse, Firefox/WebKit, Antigravity (pede login). Conectores de Figma, Notion e afins não foram usados.

## Risco

- P0: nenhum encontrado.
- P1 herdados da auditoria, ainda abertos: headers (sem CSP, XCTO e Referrer-Policy), `lang` do grupo archive nos textos EN, `data-reveal` oculto se o chunk falhar, as 15 entradas de dependências. Confirmado no código: o escape do JSON-LD em `Site.tsx` usa `"\u003c"` dentro de um literal JS, que é o próprio `<`; a substituição não faz nada.

## Protótipos

Rota isolada `/prototipos` (grupo `(prototypes)`, `noindex`, fora do sitemap, sem link no site). As duas direções leem a mesma copy PT-BR de `content.ts`, os mesmos três projetos e os mesmos ativos reais. Rótulos novos estão em `src/components/prototypes/shared.tsx` (`labels`); o único com conteúdo é "Papel: Projeto, construção e operação", derivado do título da seção, a confirmar.

| | A · Estratos de Precisão | B · Museu do Sistema |
|---|---|---|
| Abertura | `/prototipos/estratos` | `/prototipos/museu` |
| Estudo de caso | `/prototipos/estratos/prumo` | `/prototipos/museu/prumo` |
| Tese | A marca A/E como peça usinada: três estratos de cerâmica, feixe de alumínio, vidro fumê nos cortes, pinos nas juntas. Todo corte do layout usa a inclinação da perna da marca (27,4°). | Projetos como peças de acervo: imagem ampla em passe-partout, legenda curta, ficha. A marca é um desenho técnico sobre pedestal, gerado no servidor. |
| Objeto | Three.js, geometria extrudada de `mark-paths.json` (sem GLB), três vistas por botão, render sob demanda, pausa fora da tela e em aba oculta. | SVG no HTML, sem script. |
| Sem JS / sem WebGL | Still SVG da mesma geometria; botões de vista somem. | Idêntico ao normal. |
| First Load JS | 104 kB + chunk de three carregado em idle | 103 kB |
| Altura a 390 px | 6.776 px | 6.839 px |
| CTA primário a 390×844 | base em 500 px | base em 545 px |
| axe WCAG 2.2 AA | 0 violações, desktop e celular, nas duas páginas | 0 violações, idem |
| Overflow horizontal | nenhum | nenhum |

Controle: a home atual tem 121 kB e cerca de 21,7 mil px a 390 px.

Capturas em `evidence/prototypes/` (1440×900 e 390×844, primeira dobra e página inteira, as três vistas da peça e a abertura A sem JS).

### Leitura do autor, antes da crítica cega

Notas minhas, de quem construiu as duas. Não substituem a rodada independente do gate B.

| Critério (peso) | A | B |
|---|---:|---:|
| Autoria (30%) | 4,5 | 3,5 |
| Clareza (25%) | 4,0 | 4,5 |
| Mobile (20%) | 3,5 | 4,5 |
| Coerência com a marca (15%) | 4,5 | 3,5 |
| Viabilidade (10%) | 3,5 | 5,0 |
| Ponderada | 4,08 | 4,10 |

Empate técnico. A tem o objeto e a regra geométrica que ninguém confundiria com template; B lê melhor, pesa menos e resolve o estudo de caso com mais calma. Minha recomendação é a combinação que o próprio documento de direção admite: geometria e peça de A, edição do caso de B.

### Limites conhecidos

- A peça é procedural, não saiu do Blender. O still sem JS tem serrilhado na extrusão.
- Torvya não tem imagem de produto no repositório; aparece só o logo.
- Só Chromium. Falta Firefox, WebKit, aparelho real, Lighthouse e medição de frame.
- View Transitions entre acervo e caso estão declaradas, não medidas.
- Só PT-BR.

## Próximos cortes verticais propostos

1. Abertura + caso Prumo na direção escolhida, integrados ao motor atual (`Stage`/`engine`), com EN e PT e os 9 testes.
2. Radar: schema, 10 fichas piloto e `/radar/[slug]` em HTML.

## Tarefas delegáveis sem bloqueio

| Tarefa | Paths | Gate |
|---|---|---|
| Triagem das 15 entradas do audit, PR próprio | `package.json`, `package-lock.json` | A, H |
| Headers em report-only e correção do escape JSON-LD | `next.config.js`, `src/components/site/Site.tsx` | H |
| `lang` do archive e fallback de `data-reveal` | `src/app/(archive)/layout.tsx`, `SiteLayout.tsx`, `site.css` | D, E |
| Grafo de importação do legado | `src/components/*.js`, `src/components/ui`, `src/lib`, `src/hooks` | A |
| Peça em Blender → GLB, pôster da mesma cena | fora do repo + `public/` | F |
