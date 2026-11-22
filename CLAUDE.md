# Reel factory

This repo makes faceless 3D explainer shorts for one niche, with Claude Code
as the producer. Remotion and React Three Fiber draw the films in code;
ElevenLabs makes the voice, the sound effects and the music.

## First thing in every session

Look at `niche/brand.json`. If it has `"configured": false`, the owner has not
set up a niche yet: greet them in one line and run the `/setup` skill (it
interviews them about their niche). Do not start an episode before that.

## What lives where

| Path | What it is |
|---|---|
| `PRODUCTION.md` | The step-by-step guide for one episode. Read it all before you make or change an episode |
| `RESEARCH.md` | The research swarm runbook (weekly, and once in setup mode) |
| `docs/QUALITY.md` | The bar, and the reviewer gate every episode must pass |
| `docs/SOUND.md`, `docs/CAPTIONS.md` | Sound and caption rules |
| `niche/` | Everything about this owner's niche: profile, brand, topics, log, trends, weekly reports |
| `src/kit/` | Shared 3D and overlay building blocks |
| `src/<id>/` | One episode; `src/demo/` shows the structure |
| `tools/` | Voice, sound, sound check, frames, render, geodata |
| `scripts/` | Doctor, key storage, the unattended runner and the scheduler |
| `.claude/skills/` | `/setup`, `/reel`, `/research`, `/autopilot` |
| `.claude/agents/` | `reviewer` (the quality gate) and `researcher` (the swarm, on Sonnet) |
| `exports/<id>/` | Finished videos and captions (git-ignored) |

## Standing rules

- Nothing is ever posted, committed or pushed by a run. The owner posts.
- Every factual line has a fetched source, or it is cut.
- Never print, log or store the ElevenLabs key. It lives in the macOS Keychain
  or in `.env` (git-ignored). If it is missing, ask the owner to run
  `scripts/set-key.sh` in their own terminal.
- When the owner gives a standing rule for the niche, add it with the date to
  "Owner rules" in `niche/PROFILE.md`. Rules about the factory itself go in
  `PRODUCTION.md`, `docs/QUALITY.md` or the skills.
