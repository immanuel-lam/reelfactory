# Niche profile

**Status: not set up.** Run `/setup` in Claude Code. It interviews you and
fills in every section below. You can edit this file by hand at any time; the
production and research runs read it on every run.

## The niche

- **One line:** <what the series explains, for whom>
- **The format:** faceless 3D explainer shorts: one real object, huge, with
  its hidden mechanism shown on it.
- **Why the audience cares:** <the everyday moment where they meet these objects>

## Audience

- **Who:** <age range, what they do, what they already know>
- **Region:** <country or city> (search region code: `<gl>`, language: `<hl>`)
- **Dialect and spelling:** <for example British English>
- **Time zone and posting slots:** <for example Europe/London, 7:30 am and 6:30 pm>

## Platforms

<Instagram Reels, TikTok, YouTube Shorts, Facebook Reels: the ones you post to>

## Brand

- **Name, exactly as written:** <name>
- **What it is:** <one line>
- **Call to action (spoken):** <for example "Your Brand. Free on the App Store.">
- **Call to action (caption):** <for example "search X on the App Store">
- **Link:** <URL for bios and Facebook first comments>
- **What the brand does (only true statements):** <list; nothing else may be claimed>
- **Code or docs to check claims against (optional):** <paths or URLs>

## Voice

ElevenLabs. Copy this block into every `script.json`:

```json
{
  "voiceId": "<id>",
  "name": "<voice name>",
  "modelId": "eleven_v4",
  "settings": { "speed": 1.2, "stability": 0.4, "similarity_boost": 0.8 }
}
```

## Length

<default 45 to 70 seconds>

## Vocabulary

The words insiders use, and the wrong words that give an outsider away.

| Say | Never say | Why |
|---|---|---|

## Trusted sources

| Source | What it is good for | Grade |
|---|---|---|

## Never

Things a video or caption must never claim or show in this niche (on top of
the facts rules in `PRODUCTION.md`).

## Reference channels

The niche's own accounts, brands and creators, and the explainer channels the
research swarm watches each week.

| Platform | Handle | Why |
|---|---|---|

## Caption voice

<for example: sounds like a local, lowercase, short lines, one real question>

## Hashtags

<the topic and place tags to rotate>

## Owner rules

Standing decisions from the owner, newest last, with the date.
