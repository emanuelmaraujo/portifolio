# Relatório 02 · Feixe (abertura, hero, gesto e caso Prumo)

21/11/2026. Local, sem publicação. Nada commitado. Worktree `.claude/worktrees/portfolio-next-prototypes-d3ef6d`, base `51987fb`. A e B seguem intactos.

## A obra em uma frase

O visitante traça um feixe de luz num salão escuro e os tijolos soltos se assentam na marca em torno da linha dele; ao rolar, a marca se solta e o mesmo feixe vira o fio de prumo que pesa um preço contra o histórico observado. Diz, com a mão do visitante, o que eu faço: a ordem vem de uma regra, e a regra só decide com evidência.

- URL local: `http://localhost:3211/prototipos/feixe?intro` (o `?intro` força a chegada; sem ele, quem volta na mesma sessão entra direto).
- Direto no caso: `/prototipos/feixe#caso`.
- Gravações: `evidence/feixe/feixe-desktop.mp4` (1440×900) e `feixe-celular.mp4` (390×844), do primeiro quadro à mudança de veredito, com os gestos reais. Feitas em Chromium automatizado com GPU; o celular é emulação com toque.

## O que o visitante faz e o que muda

| Momento | Estímulo | Ação | Consequência |
|---|---|---|---|
| Chegada | Salão em névoa, tijolos à deriva vindo do fundo, título espalhado, convite "Trace um feixe" | Mover o mouse | Os tijolos perto do cursor acendem |
| Hero | O convite | Arrastar (mouse), tocar ou segurar e arrastar (celular), Enter e setas (teclado) | O feixe acende no traço, a marca se monta em torno dele no ângulo e tamanho do traço, o título se ordena a partir de onde o feixe passou |
| Repetir | "Trace outro" | Novo traço | A marca se desfaz e se refaz na nova linha; traço inclinado ao contrário espelha a marca |
| Abandonar | Nenhum gesto, ou rolar | Nada | Em 5,2 s, ou ao primeiro scroll, o sistema traça o próprio feixe |
| Passagem | Rolagem nativa | Rolar | Os tijolos se soltam, o feixe gira até a vertical e desce com a página |
| Caso | Prumo de latão pendurado no feixe, parede de tijolos = histórico de preço | Arrastar o prumo, estreitar a janela, marcar "preço subiu" | O fio balança, a parede treme, o veredito some ("Pesando…") e só volta com o fio em repouso; a parte não observada do histórico se solta |

Vereditos exercitados nas gravações e nos testes: Menor preço da janela, Acima do típico, Desconto inflado, Observação recém-iniciada.

## Comparação

- Site publicado: nuvem de pontos que muda de forma com a rolagem; o visitante assiste.
- A e B: a mesma página com outra moldura; objeto ao lado de uma headline.
- Feixe: matéria sólida e iluminada, uma luz que é do visitante, e um único elemento (a linha) que muda de função entre hero e caso.

## Obras abertas e o que saiu delas

Abertas no Chrome nesta sessão: Why Zero (desktop, com gesto e rolagem), Rejouice, Ponpon Mania (só a tela de carregamento), Mechanical Watch (arraste), e o site publicado em `/pt`. Não abri The Boat nem Juan Mora, e não repeti as referências em viewport de celular; para esses vale a leitura que veio no mandato.

1. Why Zero: um material ocupa a tela e o pedido é um gesto que é a tese ("Draw a zero"). Decisão: o gesto de abertura é traçar o feixe da própria marca, e há sempre saída direta, porque lá a rolagem não destrava a abertura.
2. Mechanical Watch: manipular para entender um mecanismo. Decisão: no caso, o prumo é o instrumento; mexer na evidência muda o veredito.
3. Rejouice: a entrada já mostra o próximo plano. Decisão: o feixe do hero não some, ele vira o fio do caso durante a rolagem.

## Ativos

