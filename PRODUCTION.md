# Production guide

Read this whole file before you make or change an episode. It is written for
an agent that produces one new episode without a person watching. Follow it
exactly. Where it is silent, choose the option that keeps the facts true and
the first two seconds strong.

**The job:** one vertical explainer video (length from `niche/PROFILE.md`,
default 45 to 70 seconds, 2160x3840, 60 fps) about how something in the niche
really works, plus captions for the niche's platforms. The video makes the
audience curious, answers honestly, and names the brand at the end.

**The niche:** everything specific to this channel lives in `niche/`:
`PROFILE.md` (audience, region, vocabulary, fact sources, brand, voice,
platforms, rules the owner added), `brand.json` (end card and colours),
`TOPICS.md`, `LOG.md`, `TRENDS.md` and `topic-packets.md`. If
`niche/brand.json` has `"configured": false`, stop and tell the user to run
`/setup` first.

**You do not publish anything.** You produce files. The owner posts them.

**The standard is elite.** Competent is a failure. Read `docs/QUALITY.md`
before you build: it sets the bar for the hero object, the frame, the world
and the motion, and it defines the review that every episode must pass.

Build macro: one huge object for the whole film, with the explanation
happening on it (`docs/QUALITY.md`, "Macro first").

Reference for how the code is organised: `src/demo/` (estimated timing, no
audio; it shows the file structure, it is **not** a quality reference). Once
the niche has a finished episode that passed the gate, the newest one is the
code reference too.

Caption rules: `docs/CAPTIONS.md`. Sound rules: `docs/SOUND.md`. What works this week:
`niche/TRENDS.md` (rewritten every week by `RESEARCH.md`).

---

## 1. The format (do not change it)

1. **Frame 0 is the subject, in 3D, already moving.** No logo, no title card,
   no black frame, no fade-in. Frame 0 is also the thumbnail: the first caption
   word is on screen.
2. **The first sentence is a clash the viewer has lived**, in one breath, with
   "your" in it. Two things that should not both be true. Then a question the
   viewer cannot answer without watching.
3. **The first answer lands inside 10 seconds.**
4. **Voice first.** Write and record the voice, then tie every picture change
   to the word that names the thing. Something changes every one to three
   words. Nothing sits still for more than about a second.
5. **One continuous camera move. No cuts.** The scene morphs, the camera flies.
6. **One real object, huge, for the whole film.** The mechanism is shown on the
   object itself (cut open, see-through, pulled apart). Maps and diagrams: four
   seconds in a row at most.
7. **Captions:** the kit's word-by-word captions, one boxed key word per line.
8. **A reframe line** near the end that makes the opening clash make sense in a
   new way ("So your motor was never strong. It just traded speed for force.").
