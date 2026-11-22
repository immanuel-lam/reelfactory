# Caption guide (follow this for every episode)

Captions do little for reach, so do not spend effort on cleverness. A
caption has four jobs: be found in search, name the brand, repeat the send
line, stay compliant.

Write `captions.md` into the episode's export folder
(`exports/<id>/captions.md`) with the sections below, ready to paste. The
niche's caption voice, brand name, call to action, link and hashtags are in
`niche/PROFILE.md`.

## Rules for every platform

1. **Every factual sentence comes from `script.json` and its sources.** Do not
   add a new claim in a caption. Do not turn "can" into "does" or "thousands"
   into a number.
2. **Line 1 is a plain search phrase plus the question.** Use words people
   type: check `research/autocomplete/` (the research runs save real search
   suggestions there) for the real phrasing.
3. **Do not give the answer away** in the title or the first line. One line may
   add a fact the video does not say.
4. **Name the brand exactly** as `niche/PROFILE.md` writes it, with its call
   to action. Never rely on a link in a caption, except where the platform
   makes it clickable (see the table).
5. **One send line with a named role**, the same person as in the video ("send
   this to the friend who strips every screw"). No numbers ("tag 3").
6. **One real question** your audience can answer from their own life. Never
   "comment YES", "like if", "follow for part 2": platforms demote engagement
   bait.
7. **One sources line.**
8. **Voice:** follow `niche/PROFILE.md`, "Caption voice". Defaults: lowercase
   on Instagram and TikTok, short lines, at most one emoji, no em dashes, no
   hashtag wall, no marketing words. Laugh at yourself, never at the audience.
   Facebook: normal sentence case, friendlier.
9. **Hashtags:** three to five, on the last line. One topic tag, one or two
   niche or place tags. Never `#fyp`-style tags.
10. No dates, "today" or "right now": the video may be posted days later.

## Per platform

| | Instagram Reels | TikTok | YouTube Shorts | Facebook Reels |
|---|---|---|---|---|
| First line | under 55 characters | under 80 characters | the title: 40 to 70 characters | under 125 characters |
| Total length | 150 to 300 characters | 150 to 250 characters | description 2 to 3 sentences | up to about 300 characters |
| Hashtags | 3 to 5 (hard cap 5) | 3 to 4 | 3 in the description, none in the title | 0 to 3 |
| Link | none (bio) | none (bio) | none (not clickable) | the link in the first comment |
| Title pattern | n/a | n/a | "How/Why [thing] [surprising property]" or the plain question, one emoji at most | n/a |

Only write sections for the platforms listed in `niche/PROFILE.md`.

## The file to write

```markdown
# <id> captions: <title>

## Instagram Reels
<caption>

## TikTok
<caption>

## YouTube Shorts
Title: <title, 100 characters at most>
Description: <description>

## Facebook Reels
<caption>
First comment: <call to action>: <link>

## Pinned comment (all platforms)
<one extra fact from the sources, or the question>

## Cover text
<3 to 5 words, the question only, inside the middle 60% of the frame>

## Before you post
- TikTok: switch on "AI-generated content" (and "Disclose commercial content > Your brand" if the video promotes your own product).
- Instagram and Facebook: switch on the AI label if the app asks about synthetic audio.
- YouTube: answer the altered-content question honestly (a synthetic narrator over drawn graphics).
- Upload the same clean file natively to each platform. No watermark from another app.
- Suggested slots: from `niche/PROFILE.md`, in the audience's time zone.

## Credits and sources
Voice, sound and music: ElevenLabs. <map and data credits, if used>
<the sources from script.json, one per line>
```

## Worked example (the demo episode)

Instagram:

```
how a cordless drill gets its strength, explained
the motor is the size of your thumb. so how does it beat hardwood?
send this to the friend who strips every screw
search Your Brand on the App Store. it's free.
source: any mechanics textbook
#diy #tools #howitworks
```

YouTube Shorts title: `How Does a Tiny Motor Drive a Screw Into Hardwood? 🔩`
