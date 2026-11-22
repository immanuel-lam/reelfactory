#!/bin/zsh
# Final render of one episode, with the checks that must pass before it ships.
# Usage: tools/render.sh <id> [draft]
#   draft: 1080x1920 into out/ (about 90 s). Default: 2160x3840 into
#   exports/<id>/ (a few minutes). Set REELFACTORY_EXPORTS to change the folder.
set -e
cd "$(dirname "$0")/.."
# Packages live in this folder (restore them with `npm ci`).
nm=node_modules
[[ -d $nm ]] || { echo "node_modules is missing: run npm ci"; exit 1; }
id=$1; mode=${2:-final}
$nm/.bin/tsc --noEmit -p .
if [[ $mode == draft ]]; then
  out="out/$id-draft.mp4"; scale=1; crf=18
else
  exports=${REELFACTORY_EXPORTS:-$PWD/exports}
  mkdir -p "$exports/$id"
  out="$exports/$id/$id-4k.mp4"; scale=2; crf=16
fi
$nm/.bin/remotion render src/index.ts "$id" "$out" --gl=angle --scale=$scale --crf=$crf --log=error
dir=$(dirname "$out")
# Review sheets: the whole film (one frame every 1.1 s) and the first 3 seconds.
ffmpeg -v error -y -i "$out" -vf "fps=1/1.1,scale=216:-1,tile=10x4" -frames:v 1 "$dir/$id-sheet.jpg"
ffmpeg -v error -y -ss 0 -t 3 -i "$out" -vf "fps=5,scale=270:-1,tile=5x3" -frames:v 1 "$dir/$id-first3s.jpg"
echo "video: $out"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of csv=p=0 "$out" | tr '\n' ' '; echo
echo "loudness: $(ffmpeg -i "$out" -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | xargs)"
echo "black segments: $(ffmpeg -i "$out" -vf blackdetect=d=0.3:pix_th=0.03 -an -f null - 2>&1 | grep -c black_start || true)"
# The narration must still be understood under the music.
ffmpeg -v error -y -i "$out" -vn -ar 16000 -ac 1 "out/$id-check.wav"
if command -v whisper-cli >/dev/null && [[ -f ~/.cache/whisper-models/ggml-medium.en.bin ]]; then
  echo "heard: $(whisper-cli -m ~/.cache/whisper-models/ggml-medium.en.bin -f "out/$id-check.wav" -nt 2>/dev/null | tr '\n' ' ')"
else
  echo "heard: NOT CHECKED. whisper-cli or ~/.cache/whisper-models/ggml-medium.en.bin is missing."
  echo "       Restore the model: curl -L -o ~/.cache/whisper-models/ggml-medium.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.en.bin"
fi
echo "sheets: $dir/$id-sheet.jpg  $dir/$id-first3s.jpg"
# The sound check (docs/SOUND.md). A FAIL here means the episode is not finished.
node tools/audio-check.mjs "$id" || echo "SOUND CHECK FAILED: fix the mix (node tools/sound.mjs $id) and render again."
