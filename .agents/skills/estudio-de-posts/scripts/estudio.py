"""Motor de cenas do Estúdio de Posts.

A identidade visual (cores, fontes, logo, assinatura) vem do perfil em
config/perfil.json — o motor não tem nada fixo de uma pessoa. Para usar outro
perfil, aponte ESTUDIO_PERFIL para o arquivo JSON.

Uso típico, num roteiro (ex.: edicoes/2026-11-30-slug/cenas.py):

    from estudio import *
    cenas = [cena(2.2, capa_reel("Kicker", "Linha branca", "Linha de destaque"))]
    cenas.append(cena(6.0, topo("Kicker", 2, 8) + titulo('Frase <span class="accent">destaque.</span>')))
    build(cenas, "post.html", titulo_pagina="Nome do post")

Cada cena é um bloco HTML 1080x1350 com posições absolutas. A animação é
declarativa: data-kf (keyframes), data-type (máquina de escrever) e data-count
(contador), com tempos relativos ao início da cena.
"""
import json
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
ASSETS = os.path.join(RAIZ, "assets")


def carregar_perfil(caminho=None):
    caminho = caminho or os.environ.get("ESTUDIO_PERFIL") or os.path.join(RAIZ, "config", "perfil.json")
    with open(caminho, encoding="utf-8") as f:
        return json.load(f)


PERFIL = carregar_perfil()
_C = PERFIL["marca"]["cores"]
_F = PERFIL["marca"]["fontes"]
_A = PERFIL["autor"]

# paleta exposta aos roteiros (nomes estáveis, valores do perfil)
FUNDO, CLARO, DESTAQUE = _C["fundo"], _C["claro"], _C["destaque"]
TEXTO, APOIO, APOIO_ESCURO = _C["texto"], _C["apoio"], _C["apoio-escuro"]
CARD, BORDA, SOBRE_DESTAQUE = _C["card"], _C["borda"], _C["sobre-destaque"]
# aliases da versão anterior (roteiros antigos continuam funcionando)
PRETO, CREME, LARANJA, CINZA, CINZA_ESCURO = FUNDO, CLARO, DESTAQUE, APOIO, APOIO_ESCURO

NOME = _A["nome"]
ASSINATURA = _A["assinatura"]
CHAMADA_FINAL = _A.get("chamada_final", "Siga para mais")
_LOGO = PERFIL["marca"]["logo"]


# ---------- primitivas de animação ----------
def kf(*keys):
    """Keyframes: kf((t, {"o":0,"y":24}), (t2, {"o":1,"y":0})).
    Props: o (opacidade), x, y (px), s (escala), w, h, top, left (px), dash (stroke-dashoffset)."""
    return "data-kf='" + json.dumps([[t, d] for t, d in keys], separators=(",", ":")) + "'"


def fade(t, dy=24, d=0.45):
    """Entrada padrão: sobe dy px e aparece em d segundos a partir de t."""
    return kf((t, {"o": 0, "y": dy}), (t + d, {"o": 1, "y": 0}))


def pop(t, d=0.3, s0=0.7):
    return kf((t, {"o": 0, "s": s0}), (t + d, {"o": 1, "s": 1}))


def tipo(t, d):
    """Texto digitado: coloque em um elemento com class="type"."""
    return f'data-type="{t},{d}"'


def conta(t, d, de, ate):
    """Contador numérico: <span {conta(0.3,1.4,0,31)}>31</span>"""
    return f'data-count="{t},{d},{de},{ate}"'


# ---------- componentes ----------
def logo(x, y, w, cor=None, destaque=None):
    """Logo do perfil. cor = parte principal; destaque = parte de cor de destaque."""
    h = round(w * _LOGO.get("proporcao", 1))
    svg = _LOGO["svg"].replace("{principal}", cor or TEXTO).replace("{destaque}", destaque or DESTAQUE)
    return f'<svg style="position:absolute;left:{x}px;top:{y}px" width="{w}" height="{h}" viewBox="{_LOGO["viewbox"]}">{svg}</svg>'


