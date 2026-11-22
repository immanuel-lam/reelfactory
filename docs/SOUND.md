# Sound guide (follow this for every episode)

You cannot hear. So sound here is made by rule and checked by measurement.
The cue list format is below.

What listeners praise is never one effect. It is fit: voice, picture, effects
and music that belong together. What they complain about, in order: generic
cheap effects, effects out of sync, a flat AI voice, too many effects, no
pauses, music fighting the voice.

## The ten rules

1. **Few sounds.** One sound per visual beat, not one per moving thing. About
   one cue every two seconds (20 in a 45-second film, 30 in a 65-second one).
   After you place them, delete the weakest third.
2. **One family, one key.** Choose a key and a tempo for the episode (a new
   pair each episode). Every pitched effect and the music use that key. Use
   the designed sounds: they are tuned for you.
3. **Sounds belong to things you see, not to words.** Put a cue on a visual
   event. Never add a cue only to stress a spoken word, and keep loud cues off
   the stressed word of a sentence: place them just before it or in a pause.
4. **On the frame.** The start of a hit sits on the frame of the visual event
   (never more than two frames late). A whoosh or riser starts early so that
   its peak or its end is the arrival.
5. **One build and one big hit.** One riser, one `thump`. More cancel each
   other. Give the big hit a beat of quiet first: stop the music just before
   the key line (`musicStops`).
6. **The voice is always in front.** The tool sets the music 18 LU under the
   voice and ducks it. Keep effect gains between -8 and -20 dB.
7. **Never dead air.** Room tone and the bed run under everything. The tool
   adds them.
8. **Made for a phone.** Nothing important below 300 Hz. Use `thump` for a low
   hit: it has a knock that a phone can play. Everything is mono-safe.
9. **Rising means good or starting; falling means ending.** `confirm` rises,
   `chime` falls. Brighter is more urgent.
10. **A start and an end.** A soft sound in the first half second, never the
    loudest moment of the film. The sonic logo (`logo`) on the end card, with
    the music coming forward under it.

## The voice

- Write for a held beat: a `gap` of 0.6 to 1.0 seconds before the answer line,
  and about 0.5 before the reframe. Other gaps 0.1 to 0.3.
- Pace 2.8 to 3.6 words per second. If it is slow, write denser sentences; do
  not raise `tempo` above 1.2.
- Put the important word last in the sentence: the voice naturally lands on it.
- Direction is optional and not always obeyed. If a line needs it, the model
  understands a tag in square brackets before the sentence (`[deadpan]`,
  `[curious]`), an ellipsis for a pause, and capitals for emphasis. Use at most
  one per line, and check the result with Whisper: a tag that is read aloud is
  a failed take.

## The cue list (`src/<id>/sound.mjs`)

```js
export default ({ L, LE, W }) => ({
  key: 'D minor',          // a new key each episode
  bpm: 96,                 // 90 to 125
  musicStops: [[W('trade', 'five'), W('trade', 'harder') - 0.04]],
  events: [
    ['chime', 0.0, -14],                       // [name, time in seconds, gain in dB]
    ['pop', W('small', 'gear') - 0.12, -10],    // on the visual event, which starts before the word
    ['riser', arrival - 1.6, -15],             // a riser is 1.6 s long and ends at its peak
    ['thump', W('trade', 'harder') - 0.06, -7],
    ['logo', L('cta') - 0.08, -9],
  ],
});
```

Designed sounds (made in `tools/synth.mjs`, always in the episode's key):

| Name | What it is | Use it for |
|---|---|---|
| `tick` | A dry 30 ms click | A mark, a small UI event, a line that fails |
| `pop`, `pop:3` | A soft falling pop | Something appears |
| `blip`, `blip:5` | A short high note | A report, a ping, a count (at most three in a row) |
| `bell`, `bell:8` | A warm bell with a tail | An arrival, a state reached |
| `confirm` | Two rising notes | Good news: a light turns green |
| `chime` | Two falling notes | An opening or a closing |
| `whoosh`, `whooshDown` | 0.7 s of moving air, peak in the middle | A fast camera move. Start it 0.42 s before the arrival |
| `riser` | 1.6 s build, ends at its peak | The one build. Start it 1.6 s before the arrival |
| `thump` | A low hit with a knock | The one big moment |
| `shimmer` | 2.2 s of small high notes, growing | Many things appearing |
| `pulse` | A soft mid-range wave | A sweep or a scan going out |
| `logo` | Four rising notes and a held fifth | The end card. Always |

A number after a colon is a scale degree: `bell:5` is the fifth, `bell:8` the
octave. Use degrees 1, 3, 5 and 8 so that sounds heard close together agree.

Generated sounds are only for real things in the world that cannot be
designed: a door, a bell, a machine clunk, a horn. Define them
under `sfx`:

```js
sfx: { bell: ['Brass hand bell, struck once, close, dry, no reverb tail, no music, no voices', 1.5, 0.6] },
```

Prompt rules: one event per clip; name the source, the material and the
action; say "close, dry, no reverb tail"; end with "no music, no voices"; no
brand names and no real announcements. At most three generated sounds in an
episode, each used once. At least two sounds in every episode must belong to
its subject (PRODUCTION.md, section 1b).

Music: omit `music` to get the house bed in your key and tempo, which is what
most episodes should do. To write your own prompt, keep this shape:
"Instrumental only, 104 BPM, in A minor. Start with just [one quiet
instrument] for two bars, then bring in [one or two more]. Sparse, no lead
melody, no vocals, no big drums, dry and close. End on one soft chord that
rings out." Never more than three instruments.

## Build and check

```sh
node tools/sound.mjs <id>          # designs, generates, mixes; prints warnings
node tools/audio-check.mjs <id>    # the sound check
```

`tools/render.sh` runs the check again at the end. **A FAIL means the episode
is not finished.** A WARN must be fixed or explained in your report.

| Check | Wants | If it fails |
|---|---|---|
| Loudness | -14 ± 0.7 LUFS | The tool sets this; a failure means a broken input |
| True peak, and after AAC | -1.0 dBTP, -0.3 dBTP | Lower the loudest cue |
| Loudness range | 4.5 LU or less | Cues too loud against the bed, or a long quiet stretch |
| Deepest dip, quietest moment | -12 dB, above -60 LUFS | The bed is missing somewhere |
| First second | no louder than +3 dB over the middle | Soften the opening cue |
| Last two seconds | -8 dB or higher | Put `logo` on the end card; keep `cta` as the last line |
| Phone speaker loss | 3 LU or less | Too much low end: use `thump`, not a deep generated sound |
| Mono loss | 1.5 LU or less | A stereo generated sound is cancelling |
| Voice above the music | 15 to 26 LU | Change nothing by hand; check the voice file |
| Loudest effect against the voice | +4 LU or less | Lower that cue's gain |
| Effects per second | 0.6 or less | Delete cues |
| Cues inside one second | 3 or fewer | Spread them or delete one |
| Big hits and risers | 3 or fewer | Keep the best one |
| Longest pause | 0.6 s or more | Raise the `gap` before the answer line |
| Speaking pace | 2.8 to 3.6 words per second | Rewrite the script |

## What the check cannot do

It measures. It cannot tell whether a sound fits the moment, whether the music
feels cheap, or whether the voice is tiring. So:

- Never claim that the sound is good. Report the check's result and say that
  nobody has listened.
- When you use a generated sound, say which one in your report, so the owner
  can listen to that moment.
- Keep to designed sounds when in doubt: they are known quantities.
