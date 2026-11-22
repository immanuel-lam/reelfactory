#!/bin/zsh
# Schedules the factory on this machine: a daily /reel and a weekly /research,
# each through scripts/run.sh (the claude CLI in print mode).
#
#   scripts/schedule.sh install [--daily 06:00] [--weekly sun 20:00] [--bypass] [--model opus] [--dry-run]
#   scripts/schedule.sh status
#   scripts/schedule.sh uninstall [reel|research]
#
# macOS: two launchd agents in ~/Library/LaunchAgents (a run missed while the
# Mac slept starts when it wakes). Linux: two lines in your crontab.
# The machine's PATH at install time is saved, so the runs find node, ffmpeg
# and claude.
set -e
cd "$(dirname "$0")/.."
repo=$PWD
cmd=${1:-status}; shift || true
daily=06:00; wday=sun; wtime=20:00; bypass=0; model=opus; dry=0
while (( $# )); do
  case $1 in
    --daily) daily=$2; shift 2;;
    --weekly) wday=$2; wtime=$3; shift 3;;
    --bypass) bypass=1; shift;;
    --model) model=$2; shift 2;;
    --dry-run) dry=1; shift;;
    reel|research) only=$1; shift;;
    *) echo "unknown option $1"; exit 1;;
  esac
done
dow() { case ${1:l} in sun*) echo 0;; mon*) echo 1;; tue*) echo 2;; wed*) echo 3;; thu*) echo 4;; fri*) echo 5;; sat*) echo 6;; [0-6]) echo $1;; *) echo "bad day: $1" >&2; exit 1;; esac }
hh() { echo $((10#${1%%:*})); }
mm() { echo $((10#${1##*:})); }
label() { echo "com.reelfactory.$(basename "$repo" | tr -c 'A-Za-z0-9\n' '-').$1"; }

if [[ $(uname) == Darwin ]]; then
  agents=~/Library/LaunchAgents
  (( dry )) && agents=$repo/logs/dry-run
  plist() { echo "$agents/$(label $1).plist"; }
  write() { # job, calendar dict
    mkdir -p "$agents" "$repo/logs"
    cat > "$(plist $1)" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$(label $1)</string>
  <key>ProgramArguments</key>
  <array><string>/bin/zsh</string><string>$repo/scripts/run.sh</string><string>$1</string></array>
  <key>WorkingDirectory</key><string>$repo</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$PATH</string>
    <key>HOME</key><string>$HOME</string>
    <key>REELFACTORY_MODEL</key><string>$model</string>
    <key>REELFACTORY_BYPASS</key><string>$bypass</string>
  </dict>
  <key>StartCalendarInterval</key>
  <dict>$2</dict>
  <key>StandardOutPath</key><string>$repo/logs/launchd-$1.out</string>
  <key>StandardErrorPath</key><string>$repo/logs/launchd-$1.err</string>
</dict>
</plist>
PLIST
    plutil -lint "$(plist $1)" >/dev/null
    if (( dry )); then echo "dry run: wrote $(plist $1)"; return; fi
    launchctl bootout gui/$(id -u) "$(plist $1)" 2>/dev/null || true
    launchctl bootstrap gui/$(id -u) "$(plist $1)"
    echo "installed $(label $1)"
  }
  case $cmd in
    install)
      [[ -z $only || $only == reel ]] && write reel "<key>Hour</key><integer>$(hh $daily)</integer><key>Minute</key><integer>$(mm $daily)</integer>"
      [[ -z $only || $only == research ]] && write research "<key>Weekday</key><integer>$(dow $wday)</integer><key>Hour</key><integer>$(hh $wtime)</integer><key>Minute</key><integer>$(mm $wtime)</integer>"
      echo "daily /reel at $daily, weekly /research on $wday at $wtime, model $model, $([[ $bypass == 1 ]] && echo bypassPermissions || echo 'acceptEdits + allow list')";;
    uninstall)
      for j in ${only:-reel research}; do
        launchctl bootout gui/$(id -u) "$(plist $j)" 2>/dev/null || true
        rm -f "$(plist $j)"; echo "removed $(label $j)"
      done;;
    status)
      for j in reel research; do
        if [[ -f $(plist $j) ]]; then
          when=$(plutil -extract StartCalendarInterval json -o - "$(plist $j)")
          echo "$j: scheduled $when"
        else echo "$j: not scheduled"; fi
      done
      ls -t logs/*.log(N) 2>/dev/null | head -3 | sed 's/^/recent log: /' || true;;
    *) echo "usage: scripts/schedule.sh install|status|uninstall"; exit 1;;
  esac
else
  tag="# reelfactory:$repo"
  line() { # job, cron time
    echo "$2 cd $repo && PATH='$PATH' REELFACTORY_MODEL=$model REELFACTORY_BYPASS=$bypass /bin/zsh scripts/run.sh $1 >/dev/null 2>&1 $tag:$1"
  }
  current=$(crontab -l 2>/dev/null || true)
  case $cmd in
    install)
      new=$current
      if [[ -z $only || $only == reel ]]; then new=$(print -r -- "$new" | grep -vF "$tag:reel"); new+=$'\n'$(line reel "$(mm $daily) $(hh $daily) * * *"); fi
      if [[ -z $only || $only == research ]]; then new=$(print -r -- "$new" | grep -vF "$tag:research"); new+=$'\n'$(line research "$(mm $wtime) $(hh $wtime) * * $(dow $wday)"); fi
      if (( dry )); then print -r -- "$new" | sed '/^$/d'; exit 0; fi
      print -r -- "$new" | sed '/^$/d' | crontab -
      echo "installed in crontab: daily /reel at $daily, weekly /research on $wday at $wtime";;
    uninstall)
      new=$current
      for j in ${only:-reel research}; do new=$(print -r -- "$new" | grep -vF "$tag:$j"); done
      print -r -- "$new" | sed '/^$/d' | crontab -; echo "removed";;
    status) print -r -- "$current" | grep -F "$tag" || echo "not scheduled";;
    *) echo "usage: scripts/schedule.sh install|status|uninstall"; exit 1;;
  esac
fi
