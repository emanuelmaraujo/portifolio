#!/usr/bin/env bash
# Publishes the rendered take as WebP: renders/percurso/<t>5* -> public/prototypes/percurso/<t>.
#   <t>5/<t>-NNN.jpg            the take                       -> NNN.webp
#   <t>5s/<t>-s120-base.jpg     second act, nothing switched on -> s120-base.webp
#   <t>5s/<t>-s120-<name>.jpg   one layer or one gauge step     -> s120-<name>.webp, as the light it adds to the base
#   <t>5s/<t>-s<stop>-<n>.jpg   a state of a project stop       -> s<stop>-<n>.webp
#   <t>5s/<t>-aNN.jpg           the second act arming itself    -> aNN.webp
# A second argument names the language of the take (en): renders/percurso/<t>5en* -> public/prototypes/percurso/en/<t>.
# Files already published and newer than their source are skipped, so this can run while a render is still going.
# Usage (from the repository root): bash docs/portfolio-next/assets-src/publish-percurso.sh l
set -e
take="${1:-l}"; lang="${2:-}"; src="docs/portfolio-next/assets-src/renders/percurso/${take}5${lang}"; out="public/prototypes/percurso/${lang:+$lang/}$take"
mkdir -p "$out"
web() { ffmpeg -y -loglevel error -i "$1" -c:v libwebp -quality "${3:-80}" -compression_level 5 "$2"; }
fresh() { [ -f "$2" ] && [ "$2" -nt "$1" ]; }
for f in "$src"/"$take"-*.jpg; do
  [ -f "$f" ] || continue
  n="$(basename "$f" .jpg)"; n="${n##*-}"; dst="$out/$n.webp"
  fresh "$f" "$dst" || web "$f" "$dst"
done
base="${src}s/$take-s120-base.jpg"
for f in "${src}s"/"$take"-s*.jpg; do
  [ -f "$f" ] || continue
  name="$(basename "$f" .jpg)"; name="${name#$take-}"; dst="$out/$name.webp"
  fresh "$f" "$dst" && continue
  case "$name" in
    s120-base|s2*) web "$f" "$dst" 84 ;;
    s120-*) [ -f "$base" ] && ffmpeg -y -loglevel error -i "$f" -i "$base" -filter_complex "[0]format=gbrp[a];[1]format=gbrp[b];[a][b]blend=all_mode=subtract,lutrgb=r='max(val-5,0)':g='max(val-5,0)':b='max(val-5,0)'" -c:v libwebp -quality 84 -compression_level 5 "$dst" ;;
  esac
done
# The second act arming itself, layer after layer: whole frames spliced into the film after frame 120.
for f in "${src}s"/"$take"-a*.jpg; do
  [ -f "$f" ] || continue
  name="$(basename "$f" .jpg)"; name="${name#$take-}"; dst="$out/$name.webp"
  fresh "$f" "$dst" || web "$f" "$dst"
done
ls "$out"/*.webp | wc -l; du -sh "$out"