def topo(kicker, n, total):
    """Logo + kicker no topo e rodapé 'Nome  0n / total'."""
    return (logo(80, 80, 56) + f'<div class="kicker">{kicker}</div>'
            f'<div class="fname">{NOME}</div><div class="fpage">{n:02d} / {total:02d}</div>')


def titulo(html, t=0.1):
    """Título serifado itálico (até 3 linhas de 84px). Use <span class="accent"> no destaque."""
    return f'<div {fade(t)} class="title">{html}</div>'


def legenda(html, top, t=2.0):
    """Texto de apoio cinza (26px). <b> deixa uma parte em branco."""
    return f'<div {fade(t, 0)} class="caption" style="top:{top}px;">{html}</div>'


def numero(valor, top=150, t=0.3, d=1.4, tamanho=280, sufixo="", prefixo=""):
    """Número gigante laranja com contador."""
    return (f'<div class="serif accent" style="position:absolute;left:70px;top:{top}px;font-size:{tamanho}px;'
            f'line-height:1;letter-spacing:-8px;">{prefixo}<span {conta(t, d, 0, valor)}>{valor}</span>{sufixo}</div>')


def pilula(texto, left, top, t, cor=LARANJA, cheia=True):
    fundo = f"background:{cor};" if cheia else f"border:2px solid {cor};"
    cor_txt = SOBRE_DESTAQUE if cheia else cor
    return (f'<div {pop(t)} style="position:absolute;left:{left}px;top:{top}px;height:56px;padding:0 24px;{fundo}border-radius:28px;">'
            f'<div class="bold" style="position:relative;top:{14 if cheia else 12}px;font-size:24px;white-space:nowrap;color:{cor_txt};">{texto}</div></div>')


def card(left, top, w, h, inner, t, fundo=CARD, borda=None, raio=20):
    b = f"border:2px solid {borda};" if borda else ""
    return f'<div {fade(t, 20)} style="position:absolute;left:{left}px;top:{top}px;width:{w}px;height:{h}px;background:{fundo};{b}border-radius:{raio}px;">{inner}</div>'


def lista_check(itens, top=450, passo=150, t0=0.8, dt=1.0):
    """Checklist que vai sendo marcado (cena 'o que fazer')."""
    out = ""
    for i, txt in enumerate(itens):
        y, tt = top + i * passo, t0 + i * dt
        out += (f'<div {fade(tt, 16)} style="position:absolute;left:80px;top:{y}px;width:920px;height:120px;background:{CARD};border-radius:20px;">'
                f'<div style="position:absolute;left:30px;top:30px;width:60px;height:60px;border-radius:30px;border:3px solid {BORDA};"></div>'
                f'<div style="position:absolute;left:120px;top:24px;width:760px;font-size:30px;line-height:1.3;color:{TEXTO};">{txt}</div></div>'
                f'<div {kf((tt + 0.5, {"o": 0, "s": 0.5}), (tt + 0.75, {"o": 1, "s": 1}))} style="position:absolute;left:110px;top:{y + 30}px;'
                f'width:60px;height:60px;border-radius:30px;background:{LARANJA};color:{SOBRE_DESTAQUE};font-weight:700;font-size:30px;text-align:center;line-height:60px;">✓</div>')
    return out


def navegador(img, h, top=470, t=0.6, url=None):
    """Print de site (920px de largura) dentro de uma janela de navegador."""
    url = url or _A.get("site", "").replace("https://", "").replace("http://", "")
    return f"""<div {kf((t, {"o": 0, "y": 40, "s": 0.96}), (t + 0.5, {"o": 1, "y": 0, "s": 1}))} style="position:absolute;left:80px;top:{top}px;width:920px;height:{h + 44}px;background:{FUNDO};border:2px solid {BORDA};border-radius:18px;overflow:hidden;">
  <div style="position:absolute;left:0;top:0;width:920px;height:44px;background:{CARD};"></div>
  <div style="position:absolute;left:18px;top:16px;width:12px;height:12px;border-radius:6px;background:{BORDA};"></div>
  <div style="position:absolute;left:38px;top:16px;width:12px;height:12px;border-radius:6px;background:{BORDA};"></div>
  <div style="position:absolute;left:58px;top:16px;width:12px;height:12px;border-radius:6px;background:{BORDA};"></div>
  <div style="position:absolute;left:250px;top:9px;width:420px;height:26px;border-radius:13px;background:{PRETO};"><div style="position:absolute;left:0;top:3px;width:420px;text-align:center;font-size:15px;color:{CINZA};">{url}</div></div>
  <img src="{img}" style="position:absolute;left:-2px;top:44px;width:920px;height:{h}px;">
</div>"""


