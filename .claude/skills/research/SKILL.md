---
name: research
description: Run the weekly research swarm — eleven Sonnet researcher agents study what worked in short video in the last 14 days for this niche, then the lead checks the claims and rewrites niche/TRENDS.md, adds topics and writes a weekly report. Used by the weekly autopilot run and by the owner on demand.
---

# Weekly research swarm

Research what is working in short video in the last 14 days and update the
trend guide for this niche. You may be working with nobody watching.

1. If `niche/brand.json` has `"configured": false`, stop and say: "Run /setup
   first."
2. Read `RESEARCH.md` completely and follow it step by step.
3. You lead the swarm. Start the eleven researchers with the Agent tool,
   `subagent_type: "researcher"`, all in one message, each with the shared
   rules from `RESEARCH.md` (placeholders filled from `niche/PROFILE.md`) and
   one slice. Wait for all of them.
4. Check the most important claims yourself, then write
   `niche/weekly/<today's date>.md`, rewrite `niche/TRENDS.md` (under 120
   lines, concrete, with evidence strength), add new topics to
   `niche/TOPICS.md`, and update `niche/topic-packets.md` and
   `niche/references.md`.
5. Rules that override everything: never invent a count, a quote, a date or a
   URL; label reported numbers as reported; change only the files `RESEARCH.md`
   allows; do not change `PRODUCTION.md`, the kit, the tools or any episode
   (put proposals in the weekly report); publish nothing, commit nothing, send
   nothing to anyone; no browser cookies, no logins.
6. End with the report that `RESEARCH.md` step 5 describes.
