#!/bin/zsh
# Stores a secret without it touching the chat or the repo.
#   scripts/set-key.sh          your ElevenLabs API key
#   scripts/set-key.sh claude   a long-lived Claude Code token for the autopilot
#                               (make one with: claude setup-token)
# macOS: the login Keychain (service "reelfactory-elevenlabs").
# Elsewhere: .env at the repo root (git-ignored, mode 600).
# Get a key at https://elevenlabs.io/app/settings/api-keys (it needs
# text-to-speech, sound effects, music and voices read access).
set -e
cd "$(dirname "$0")/.."
if [[ ${1:-} == claude ]]; then
  service=reelfactory-claude-token; var=CLAUDE_CODE_OAUTH_TOKEN; what="Claude Code token (from claude setup-token)"
else
  service=reelfactory-elevenlabs; var=ELEVENLABS_API_KEY; what="ElevenLabs API key"
fi
printf "$what (input hidden): "
read -rs key; echo
[[ -n $key ]] || { echo "Nothing entered."; exit 1; }
if [[ $(uname) == Darwin ]]; then
  security add-generic-password -U -a "$USER" -s $service -w "$key"
  echo "Stored in the macOS Keychain (service $service)."
else
  touch .env; chmod 600 .env
  grep -v "^$var=" .env > .env.tmp || true
  echo "$var=$key" >> .env.tmp && mv .env.tmp .env && chmod 600 .env
  echo "Stored in .env (git-ignored)."
fi
unset key
