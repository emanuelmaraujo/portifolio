#!/usr/bin/env bash
# Renderiza o post animado: frames -> MP4 (para publicar) + GIF (prévia) + folha de revisão.
# Uso: render.sh <post.html> <pasta-de-saida> [nome-base] [fps] [--revisao]
#   --revisao (em qualquer posição): gera só a folha com o estado final de cada cena
set -euo pipefail
REVISAO=0; ARGS=()
for a in "$@"; do if [ "$a" = "--revisao" ]; then REVISAO=1; else ARGS+=("$a"); fi; done
set -- "${ARGS[@]}"
[ $# -ge 2 ] || { echo "uso: render.sh <post.html> <pasta> [nome] [fps] [--revisao]" >&2; exit 2; }
HTML="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
OUT="$2"; NOME="${3:-post}"; FPS="${4:-15}"
DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$OUT"
TMP="$(mktemp -d "$OUT/.frames-XXXX")"

# 1) folha de revisão: um quadro perto do fim de cada cena (estado final de cada uma)
TIMES=$(python3 -I - "$HTML" <<'PY'
import re,sys,json
h=open(sys.argv[1]).read()
c=[(float(a),float(b)) for a,b in re.findall(r'data-s="([\d.]+)" data-e="([\d.]+)"',h)]
print(json.dumps([round(e-0.6,2) for s,e in c]))
PY
)
mkdir -p "$TMP/rev"
node "$DIR/capture.js" "$HTML" "$TMP/rev" keys 0 1 "$TIMES" >/dev/null
python3 -I - "$TMP/rev" "$OUT/${NOME}-revisao.jpg" <<'PY'
import glob,sys
from PIL import Image
fs=sorted(glob.glob(sys.argv[1]+'/f*.png')); ims=[Image.open(f).convert('RGB').resize((432,540)) for f in fs]
cols=min(5,len(ims)); rows=(len(ims)+cols-1)//cols
s=Image.new('RGB',(cols*442+10,rows*550+10),'#444')
for i,im in enumerate(ims): s.paste(im,(10+(i%cols)*442,10+(i//cols)*550))
s.save(sys.argv[2],quality=85); print('revisao:',sys.argv[2])
PY
if [ "$REVISAO" = 1 ]; then rm -rf "$TMP"; exit 0; fi

# 2) todos os frames
mkdir -p "$TMP/f"
node "$DIR/capture.js" "$HTML" "$TMP/f" all "$FPS" 1

# 3) MP4 (vai para LinkedIn e Instagram)
ffmpeg -y -loglevel error -framerate "$FPS" -i "$TMP/f/f%04d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart "$OUT/${NOME}.mp4"
# 4) GIF de prévia (para revisão humana; NÃO usar como mídia no LinkedIn)
ffmpeg -y -loglevel error -framerate "$FPS" -i "$TMP/f/f%04d.png" -vf "palettegen=max_colors=128:stats_mode=diff" "$TMP/pal.png"
ffmpeg -y -loglevel error -framerate "$FPS" -i "$TMP/f/f%04d.png" -i "$TMP/pal.png" -lavfi "[0:v][1:v]paletteuse=dither=none:diff_mode=rectangle" -loop 0 "$OUT/${NOME}.gif"
rm -rf "$TMP"
ls -la "$OUT/${NOME}".* | awk '{print $5, $9}'
