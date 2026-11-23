#!/usr/bin/env bash
# Turns the rendered journey into the frames the page loads. Usage: publish-run.sh <renders dir> <public dir>
set -e
mkdir -p "$2"
for f in "$1"/run-*.jpg; do
  n=$(basename "$f" .jpg); n=${n##*-}
  [ -e "$2/$n.jpg" ] && [ "$2/$n.jpg" -nt "$f" ] && continue
  ffmpeg -loglevel error -y -i "$f" -vf scale=1280:-2 -q:v 5 "$2/$n.jpg"
done
du -sh "$2"; ls "$2" | wc -l
