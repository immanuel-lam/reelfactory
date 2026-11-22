---
name: setup
description: First-run setup of the reel factory for a new niche. Interviews the owner about their niche, audience, brand and voice, writes niche/PROFILE.md and niche/brand.json, runs the research swarm in setup mode to seed topics and trends, and offers to schedule the daily and weekly runs. Use when niche/brand.json has "configured": false, or when the user says they want to set up, change or start a niche.
---

# Set up a niche

You are setting up the reel factory for a new owner. They cloned the repo and
want a channel of faceless 3D explainer shorts about **their** niche. Your job
in this skill: understand the niche well enough that a daily run with nobody
watching can make an elite episode, then seed the research.

Read first: `README.md`, `PRODUCTION.md` (sections 1, 1b and 2),
`RESEARCH.md` ("Setup mode"), and the templates in `niche/`. Aim for a
profile detailed enough that a run with nobody watching never has to guess:
exact names, real sources, the words insiders use, and a clear never-list.

If `niche/brand.json` already has `"configured": true`, ask whether the owner
wants to change the existing niche or start over. Starting over moves the old
`niche/` to `niche.old-<date>/` first; never delete it.

## Step 1: check the machine

Run `scripts/doctor.sh`. If something required is missing, show the owner the
exact install command it prints and wait. Do not install system packages
yourself unless the owner says so. `npm ci` you may run.

## Step 2: the interview

Ask with the AskUserQuestion tool where the answer is a choice, and in plain
chat where it needs their words. Ask in small rounds (at most four questions
at a time), and after each round say back in two lines what you understood.
Never ask what you can find out yourself (for example the right words for a
region, or which platforms allow links).

Round 1, the niche:
- What is the channel about, in one line? What do viewers meet every day in
  this niche that hides a mechanism? (Give two examples of good explainer
  topics from their answer, so they see the format.)
- Who watches: age, what they do, what they already know?
- Where are they (country or city) and what language and dialect?

Round 2, the brand:
- Is there a product, app, shop or account to promote, or is the channel the
  brand? Its exact name, a one-line description, the call to action (spoken
  and written) and the link.
- What does the product truly do? (Only these statements may ever be claimed.
  If there is a code repo or docs, ask for the path or URL so runs can check.)
- A logo? (An SVG or PNG path. Copy it to `public/brand/` and set
  `"logo": "brand/<file>"`. Without one the end card shows the initial.)
- Brand colours: one accent, one secondary. Suggest a pair if they have none.

Round 3, voice and style:
- Which platforms do they post to?
- The narrator: accent, gender, age, energy. Then find voices (the key must
  be set first, Step 3): `node tools/voices.mjs search "<words>" <language>`
  searches the ElevenLabs shared library, `node tools/voices.mjs mine` lists
  the owner's own voices. Offer the three best with their preview URLs so the
  owner can listen, and let them choose. Record the voice id and name.
- Length: 45 to 70 seconds by default. Do they want shorter?
- Caption voice: how should captions sound? Ask for one account whose captions
  they like.

Round 4, the guard rails:
- Words insiders use, and words that give an outsider away. Propose a first
  list from your own knowledge and let them correct it.
- Anything a video must never claim or show (health claims, prices, a
  competitor, safety-critical how-tos...).
- Accounts and channels they admire or compete with (handles).
- When to post (their time zone).

## Step 3: the ElevenLabs key

The voice, the generated sounds and the music all use ElevenLabs. Check with
`node -e "import('./tools/secrets.mjs').then(m=>{m.elevenKey();console.log('key found')})"`.
If it is missing, ask the owner to run `scripts/set-key.sh` in their own
terminal (it stores the key in the macOS Keychain, or in `.env` on other
systems). Never ask them to paste the key into the chat, and never print it.

## Step 4: write the niche

1. Fill every section of `niche/PROFILE.md` from the interview. Remove the
   "Status: not set up" paragraph. Keep the headings: the runs look for them.
2. Write `niche/brand.json` with `"configured": true` and the brand values.
   `ctaSpoken` is the last line of every film. `credit` is the default
   end-card credit (data and map credits; empty if none).
3. Set the `voice` block in `src/demo/script.json` to the chosen voice, so the
   demo matches.
4. Run `npm run typecheck`, then `node tools/frames.mjs demo check 0 5 20 25`
   and open the sheet: the end card must show their brand.

## Step 5: seed the research

Follow `RESEARCH.md` in **setup mode**: start the researchers (the `researcher`
agent) in one message, check their finds, and write `niche/TRENDS.md`,
`niche/TOPICS.md` (at least 15 ranked rows), `niche/topic-packets.md` (top
five), `niche/references.md`, and the trusted sources and reference channels
into `niche/PROFILE.md`. Tell the owner before you start that this runs about
eleven agents and takes a while.

Show the owner the top ten topics and ask them to strike any they dislike
(set those rows to `stale` with "owner struck").

## Step 6: what next

Tell the owner, briefly:

- `/reel` makes the next episode now (it takes a long time: a full build,
  review rounds and a 4K render).
- `/research` refreshes the trends (weekly is right).
- `/autopilot` schedules both on this machine with the `claude` CLI.
- Outputs land in `exports/<id>/` (video and `captions.md`). Nothing is ever
  posted automatically.
- After they post, they paste the numbers into the Performance table in
  `niche/LOG.md`: the weekly research learns from it.

Ask whether to make the first episode now or to set up the autopilot.
