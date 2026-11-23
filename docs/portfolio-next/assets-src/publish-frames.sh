#!/usr/bin/env bash
# Turns the Blender renders into the frames the page loads. Usage: publish-frames.sh <renders dir> <public dir>
set -e
SRC="$1"; OUT="$2"
for tag in l p; do
  mkdir -p "$OUT/$tag"
  for f in "$SRC"/jar-$tag-*.jpg; do
    [ -e "$f" ] || continue
    n=$(basename "$f" .jpg); n=${n##*-}
    ffmpeg -loglevel error -y -i "$f" -q:v 4 "$OUT/$tag/$n.jpg"
  done
  for d in 001 040; do
    [ -e "$SRC/depth-$tag-$d.png" ] && ffmpeg -loglevel error -y -i "$SRC/depth-$tag-$d.png" -vf "scale=iw/2:-1,gblur=sigma=2,format=gray" -q:v 5 "$OUT/$tag/depth-$d.jpg"
  done
done
du -sh "$OUT"
