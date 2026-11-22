# Research runs (the swarm)

What goes viral changes from week to week. Once a week, a research swarm looks
at what worked in the last 7 to 14 days and rewrites `niche/TRENDS.md`, which
every production run reads. The same swarm, in `setup` mode, runs once when a
niche is first set up (see "Setup mode" at the end).

This file is the runbook for the agent that leads the swarm. Follow it exactly.

**You lead; `researcher` agents do the looking.** Start them with the Agent
tool, `subagent_type: "researcher"` (`.claude/agents/researcher.md`, which
runs on Sonnet), all in one message so they run together. Each one gets a
complete brief (it knows nothing else). You read their reports, check the
important claims yourself, and write the results down.

**You change only these files:** `niche/weekly/<date>.md` (new),
`niche/TRENDS.md`, `niche/TOPICS.md`, `niche/topic-packets.md`,
`niche/references.md`, and files under `research/`. Do not change
`PRODUCTION.md`, the kit, the tools or any episode: put proposals for those in
the weekly report under "Proposed changes for the owner". Publish nothing,
commit nothing.

## Step 1: read what we already know

- `niche/PROFILE.md`: the audience, the region (its two-letter country code
  for search), the language, the platforms, the competitor and reference
  channels, the trusted sources.
- `niche/TRENDS.md` and the two newest files in `niche/weekly/`.
- `niche/LOG.md`: the episodes, their fingerprints, and the Performance table
  (the owner pastes real numbers there; it is the most valuable evidence).
- `niche/TOPICS.md`.
- Skim the setup report (`niche/weekly/*-setup.md`) once, so the swarm does
  not repeat settled work.

## Step 2: start the swarm (11 researchers)

Give every researcher the shared rules in the next section, word for word
(with the placeholders filled in from `niche/PROFILE.md`), and one slice.
Adapt a slice when last week's report says it found nothing. The channel
lists come from `niche/PROFILE.md`, "Reference channels"; add three new ones
you find each week to that list in the weekly report's proposals.

