"""Modelo: EXPLICADOR — conceito novo ou mal entendido.
Estrutura: capa → problema → conceito → como funciona (2 cenas) → o que fazer → fechamento.
Troque todo texto entre [[ ]]."""
import os
import sys

SKILL = os.environ.get("ESTUDIO_SKILL", "{{SKILL}}")
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from estudio import *  # noqa: E402,F403

AQUI = os.path.dirname(os.path.abspath(__file__))
TOTAL = 6
cenas = [
    cena(2.2, capa_reel("[[Pilar]]", "[[Pergunta curta]]", "[[Resposta em 1 linha]]", chips=("[[Tema]]", "[[Nível]]"), destaque="Arraste para entender")),
    cena(4.6, capa("[[O problema em uma frase]]", "[[o porquê em destaque.]]", selo="[[Kicker]]")),
    cena(5.6, topo("O conceito", 2, TOTAL)
         + titulo('[[Definição curta com <span class="accent">a palavra-chave.</span>]]')
         + card(80, 520, 920, 260, '<div class="bold" style="position:absolute;left:40px;top:40px;width:840px;font-size:38px;line-height:1.3;">[[Analogia do dia a dia]]</div>', 1.0)
         + legenda("[[Uma linha que liga a analogia ao conceito.]]", 860, 2.2)),
    cena(5.6, topo("Como funciona", 3, TOTAL)
         + titulo('[[Etapa 1 → <span class="accent">etapa 2.</span>]]')
         + pilula("[[etapa 1]]", 80, 560, 0.8) + pilula("[[etapa 2]]", 80, 660, 1.4) + pilula("[[etapa 3]]", 80, 760, 2.0, cheia=False)
         + legenda("[[Onde costuma dar errado.]]", 900, 2.6)),
    cena(5.6, topo("Na prática", 4, TOTAL)
         + titulo('O que dá para fazer <span class="accent">esta semana.</span>')
         + lista_check(["[[ação 1]]", "[[ação 2]]", "[[ação 3]]"])),
    cena(5.0, fechamento('[[Pergunta simples <span class="accent">para comentar?</span>]]', fontes="[[Fonte 1 · Fonte 2]]")),
]
build(cenas, os.path.join(AQUI, "post.html"), "[[Título do post]]")
