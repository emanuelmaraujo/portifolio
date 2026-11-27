"""A aposta de Scott Aaronson sobre IA e criptografia — post aprofundado, 14:30."""
import os
import sys

PASTA = os.path.dirname(os.path.abspath(__file__))
SKILL = os.environ.get("ESTUDIO_SKILL", os.path.normpath(os.path.join(PASTA, "../../../.agents/skills/estudio-de-posts")))
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from estudio import *  # noqa: E402,F403

TOTAL = 7


def bloco(texto, top, t, destaque=False, h=150, size=32):
    fundo = DESTAQUE if destaque else CARD
    cor = SOBRE_DESTAQUE if destaque else TEXTO
    return card(80, top, 920, h, f'<div class="semi" style="position:absolute;left:40px;top:36px;width:840px;font-size:{size}px;line-height:1.35;color:{cor};">{texto}</div>', t, fundo=fundo)


def citacao(texto, top, t, h=330):
    return card(80, top, 920, h,
                f'<div class="serif accent" style="position:absolute;left:36px;top:6px;font-size:150px;line-height:1;">“</div>'
                f'<div class="serif" style="position:absolute;left:60px;top:90px;width:810px;font-size:48px;line-height:1.15;">{texto}</div>', t)


cenas = [
    cena(2.2, capa_reel("IA e criptografia", "Laboratórios de IA estariam guardando", "uma bomba.",
                        chips=("IA", "Criptografia"), destaque="Arraste para entender")),

    cena(5.6, capa("Um cientista renomado fez um alerta", "sobre IA e criptografia.",
                   selo="25/11/2026")),

    cena(7.0, topo("O que ele escreveu", 2, TOTAL)
         + citacao("Estou praticamente certo, por várias fontes confiáveis, de que os laboratórios de IA estão sentados sobre uma ou mais bombas nessa área.", 330, 0.8)
         + legenda('Scott Aaronson, no blog Shtetl-Optimized (tradução livre). "Nessa área": algoritmos que quebrariam a <b>criptografia usada hoje</b>.', 700, 2.4)),

    cena(6.6, topo("O que ele não disse", 3, TOTAL)
         + titulo('Qual é <span class="accent">a descoberta.</span>')
         + bloco('Ele mesmo escreveu estar <b>"muito menos confiante"</b> sobre a natureza dela, e que não quer espalhar boato.', 440, 0.9, h=170)
         + bloco('A história de que a IA teria <b>resolvido a fatoração</b> circulou na imprensa, mas <b>não está no texto dele</b>.', 640, 1.8, destaque=True, h=170)
         + legenda("Até agora, nenhum laboratório confirmou nada.", 860, 2.8)),

    cena(7.0, topo("Por que a fatoração importa", 4, TOTAL)
         + titulo('O RSA confia em <span class="accent">uma conta difícil.</span>')
         + bloco('<span class="accent">Fácil:</span> multiplicar dois números primos enormes.', 440, 0.9, h=120)
         + bloco('<span class="accent">Difícil:</span> partir do resultado e descobrir quais eram os primos.', 590, 1.6, h=150)
         + legenda('Se alguém achasse um jeito rápido de fazer o caminho de volta, chaves RSA deixariam de proteger. É por isso que o boato assustou tanta gente.', 780, 2.4)),

    cena(6.2, topo("Não é só RSA", 5, TOTAL)
         + titulo('As curvas elípticas <span class="accent">dependem de outro problema.</span>')
         + bloco('Assinaturas de Bitcoin e boa parte das conexões seguras usam <b>curvas elípticas</b>, que se apoiam no logaritmo discreto, não na fatoração.', 440, 0.9, h=210)
         + legenda('Aaronson não disse se algum desses problemas foi afetado. Quem disse foram as manchetes.', 700, 2.0)),

    cena(6.6, topo("Já existe plano B", 6, TOTAL)
         + titulo('A criptografia <span class="accent">pós-quântica.</span>')
         + bloco('Em agosto de 2024, o NIST publicou os padrões <b>FIPS 203, 204 e 205</b>.', 340, 0.9, h=130)
         + bloco('Eles se apoiam em reticulados e funções de hash, <b>não em fatoração nem em curvas elípticas</b>.', 500, 1.6, h=170)
         + legenda('Foram criados pensando no computador quântico, mas a mesma troca serviria para um algoritmo clássico mais rápido.', 710, 2.4)),

    cena(7.0, topo("Boato ou sinal", 7, TOTAL)
         + titulo('O que dá para fazer <span class="accent">com um boato.</span>')
         + lista_check(["Tratar como sinal, não como fato",
                        "Saber onde a empresa usa RSA e curvas elípticas",
                        "Acompanhar a migração pós-quântica, que já era recomendada",
                        "Esperar o resultado ser publicado e revisado"],
                       top=400, passo=150, t0=0.8, dt=1.1)),

    cena(5.0, fechamento('Boato ou sinal? <span class="accent">Como você leu essa?</span>',
                         fontes="Scott Aaronson, Shtetl-Optimized (25/11/2026) · Cointelegraph · NIST FIPS 203/204/205")),
]
build(cenas, os.path.join(PASTA, "post.html"), "A aposta de Scott Aaronson sobre IA e criptografia")
