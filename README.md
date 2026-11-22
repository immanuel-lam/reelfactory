# reelfactory

A reel factory you run with [Claude Code](https://docs.claude.com/en/docs/claude-code).
Clone it, tell Claude your niche, and it researches what is working, picks
topics, writes sourced scripts, records an AI narrator, builds a 3D film in
code, reviews it with a fresh agent until it passes a quality gate, and
renders a 4K vertical video with captions for Instagram, TikTok, YouTube
Shorts and Facebook. Every day, by itself, if you want.

The format: **faceless 3D explainer shorts**. One real object, huge in the
frame, with its hidden mechanism shown on it ("Your drill's motor is the size
of your thumb. So how does it drive a screw into hardwood?").

Nothing is ever posted for you. You get files; you post them.

## What you need

- macOS or Linux, Node 20+, ffmpeg, Python 3
- [Claude Code](https://docs.claude.com/en/docs/claude-code) (a Claude
  subscription or API key)
- An [ElevenLabs](https://elevenlabs.io) API key (voice, sound effects, music)
- Optional: `yt-dlp` (the research swarm needs it) and `whisper-cli` with the
  `ggml-medium.en.bin` model (checks that the voice says the script)

## Start

```sh
git clone https://github.com/immanuel-lam/reelfactory.git
cd reelfactory
npm ci
scripts/doctor.sh      # what is missing, and how to install it
scripts/set-key.sh     # stores your ElevenLabs key (Keychain on macOS, .env elsewhere)
claude
```

Claude sees that no niche is set up and starts `/setup`. It asks about your
niche, your audience and region, your brand and call to action, the narrator
you want, the words insiders use, and what a video must never claim. Then it
runs the research swarm once to seed your topic list and trends.

To see the pipeline work before any setup or API key:

```sh
npm run demo           # renders review frames of the demo episode into out/
npx remotion studio    # opens the films in the Remotion editor
```

## The commands

| In Claude Code | What it does |
|---|---|
| `/setup` | The interview. Writes `niche/PROFILE.md` and `niche/brand.json`, seeds topics and trends |
| `/reel` | Makes the next episode end to end, or continues an unfinished one |
| `/research` | The weekly research swarm: eleven Sonnet researchers, then a new `niche/TRENDS.md`, new topics and a report |
| `/autopilot` | Schedules `/reel` daily and `/research` weekly on this machine |

## How one episode is made (`/reel`)

1. **Topic.** The next row in `niche/TOPICS.md`, steered by this week's
   `niche/TRENDS.md`. A fingerprint check keeps every episode unique.
2. **Script.** 130 to 210 words in a fixed shape (hook, mechanism, reframe,
   send line, call to action). Every factual line has a fetched source, or it
   is cut.
3. **Voice.** ElevenLabs, one clip per line, with word timing. Every picture
   change is tied to the word that names it.
4. **Film.** React Three Fiber inside Remotion: the real object, built from
   reference photos to a spec sheet; real places from OpenStreetMap; one
   continuous camera move; word-by-word captions; your end card.
5. **Sound.** Designed effects in the episode's key, a few generated sounds, a
   music bed, mixed by measurement and checked against reference videos
   (the agent cannot hear, so the check stands in for ears).
6. **Review gate.** A fresh `reviewer` agent scores twelve lines from frame
   sheets and stills. Every line must reach 8/10. There is no round limit: fix,
   review with a new reviewer, repeat. An unfinished episode is continued by
   the next run.
7. **Render and captions.** 2160x3840, 60 fps, -14 LUFS, checked for black
   frames and with Whisper; `captions.md` per platform.

Outputs: `exports/<id>/<id>-4k.mp4` and `exports/<id>/captions.md`.

## The research swarm (`/research`)

The lead agent starts eleven `researcher` agents (Sonnet) in parallel. Each
takes one slice: this week's faceless explainers, code-made videos, your
niche's accounts, your audience's news, formats, platform changes, hooks,
captions, your own results, new topics, and sound. They download small copies
with `yt-dlp`, cut frame sheets with ffmpeg and look at the frames. The lead
checks the claims and rewrites `niche/TRENDS.md`, which every `/reel` reads.

Paste your real numbers into the Performance table in `niche/LOG.md` after you
post. It is the best evidence the swarm has.

## Autopilot (no extra app needed)

```sh
scripts/schedule.sh install --daily 06:00 --weekly sun 20:00
scripts/schedule.sh status
scripts/schedule.sh uninstall
```

Before the first scheduled run:

1. Open `claude` in the repo once and accept the workspace trust prompt.
   Until you do, print mode ignores the allow list in `.claude/settings.json`.
2. Make a long-lived sign-in for unattended runs: `claude setup-token`, then
   `scripts/set-key.sh claude` to store it (Keychain on macOS, `.env`
   elsewhere). A normal sign-in expires after a few days.

Each run is `claude -p "/reel"` (or `/research`) through `scripts/run.sh`,
started by launchd on macOS or cron on Linux, logged to `logs/`. Only one run
at a time. By default runs use `--permission-mode acceptEdits` with the allow
list in `.claude/settings.json`; add `--bypass` to run with
`bypassPermissions` (only on a machine or account kept for this). The machine
must be awake at the scheduled time. You can also ask Claude: `/autopilot`.

A full episode takes a long time (often hours, mostly review rounds) and uses
a lot of tokens. ElevenLabs responses are cached in `cache/`, so re-renders
cost no credits.

## Your niche lives in `niche/`

| File | What it is |
|---|---|
| `PROFILE.md` | Audience, region, vocabulary, trusted sources, brand, voice, never-list, owner rules |
| `brand.json` | Name, tagline, call to action, logo, colours for the end card |
| `TOPICS.md` | The ranked backlog and its statuses |
| `topic-packets.md` | What a scout already found for the best topics |
| `TRENDS.md` | What works this week (rewritten weekly) |
| `LOG.md` | Episodes, fingerprints, quality scores, performance |
| `weekly/` | The research reports |

Fork the repo and commit `niche/` and your episodes in `src/` to keep them.

## Layout

```
.claude/skills/   /setup, /reel, /research, /autopilot
.claude/agents/   reviewer (the quality gate), researcher (the swarm)
PRODUCTION.md     the episode guide
RESEARCH.md       the swarm runbook
docs/             quality bar, sound, captions
niche/            your niche (written by /setup)
src/kit/          3D and overlay building blocks
src/demo/         a demo episode that shows the file structure
tools/            voice, sound, sound check, frames, render, geodata, voices
scripts/          doctor, set-key, run, schedule
```

## Credits

Fonts: Manrope, Hanken Grotesk, Sometype Mono and Instrument Serif (SIL Open
Font License). Map data from `tools/geodata.mjs`: © OpenStreetMap
contributors (ODbL), credit it in your end card and captions.
