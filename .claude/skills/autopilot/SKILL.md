---
name: autopilot
description: Schedule, change, check or stop the factory's automatic runs on this machine (a daily /reel and a weekly /research through the claude CLI, with launchd on macOS or cron on Linux). Use when the user wants the factory to run by itself, asks when it runs, or wants to pause it.
---

# Autopilot

The factory runs by itself through the `claude` CLI in print mode:
`scripts/run.sh reel` and `scripts/run.sh research`, started by
`scripts/schedule.sh` (launchd on macOS, cron on Linux). Each run is a fresh
session: it relies on the files in the repo, not on memory of earlier runs.

1. If `niche/brand.json` has `"configured": false`, say "Run /setup first" and
   stop.
2. Find out what the owner wants: install, change the times, check the status,
   see the last logs, or stop. Show the current state first:
   `scripts/schedule.sh status`.
3. To install, ask (AskUserQuestion) for:
   - The daily time for `/reel` (default 06:00 local time).
   - The weekly day and time for `/research` (default Sunday 20:00).
   - The permission mode. Offer these two, recommend the first:
     - **Allowlist (Recommended)**: `acceptEdits` plus the allow list in
       `.claude/settings.json`. Safe; a command outside the list is refused
       and the run works around it or stops and reports.
     - **Bypass**: `bypassPermissions`. Fully unattended, but the agent can
       run any command as the owner. Only on a machine or account kept for
       this.
   Then run `scripts/schedule.sh install --daily HH:MM --weekly DAY HH:MM
   [--bypass]` and show its output.
4. Two things the owner must do once, in their own terminal, before the
   first unattended run:
   - Run `claude setup-token` and then `scripts/set-key.sh claude` (stores a
     long-lived token; a normal sign-in expires after a few days and the runs
     would fail).
   - The workspace must be trusted (they accepted the trust prompt when they
     first opened `claude` here). Untrusted, print mode ignores the allow
     list.
5. Explain where things land: logs in `logs/`, videos and captions in
   `exports/<id>/`, the run reports at the end of each log. The machine must
   be awake at the scheduled time (on a Mac: `pmset` or keep it plugged in and
   awake; launchd runs a missed job when the Mac wakes).
6. To stop: `scripts/schedule.sh uninstall`. To pause the daily run only:
   `scripts/schedule.sh uninstall reel`.
7. To test now, without waiting: `scripts/run.sh research` or
   `scripts/run.sh reel` in the owner's terminal (each takes a long time).
   Do not start one from inside this session unless the owner asks.

Never schedule anything that posts, commits or pushes.
