"""Drupal: corrigida num dia, explorada no outro — post aprofundado, 14:30."""
import os
import sys

PASTA = os.path.dirname(os.path.abspath(__file__))
SKILL = os.environ.get("ESTUDIO_SKILL", os.path.normpath(os.path.join(PASTA, "../../../.agents/skills/estudio-de-posts")))
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from estudio import *  # noqa: E402,F403

TOTAL = 7


def linha_do_tempo(eventos, top=420, passo=150, t0=0.8):
    s = f'<div {fade(t0 - 0.2, 0)} style="position:absolute;left:110px;top:{top + 20}px;width:4px;height:{(len(eventos) - 1) * passo}px;background:{BORDA};"></div>'
    for i, (d, txt, quente) in enumerate(eventos):
        y, t = top + i * passo, t0 + i * 0.75
        cor = DESTAQUE if quente else APOIO
        s += (f'<div {pop(t)} style="position:absolute;left:98px;top:{y + 8}px;width:28px;height:28px;border-radius:14px;background:{cor};"></div>'
              f'<div {fade(t, 0)} class="small-caps" style="position:absolute;left:160px;top:{y + 4}px;color:{cor};">{d}</div>'
              f'<div {fade(t + 0.1, 0)} style="position:absolute;left:160px;top:{y + 42}px;width:820px;font-size:30px;line-height:1.3;">{txt}</div>')
    return s


def bloco(texto, top, t, destaque=False, h=150):
    fundo = DESTAQUE if destaque else CARD
    cor = SOBRE_DESTAQUE if destaque else TEXTO
    return card(80, top, 920, h, f'<div class="semi" style="position:absolute;left:40px;top:36px;width:840px;font-size:32px;line-height:1.35;color:{cor};">{texto}</div>', t, fundo=fundo)


cenas = [
    cena(2.2, capa_reel("Falha explorada", "Corrigida num dia, explorada", "no outro.",
                        chips=("Cibersegurança", "Drupal"), destaque="CVE-2026-132165")),

    cena(5.6, capa("Uma falha crítica no Drupal foi corrigida em 18/11", "e explorada no dia seguinte.",
                   selo="SA-CORE-2026-017")),

    cena(6.6, topo("A falha", 2, TOTAL)
         + titulo('O instalador virou <span class="accent">porta de entrada.</span>')
         + bloco('O <b>install.php</b>, que só deveria rodar na instalação, podia ser usado para <b>reinstalar um site que já existe</b>.', 430, 0.9, h=170)
         + bloco('Resultado: tomada do site ou execução remota de código, <b>sem login</b>.', 630, 1.9, destaque=True, h=130)
         + legenda('Classificação do Drupal: <b>Highly critical, 20/25</b>.', 800, 2.8)),

    cena(7.4, topo("Linha do tempo", 3, TOTAL)
         + titulo("Do aviso ao ataque")
         + linha_do_tempo([
             ("16/11", "Drupal avisa que vem correção de segurança", False),
             ("18/11", "Correção publicada (10.6.22, 11.3.22 e 11.4.13)", False),
             ("19/11 · 19h UTC", "Primeira exploração relatada em sites reais", True),
             ("24/11", "CISA inclui a falha no catálogo KEV", True),
             ("27/11", "Prazo para órgãos federais dos EUA corrigirem", False),
         ], top=330, passo=165)),

    cena(6.6, topo("Por que tão rápido", 4, TOTAL)
         + titulo('A correção também <span class="accent">ensina o atacante.</span>')
         + bloco('Quando o patch sai, comparar a versão antiga com a nova mostra <b>onde estava o erro</b>.', 470, 0.9, h=170)
         + legenda('Aqui, entre a correção e o primeiro ataque relatado, passou <b>cerca de um dia</b>. Atualizar "na próxima janela" já pode ser tarde.', 690, 2.0)),

    cena(6.2, topo("Quem encontrou", 5, TOTAL)
         + titulo('Achada por um <span class="accent">scanner de IA.</span>')
         + bloco('O aviso do Drupal credita a descoberta ao <b>scanner de código aberto da Anthropic</b>.', 340, 0.9, h=170)
         + legenda('IA acelera a descoberta de falhas. O que define o risco continua sendo <b>quanto tempo a correção leva para chegar ao servidor</b>.', 560, 2.0)),

    cena(6.2, topo("Nem todo site", 6, TOTAL)
         + titulo('Quem está <span class="accent">mais exposto.</span>')
         + bloco('Só <b>configurações incomuns</b> são exploráveis, segundo o Drupal.', 340, 0.8, h=130)
         + bloco('Parte dos caminhos de ataque falha se o servidor web <b>não pode escrever no settings.php</b>.', 500, 1.5, h=170)
         + legenda('Por isso a correção vale para todos: é difícil ter certeza de que a sua configuração não é a incomum.', 720, 2.4)),

    cena(7.0, topo("O que fazer", 7, TOTAL)
         + titulo('Se você tem Drupal, <span class="accent">hoje.</span>')
         + lista_check(["Atualizar para 10.6.22, 11.3.22 ou 11.4.13",
                        "Sem como atualizar agora: proteger o install.php",
                        "Servidor web sem permissão de escrita no settings.php",
                        "Versão 11.2 / 10.5 ou anterior: sem correção, planeje migrar"],
                       top=340, passo=150, t0=0.8, dt=1.1)),

    cena(5.0, fechamento('Quanto tempo vocês levam entre o patch sair <span class="accent">e ele chegar ao servidor?</span>',
                         fontes="Drupal SA-CORE-2026-017 · CISA Known Exploited Vulnerabilities")),
]
build(cenas, os.path.join(PASTA, "post.html"), "Drupal: corrigida num dia, explorada no outro")