def capa(linha1, linha2_laranja, selo=None, apoio=None):
    """Capa padrão: logo, selo opcional, título em 2 blocos e 'Arraste para entender'."""
    s = logo(80, 80, 56)
    if selo:
        s += (f'<div {kf((0.1, {"o": 0, "x": -20}), (0.5, {"o": 1, "x": 0}))} style="position:absolute;left:80px;top:200px;'
              f'background:{LARANJA};color:{SOBRE_DESTAQUE};border-radius:10px;padding:14px 22px;" class="small-caps">{selo}</div>')
    s += (f'<div {fade(0.3)} class="serif" style="position:absolute;left:80px;top:300px;width:920px;font-size:108px;line-height:0.98;letter-spacing:-1.5px;">{linha1}</div>'
          f'<div {fade(1.1)} class="serif accent" style="position:absolute;left:80px;top:700px;width:920px;font-size:108px;line-height:0.98;letter-spacing:-1.5px;">{linha2_laranja}</div>')
    if apoio:
        s += f'<div {fade(1.8, 0)} style="position:absolute;left:80px;top:1000px;width:900px;font-size:30px;color:{CINZA};">{apoio}</div>'
    s += ('<div class="semi" style="position:absolute;left:80px;top:1180px;font-size:24px;">Arraste para entender</div>'
          f'<div style="position:absolute;left:420px;top:1192px;width:540px;height:3px;background:{TEXTO};"></div>'
          f'<svg style="position:absolute;left:944px;top:1180px" width="28" height="28" viewBox="0 0 28 28"><polygon points="0,0 28,14 0,28" fill="{TEXTO}"/></svg>')
    return s


def fechamento(pergunta_html, apoio="Me conta nos comentários.", fontes=None, link=None):
    """Cena final: pergunta, assinatura e (opcional) link e fontes."""
    s = logo(80, 96, 56)
    s += (f'<div {fade(0.2)} class="serif" style="position:absolute;left:80px;top:330px;width:920px;font-size:92px;line-height:1.02;letter-spacing:-1px;">{pergunta_html}</div>'
          f'<div {fade(1.0, 0)} style="position:absolute;left:80px;top:760px;width:900px;font-size:30px;line-height:1.45;color:{CINZA};">{apoio}</div>')
    if link:
        s += (f'<div {pop(1.2, 0.4, 0.85)} style="position:absolute;left:80px;top:840px;height:72px;padding:0 34px;background:{LARANJA};border-radius:36px;">'
              f'<div class="bold" style="position:relative;top:20px;font-size:30px;white-space:nowrap;color:{SOBRE_DESTAQUE};">{link}</div></div>')
    s += (f'<div {fade(1.4, 0)} style="position:absolute;left:80px;top:950px;width:60px;height:4px;background:{LARANJA};"></div>'
          f'<div {fade(1.4, 0)} class="bold" style="position:absolute;left:80px;top:980px;font-size:34px;">{NOME}</div>'
          f'<div {fade(1.6, 0)} style="position:absolute;left:80px;top:1030px;font-size:24px;color:{CINZA};">{ASSINATURA}</div>'
          f'<div {fade(1.8, 0)} class="semi" style="position:absolute;left:80px;top:1110px;background:{TEXTO};color:{SOBRE_DESTAQUE};border-radius:40px;padding:18px 34px;font-size:24px;">{CHAMADA_FINAL}</div>')
    if fontes:
        s += f'<div style="position:absolute;left:80px;top:1260px;width:920px;font-size:16px;color:{CINZA_ESCURO};">Fontes: {fontes}</div>'
    return s


