#!/usr/bin/env python3
"""Confere legendas antes da aprovação.

Uso: python3 checar_legenda.py legenda.md [--perfil config/perfil.json]

O arquivo pode ter blocos por canal separados por '<!-- canal: linkedin -->' e
'<!-- canal: instagram -->'. Sem marcadores, o texto todo é tratado como LinkedIn.
Sai com código 1 se houver ERRO (avisos não bloqueiam).
"""
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FRASES_DE_EFEITO = [r"\bnunca mais\b", r"100\s?% segur", r"\bresolve tudo\b", r"\bo segredo (é|para)\b", r"\bsimples assim\b"]


def perfil(caminho):
    for c in (caminho, os.environ.get("ESTUDIO_PERFIL"), os.path.join(RAIZ, "config", "perfil.json")):
        if c and os.path.exists(c):
            return json.load(open(c, encoding="utf-8"))
    return {}


def blocos(txt):
    partes = re.split(r"<!--\s*canal:\s*(\w+)\s*-->", txt)
    if len(partes) == 1:
        return {"linkedin": txt}
    return {partes[i].lower(): partes[i + 1] for i in range(1, len(partes) - 1, 2)}


def checar(canal, txt, tom):
    erros, avisos = [], []
    linhas = [l for l in txt.strip().splitlines() if l.strip()]
    if not linhas:
        return [f"[{canal}] legenda vazia"], []
    corpo = [l for l in linhas if not l.strip().startswith("#")]
    hashtags_linha = [l for l in linhas if l.strip().startswith("#")]
    corpo_txt = "\n".join(corpo)

    m = re.findall(r"(?<![\w/])[@#]\w+", corpo_txt)
    m = [x for x in m if not re.match(r"https?://", x)]
    if m:
        erros.append(f"[{canal}] @ ou # no meio do texto (vira menção/hashtag): {', '.join(m[:5])}")
    if re.search(r"\S@\S", re.sub(r"https?://\S+|\S+@\S+\.\w+", "", corpo_txt)):
        erros.append(f"[{canal}] '@' dentro de palavra (ex.: senha de exemplo) — o Instagram pode transformar em menção")

    tags = re.findall(r"#\w+", " ".join(hashtags_linha))
    mx = tom.get("hashtags_max", 4)
    if len(tags) > mx:
        erros.append(f"[{canal}] {len(tags)} hashtags (máximo {mx})")
    if hashtags_linha and linhas[-1] not in hashtags_linha:
        avisos.append(f"[{canal}] hashtags devem ficar na última linha")

    lim = tom.get("legenda_linhas_max", 7)
    if len(corpo) > lim:
        erros.append(f"[{canal}] {len(corpo)} linhas de texto (máximo {lim}) — a profundidade vai no vídeo")
    if len(corpo_txt) > 1300:
        avisos.append(f"[{canal}] {len(corpo_txt)} caracteres: o LinkedIn corta em ~210 no 'ver mais'; garanta que o gancho está no início")

    tem_link = re.search(r"https?://\S+", txt)
    if canal == "linkedin" and not tem_link:
        avisos.append("[linkedin] sem link https (se houver página para indicar, coloque na legenda)")
    if canal == "instagram" and tem_link:
        avisos.append("[instagram] link https não é clicável no Instagram; prefira 'Acesse: dominio/caminho'")

    texto_sem_link = [l for l in corpo if not re.search(r"https?://|^Acesse:|^Fontes?:", l.strip())]
    curtas = [l for l in texto_sem_link[-3:] if len(l.split()) <= 7 and l.rstrip().endswith(".")]
    if len(curtas) >= 3:
        avisos.append(f"[{canal}] final com 3 frases curtas seguidas — parece slogan; deixe o fim mais leve")
    for p in FRASES_DE_EFEITO:
        if re.search(p, corpo_txt, re.I):
            avisos.append(f"[{canal}] promessa absoluta ou frase de efeito: '{re.search(p, corpo_txt, re.I).group(0)}'")
    if not re.search(r"\?", corpo_txt):
        avisos.append(f"[{canal}] sem pergunta — considere fechar com uma pergunta simples")
    return erros, avisos


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    arq = sys.argv[1]
    p = perfil(sys.argv[sys.argv.index("--perfil") + 1] if "--perfil" in sys.argv else None)
    tom = p.get("tom", {})
    txt = re.sub(r"<!--(?!\s*canal:).*?-->", "", open(arq, encoding="utf-8").read(), flags=re.S)
    E, A = [], []
    for canal, b in blocos(txt).items():
        e, a = checar(canal, b, tom)
        E += e
        A += a
    for e in E:
        print("ERRO  ", e)
    for a in A:
        print("AVISO ", a)
    if not E and not A:
        print("OK: legenda sem problemas")
    sys.exit(1 if E else 0)


if __name__ == "__main__":
    main()