| # | Slice | What to bring back |
|---|---|---|
| 1 | **This week's faceless explainers.** The newest uploads (last 14 days) of the big explainer channels (Zack D. Films, Primal Space, Kurzgesagt and others in `niche/PROFILE.md`), plus three new ones found this week | Top videos by views per day, exact first sentence, first 3 seconds frame by frame, length, what is new compared with their older hits |
| 2 | **Code-made and AI-made videos this week.** Reels and posts made with Remotion, Three.js or Claude, the Remotion showcase | The week's best by likes, what they open on, any new visual technique worth building |
| 3 | **The niche this week.** The niche's brands, creators and accounts (`niche/PROFILE.md`) | What each posted in the last 14 days, the week's outliers against the account median, and why |
| 4 | **The audience's news this week.** What the niche's audience is talking about in its region: launches, changes, events, seasons. The trusted sources' news pages, local news, search autocomplete for the niche's core terms | A dated list of what is happening in the next 10 days and which of it could be an honest explainer topic |
| 5 | **Formats and sounds.** Formats rising or dying on the niche's platforms in the last 14 days, with real examples | Each format with one example, its views, and whether a faceless code-made video can use it |
| 6 | **Platform changes.** Anything the niche's platforms announced or changed in the last 14 days about ranking, originality, AI labels, links, captions, hashtags | Dated facts with sources, graded primary or secondary |
| 7 | **Hooks of the week.** The opening sentences and opening pictures of the 30 highest-view-per-day faceless shorts found by slices 1 to 3 and by search | A ranked list of hook shapes with examples, and which shapes are overused this week |
| 8 | **Titles and captions of the week.** The titles, captions and hashtags of the same winners | What the winners wrote, measured (length, question or statement, hashtags), compared with last week's report |
| 9 | **Our own results.** The Performance table in `niche/LOG.md`, plus public counts for our posted episodes if their links are listed there | Which of our episodes did best and worst against our own median, and the most likely reasons (hook, topic, length, first frame) |
| 10 | **Topic scout.** Search autocomplete (Google and YouTube, the niche's region), comments on niche videos, "how does" and "why do" questions about the niche's objects | Twelve new topic candidates that pass the four tests in `niche/TOPICS.md`, each with the first source to check |
| 11 | **Sound of the week.** Measure the audio of this week's ten best faceless videos from slices 1 to 3 with ffmpeg (`ebur128` loudness and range, the bed level under the voice from the gaps between lines, events per second, the first and last seconds), and read comments that mention sound, music or voice | What changed against the reference ranges, any new sound idea worth designing, and complaints or praise about sound, quoted |

Slices 1, 3 and 5 may use TikTok. No other slice may: TikTok blocks all
requests when many arrive together.

### Shared rules for every researcher (paste into each brief)

```
Today's date is <date>. You research what is working in short vertical video
in the last 14 days, for a daily faceless explainer series about <niche, one
line from niche/PROFILE.md> for <audience> in <region> (3D motion graphics
made in code, AI voice). Do the work yourself; do not start subagents. Do not
use --cookies or --cookies-from-browser. Put no personal or project names in
any search or request. Work only in <repo>/research/tmp/<date>/<slice>/ and
never run downloaded code.

How to look at a video (titles are not evidence; look at the frames):
- Rank a channel's shorts: yt-dlp --flat-playlist --playlist-end 60 --print "%(view_count)s|%(id)s|%(title)s" "https://www.youtube.com/@HANDLE/shorts"
- Exact numbers and the upload date: yt-dlp -J --skip-download <url>
- Views per day = views / days since upload. Prefer uploads from the last 14 days.
- Download small: yt-dlp -f "b[height<=720]/b" -o "<workdir>/%(id)s.%(ext)s" <url>
- First 3 seconds: ffmpeg -ss 0 -t 3 -i f.mp4 -vf "fps=5,scale=240:-1,tile=5x3" <id>-first3s.jpg
- Whole video: ffmpeg -i f.mp4 -vf "fps=1,scale=240:-1,tile=8x8" <id>-sheet.jpg
- Read the JPGs with the Read tool.
- Words: yt-dlp --skip-download --write-auto-subs --sub-langs "en.*" --convert-subs srt <url>, or whisper-cli -m ~/.cache/whisper-models/ggml-medium.en.bin -f audio16k.wav -nt
- Instagram single reels work without login: yt-dlp -J --skip-download https://www.instagram.com/reel/<code>/ (likes and comments, no views). Find reel links through articles and guides.
- TikTok account listing: yt-dlp --flat-playlist --playlist-end 60 --print "%(view_count)s|%(id)s|%(duration)s|%(title).200s" "https://www.tiktok.com/@USER". Wait 20 s between accounts. After two HTTP 403 in a row, stop using TikTok.
- Search phrases: curl -s "https://suggestqueries.google.com/complete/search?client=firefox&gl=<region code>&hl=<language>&q=<query>" (add &ds=yt for YouTube).

Report rules: at most 700 words. Every count says whether you verified it or
only read it. Every claim about "this week" carries a date. Say which videos
you looked at frame by frame and which you only read about. A small sample
does not prove a cause: say so. Never invent a count, a quote, a date or a
URL. If you found nothing new, say that plainly. List the paths of the frame
sheets worth keeping.
```

## Step 3: check and combine

- Open the frame sheets of the five most important finds yourself.
- Where two researchers disagree, look at the evidence and decide, or record
  the disagreement.
- Separate what is new this week from what the setup report and earlier
  weekly reports already established. A finding that only repeats standing knowledge goes in
  one line.
- Copy the frame sheets worth keeping to `research/refs/<date>/` (the
  `research/tmp/` folder is scratch), and the autocomplete results to
  `research/autocomplete/<date>.txt`.

## Step 4: write it down

1. **`niche/weekly/<date>.md`**, the full report: method and limits; what is
   new this week, most useful first; the week's best ten videos with numbers
   and opening sentences; platform changes; our own results; proposed changes
   for the owner (to the guide, the kit, the profile or the schedule).
2. **`niche/TRENDS.md`**, rewritten from its template. Keep it under 120
   lines: the production run reads all of it. It must be concrete enough to
   act on ("open on a held close-up for one second before the first word: four
   of this week's top ten do") and must say how strong the evidence is.
3. **`niche/TOPICS.md`**: add the new candidates at the bottom with what to
   verify first. Mark timely ones with `timely until <date>` in the notes so
   the production run takes them first. Do not delete rows; set a row to
   `stale` with a reason when it no longer fits. For the three best new
   topics, write a packet in `niche/topic-packets.md` (hook, mechanism step by
   step, reframe, sources found) and point the row at it (`P<n>`).
4. **`niche/references.md`**: the two or three best reference sheets for the
   reviewer (the strongest macro, faceless explainers you looked at), with
   their counts. Replace older ones only when the new ones are stronger.

## Step 5: report

End with a short report: what changed in TRENDS.md compared with last week,
the three findings that matter most, the new topics, what the swarm could not
reach, and the proposed changes that need the owner's decision.

## Evidence rules

- Counts come from `yt-dlp` or from a named source. Reported counts are
  labelled as reported.
- Instagram view counts are not available without login. Use likes.
- A convenience sample shows what winners have in common. It does not prove
  that a feature causes views.
- Vendor blogs sell tools: grade them as secondary and look for the primary
  source.
- Nobody can hear audio. Sound findings come from transcripts, waveforms and
  comments.

## Setup mode (the first run for a new niche)

`/setup` runs this once, after `niche/PROFILE.md` exists. Differences from the
weekly run:

- Use a 60-day window instead of 14 days.
- Replace slices 2, 6, 9 and 11 with:
  - **Niche winners, all time.** The 20 highest-view short explainers ever
    made about this niche's subjects, frame sheets of the best five.
  - **Audience questions, deep.** Autocomplete for 40 seed phrases built from
    the niche's objects ("how does a ___ work", "why does ___"), forum and
    Reddit threads, comments on the top videos. Bring back 30 real questions
    with where each was found.
  - **Objects and mechanisms.** For the niche, list 30 everyday objects with a
    hidden mechanism that the audience uses or sees, with the one-line
    mechanism and the best first source for each.
  - **Trusted sources.** The official and reliable sources for facts in this
    niche (standards bodies, manufacturers, regulators, operators, peer
    reviewed references), graded.
- Write `niche/TRENDS.md`, at least 15 rows in `niche/TOPICS.md` (ranked by
  the four tests, with a score per test), packets for the top five in
  `niche/topic-packets.md`, `niche/references.md`, and add the trusted sources
  and reference channels to `niche/PROFILE.md`.
- Write the report to `niche/weekly/<date>-setup.md`.
