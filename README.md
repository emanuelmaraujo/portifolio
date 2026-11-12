# Emanuel Araújo · portfólio

Identidade digital de Emanuel Araújo: engenharia de IA, cibersegurança, liderança de TI e produtos próprios. Inglês em `/`, português em `/pt`. Artigos em `/blog` e notas de projeto em `/projetos`.

## Conceito

**Um sistema, muitas formas.** Um único campo de partículas WebGL acompanha a página inteira e se reorganiza a cada capítulo: a marca, os estratos da carreira, o grafo de competências, a orquestra de agentes, o prumo, as placas Torvya, o quadro de pedidos e o horizonte. A rolagem conduz a matéria de uma figura à outra.

| Capítulo | Figura | Interação |
| --- | --- | --- |
| Abertura e contato | Marca pessoal | Partículas se condensam na entrada e desviam do cursor |
| Trajetória | Cinco estratos atravessados por um feixe | A etapa no centro da tela acende a camada correspondente |
| Competências | Quatro núcleos ligados por filamentos | Selecionar uma disciplina destaca o núcleo e lista as conexões |
| Agentes | Orquestrador com seis etapas em anel | "Executar uma tarefa" percorre o fluxo, com falha, correção, revisão e aprovação |
| Prumo | Ruído que converge em um fio de prumo | As etapas do pipeline alternam o destaque entre ruído e fio |
| Torvya | Placas de acrílico modeladas em 3D | Alternar entre Review e Connect traz a placa para a frente |
| Marcos Krep's | Quadro de pedidos | Telas reais do sistema com dados de teste |
| Credenciais | Duas órbitas com os badges como objetos 3D | Escolher uma credencial gira a órbita até o badge ficar de frente |
| Contato | Marca pessoal | Uma luz sobe pelos três estratos até o feixe, em ciclo |
| Artigos | Figura gerada a partir do título de cada texto | A figura muda conforme a lista é percorrida e se rearranja a cada seção do artigo |

## Marca

O símbolo é um "A" cuja perna esquerda são três estratos (infraestrutura, segurança, inteligência) e a direita um feixe contínuo (orquestração). A barra do meio se estende até o feixe e forma a travessa do "A"; as três barras leem como "E". A geometria é gerada a partir de uma grade de 64 unidades e é a mesma no SVG, no cabeçalho, no card social e na figura 3D (`src/components/site/scene/mark-paths.json`).

Arquivos em `public/identity/`: `mark.svg` (fundo escuro), `mark-light.svg` (fundo claro), `mark-mono.svg` (`currentColor`), `mark-compact.svg` (tamanhos pequenos), `mark-animated.svg` e `favicon.svg`. O card social (`/og.png`) e o ícone Apple (`/apple-icon.png`) são gerados no build.

Paleta: tinta `#08090b`, osso `#ede8df`, laranja-sinal `#ff5b22`. Cada projeto usa o acento da própria marca (Prumo lima, Torvya azul, Marcos Krep's amarelo). Tipografia: Geist, Geist Mono e Instrument Serif em itálico.

## Arquitetura

```
src/components/site/
  content.ts          conteúdo bilíngue e links
  entries.ts          leitura dos artigos e notas em Markdown
  Archive.tsx         páginas de artigos e notas
  Site.tsx            página (server component)
  SiteLayout.tsx      <html>, fontes e metadados
  Stage.tsx           canvas fixo; carrega o motor depois da primeira pintura
  Trajectory · Capabilities · Orchestration · Work   seções interativas
  scene/engine.ts     renderer, rolagem, câmera, rótulos ancorados
  scene/forms.ts      geradores das oito figuras
  scene/plaques.ts    placas Torvya (geometria e faces desenhadas em canvas)
  scene/badges.ts     badges das credenciais em órbita
  scene/sigil.ts      figura generativa por texto (3D e emblema 2D)
  site.css            tokens e layout
```

As seções controlam a cena por atributos `data-*` (`data-form`, `data-side`, `data-accent`, `data-active`, `data-seed`, `data-badge`), então o React não conversa com o WebGL. Three.js é a única dependência 3D; as animações de interface são CSS.

No celular, cada capítulo abre com uma janela livre para a figura, que recua quando o texto sobe sobre ela. As partículas reagem ao dedo que rola a página, à velocidade da rolagem e à inclinação do aparelho, e a navegação vira uma barra na base da tela.

Um loading curto cobre a entrada até o motor 3D estar pronto, e a animação de abertura começa quando ele sai. Sem JavaScript ele não aparece.

Cada artigo tem uma figura própria: `scene/sigil.ts` gera, a partir do slug, sempre a mesma forma para o mesmo texto. Ela aparece em 3D na página do artigo e como emblema de pontos (SVG) nas listas. O artigo é dividido nos títulos de segundo nível, e cada parte é um capítulo do campo de partículas.

Artigos (`posts/`) e notas de projeto (`projetos_posts/`) são Markdown renderizado no build, listados em `/blog` e `/projetos` e, os três mais recentes, na página inicial. Versões em inglês terminam em `-en` e cada texto aponta para a outra língua.

Todo o conteúdo é HTML renderizado no servidor. Sem WebGL, ou após perda de contexto, a página mantém o fundo em CSS e a marca estática. Com `prefers-reduced-motion`, as figuras trocam sem deslocamento e o laço de animação para. O renderer limita o DPR, reduz a resolução se os quadros ficarem lentos e pausa com a aba oculta.

## Fontes do conteúdo

Fatos de projeto vêm dos repositórios locais (Prumo, PDV Marcos Krep's, Promos, VideoFactory, Skills) e do perfil do GitHub. As logos de Prumo, Torvya e Marcos Krep's são os arquivos originais de cada marca. O card do Prumo é o exemplo do kit da marca. As telas do Marcos Krep's são capturas reais com dados de teste. As faces das placas Torvya são redesenhadas em código: o QR é decorativo e a face Review usa um selo neutro no lugar do logotipo de terceiros impresso no produto.

## Desenvolvimento

```powershell
npm ci
npm run dev        # http://localhost:3000
npm run build
npm run typecheck
npm run lint
npm test           # exige build; sobe o servidor de produção em uma porta livre
```

Deploy na Vercel com o preset Next.js (`vercel.json`). Canonical, Open Graph e sitemap usam `PORTFOLIO_SITE_URL` quando definido.