| Ativo | Origem | Arquivo |
|---|---|---|
| Salão (fundo) | ChatGPT Imagens, conta do Emanuel | `public/prototypes/feixe/hall.jpg`, original em `assets-src/hall-chatgpt.png` |
| Névoa em movimento | Google Flow, Omni 1.2 Flash, 720p 8 s, 24 créditos de 1.050 | `public/prototypes/feixe/haze.mp4` (110 kB, loop com fusão), original em `assets-src/haze-flow.mp4` |
| Prumo 3D | Blender 5.2, script `assets-src/prumo_bob.py`, GLB validado (0 erros) | `public/prototypes/feixe/prumo.glb` (85 kB) |
| Marca em tijolos | gerada em código a partir de `mark-paths.json` | sem arquivo |

Direitos de uso comercial das saídas do ChatGPT e do Flow: a confirmar nos termos das contas antes de publicar.

## Lógica do veredito

Dados de exemplo, rotulados na tela. Os limiares foram lidos de `D:/Dev/Prumo/prumo/core/policy.py` e a ordem das regras de `verdict.py`: janela de 90 dias cortada ao observado, tolerância de 3%, mínimo de 4 observações, alta de 10% em 14 dias, percentil 70 ponderado no tempo. É uma versão reduzida; o motor real tem mais regras (série esparsa, queda implausível, fonte homogênea).

## Verificação

`evidence/feixe/fluxos.txt`: 24 de 24 no build de produção, Chromium.

- Abertura: começa espalhada, link de projetos visível antes de qualquer gesto, resolve sozinha.
- Gesto: traço curto abandonado, dois traços seguidos, teclado (Enter e setas).
- Caso: slider por teclado passa por "Pesando…" e muda o veredito; inflado e recém-iniciado conferidos.
- Acesso direto ao caso e retorno na mesma sessão sem repetir a abertura.
- Movimento reduzido: título legível de imediato, cena parada, veredito muda sem balanço.
- Sem JS: título, link de projetos e texto do caso no HTML.
- Celular (emulado): CTA dentro da primeira tela, swipe rola a página, segurar e arrastar desenha sem rolar, alvos de 44 px, sem overflow.
- axe WCAG 2.2 AA: 0 violações com hero e com caso em vista.
- Build: `/prototipos/feixe` 107 kB de First Load (home atual 121 kB); three carrega sob demanda. Os 9 testes do repositório passam.

## Crítica independente

ChatGPT recebeu só as folhas de quadros das duas gravações, sem explicação. Leu a sequência corretamente, identificou o dono e a atuação, e respondeu "claramente autoral". Lembrança: a marca materializada e a frase "Modelos sugerem, regras determinísticas decidem". Atritos apontados: excesso de partículas soltas, contraste de textos secundários, e espetáculo antes da substância.

Aplicado depois da crítica: o que está solto escurece assim que algo é construído, textos secundários mais claros com fundo mais fechado, passagem mais curta. Regravado depois disso. Não pedi uma segunda rodada de crítica sobre a versão ajustada.

## Pronto para julgar

Abertura, gesto, repetição, passagem e a interação do caso, em desktop e no celular emulado.

## Ainda depende de validação

- Aparelho real: iOS Safari e Android, toque de verdade, bateria e taxa de quadros. Nada disso foi medido.
- Firefox e WebKit não foram abertos.
- O frame do "passagem" ainda é denso; a parede do caso ficou mais apagada depois do ajuste de silêncio e merece uma rodada de luz.
- A crítica viu quadros, não o movimento.
- Só PT-BR. O texto da passagem e os rótulos novos estão em `Feixe.tsx` (`fx`).
- O download do Chrome ficou como `.tmp` na pasta Downloads (copiei de lá); pode haver um aviso de download pendente no navegador.

## Rodada 2 · 22/11/2026 · depois de desenhar o zero no Why Zero

Desenhei o zero com mouse real (Chromium automatizado; quadros e vídeo em `evidence/referencias/`). O que mudou no Feixe por causa disso:

