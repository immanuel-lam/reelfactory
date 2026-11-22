#!/bin/zsh
# Half-size review frames at the given times (seconds), tiled into one sheet.
# Usage: tools/stills.sh <id> <name> <t1> <t2> ...   ->  out/<id>-<name>-sheet.jpg
set -e
cd "$(dirname "$0")/.."
# Packages live in this folder (restore them with `npm ci`).
nm=node_modules
[[ -d $nm ]] || { echo "node_modules is missing: run npm ci"; exit 1; }
id=$1; name=$2; shift 2
rm -rf out/bundle "out/$id-$name"; mkdir -p "out/$id-$name"
$nm/.bin/remotion bundle src/index.ts --out-dir out/bundle >/dev/null 2>&1 || { echo "bundle failed: run $nm/.bin/tsc --noEmit -p ."; exit 1; }
for t in "$@"; do
  f=$(python3 -c "print(round($t*60))")
  $nm/.bin/remotion still out/bundle "$id" "out/$id-$name/$(printf %05d $f).png" --frame=$f --scale=0.5 --gl=angle >/dev/null 2>&1 || echo "failed at $t s"
done
n=$#
cols=$(( n < 6 ? n : 6 ))
ffmpeg -v error -y -pattern_type glob -i "out/$id-$name/*.png" -vf "scale=360:-1,tile=${cols}x$(( (n + cols - 1) / cols ))" -frames:v 1 "out/$id-$name-sheet.jpg"
echo "out/$id-$name-sheet.jpg"
