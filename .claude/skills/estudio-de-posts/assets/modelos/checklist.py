"""Modelo: CHECKLIST — ação concreta ou revisão.
Estrutura: capa → por que agora → itens → como saber se deu certo → fechamento."""
import os
import sys

SKILL = os.environ.get("ESTUDIO_SKILL", "{{SKILL}}")
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from estudio import *  # noqa: E402,F403

AQUI = os.path.dirname(os.path.abspath(__file__))
TOTAL = 4
cenas = [
    cena(2.2, capa_reel("[[Pilar]]", "[[N coisas para]]", "[[fazer hoje.]]", chips=("[[Tema]]",), destaque="Salve para depois")),
    cena(5.0, topo("Por que agora", 1, TOTAL) + titulo('[[O motivo <span class="accent">com data ou dado.</span>]]') + legenda("[[Fonte do motivo.]]", 520, 1.4)),
    cena(6.4, topo("O checklist", 2, TOTAL) + titulo('[[Faça nesta <span class="accent">ordem.</span>]]')
         + lista_check(["[[item 1]]", "[[item 2]]", "[[item 3]]", "[[item 4]]"], top=420, passo=140)),
    cena(5.0, topo("Como conferir", 3, TOTAL) + titulo('[[O sinal de que <span class="accent">funcionou.</span>]]') + legenda("[[Teste simples.]]", 520, 1.4)),
    cena(5.0, fechamento('[[Qual desses você <span class="accent">ainda não fez?</span>]]', fontes="[[Fontes]]")),
]
build(cenas, os.path.join(AQUI, "post.html"), "[[Título do post]]")