| No Why Zero | No Feixe agora |
|---|---|
| O traço derrete o gelo numa faixa larga | A página abre sob um véu escuro (o salão); o traço o rasga numa faixa larga com borda incandescente e mostra a cena clara por baixo |
| Fechar o zero estoura em branco e troca de mundo | Soltar o traço alarga o rasgo até o véu sumir, com um clarão; a página passa de grafite para osso, com texto em tinta |
| "You Believed" nomeia o ato | "Você orquestrou." aparece uma vez, só quando o feixe foi do visitante (não no automático) |
| A câmera gira em volta da mão na rolagem | A marca cresceu, ganhou cinco camadas de profundidade, e a câmera gira em volta dela na rolagem; o título gira junto e volta de frente quando o gráfico chega |

Agora são três mundos: véu escuro, salão claro, sala escura do caso. A névoa do Flow e o salão do ChatGPT ficam no véu e na sala do caso.

Verificação desta rodada: 24 de 24 fluxos no build de produção (Chromium), axe sem violações nos dois mundos, 9 testes do repositório verdes, `/prototipos/feixe` com 108 kB de First Load. Gravações e folhas de quadros em `evidence/feixe/` foram refeitas.

Ainda fraco ou não verificado:
- O rasgo se alarga como uma cápsula regular; falta borda orgânica.
- A passagem escura segue densa de tijolos soltos.
- Não pedi nova crítica independente sobre esta versão.
- Continua sem aparelho real, Firefox e WebKit.
- Não usei banco de imagens nem template MIT: a cena não precisou.

## Rodada 3 · 22/11/2026 · de página com efeito para cena

Pedido: mais imersivo, com o Why Zero como régua. O motor foi reescrito (`scene.ts`) e passou a renderizar em três passos: a cena, um passo de brilho e um passo final que põe um vidro entre o visitante e a cena.

| Antes | Agora |
|---|---|
| Véu: imagem escura recortada em 2D | Vidro fumê fosco dentro da cena: refrata e desfoca o que está atrás, tem grão próprio, e o cursor o desembaça onde passa |
| Rasgo em forma de cápsula | Degelo com borda irregular e incandescente a partir do traço; ao soltar, o vidro inteiro derrete de dentro para fora com um clarão |
| Marca chapada, câmera fixa de frente | Monumento com cinco camadas sobre um piso, com sombra projetada e reflexo; câmera levemente acima, que chega de longe, dá um empurrão no momento do feixe e sobe em órbita na rolagem |
| Feixe como linha | Feixe mais brilhante que o branco, com halo de bloom, atravessando o monumento |
| Sem leitura de estado | Medidor "ordem" de 000 a 100 no canto, lendo quantos tijolos estão assentados |

Mantido: "Você orquestrou.", os três mundos, o caso Prumo com prumo de latão, vereditos e controles.

Verificação: 24 de 24 fluxos no build de produção (Chromium com GPU), axe sem violações, 9 testes do repositório, `/prototipos/feixe` com 108 kB de First Load. Gravações, folhas de quadros e os quadros `vidro-rasgado.jpg` e `hero-claro.jpg` refeitos.

Defeito encontrado e corrigido nesta rodada: em movimento reduzido e em visita de retorno a marca não aparecia, porque o feixe era medido antes de a câmera existir. Agora os traços são medidos por uma câmera de repouso.

Limites honestos:
- Não é o Why Zero. Lá há personagem modelado, materiais pintados e direção de arte de estúdio. Aqui a figura ainda é feita de tijolos, sem modelo esculpido além do prumo.
- O passo final custa GPU: sete amostras de desfoque por pixel enquanto o vidro existe. Não medi taxa de quadros nem bateria em aparelho real, e no celular o reflexo fica desligado.
- Na passagem, a frase fica sobre uma nuvem densa de tijolos e perde leitura por instantes.
- Com a câmera inclinada, a marca avança sobre o título e o texto de apoio no desktop.
- Só Chromium; sem nova crítica independente desta versão.
