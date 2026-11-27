"""Vazou nome e CPF. O golpe vem depois. — post leve, 09:30."""
import os
import sys

PASTA = os.path.dirname(os.path.abspath(__file__))
SKILL = os.environ.get("ESTUDIO_SKILL", os.path.normpath(os.path.join(PASTA, "../../../.agents/skills/estudio-de-posts")))
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from estudio import *  # noqa: E402,F403

TOTAL = 4


def caso(nome, numero, detalhe, top, t):
    return card(80, top, 920, 190,
                f'<div class="small-caps" style="position:absolute;left:40px;top:34px;color:{APOIO};">{nome}</div>'
                f'<div class="serif accent" style="position:absolute;left:40px;top:70px;font-size:76px;line-height:1;">{numero}</div>'
                f'<div style="position:absolute;left:40px;top:150px;width:840px;font-size:24px;color:{APOIO};">{detalhe}</div>', t)


cenas = [
    cena(2.2, capa_reel("Vazamentos", "Vazaram só seu nome e CPF?", "O golpe vem depois.",
                        chips=("Cibersegurança", "Golpes"), destaque="Arraste para entender")),

    cena(6.6, topo("Só em novembro", 1, TOTAL)
         + titulo('Dois vazamentos <span class="accent">em uma semana.</span>')
         + caso("Caixa Vida e Previdência", "7,6 milhões", "de clientes com nome e CPF expostos", 440, 0.8)
         + caso("Tesouro Nacional", "30 mil cadastros", "e cerca de 4 mil chaves Pix", 660, 1.6)
         + legenda("Nos dois casos, as empresas dizem que não houve acesso a senhas nem prejuízo financeiro.", 900, 2.6)),

    cena(6.2, topo("Então está tudo bem?", 2, TOTAL)
         + titulo('O perigo não é a senha. <span class="accent">É o contexto.</span>')
         + card(80, 450, 920, 250,
                '<div class="semi" style="position:absolute;left:40px;top:40px;width:840px;font-size:34px;line-height:1.4;">'
                'Com seu nome, CPF e e-mail, o golpista liga <span class="accent">parecendo a sua empresa, o seu banco ou o governo.</span></div>', 1.0)
         + legenda('O próprio Tesouro avisou: os dados podem deixar contatos falsos <b>mais convincentes</b>.', 760, 2.2)),

    cena(7.0, topo("Na prática", 3, TOTAL)
         + titulo('Quando alguém já sabe <span class="accent">seus dados.</span>')
         + lista_check(["Saber seu CPF não prova que é o seu banco",
                        "Desligue e ligue você, no número oficial",
                        "Nunca passe código recebido por SMS ou e-mail",
                        "Desconfie de cobrança ou pedido inesperado"],
                       top=400, passo=150, t0=0.8, dt=1.1)),

    cena(5.6, topo("Se você é cliente", 4, TOTAL)
         + titulo('Fique de olho <span class="accent">nas próximas semanas.</span>')
         + card(80, 450, 920, 210, f'<div class="serif" style="position:absolute;left:40px;top:46px;width:840px;font-size:54px;line-height:1.08;color:{SOBRE_DESTAQUE};">A notícia dura um dia. O dado vazado continua circulando.</div>', 0.9, fundo=DESTAQUE)
         + legenda('Por isso o golpe pode chegar semanas depois, quando ninguém mais lembra do vazamento.', 720, 2.0)),

    cena(5.0, fechamento('Você já recebeu uma ligação de alguém <span class="accent">que sabia seus dados?</span>',
                         fontes="Caixa Vida e Previdência e Tesouro Nacional (via Times Brasil e Fast Company Brasil, nov/2026)")),
]
build(cenas, os.path.join(PASTA, "post.html"), "Vazou nome e CPF. O golpe vem depois.")
