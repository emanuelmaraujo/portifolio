"""Black Friday: o cadeado não prova que a loja é real — post leve, 09:30."""
import os
import sys

PASTA = os.path.dirname(os.path.abspath(__file__))
SKILL = os.environ.get("ESTUDIO_SKILL", os.path.normpath(os.path.join(PASTA, "../../../.agents/skills/estudio-de-posts")))
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from estudio import *  # noqa: E402,F403

TOTAL = 4


def passos(itens, top=440, passo=135, t0=0.8):
    out = ""
    for i, (n, txt) in enumerate(itens):
        out += card(80, top + i * passo, 920, 115,
                    f'<div class="serif accent" style="position:absolute;left:36px;top:14px;font-size:76px;line-height:1;">{n}</div>'
                    f'<div class="semi" style="position:absolute;left:120px;top:38px;width:760px;font-size:32px;line-height:1.2;">{txt}</div>',
                    t0 + i * 0.7)
    return out

cenas = [
    cena(2.2, capa_reel("Black Friday", "Site com cadeado também pode ser", "golpe.",
                        chips=("Cibersegurança", "Golpes"), destaque="Arraste para entender")),

    cena(6.0, topo("Sexta é Black Friday", 1, TOTAL)
         + numero(53, sufixo="%", tamanho=300)
         + f'<div {fade(1.2)} class="bold" style="position:absolute;left:80px;top:470px;width:920px;font-size:44px;line-height:1.25;">dos golpes de Black Friday são sites falsos.</div>'
         + card(80, 640, 920, 190,
                f'<div class="serif" style="position:absolute;left:40px;top:44px;width:840px;font-size:58px;line-height:1.05;color:{SOBRE_DESTAQUE};">Depois vem o Pix: 42%.</div>',
                2.2, fundo=DESTAQUE)
         + legenda("Levantamento da Serasa divulgado em outubro de 2026.", 880, 3.0)),

    cena(6.0, topo("O cadeado", 2, TOTAL)
         + titulo('O cadeado só diz que a conexão <span class="accent">é criptografada.</span>')
         + card(80, 470, 920, 230,
                '<div class="semi" style="position:absolute;left:40px;top:40px;width:840px;font-size:34px;line-height:1.4;">'
                'Site falso também consegue certificado.<br>O <b>https</b> protege o caminho dos dados, mas <span class="accent">não diz quem está do outro lado.</span></div>', 1.0)
         + legenda("Ou seja: cadeado na barra não é selo de loja confiável.", 750, 2.4)),

    cena(7.0, topo("Antes de pagar", 3, TOTAL)
         + titulo('O que conferir <span class="accent">antes de pagar.</span>')
         + lista_check(["Digite o endereço da loja, em vez de clicar no link recebido",
                        "Desconfie de desconto muito acima do mercado",
                        "Veja a idade e as reclamações do site (Detector de Sites do Reclame Aqui)",
                        "Pix só dentro do checkout, conferindo o recebedor"],
                       top=420, passo=150, t0=0.8, dt=1.1)),

    cena(6.0, topo("Se cair", 4, TOTAL)
         + titulo('Caiu num golpe com Pix? <span class="accent">Aja rápido.</span>')
         + passos([("1", "Ligue para o seu banco"), ("2", "Peça o MED, o mecanismo de devolução do Pix"), ("3", "Registre o boletim de ocorrência")])
         + legenda("O MED pode ser pedido em até 80 dias, mas a devolução <b>não é garantida</b>: quanto antes, melhor.", 900, 3.2)),

    cena(5.0, fechamento('Você confere o site antes de pagar <span class="accent">ou confia no cadeado?</span>',
                         fontes="Serasa (via Forbes Brasil, out/2026) · Reclame Aqui")),
]
build(cenas, os.path.join(PASTA, "post.html"), "Black Friday: o cadeado não prova que a loja é real")
