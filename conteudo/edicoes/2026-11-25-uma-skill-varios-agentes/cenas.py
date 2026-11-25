"""Uma skill, vários agentes — post aprofundado, 14:30 (experiência própria)."""
import os
import sys

PASTA = os.path.dirname(os.path.abspath(__file__))
SKILL = os.environ.get("ESTUDIO_SKILL", os.path.normpath(os.path.join(PASTA, "../../../.agents/skills/estudio-de-posts")))
sys.path.insert(0, os.path.join(SKILL, "scripts"))
from estudio import *  # noqa: E402,F403

TOTAL = 7
MONO = 'font-family:ui-monospace,Menlo,Consolas,monospace;'


def codigo(linhas, top, t, h=None, size=28):
    h = h or (len(linhas) * int(size * 1.6) + 70)
    corpo = "<br>".join(linhas)
    return card(80, top, 920, h, f'<div style="position:absolute;left:40px;top:34px;width:850px;{MONO}font-size:{size}px;line-height:1.6;color:{TEXTO};white-space:nowrap;">{corpo}</div>', t, fundo="#151515", borda=BORDA)


def bloco(texto, top, t, destaque=False, h=150):
    fundo = DESTAQUE if destaque else CARD
    cor = SOBRE_DESTAQUE if destaque else TEXTO
    return card(80, top, 920, h, f'<div class="semi" style="position:absolute;left:40px;top:36px;width:840px;font-size:32px;line-height:1.35;color:{cor};">{texto}</div>', t, fundo=fundo)


A = f'<span style="color:{DESTAQUE}">'
G = f'<span style="color:{APOIO}">'
cenas = [
    cena(2.2, capa_reel("Agentes de IA", "A mesma skill rodando em", "vários agentes.", chips=("IA", "Skills"), destaque="Arraste para ver")),

    cena(5.6, capa("Levei a mesma skill para vários agentes",
                   "e o arquivo quase não mudou.", selo="Na prática")),

    cena(6.6, topo("O que é uma skill", 2, TOTAL)
         + titulo('Uma pasta com <span class="accent">instruções.</span>')
         + codigo([f"{A}estudio-de-posts/</span>",
                   f"├─ {A}SKILL.md</span>   {G}nome, descrição e passo a passo</span>",
                   f"├─ references/  {G}guias que ele abre quando precisa</span>",
                   f"├─ scripts/     {G}o que ele executa</span>",
                   f"└─ assets/      {G}modelos e arquivos de apoio</span>"], 330, 0.8, size=27)
         + legenda("No Claude, o agente lê primeiro só o nome e a descrição. O resto entra quando a tarefa pede.", 700, 2.2)),

    cena(6.6, topo("O cabeçalho", 3, TOTAL)
         + titulo('A descrição é <span class="accent">o gatilho.</span>')
         + codigo([f"{G}---</span>",
                   f"{A}name:</span> estudio-de-posts",
                   f"{A}description:</span> Estúdio de posts diários...",
                   "  Use sempre que ele pedir um post,",
                   "  vídeo ou carrossel...",
                   f"{G}---</span>"], 330, 0.8, size=28)
         + legenda('É por ela que o agente decide usar a skill. Descrição vaga, skill esquecida.', 760, 2.2)),

    cena(6.6, topo("Formato aberto", 4, TOTAL)
         + titulo('O mesmo arquivo, <span class="accent">outras ferramentas.</span>')
         + bloco('No <b>ChatGPT</b>: Skills → Criar → Enviar do computador. A pasta vai em .zip.', 450, 0.9)
         + bloco('Em agentes de código, ela fica numa pasta do repositório.', 630, 1.6)
         + legenda('O que muda de uma ferramenta para outra é <b>onde ela procura</b>, não o formato.', 810, 2.4)),

    cena(7.0, topo("Como organizei", 5, TOTAL)
         + titulo('Uma fonte, <span class="accent">uma cópia.</span>')
         + codigo([f"{A}.agents/skills/</span>  {G}Codex, Cursor, Gemini CLI</span>",
                   f"{A}.claude/skills/</span>  {G}Claude Code, Copilot</span>",
                   "",
                   f"npm run {A}skills:sync</span>   {G}copia</span>",
                   f"npm run {A}skills:check</span>  {G}confere</span>"], 330, 0.8, size=27)
         + legenda('Editar nos dois lugares à mão é pedir para as versões divergirem. As pastas também ainda variam entre ferramentas: vale conferir a documentação de cada uma.', 720, 2.2)),

    cena(6.6, topo("O que não viaja", 6, TOTAL)
         + titulo('A skill viaja. <span class="accent">O ambiente, não.</span>')
         + lista_check(["Scripts dependem do que está instalado (Python, ffmpeg...)",
                        "Conectores, como o Buffer, são de cada ferramenta",
                        "Por isso a versão do ChatGPT tem um plano B: entrega HTML e legenda"],
                       top=400, passo=150, t0=0.8, dt=1.1)),

    cena(6.0, topo("O que eu levo disso", 7, TOTAL)
         + titulo('Escreva a skill pensando <span class="accent">em quem vai ler.</span>')
         + lista_check(["Instrução clara e direta", "O porquê de cada regra", "Detalhes em arquivos separados"], top=400, passo=150, t0=0.8, dt=0.9)
         + legenda('Foi o que fez a mesma skill funcionar em lugares diferentes.', 870, 3.6)),

    cena(5.0, fechamento('Vocês já usam skills <span class="accent">em mais de uma ferramenta?</span>',
                         fontes="OpenAI Help Center (Skills in ChatGPT) · experiência própria")),
]
build(cenas, os.path.join(PASTA, "post.html"), "Uma skill, vários agentes")