def capa_reel(kicker, linha1, linha2_laranja, chips=(), destaque=None):
    """Capa estática (cena de ~2,2 s no início do vídeo) usada como capa do Reel no Instagram
    (thumbnailOffset=1000) e como miniatura no LinkedIn. Sem animação de entrada: o quadro em 1 s
    precisa estar completo. Título grande, chips das áreas e uma pílula laranja (link ou chamada)."""
    s = logo(80, 80, 72) + f'<div class="kicker" style="left:176px;top:104px;">{kicker}</div>'
    s += (f'<div class="serif" style="position:absolute;left:80px;top:300px;width:920px;font-size:120px;line-height:0.96;letter-spacing:-2px;">{linha1}</div>'
          f'<div class="serif accent" style="position:absolute;left:80px;top:560px;width:920px;font-size:120px;line-height:0.96;letter-spacing:-2px;">{linha2_laranja}</div>')
    x = 80
    for i, c in enumerate(chips):
        w = int(len(c) * 13.5 + 48)
        cor = LARANJA if i == 0 else BORDA
        txt = LARANJA if i == 0 else TEXTO
        s += (f'<div style="position:absolute;left:{x}px;top:780px;height:56px;width:{w}px;border:2px solid {cor};border-radius:28px;">'
              f'<div class="semi" style="position:absolute;left:0;top:13px;width:{w - 4}px;text-align:center;font-size:24px;white-space:nowrap;color:{txt};">{c}</div></div>')
        x += w + 16
    if destaque:
        s += (f'<div style="position:absolute;left:80px;top:1100px;height:72px;padding:0 32px;background:{LARANJA};border-radius:36px;">'
              f'<div class="bold" style="position:relative;top:20px;font-size:30px;white-space:nowrap;color:{SOBRE_DESTAQUE};">{destaque}</div></div>')
    return s


# ---------- montagem ----------
def cena(duracao, html):
    return (duracao, html)


def _merge_kf_class(body):
    """Garante que todo elemento com data-kf tenha a classe 'kf' sem duplicar o atributo class."""
    def fix(m):
        t = m.group(0)
        if "data-kf=" not in t:
            return t
        if re.search(r'\sclass="', t):
            return re.sub(r'\sclass="', ' class="kf ', t, count=1)
        return t.replace("data-kf=", 'class="kf" data-kf=', 1)
    return re.sub(r"<(div|span|svg|path|line)\b[^>]*>", fix, body)


def build(cenas, saida, titulo_pagina="Post"):
    """Gera o HTML animado. cenas = lista de (duracao_em_segundos, html)."""
    head = open(os.path.join(ASSETS, "base_head.html"), encoding="utf-8").read()
    css_vars = "\n".join(f"    --{k}: {v};" for k, v in _C.items())
    css_vars += (f'\n    --fonte-titulo: {_F["titulo"]};\n    --fonte-texto: {_F["texto"]};'
                 f'\n    --estilo-titulo: {_F.get("estilo_titulo", "normal")};\n    --peso-titulo: {_F.get("peso_titulo", "400")};')
    head = (head.replace("{{TITULO}}", titulo_pagina).replace("{{FONT_EMBED}}", _F.get("embed_html", ""))
                .replace("{{CSS_VARS}}", css_vars))
    fontes_checar = ",".join(_F.get("nomes_para_checagem", []))
    head = head.replace("</head>", f'<meta name="estudio:fontes" content="{fontes_checar}">\n</head>')
    engine = open(os.path.join(ASSETS, "engine.js.html"), encoding="utf-8").read()
    t, blocos = 0.0, []
    for i, (d, html) in enumerate(cenas):
        blocos.append(f'<div class="scene" data-s="{round(t, 2)}" data-e="{round(t + d, 2)}" id="sc{i + 1}">{html}</div>')
        t += d
    body = '<body>\n<div class="stage" id="stage">\n' + "\n".join(blocos) + "\n</div>\n" + engine + "\n</body>\n</html>\n"
    os.makedirs(os.path.dirname(os.path.abspath(saida)), exist_ok=True)
    open(saida, "w", encoding="utf-8").write(head + _merge_kf_class(body))
    print(f"{len(cenas)} cenas, {round(t, 1)} s -> {saida}")
    return t
