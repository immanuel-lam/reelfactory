---
name: reel
description: Produce the next explainer episode for the niche, end to end — topic, sourced script, ElevenLabs voice, 3D film, sound, the reviewer quality gate, 4K render and captions. Continues an unfinished episode first. Used by the daily autopilot run and by the owner on demand.
---

# Make the next episode

You produce the next episode with its captions. You may be working alone with
nobody watching (the daily autopilot run). The standard is elite: competent
is a failure.

Work in the repo root.

1. If `niche/brand.json` has `"configured": false`, stop and say: "Run /setup
   first." Do nothing else.
2. Read `PRODUCTION.md` completely before anything else. Then read
   `docs/QUALITY.md`, `docs/SOUND.md`, `niche/PROFILE.md`, `niche/TRENDS.md`,
   `niche/TOPICS.md` (and the packet for your topic in
   `niche/topic-packets.md` if it exists), `niche/LOG.md`, the newest finished
   episode in `src/` (or `src/demo/` if there is none) and the kit in
   `src/kit/`.
3. Unfinished work comes first. If a row in `niche/TOPICS.md` is
   `in progress`, do not start a new episode: read `out/<id>-loop.md` and
   continue that episode from where it stopped. Otherwise take the next topic,
   set its row to `in progress`, and start.
4. Follow `PRODUCTION.md` step by step: pick the topic, write your fingerprint
   row and confirm the episode is unique (section 1b), verify every fact from
   a source you fetch, write the script, generate the voice, build the 3D
   film to the bar in `docs/QUALITY.md`, add sound by `docs/SOUND.md`, review
   the frames with the Read tool and fix what is wrong, pass the review gate,
   render the final 4K video with `tools/render.sh`, write `captions.md`
   following `docs/CAPTIONS.md`, then update `niche/TOPICS.md` and
   `niche/LOG.md`.
5. The world is real. Use the niche's own words (`niche/PROFILE.md`,
   "Vocabulary") in everything a viewer sees or hears. Every object is the
   named real model, built from reference photos. Every real place is built
   from real geodata with `tools/geodata.mjs` and `kit/geoworld.tsx`: never
   add, move or resize a building by hand. Also: a hero object of many parts
   with rounded edges, materials and life inside; people (`kit/folk.tsx`);
   shadows, key light and bloom from `kit/stage.tsx`.
6. The review gate (`PRODUCTION.md` step 6b, `docs/QUALITY.md` part 2) is a
   loop with no round limit. Each round: write your own list of everything
   weaker than the bar, start one fresh `reviewer` agent with the Agent tool,
   give it exactly what `docs/QUALITY.md` lists (including the settled list
   from `out/<id>-loop.md`), then fix all of its changes and all of your list.
   Repeat with a new reviewer until every line scores 8 or more AND your own
   list is empty. If a line does not improve for two rounds, rebuild that
   part with a different method. Decline a reviewer change only when it
   breaks a written rule, add it to the settled list, and raise that line
   another way. Update `out/<id>-loop.md` after every round. The reviewer is
   the only other agent you may start; do everything else yourself.
7. If the run must stop before the gate passes (out of context, out of time,
   a hard blocker), leave the row `in progress`, keep `out/<id>-loop.md`
   current, and say in the report what is open. The next run continues.
8. Rules that override everything: every factual line has a fetched source or
   it is cut; if a topic cannot be verified, mark it blocked and take the next
   one; every episode is unique; never print or store the ElevenLabs key;
   publish nothing, commit nothing, push nothing, send nothing to anyone
   (fetching public data such as the Overpass API is allowed); change nothing
   outside this repo; do not edit episodes that are `done`; do not weaken the
   checks in `tools/` or the bar in `docs/QUALITY.md`.
9. If a hard blocker stops the run (missing key, API error, no credits, a
   render that cannot be fixed), stop and report the exact error. Do not fake
   a result.
10. End with the report that `PRODUCTION.md` step 10 describes. If the gate
    did not pass, put that first with the open items.
