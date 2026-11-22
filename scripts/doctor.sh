#!/bin/zsh
# Checks that this machine can run the factory. Prints what is missing and how
# to install it. Changes nothing.
cd "$(dirname "$0")/.."
ok=0
have() { command -v "$1" >/dev/null 2>&1; }
need() { # name, required|optional, install hint
  if have "$1"; then printf "ok       %-12s %s\n" "$1" "$(command -v "$1")"
  else
    printf "%-8s %-12s install: %s\n" "${2:u}" "$1" "$3"
    [[ $2 == required ]] && ok=1
  fi
}
mac=0; [[ $(uname) == Darwin ]] && mac=1
inst() { (( mac )) && echo "brew install $1" || echo "$2"; }

need node required "$(inst node 'https://nodejs.org (version 20 or newer)')"
need npm required "comes with node"
need ffmpeg required "$(inst ffmpeg 'sudo apt install ffmpeg')"
need ffprobe required "comes with ffmpeg"
need python3 required "$(inst python 'sudo apt install python3')"
need claude required "https://docs.claude.com/en/docs/claude-code (curl -fsSL https://claude.ai/install.sh | bash)"
need yt-dlp optional "$(inst yt-dlp 'pipx install yt-dlp') (the research swarm needs it)"
need whisper-cli optional "$(inst whisper-cpp 'build whisper.cpp') (checks that the voice says the script)"

if have node; then
  v=$(node -p 'process.versions.node.split(".")[0]')
  (( v >= 20 )) || { echo "REQUIRED node 20 or newer (you have $(node -v))"; ok=1; }
fi
model=~/.cache/whisper-models/ggml-medium.en.bin
if [[ -f $model ]]; then echo "ok       whisper model"
else echo "OPTIONAL whisper model: mkdir -p ~/.cache/whisper-models && curl -L -o $model https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.en.bin"; fi

[[ -d node_modules ]] && echo "ok       node_modules" || { echo "REQUIRED node_modules: run npm ci"; ok=1; }

if have node && [[ -d node_modules ]]; then
  if node -e "import('./tools/secrets.mjs').then(m=>{m.elevenKey()}).catch(()=>process.exit(1))" 2>/dev/null; then
    echo "ok       ElevenLabs key"
  else
    echo "REQUIRED ElevenLabs key: run scripts/set-key.sh"; ok=1
  fi
fi
if [[ -n ${CLAUDE_CODE_OAUTH_TOKEN:-} ]] || { [[ $(uname) == Darwin ]] && security find-generic-password -s reelfactory-claude-token >/dev/null 2>&1; } || grep -qs '^CLAUDE_CODE_OAUTH_TOKEN=' .env; then
  echo "ok       Claude token for the autopilot"
else
  echo "OPTIONAL Claude token for the autopilot: claude setup-token, then scripts/set-key.sh claude"
fi
grep -q '"configured": true' niche/brand.json && echo "ok       niche configured" || echo "TODO     niche: run /setup in Claude Code"
exit $ok
