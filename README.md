# Aperture · Emanuel Araújo

Portfólio de engenharia, IA, orquestração de agentes, cibersegurança e liderança de TI. Inglês em `/`, português brasileiro em `/pt`. O acervo permanece em `/blog` e `/projetos`, incluindo os links para artigos e projetos existentes.

## Desenvolvimento e Vercel

```powershell
npm ci
npm run dev
# http://localhost:3000
```

```powershell
npm run build
npm run typecheck
npm run lint
npm test
npm run start
```

`npm test` sobe um servidor de produção em uma porta local livre e valida as páginas, o acervo e os assets. `vercel.json` seleciona o preset Next.js, `npm ci`, `npm run build` e a saída nativa `.next`. Canonical, Open Graph e sitemap usam `PORTFOLIO_SITE_URL` quando definido e o domínio atual da Vercel por padrão. O build usa a raiz do domínio. O workflow do GitHub Pages e as ferramentas de publicação Cloudflare do portfólio foram removidos.

A branch `portfolio/aperture-webgl` parte de `eff50bb`, a versão mais recente do portfólio já publicada. A mudança está preparada para revisão e publicação futura.

## Identidade

**Aperture** representa um núcleo de inteligência cercado por componentes de proteção e operação. As duas peças do monograma EA usam cortes compatíveis com as faces chanfradas da estrutura WebGL. A paleta combina grafite azulado, aço, gelo e coral de sinalização. A landing intercala o hero escuro, a exposição clara de projetos, o grafo escuro e o contato coral.

| Conceito | Originalidade e coerência | Leitura pequena e animação |
| --- | --- | --- |
| [Lattice](public/aperture/concepts/01-lattice.svg) | Conexões e nós, próximos de um diagrama técnico | Traços finos perdem presença em tamanhos pequenos. Favorece desenho por linhas |
| [Aperture](public/aperture/concepts/02-aperture.svg) | Duas peças sólidas com chanfros e espaço negativo, diretamente ligadas à estrutura 3D | Contorno legível em tamanho compacto. As peças convergem em SVG e ganham espessura em WebGL |
| [Keystone](public/aperture/concepts/03-keystone.svg) | Moldura estrutural com monograma interno | A moldura compete com as letras no favicon. Favorece rotação de conjunto |

A variante selecionada está em [SVG principal](public/aperture/mark.svg), [monocromático](public/aperture/mark-mono.svg), [compacto](public/aperture/mark-compact.svg), [animado](public/aperture/mark-animated.svg) e [favicon](public/aperture/favicon.svg). O [poster do núcleo](public/aperture/core-poster.svg), as placas e os assets sociais são originais. Os tokens de cor, escala e movimento estão em `portfolio.css` e as regras específicas do hero em `aperture.css`.

