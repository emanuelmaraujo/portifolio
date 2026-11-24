"""Modelo: COMPARATIVO — duas abordagens ou ferramentas.
Estrutura: capa → dilema → opção A → opção B → critérios lado a lado → recomendação condicional → fechamento."""
import os
import sys

SKILL = os.environ.get("ESTUDIO_SKILL", "{{SKILL}}")
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from estudio import *  # noqa: E402,F403

AQUI = os.path.dirname(os.path.abspath(__file__))
TOTAL = 6


def lado_a_lado(criterios, top=440, t0=0.8):
    """criterios = [(nome, valor_a, valor_b), ...]"""
    s = (f'<div class="small-caps" style="position:absolute;left:420px;top:{top}px;color:{DESTAQUE};">[[Opção A]]</div>'
         f'<div class="small-caps" style="position:absolute;left:720px;top:{top}px;color:{APOIO};">[[Opção B]]</div>')
    for i, (nome, a, b) in enumerate(criterios):
        y, t = top + 60 + i * 130, t0 + i * 0.6
        s += card(80, y, 920, 110,
                  f'<div class="semi" style="position:absolute;left:30px;top:36px;width:300px;font-size:28px;">{nome}</div>'
                  f'<div style="position:absolute;left:340px;top:36px;width:280px;font-size:28px;color:{TEXTO};">{a}</div>'
                  f'<div style="position:absolute;left:640px;top:36px;width:260px;font-size:28px;color:{APOIO};">{b}</div>', t)
    return s


cenas = [
    cena(2.2, capa_reel("[[Pilar]]", "[[A ou B?]]", "[[Depende de 1 coisa.]]", chips=("[[Tema]]",), destaque="Arraste para comparar")),
    cena(4.8, capa("[[O dilema que todo mundo enfrenta]]", "[[e a pergunta certa.]]", selo="Comparativo")),
    cena(5.2, topo("Opção A", 2, TOTAL) + titulo('[[Quando A <span class="accent">faz sentido.</span>]]') + legenda("[[Cenário típico de A.]]", 520, 1.2)),
    cena(5.2, topo("Opção B", 3, TOTAL) + titulo('[[Quando B <span class="accent">faz sentido.</span>]]') + legenda("[[Cenário típico de B.]]", 520, 1.2)),
    cena(6.4, topo("Lado a lado", 4, TOTAL) + titulo('[[Os critérios <span class="accent">que decidem.</span>]]')
         + lado_a_lado([("Custo", "[[A]]", "[[B]]"), ("Risco", "[[A]]", "[[B]]"), ("Esforço", "[[A]]", "[[B]]"), ("Prazo", "[[A]]", "[[B]]")])),
    cena(5.2, topo("Recomendação", 5, TOTAL) + titulo('[[Se X, <span class="accent">escolha A.</span> Se Y, B.]]') + legenda("[[A exceção importante.]]", 560, 1.4)),
    cena(5.0, fechamento('[[Qual vocês usam <span class="accent">hoje?</span>]]', fontes="[[Fontes]]")),
]
build(cenas, os.path.join(AQUI, "post.html"), "[[Título do post]]")