9. **A send line with a named person** ("Send this to the friend who strips
   every screw.").
10. **The end card**: `<EndCard>` from the kit, on the spoken CTA line
    (`ctaSpoken` in `niche/brand.json`).
11. **Calm, not loud.** No flashes, no screen shake, no strobing, no fast zoom
    cuts. Motion is rich and smooth: eased moves, small overshoots.

`niche/PROFILE.md` may change the length, the send-line form or the CTA. It
never changes rules 1 to 6 or 11.

### Script shape (130 to 210 words for 45 to 70 seconds)

Use the length the mechanism needs. Never pad: every extra line must be a new
picture on the object. The first answer still lands inside 10 seconds.

| Part | Lines | What it does |
|---|---|---|
| Hook | 2 to 3 | The clash, then "So how...?" |
| Mechanism | 4 to 9 | One step per line, each one a picture |
| Scale | 1 to 2 | The same thing at full scale, with one real number or "thousands" |
| Brand | 0 to 1 | What the brand does with it, only if true and sourced (see `niche/PROFILE.md`, "What the brand does") |
| Bonus | 0 to 1 | One surprising consequence |
| Reframe | 2 | The opening, seen the new way |
| Send | 1 | "Send this to the [person] who [situation]." |
| End card | 1 | `ctaSpoken` from `niche/brand.json` (key `cta`, always the last line) |

Writing rules: short sentences, one idea each, the important word last. Plain
language in the audience's dialect (`niche/PROFILE.md`); one piece of slang at
most. Write numbers as words. No "today", "right now" or dates: the video may
be posted days later.

### Hook checklist (answer yes to all ten before you record the voice)

1. Does frame 0 show the finished subject, not a blank or a logo?
2. Does something move in the first half second?
3. Does one idea fill the screen?
4. Does the first sentence fit in one breath and put the viewer in it?
5. Do two things clash?
6. Has the viewer lived the strange part?
7. Can the question only be answered by watching?
8. Does the frame read with the sound off?
9. Does the voice start inside half a second?
10. Does the video deliver exactly what the opener promises?

---

## 1b. Every episode is unique

No two episodes may feel like the same video with the words swapped. Platforms
also demote templated, repetitive content, so this protects reach as well.

**What stays the same** (the series identity): the format rules above, the
caption style, the voice, the end card, the calm motion, the colour system.

**What must be new in every episode:**

| Dimension | Rule |
|---|---|
| Topic and mechanism | Never repeat a topic, and never explain the same mechanism twice from a new angle |
| Hero object | A new main object, built for this episode. An earlier hero may appear in the background, never as the hero again |
| World | A new place: do not reuse another episode's set as the main stage, and never with the same camera path |
| Opening picture | Frame 0 must look different from every earlier frame 0 (compare with the `-first3s.jpg` sheets in `exports/*/`) |
| Hook shape | Rotate the form of the first sentence (see the list below). Do not use the same form as either of the two episodes before |
| Key visual idea | One new way of showing the mechanism. Do not reuse an earlier episode's key idea |
| Camera journey | A new path: different start, different big move, different end framing |
| Reframe line | New wording and a new idea |
| Send line | A new person each time. Keep the form "Send this to the [person] who [situation]." |
| Sound | A new key and tempo, and at least two sounds that belong to the subject |
| Accent | The brand accent stays; give the episode one secondary colour of its own |

Hook shapes to rotate (all open on the object, never on a title):

1. **The clash**: "Your drill's motor is the size of your thumb. But it drives a screw into hardwood."
2. **The missing thing**: "This lamp has no switch and no cable. So where is the power?"
3. **The impossible number**: "This card has no battery, and it still talks to the reader in a blink."
4. **The everyday mystery**: "Your toast is never done on one side only. Why?"
5. **The hidden rule**: "There is one part in your fridge that must never get cold."
6. **The wrong belief**: "Most people think a microwave heats from the inside out. It doesn't."

**How to check.** Before you write the script, read `niche/LOG.md` (its
fingerprint table) and look at the first-3-seconds sheets of the last five
episodes. Write your own fingerprint row first, as a plan, and confirm it
differs from every earlier row in topic, hero object, world, hook shape, key
visual idea and reframe. After the render, compare your `-first3s.jpg` with
the earlier ones side by side. If yours could be mistaken for an earlier
episode, change it.

Reusing kit code is good. Reusing a look is not: when you reuse a kit
set-piece, change its role, its framing and what happens to it.

---

## 2. Facts (never break these)

- **Use the niche's own words** (`niche/PROFILE.md`, "Vocabulary"). Insiders
  notice a wrong word at once. What the viewer sees and hears follows the
  vocabulary list; code names may differ.
- **Every factual sentence in the script has a source** written in
  `script.json` under `sources`: an official page, a reliable reference, the
  brand's own code or documentation, or recorded data. Fetch the source; do
  not rely on memory. `niche/PROFILE.md`, "Trusted sources", lists the best
  ones for this niche.
- **If you cannot verify a line, delete the line.** Do not soften it into a
  guess. If the whole topic cannot be verified, mark it `blocked` in
  `niche/TOPICS.md` with the reason and take the next topic.
- **What the brand does** is only what `niche/PROFILE.md` lists as true (and,
  where it names a code repo, what that code does). Never invent a feature.
- **Never claim or show** anything on the "Never" list in `niche/PROFILE.md`,
  anything about a named private person, a real person's voice, or how to
  break a law or a rule.
- **Illustrations are allowed, inventions are not.** A drawn example is fine.
  An example value must be clearly an example in context, not presented as a
  recorded event.
- **No logos or pictograms of other brands.** Model names, numbers and place
  names are fine. The object itself must be the real model, with its real
  shape, colours and layout (`docs/QUALITY.md`, "Real things look real").
- **Sounds are re-created, never sampled** from real recordings you do not own.

---

## 3. Pipeline

Run everything from the repo root. Restore packages with `npm ci`.
`scripts/doctor.sh` checks the tools.

### Step 1: pick the topic and the id

Read `niche/TRENDS.md`, `niche/TOPICS.md` and `niche/LOG.md`.

**Unfinished work comes first.** If a row in `niche/TOPICS.md` is
`in progress`, do not start a new episode. Continue that one: read
`out/<id>-loop.md`, do the open changes and your open weakness list, and go on
with the review loop (step 6b) until the gate passes. Only then render, write
captions and record it. One episode at a time; never two in progress.

Otherwise take the first `todo` row (rows that `niche/TRENDS.md` marks as
timely this week come first), set it to `in progress` with its id, and start.
The id is the next free `eNNN` (look at `src/`). Create `src/<id>/`.

`niche/TRENDS.md` may steer the hook shape, the length, the pacing, the
caption wording and the choice of topic for this week. It can never override
the facts rules, the uniqueness rules, the calm-motion rule or the no-publish
rule. If it is more than 14 days old, say so in your report and rely on this
guide.

**If the backlog is short.** If fewer than three `todo` rows remain, find new
topics before you start: real questions your audience asks (search
autocomplete in the niche's region, as described in `RESEARCH.md`; the trusted
sources' news), keep the ones that pass the four tests at the top of
`niche/TOPICS.md`, and add at least five rows with what to verify first. Never
start an episode without a topic that is in `niche/TOPICS.md`, and never
repeat a topic or a mechanism that is in `niche/LOG.md`.

If the topic's row points to a packet (`P3`), read it in
`niche/topic-packets.md`: it has the hook, the mechanism, the reframe and the
sources a scout already found. Fetch each source again yourself.

Write your fingerprint row (section 1b) before the script.

### Step 2: research and script

Research the mechanism until you can explain every step with a source. Then
write `src/<id>/script.json` (copy the structure of `src/demo/script.json`):
`id`, `title`, `voice` (copy it from `niche/PROFILE.md`, "Voice"), `tempo`
(1.16), `leadIn` (0.1), `lines` (each with a short `key`, `text`, and `gap` in
seconds after it), `sources`. The last line has the key `cta` and the text
`ctaSpoken` from `niche/brand.json`.

Give the voice room: a `gap` of 0.6 to 1.0 seconds before the answer line and
about 0.5 before the reframe (`docs/SOUND.md`, "The voice").

Run the hook checklist.

### Step 3: voice

```sh
node tools/voice.mjs <id>
```

ElevenLabs, one clip per line (never the whole script in one request: lines
stay level and re-takes of one line are cheap). The key comes from `.env` or
the macOS Keychain (`scripts/set-key.sh`). If the key is missing or the API
fails, stop and report. Never print or store the key.

The tool writes `public/<id>/vo.wav` and `src/<id>/timing.json` and prints the
pace. Aim for 2.8 to 3.2 words per second. Too long: cut words, do not raise
the tempo above 1.2. Check the words with Whisper:

```sh
ffmpeg -v error -y -i public/<id>/vo.wav -ar 16000 -ac 1 out/<id>-vo16.wav
whisper-cli -m ~/.cache/whisper-models/ggml-medium.en.bin -f out/<id>-vo16.wav -nt
```

If a word is misread or mispronounced, respell it in the script (the cache
makes re-runs of unchanged lines free).

Tip: `node tools/draft-timing.mjs <id>` writes an estimated `timing.json` with
no API call, so you can block out the pictures first. The real voice replaces
it; everything tied to `L`, `LE` and `W` follows.

### Step 4: build the film

**A real place comes from real geodata first.** If the film is set in a real
place, fetch it before you build anything (`docs/QUALITY.md`, "Real places are
built from real geodata"):

```sh
node tools/geodata.mjs <id> --bbox south,west,north,east --origin lat,lon [--track highway=primary] [--fit 120] [--straighten]
```

It writes `src/<id>/geo.json` (keep the raw answer in `cache/osm/`) and prints
the counts of heights from tags, from storey counts and from defaults. Build
the city with `GeoCity` and `GeoRoads` from `kit/geoworld.tsx`, and put trees
and other mapped objects at their mapped positions. Add "© OpenStreetMap
contributors" to the end-card credit.

Files to write in `src/<id>/` (use `src/demo/` as the model):

| File | Contents |
|---|---|
| `timeline.ts` | `T = makeTimeline(timing)`, the moving things as functions of time, the camera keys, `END` |
| `World.tsx` | The 3D scene, composed from the kit plus this episode's own set-pieces |
| `Overlays.tsx` | `KEY_WORDS`, the DOM overlays (labels pinned to 3D points, lines, the phone) |
| `Film.tsx` | Exports `Film` and `DURATION`; layers the canvas, overlays, `<EndCard>`, `<Captions>`, `<Audio>` |
| `sound.mjs` | Sound cues (step 5) |

Then add the episode to `EPISODES` in `src/Root.tsx`.

**Timing.** Everything is timed in seconds against the voice: `L('key')` is a
line's start, `LE('key')` its end, `W('key', 'word')` the start of a word in
it. Never hard-code a time that belongs to a word. Use `prog`, `pop`, `kick`
and `track` from `src/kit/time.ts`.

**The kit (`src/kit/`), reuse before you build:**

| File | What it gives you |
|---|---|
| `time.ts` | `makeTimeline`, `prog`, `pop`, `kick`, `track`, easings, vector helpers |
| `camera.ts` | `makeCamera(keys, anchors)` (one continuous camera; keys can be relative to a moving anchor), `makeProjector` (3D point to screen pixels, for DOM overlays) |
| `stage.tsx` | The look: `Look` (shadows, reflections, exposure), `KeyLight` (the one shadow-casting light, aimed at the subject), `Bloom` (must be last in the World), `RoundBox`, `Grain` |
| `three.tsx` | Colours `C` (accent and secondary from `niche/brand.json`), `Glow`, `GroundGlow`, `Box`, `Rig`, `Atmosphere`, `Sky`, texture helpers, `ribbon` |
| `people.tsx` | `Person`: standing or sitting, with a phone or holding a rail |
| `folk.tsx` | `Folk`: people with a shaped torso, knees, elbows, hands, hair, bags and a contact shadow; `phase` and `moving` drive a walk cycle. Prefer it to `Person` for anyone in focus |
| `geoworld.tsx` | `GeoCity`, `GeoRoads`, `useGeoCity`: a real city from `tools/geodata.mjs` output (mapped footprints extruded to mapped heights, facades tiled per storey, lit shopfronts at street level) |
| `Captions.tsx` | Word-by-word captions with a boxed key word |
| `Phone.tsx` | `PhoneShell` (a phone held at the bottom of the frame; put your own screen inside), `Roundel` |
| `EndCard.tsx` | The end card and the brand icon, from `niche/brand.json` |
| `brand.ts` | The niche's brand values |

Build new set-pieces to the bar in `docs/QUALITY.md`, part 1: **first name
the exact real model, collect its reference photos, write
`out/<id>-refs/SPEC.md` and match it**, then at least fifteen parts in three
sizes for a hero object, `RoundBox` for everything manufactured, three
materials, life inside (canvas textures), emissive faces for lit parts and
`Glow` for halos. When a new set-piece is reusable, put it in the kit and add
it to the table above with its real model name.

**3D rules (a render breaks or flickers if you ignore them):**

- All motion comes from the frame: `const t = useCurrentFrame() / fps`. Never
  animate with `useFrame`, `Date.now()`, `Math.random()` or CSS animations.
  (`Bloom` uses `useFrame` only to draw the frame; that is the one exception.)
  Random numbers: remotion's `random('seed')`.
- One `<ThreeCanvas>` with explicit `width` and `height`. The camera is set by
  `<Rig cam={CAM} t={t} />`.
- Text that must be sharp is DOM, placed with `makeProjector`. No drei, no
  `<Html>`, no post-processing packages beyond the kit's `Bloom`.
- Keep real lights few (under about eight). Use emissive materials and `Glow`.
- Night look: fog from `<Atmosphere>`; add `fog={false}` to things that must
  read at a distance.
- Materials that switch `transparent` or `toneMapped` between frames must be
  remounted (give them a `key`), or a sequential render keeps the first state.
  Single stills do not show this bug.
- Units are metres.

**Look.** A near-black base, one accent (`C.amber`, the brand accent) for data
and energy, the episode's secondary colour, type in Manrope. The frame must
never be mostly empty or mostly dark: put the subject large in the upper two
thirds; the lower third may hold the phone. Captions sit at the top (y 250).
Keep important content inside x 60 to 900 and y 250 to 1440 (platform buttons
cover the rest).

### Step 5: sound

Read `docs/SOUND.md` first: it is short, and sound is the most common
complaint about videos like these. You cannot hear, so you follow its rules
and its check.

Write `src/<id>/sound.mjs`: a key and a tempo for this episode, about 20 cues
tied to visual events with `L`, `LE` and `W`, one music stop before the key
line, the `logo` on the end card. Use the designed sounds; add at most three
generated real-world sounds under `sfx`.

```sh
node tools/sound.mjs <id>
node tools/audio-check.mjs <id>
```

Fix every FAIL. Fix or explain every WARN. Then add
`<Audio src={staticFile('<id>/mix.wav')} />` to `Film.tsx`.

### Step 6: look at it, and fix it

```sh
npm run typecheck
node tools/frames.mjs <id> check 0 0.5 1.5 3 5 8 11 14 17 20 24 28 32 36 40
```

Open `out/<id>-check-sheet.jpg` with the Read tool and judge it honestly. Add
times around every scene change. Fix and repeat until all of these are true:

- Frame 0 shows the subject, large and lit, with the first caption word.
- Every frame has a clear subject. No frame is mostly empty, mostly dark, or a
  flat colour for more than about half a second.
- Nothing important is clipped by the frame edge or hidden behind the phone,
  the captions or another object.
- Captions never run off the sides.
- Each picture matches the words spoken at that moment.
- Text is spelled correctly and names are right.
- Every real object matches its reference photos: you have put stills beside
  the photos in `out/<id>-refs/` from the same angles, listed the differences
  and fixed them (`docs/QUALITY.md`, "Real things look real", step 5).
- The end card shows the brand icon, name, tagline, CTA and the credit line.

Then the sheets, in motion order:

```sh
node tools/frames.mjs <id> sheets
```

Read `out/<id>-sheet.jpg` and `out/<id>-first3s.jpg` and fix what you see.

### Step 6b: the review (the quality gate)

Your own eyes are not enough: you built it. Follow `docs/QUALITY.md`, part 2.
Make the review frames with `tools/frames.mjs` (`sheets`, `review <seconds...>`
and `hero <frames...>`). Keep `tools/render.sh <id> draft` for the last motion
check. Start one fresh `reviewer` agent with the Agent tool, give it exactly
what that file lists, and act on all its changes. Every line of the scoring
sheet must reach 8 out of 10, and your own list of weaknesses must be empty.
Each new round uses a new reviewer. There is no round limit: fix, review, fix
again, until the gate passes. If a line does not move for two rounds, rebuild
that part with a different method (`docs/QUALITY.md`, "When a line will not
move"). Keep `out/<id>-loop.md` current after every round, so that a later run
can continue if this one stops. Record each round's scores in the Quality
table in `niche/LOG.md`.

Never ship around the gate. If the run must stop before the gate passes,
leave the row `in progress`, render nothing final, and say in the report what
is still open; the next run continues the same episode.

This is the one place where you start another agent. The reviewer only looks
and scores; it changes no files.

### Step 7: final render and checks

```sh
tools/render.sh <id>
```

It writes `exports/<id>/<id>-4k.mp4` and prints the checks. All must pass:

- 2160x3840, 60 fps, length inside the niche's range plus or minus 2 seconds.
- Loudness between -15 and -13 LUFS.
- 0 black segments.
- The "heard" line (Whisper on the final mix) matches the script.
- The sound check at the end prints 0 FAIL.
- The review (step 6b) has every line at 8 or more and your weakness list is
  empty. Do not run the final render before that.

### Step 8: captions

Follow `docs/CAPTIONS.md` and write `exports/<id>/captions.md`.

### Step 9: record it

- `niche/TOPICS.md`: set the row to `done` with the id.
- `niche/LOG.md`: add a row to the episode table (date, id, title, length,
  voice pace, anything the owner should know), a row to the fingerprint table
  and the final scores to the Quality table.
- Do not commit, push or publish.

### Step 10: report

Finish with a short report: the id and title, the paths of the video and the
captions, the script, each claim with its source, what you checked and what you
could not check, and the review rounds it took. If the run stopped before the
gate passed, the report says so first and lists what is open. You cannot hear
audio: give the sound check's result, name any generated sound you used and
when it plays, and say that nobody has listened.

---

## 4. When something goes wrong

| Problem | What to do |
|---|---|
| `niche/brand.json` has `"configured": false` | Stop. Tell the user to run `/setup` |
| A fact cannot be verified | Cut the line, or block the topic and take the next one |
| ElevenLabs key missing, API error or out of credits | Stop. Report the exact error. Do not use another voice service |
| Music generation fails | The tool mixes without a bed; say so in the report |
| Type errors or a render error | Read the error, fix the code. Never skip the type check |
| A still is blank or frozen | Something is not driven by the frame; check for `useFrame`, effects without `t`, or a missing `delayRender` |
| The render is slow | Always use `--gl=angle` on a Mac (the tools do). A 45 s draft takes about 90 s |
| Several rounds of fixes and still weak | Do not ship. Rebuild the weak part with a different method and review again. If the run must stop, leave the episode `in progress` with `out/<id>-loop.md` current |

## 5. Rules the owner added

The owner's own decisions for this niche are in `niche/PROFILE.md`, "Owner
rules". They override this guide where they conflict, except the facts rules
and the no-publish rule. When the owner gives you a new standing rule in a
conversation, add it there with the date.
