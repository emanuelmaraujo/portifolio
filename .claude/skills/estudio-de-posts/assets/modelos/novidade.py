"""Modelo: NOVIDADE — notícia, relatório, lançamento ou vulnerabilidade do momento.
Estrutura: capa → número → de onde vem → o que significa → o que NÃO diz → implicação → fechamento."""
import os
import sys

SKILL = os.environ.get("ESTUDIO_SKILL", "{{SKILL}}")
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from estudio import *  # noqa: E402,F403

AQUI = os.path.dirname(os.path.abspath(__file__))
TOTAL = 6
cenas = [
    cena(2.2, capa_reel("[[Relatório AAAA]]", "[[O achado principal]]", "[[a virada em 1 linha]]", chips=("[[Pilar]]",), destaque="Arraste para entender")),
    cena(6.0, topo("O número", 1, TOTAL)
         + numero(31, sufixo="%", tamanho=300)
         + f'<div {fade(1.2)} class="bold" style="position:absolute;left:80px;top:470px;width:920px;font-size:42px;line-height:1.25;">[[o que o número mede]]</div>'
         + legenda("[[Comparação com o ano anterior ou referência.]]", 640, 2.2)),
    cena(5.2, topo("De onde vem", 2, TOTAL)
         + titulo('[[Nome do relatório, <span class="accent">edição e amostra.</span>]]')
         + legenda("[[Quem publica, quantos casos, período analisado.]]", 520, 1.2)),
    cena(5.6, topo("O que significa", 3, TOTAL)
         + titulo('[[A leitura em uma frase <span class="accent">com consequência.</span>]]')
         + card(80, 540, 920, 200, f'<div class="serif" style="position:absolute;left:40px;top:50px;width:840px;font-size:56px;line-height:1.05;color:{SOBRE_DESTAQUE};">[[Frase de destaque]]</div>', 1.6, fundo=DESTAQUE)),
    cena(5.2, topo("O que o dado não diz", 4, TOTAL)
         + titulo('[[A limitação <span class="accent">honesta.</span>]]')
         + legenda("[[Viés de amostra, região, definição usada.]]", 520, 1.2)),
    cena(5.6, topo("Na prática", 5, TOTAL)
         + titulo('[[Para quem decide: <span class="accent">a ação.</span>]]')
         + lista_check(["[[ação para usuários]]", "[[ação para TI]]", "[[decisão para liderança]]"])),
    cena(5.0, fechamento('[[Pergunta <span class="accent">para comentar?</span>]]', fontes="[[Fontes]]")),
]
build(cenas, os.path.join(AQUI, "post.html"), "[[Título do post]]")
