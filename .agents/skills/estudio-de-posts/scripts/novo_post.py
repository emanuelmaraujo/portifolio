#!/usr/bin/env python3
"""Abre uma edição nova: pasta AAAA-MM-DD-slug com apuracao.md, roteiro.md, legenda.md e cenas.py.

Uso:
    python3 novo_post.py <pasta-de-edicoes> "<título>" --peso aprofundado --formato novidade [--data AAAA-MM-DD]

Formatos: os arquivos de assets/modelos/ (explicador, novidade, comparativo, checklist, caso).
"""
import argparse
import datetime as dt
import os
import re
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELOS = os.path.join(RAIZ, "assets", "modelos")


def slug(txt):
    t = unicodedata.normalize("NFKD", txt).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")[:50]


def main():
    formatos = sorted(f[:-3] for f in os.listdir(MODELOS) if f.endswith(".py"))
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pasta")
    ap.add_argument("titulo")
    ap.add_argument("--peso", choices=["leve", "aprofundado"], required=True)
    ap.add_argument("--formato", choices=formatos, required=True)
    ap.add_argument("--data", default=dt.date.today().isoformat())
    a = ap.parse_args()

    destino = os.path.join(a.pasta, f"{a.data}-{slug(a.titulo)}")
    if os.path.exists(destino):
        sys.exit(f"Já existe: {destino} (escolha outro título ou data)")
    os.makedirs(destino)

    cab = f"# {a.titulo}\n\n- Data: {a.data}\n- Peso: {a.peso}\n- Formato: {a.formato}\n"
    arquivos = {
        "apuracao.md": cab + "\n## Dados e fontes\n\n- Dado: \n  Fonte: \n\n",
        "roteiro.md": cab + "\n| # | Kicker | Título | Visual | Apoio |\n|---|---|---|---|---|\n| 0 | capa_reel | | | |\n",
        "legenda.md": "<!-- canal: linkedin -->\n\n\n<!-- canal: instagram -->\n\n",
    }
    for nome, txt in arquivos.items():
        with open(os.path.join(destino, nome), "w", encoding="utf-8") as f:
            f.write(txt)
    with open(os.path.join(MODELOS, a.formato + ".py"), encoding="utf-8") as f:
        modelo = f.read().replace("{{SKILL}}", RAIZ).replace('"[[Título do post]]"', repr(a.titulo))
    with open(os.path.join(destino, "cenas.py"), "w", encoding="utf-8") as f:
        f.write(modelo)
    print(destino)


if __name__ == "__main__":
    main()
