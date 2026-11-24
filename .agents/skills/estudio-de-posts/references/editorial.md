# Método editorial

## Sumário
1. Tom de voz
2. Estrutura do roteiro e formatos
3. Legenda
4. Exemplos de legendas aprovadas
5. Revisão antes de mostrar

## 1. Tom de voz

Soar como um profissional experiente conversando com um colega: direto, concreto e sem tom de palestra. Regras extras de tom ficam em `tom` no `config/perfil.json`.

**Funciona**
- Abrir com uma situação reconhecível ou uma pergunta real ("Quantos links você já mandou para você mesmo para ler depois?").
- Primeira pessoa e experiência própria quando houver ("Eu fazia isso o tempo todo.").
- Exemplo concreto antes do conceito ("Imagine que você pede: 'cria um post e agenda para amanhã'.").
- Número com fonte e com o que ele significa na prática.
- Fechar com uma pergunta simples, que alguém consiga responder em uma linha.

**Não funciona**
- Frases de efeito em sequência ("A IA copia a voz. Não copia o combinado."). Uma pode; três seguidas viram pôster.
- Tom de quem ensina de cima para baixo ("Skills dizem como fazer. RAG traz o que saber.").
- Generalizar o público quando o post é sobre uma ameaça específica (falar "para empresas" quando o foco era o perigo para todos).
- Final carregado. O começo pode ter gancho forte; o final deve ser leve.
- Promessa absoluta ("nunca mais", "100% seguro").

**Teste rápido**: leia a frase em voz alta. Se parece slogan ou slide de palestra motivacional, reescreva como você diria numa conversa de corredor.

**Ajuste pelo peso**: no leve, todo termo técnico é explicado na mesma frase. No aprofundado, use o vocabulário técnico sem explicar o básico — a profundidade é o valor do post.

## 2. Estrutura do roteiro e formatos

Leve: 5–7 cenas (30–40 s). Aprofundado: 8–10 cenas (50–70 s). Regras para todas as cenas:
- Uma ideia por cena.
- Kicker (assunto), título curto (até 3 linhas), **um** elemento visual, uma linha de apoio.
- Ordem de entrada: título → visual → apoio. Uma coisa chamando atenção por vez.
- Primeira cena: `capa_reel` estática (vira capa do Reel e miniatura). Última: `fechamento` com pergunta, assinatura e fontes ou link.

Entregue o roteiro como uma tabela curta antes de produzir quando o pedido for aberto:

| # | Kicker | Título | Visual | Apoio |
|---|---|---|---|---|

**Formatos** (modelos em `assets/modelos/`; no aprofundado, acrescente cenas de mecanismo e limitação):
- **novidade** — o que aconteceu → por que importa → como funciona → o que o dado não diz → o que fazer.
- **explicador** — problema → conceito com analogia → como funciona → o que fazer.
- **comparativo** — dilema → opção A → opção B → critérios lado a lado → quando usar cada uma.
- **checklist** — por que agora → itens → como conferir.
- **caso** — o que aconteceu (só fatos confirmados) → linha do tempo → causa conhecida → o controle que teria evitado.

## 3. Legenda

Formato (até `tom.legenda_linhas_max` linhas, padrão 7):
```
<situação ou pergunta reconhecível>
<o que o post mostra — 1 a 2 frases, com o dado principal>
<convite para ver o vídeo ou acessar>
<pergunta final>
<Fontes: … (quando houver dado)>
<link>
#Hashtag1 #Hashtag2 #Hashtag3
```
- **Sem @ e sem # no meio do texto**: o Instagram transforma em menção ou hashtag (ex.: uma senha de exemplo com @).
- Hashtags só na última linha, no máximo `tom.hashtags_max`.
- LinkedIn: link completo (https://…). Instagram: "Acesse: dominio/caminho" (link na legenda não é clicável lá).
- No aprofundado, pode ter uma linha a mais de contexto técnico; a profundidade fica no vídeo.

Rode `scripts/checar_legenda.py legenda.md` antes de mostrar.

## 4. Exemplos de legendas aprovadas

**Leve — explicador (agentes de IA)**
> Se você ainda não sabe como um agente de IA funciona na prática, essa animação mostra o passo a passo.
> Imagine que você pede: "cria um post sobre golpes e agenda para amanhã".
> O agente pega as instruções certas para aquela tarefa (é a skill). Se precisar de informação, consulta os seus arquivos antes de responder (RAG).
> Para executar, usa as ferramentas que você já tem (MCP). E segue as etapas até entregar (workflow).
> Foi assim que este próprio post foi feito.

**Leve — novidade (relatório de segurança)**
> Saiu o maior relatório de vazamentos de dados do mundo, e uma coisa me chamou atenção: pela primeira vez em 19 anos, a principal porta de entrada dos ataques não é mais a senha roubada. É o sistema desatualizado.
> E com a IA, o tempo entre uma falha aparecer e alguém explorar caiu de meses para horas.
> Separei no vídeo os pontos que mais mudam o nosso dia a dia.
> Quantas atualizações estão esperando aí no seu celular agora?

**Leve — golpes com IA (versão curta, só os novos perigos)**
> Por muito tempo, dava para reconhecer um golpe pelos erros de português. Isso ficou para trás.
> Com a IA, a mensagem chega sem erro nenhum. A voz no áudio é igual à do seu filho. O rosto na videochamada é o do seu chefe.
> E muitos golpistas nem pedem nada no começo. Primeiro ganham a sua confiança. O pedido vem depois.
> Você já recebeu alguma mensagem assim?

**Bastidores (divulgação de projeto próprio)**
> Quantas estrelas você já deu no GitHub para "ver depois"? Quantos links mandou para você mesmo?
> Eu fazia isso o tempo todo. E na hora que precisava, não achava nada.
> Por isso montei o Radar: um lugar só com os principais projetos, repositórios, skills e referências — de IA e segurança a design e motion.
> Sem precisar salvar nem controlar. É só entrar e localizar. Aberto e gratuito.

Para o aprofundado, mantenha o mesmo esqueleto e troque a situação do dia a dia por uma situação técnica ("Seu agente lê um PDF e, de repente, manda um e-mail que ninguém pediu."), com uma pergunta final técnica ("Vocês exigem confirmação humana para ações de escrita dos agentes?").

## 5. Revisão antes de mostrar

- [ ] Peso declarado e coerente (vocabulário e profundidade batem com leve/aprofundado).
- [ ] Fatos e números conferidos em fontes confiáveis e relevantes, com link em `apuracao.md`; nada inventado; exemplos ilustrativos parecem exemplos.
- [ ] Termina em algo útil: uma ação, um critério técnico ou um entendimento claro.
- [ ] Folha de revisão sem texto sobreposto, cortado ou vão vazio; capa legível em miniatura; sem avisos do `capture.js`.
- [ ] `checar_legenda.py` sem erros e legenda lida em voz alta sem frase de pôster.