O uso de profundidade para comunicar função veio das referências de experiências interativas. A composição, o símbolo e a geometria são próprios. [Awwwards WebGL](https://www.awwwards.com/websites/webgl/) · [Active Theory](https://activetheory.net/) · [Bruno Simon](https://bruno-simon.com/)

## Cena e motion

`SceneStage.tsx` carrega separadamente os modelos e o renderer. `webgl/core.ts` contém as placas extrudadas, cristal, monograma e trilhos. `webgl/torvya.ts` desenha as placas Review e Connect e suas texturas em código. Three.js renderiza a perspectiva, os materiais e as luzes em WebGL2. R3F, Drei e GSAP foram considerados. O controle direto das duas cenas e CSS para transições da interface cobriram o escopo sem uma segunda camada de animação.

| Movimento | Gatilho, estado e tempo | Comportamento alternativo |
| --- | --- | --- |
| Formação EA | Entrada. Duas peças convergem em 750 ms com atraso de 80 ms na segunda | SVG estático com movimento reduzido |
| Título | Entrada. Duas linhas passam por máscara direcional em 880 ms com atraso de 120 ms | Texto completo desde a primeira pintura |
| Montagem do núcleo | Entrada na viewport. Placas se aproximam radialmente e encaixam com easing cúbico e 43 ms de defasagem entre segmentos. Último encaixe em cerca de 1,33 s de animação | Poster vetorial disponível durante carregamento, perda de contexto e movimento reduzido |
| Resposta do núcleo | Cursor e rolagem amortecem câmera, orientação e separação das placas. O loop ocioso move cristal e órbitas | Pausa congela a cena. Em toque, rolagem continua a orientar o núcleo |
| Transição das exposições | No navegador com `animation-timeline`, a rolagem conduz o visual de 24 px e escala .97 até o tamanho final | Layout sem movimento mantém o conteúdo e os controles visíveis |
| Profundidade e fluxo | Ponteiro inclina o Prumo e o POS em 260 ms. No Prumo, hover ou foco conduz o sinal de distribuição em 1 s | Conteúdo completo em toque e movimento reduzido |
| Torvya | Arrasto horizontal ou botão por teclado muda a orientação em incrementos de 60° com amortecimento | Ilustração vetorial e descrições HTML |
| Grafo | Teclado ou clique seleciona um nó. Pulso de 1,2 s por ciclo, até três ciclos. Detalhe troca em 270 ms | Conexões e estado selecionado continuam legíveis sem animação |

O renderer limita o DPR a 1,5 em desktop e 1 em ponteiro de toque, com redução adaptativa até .75. Ele interrompe frames fora da viewport e com a aba oculta. Desmontagem libera observers, listeners, materiais, texturas, geometrias e contexto. O fallback restaura o poster no evento de perda de contexto, e a cena recria a iluminação se o navegador restaurar o contexto.

## Projetos e fontes

O Prumo apresenta o fluxo de marketplaces, workers, curadoria e distribuição. A Torvya mostra os conceitos de produto, com review e compartilhamento via NFC/QR. Marcos Krep’s usa um estudo de interface baseado em estados verificados no repositório, com identificadores fictícios. A seção de laboratório distingue Promos, Cezar e VideoFactory por maturidade. Credenciais públicas incluem ISO/IEC 27001 Foundation, Fortinet e Cisco. As apresentações evitam capturas com dados de operação.

## Skills e validação

- `web-design-orchestrator` organizou reconhecimento, símbolo, protótipo, exposições e QA. `product-art-direction` e `design-system-architect` produziram os três conceitos SVG, a escolha e os tokens.
- `premium-landing-builder` conduziu a hierarquia bilíngue e as apresentações distintas. `web-3d-experience-builder`, `web-motion-engineer` e `code-driven-motion-storytelling` orientaram a cena real, a montagem em etapas, a navegação e as alternativas estáticas.
- `frontend-visual-qa`, `web-accessibility-audit` e `web-performance-engineer` orientaram capturas, teclado, teste de movimento, perda de contexto e medições de laboratório.
- `web-security-review` orientou a revisão de dados, dependências e assets. A remoção do tooling Cloudflare e a atualização do ESLint dentro da mesma major eliminaram os alertas críticos do `npm audit` neste lockfile. Permanecem avisos herdados de dependências. A revisão do código foi feita pelo implementador.

Build, TypeScript e três testes de produção local passaram. ESLint registra 16 avisos em componentes legados. As capturas e comparações de estado estão em `aperture-qa` no workspace da tarefa. A validação de navegador usa Chrome emulado e renderização por software.

Em três sessões frias por cenário a 1440 × 900, o LCP mediano foi 192 ms no export local anterior e 192 ms em Aperture com WebGL. O JavaScript decodificado foi de 348 KiB para 942 KiB com a cena ativa e 356 KiB com movimento reduzido. O CLS observado foi zero. Os servidores locais são distintos e a comparação serve como amostra de laboratório. Em 60 intervalos com a cena ativa, o p95 foi 33,4 ms no desktop e 16,8 ms no perfil móvel emulado. O axe encontrou zero violações A/AA nas quatro combinações de idioma e tamanho auditadas. Os títulos do acervo também foram verificados com JavaScript desativado. A validação local não cobre leitor de tela, GPU de dispositivos físicos ou execução remota na Vercel.
