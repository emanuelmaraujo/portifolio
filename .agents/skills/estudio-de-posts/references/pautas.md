# Como encontrar o tema

## 1. Assunto do momento (primeira opção)
Procure o que está sendo discutido agora, nos últimos dias, nos pilares do perfil (IA, cibersegurança, infraestrutura, desenvolvimento/design/motion):
- lançamentos e mudanças relevantes de ferramentas, modelos e plataformas;
- vulnerabilidades exploradas, incidentes e golpes em circulação;
- pesquisas, relatórios e estudos recém-publicados;
- novidades do Radar do Emanuel (`projetos_proprios` no perfil).

Um bom assunto do momento: aconteceu há pouco, afeta muita gente da área e dá para explicar o que muda. Confirme o fato na origem antes de propor (quem anunciou, quem publicou o dado).

Transforme a notícia em post respondendo: **o que aconteceu → por que importa → como funciona → o que fazer**. No peso leve, foque em "o que muda para mim"; no aprofundado, em "como funciona por dentro e onde falha".

## 1b. O que torna o assunto interessante
O tema precisa despertar curiosidade em quem é da área: algo novo, surpreendente ou que muda como as coisas funcionam. Experiência própria do Emanuel vale quando o assunto em si é interessante para o público, não só para ele.

## 2. Tema livre
Se o Emanuel indicar um tema, ele tem prioridade. Defina o peso do dia, procure um gancho atual que conecte o tema ao momento (se houver) e siga.

## 3. Princípios e fundamentos (quando não há assunto forte)
Conhecimentos que continuam importantes e rendem tanto um post leve quanto um aprofundado. Use como ponto de partida e busque um gancho recente se existir.

**IA**
- Como um LLM gera texto: tokens, contexto, probabilidade e por que ele "alucina".
- RAG por dentro: embeddings, busca vetorial, chunking e onde a recuperação falha.
- Agentes, ferramentas e MCP: como um modelo decide chamar uma ferramenta.
- Injeção de prompt (direta e indireta) e por que é difícil de resolver.
- Como avaliar um modelo: benchmarks, conjuntos de teste próprios, regressão.
- Fine-tuning x RAG x prompt: o que cada um resolve.
- Janela de contexto, cache e custo de tokens na prática.

**Cibersegurança**
- Como funciona a autenticação com passkeys (chave pública/privada, WebAuthn).
- MFA: por que SMS é fraco, fadiga de MFA e roubo de sessão (cookies, tokens).
- Engenharia social com IA: voz, vídeo e texto falsos.
- Como uma vulnerabilidade vira exploração: CVE, CVSS, EPSS e exploração ativa.
- Cadeia de suprimentos de software: dependências, pacotes maliciosos, SBOM.
- Ransomware por dentro: acesso inicial, movimento lateral, criptografia, extorsão.
- Phishing moderno: páginas clonadas, proxy reverso, QR code.
- Zero Trust como princípio técnico (identidade, dispositivo, menor privilégio).

**Infraestrutura, cloud e redes**
- DNS de ponta a ponta e por que tantos incidentes "são DNS".
- TLS e certificados: o que acontece no cadeado.
- Containers x VMs: isolamento de verdade.
- Backup 3-2-1, imutabilidade e teste de restauração.
- Observabilidade: logs, métricas e traces.
- Como uma CDN e um WAF param ataques.

**Desenvolvimento, design e motion**
- Revisar código gerado por IA: o que costuma vir errado.
- Segredos no código: como vazam e como evitar.
- Acessibilidade: contraste, teclado, leitores de tela.
- Motion que ajuda x motion que atrapalha, e o movimento reduzido.
- Git por dentro: commits, branches e rebase sem medo.

## 4. Evite
- Posts sobre a própria ferramenta de produção (skills, o estúdio, como os posts são feitos): ele recusou esse tipo de tema.
- Temas de gestão (orçamento, contratos, indicadores de equipe, comitês).
- Repetir o tema de um post recente (veja `historico.md`) sem um ângulo novo.
- Notícia que não dá para confirmar numa fonte confiável.
