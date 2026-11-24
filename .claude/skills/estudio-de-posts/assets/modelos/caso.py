"""Modelo: CASO / POST-MORTEM — incidente público.
Só fatos confirmados em fontes confiáveis. Sem especular culpa.
Estrutura: capa → o que aconteceu → linha do tempo → causa conhecida → controle que evitaria → pergunta → fechamento."""
import os
import sys

SKILL = os.environ.get("ESTUDIO_SKILL", "{{SKILL}}")
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from estudio import *  # noqa: E402,F403

AQUI = os.path.dirname(os.path.abspath(__file__))
TOTAL = 6


def linha_do_tempo(eventos, top=460, t0=0.8):
    """eventos = [(data, texto), ...]"""
    s = f'<div {fade(t0 - 0.2, 0)} style="position:absolute;left:110px;top:{top}px;width:4px;height:{len(eventos) * 140}px;background:{BORDA};"></div>'
    for i, (d, txt) in enumerate(eventos):
        y, t = top + i * 140, t0 + i * 0.7
        s += (f'<div {pop(t)} style="position:absolute;left:98px;top:{y + 10}px;width:28px;height:28px;border-radius:14px;background:{DESTAQUE};"></div>'
              f'<div {fade(t, 0)} class="small-caps" style="position:absolute;left:160px;top:{y + 6}px;color:{DESTAQUE};">{d}</div>'
              f'<div {fade(t + 0.1, 0)} style="position:absolute;left:160px;top:{y + 44}px;width:820px;font-size:30px;line-height:1.3;">{txt}</div>')
    return s


cenas = [
    cena(2.2, capa_reel("Caso real", "[[O que aconteceu]]", "[[e a lição.]]", chips=("[[Pilar]]",), destaque="Arraste para entender")),
    cena(5.2, topo("O que aconteceu", 1, TOTAL) + titulo('[[Fato principal <span class="accent">com fonte.</span>]]') + legenda("[[Fonte oficial.]]", 560, 1.4)),
    cena(6.4, topo("Linha do tempo", 2, TOTAL) + titulo("[[Como se desenrolou]]")
         + linha_do_tempo([("[[data]]", "[[evento]]"), ("[[data]]", "[[evento]]"), ("[[data]]", "[[evento]]")])),
    cena(5.2, topo("Causa conhecida", 3, TOTAL) + titulo('[[A causa <span class="accent">divulgada.</span>]]') + legenda("[[O que ainda não se sabe.]]", 560, 1.6)),
    cena(5.6, topo("O controle", 4, TOTAL) + titulo('[[O que teria <span class="accent">reduzido o impacto.</span>]]')
         + lista_check(["[[controle 1]]", "[[controle 2]]", "[[controle 3]]"])),
    cena(5.0, fechamento('[[Isso passaria <span class="accent">no seu ambiente?</span>]]', fontes="[[Fontes]]")),
]
build(cenas, os.path.join(AQUI, "post.html"), "[[Título do post]]")
