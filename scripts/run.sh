#!/bin/zsh
# One unattended run of the factory through the claude CLI.
#   scripts/run.sh reel       make (or continue) the next episode
#   scripts/run.sh research   the weekly research swarm
# Logs go to logs/<date>-<job>.log. Used by scripts/schedule.sh, and safe to
# run by hand. Settings (set by schedule.sh, or in your environment):
#   REELFACTORY_MODEL       model for the lead agent (default: opus)
#   REELFACTORY_BYPASS=1    use --permission-mode bypassPermissions instead of
#                           acceptEdits plus the allow list in .claude/settings.json
set -e
cd "$(dirname "$0")/.."
job=${1:?usage: scripts/run.sh reel|research}
[[ $job == reel || $job == research ]] || { echo "unknown job: $job"; exit 1; }
mkdir -p logs
log="logs/$(date +%Y-%m-%d-%H%M)-$job.log"
# One run at a time: a reel run can take hours, and two would fight over files.
lock=logs/.run.lock
if ! mkdir "$lock" 2>/dev/null; then
  echo "$(date): another run holds $lock; skipping $job" >> logs/skipped.log
  exit 0
fi
trap 'rmdir "$lock"' EXIT
# A long-lived token keeps unattended runs signed in (scripts/set-key.sh claude).
if [[ -z ${CLAUDE_CODE_OAUTH_TOKEN:-} ]]; then
  if [[ $(uname) == Darwin ]]; then
    t=$(security find-generic-password -s reelfactory-claude-token -w 2>/dev/null || true)
  else
    t=$(grep -s '^CLAUDE_CODE_OAUTH_TOKEN=' .env | cut -d= -f2-)
  fi
  [[ -n $t ]] && export CLAUDE_CODE_OAUTH_TOKEN=$t
  unset t
fi
mode=(--permission-mode acceptEdits)
[[ ${REELFACTORY_BYPASS:-0} == 1 ]] && mode=(--permission-mode bypassPermissions)
{
  echo "== $job started $(date)"
  rc=0
  claude -p "/$job" --model "${REELFACTORY_MODEL:-opus}" "${mode[@]}" --output-format text || rc=$?
  echo "== $job finished $(date) (exit $rc)"
} >> "$log" 2>&1
echo "$log"
