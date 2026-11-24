# Publicação (Buffer, hospedagem e Adobe Express)

IDs de organização e canais ficam em `config/perfil.json` → `canais`. Se estiverem vazios ou derem erro, descubra com `get_account` + `list_channels` e proponha atualizar o perfil.

## Sumário
1. Limites do Buffer
2. Hospedar o vídeo
3. Criar os posts
4. Conferência depois de agendar
5. Versão editável no Adobe Express

## 1. Limites do Buffer
- Plano gratuito: no máximo 10 posts agendados por vez.
- Primeiro comentário automático no LinkedIn exige plano pago (erro 400). Coloque o link na legenda.
- Datas em ISO 8601 com o fuso do perfil (ex.: `-03:00`). Pegue o horário atual com `get_account` (`currentTime`); nunca agende no passado.

## 2. Hospedar o vídeo
O Buffer baixa a mídia na hora de publicar: o link precisa ser público, permanente e responder a `HEAD` com 200.

**Opção recomendada — pasta de mídia do site do autor**: commit do MP4 em `public/midia/AAAA-MM-DD-slug.mp4` no repositório do site e use a URL publicada depois do deploy.

**Opção alternativa — projeto Vercel por post**:
1. Suba o MP4 ao Creative Cloud (`asset_initialize_file_upload` → `curl -X PUT --data-binary @arquivo` no link de transferência → `asset_finalize_file_upload`). O `presignedAssetUrl` vale ~4 h.
2. `create_deployment` com um `build.py` que baixa esse link, confere o md5 e grava em `public/<nome>.mp4` (vercel.json: `buildCommand: python3 build.py`, `outputDirectory: public`, `installCommand: echo skip`, `framework: null`).
3. Espere 200 em `https://<projeto>.vercel.app/<nome>.mp4` e confira o md5 baixado.
4. Mantenha o projeto no ar até o post ficar `sent`; depois ele pode ser apagado (pergunte antes).

**Não servem**: link temporário da Adobe (expira e recusa HEAD), link de visualização do Drive ou do Express.

## 3. Criar os posts
LinkedIn (vídeo):
```
create_post(channelId=<canais.linkedin.id>, schedulingType="automatic", mode="customScheduled",
            dueAt="AAAA-MM-DDTHH:MM:00-03:00", text=<legenda com link https>,
            assets=[{"video": {"url": <mp4>, "metadata": {"title": <título>}}}])
```
Instagram (Reel no feed, com capa):
```
create_post(channelId=<canais.instagram.id>, schedulingType="automatic", mode="customScheduled", dueAt=...,
            metadata={"instagram": {"type": "reel", "shouldShareToFeed": true}},
            text=<legenda com "Acesse: dominio/caminho">,
            assets=[{"video": {"url": <mp4>, "metadata": {"title": <título>, "thumbnailOffset": 1000}}}])
```
- A capa do Reel é um quadro do próprio vídeo escolhido por `thumbnailOffset` (ms); o Buffer não aceita imagem de capa separada para vídeo. Por isso todo vídeo abre com `capa_reel`.
- Carrossel de documento no LinkedIn: `assets=[{"document": {"url": <pdf>, "title": ..., "thumbnailUrl": <capa>}}]`. Carrossel no Instagram: até 10 imagens JPG 1080×1350 com `altText`.
- Execução automática (tarefa agendada): `saveToDraft: true` até a aprovação.
- "Agora": `mode: "shareNow"`.

## 4. Conferência depois de agendar
1. `list_posts` para confirmar status `scheduled` e ausência de duplicatas (sessões podem reiniciar no meio; sempre confira antes de recriar).
2. Baixe o `thumbnail` do post do Instagram e confirme que é a capa.
3. Depois do horário, confira se ficou `sent`. Em erro de mídia, `edit_post` trocando a mídia e reagende.

## 5. Versão editável no Adobe Express
1. Gere HTML estático com o estado final de cada cena, sem `<script>` e sem elementos que só existem na animação.
2. **Achate o layout**: cada elemento posicionado direto no slide, um bloco de texto por elemento. O importador desloca filhos de contêineres sem fundo e corta texto de várias linhas quando o `line-height` está em px — use proporção (1.2, 1.4).
3. Evite caracteres fora da fonte (✕ vira quadrado; use ×). ✓ e → funcionam.
4. Rode `html_export_readiness_skill` antes de cada `export_html_to_express`. HTML grande: suba ao Creative Cloud e passe a URL (`*.adobe.com`).
5. Baixe o PDF com `download_design` e confira as páginas. Cada exportação cria um documento novo; diga quais rascunhos podem ser apagados.
