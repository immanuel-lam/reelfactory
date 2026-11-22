# The quality bar

The standard: these videos have to be elite. Competent is a failure. A viewer
decides in one second, and a video that looks like an agent made it with boxes
is skipped.

This file has two parts: how to build to the bar, and the review that every
episode must pass before it ships. The review is done by a second agent with
fresh eyes, because the agent that built a film cannot see it clearly.

## Part 1: building to the bar

### Macro first (the most important rule here)

A wide tour of a street and a map "looks like a game screenshot". The best
short explainers win with a single huge subject, and never leave their
object: a thumb and a keyboard, a finger and a pane of glass.

So build every episode as a macro film:

1. **One object, huge, for the whole film.** The hero fills 60 to 80% of the
   frame's width in frame 0 and stays the subject to the end. A wheel on a
   rail. A card at a reader. One escalator step. A coffee machine's group head.
2. **The explanation happens on the object.** Cut it open, make a wall
   transparent, pull the parts apart, light up the path of the current, let a
   label point at the part. The camera orbits, pushes in and pulls out around
   the one object. It does not travel to another place.
3. **The world is background.** A street, a kitchen, a workshop or a harbour
   sits behind the object, out of focus and darker, with people and lights for
   life. It is never the subject.
4. **At most four seconds of map or diagram in a row**, and at most eight in
   the film. A map is flat: it is where the first film lost its viewers' eyes
   for long stretches.
5. **Spend the effort where the pixels are.** One object seen from 30 cm
   needs real detail: fifteen parts is the floor, forty is normal. A world
   seen from 50 m needs almost none.

Topics in `niche/TOPICS.md` are chosen because each is one object with a
hidden mechanism inside it.

### The hero object

The object in frame 0 carries the film. Build it like a product shot.

1. **Build the real thing, not a thing like it.** See "Real things look
   real" below: name the exact model, collect reference photos, and match
   them. This comes before every other rule in this list.
2. **At least fifteen parts, in three sizes.** Big forms (the body), medium
   forms (doors, panels, a lid, a handle), small forms (screws, lights, seams,
   vents, labels). Small forms are what make an object look manufactured. A
   hero made of five boxes looks like five boxes.
3. **Rounded edges on everything manufactured.** Use `RoundBox` from
   `kit/stage.tsx`. A hard box edge never catches a highlight.
4. **Three materials at least**, with different roughness: painted metal
   (roughness 0.3, metalness 0.4), glass (dark, roughness 0.1, metalness 0.7,
   often emissive from inside), rubber or plastic (roughness 0.8). Lit things
   are emissive.
5. **Life inside.** A lit interior with people, a screen with content, a
   display with real words. Draw these as canvas textures.
6. **It moves like it has weight.** Things dip when they stop, doors take
   time, nothing starts or stops instantly. Use `EASE.out` into a stop and
   `EASE.in` out of one.

### Real things look real

Your viewers know the things in your niche. A machine, a tool, a vehicle or a
building that is only "roughly shaped like it" tells them in one frame that
nobody looked. The niche's own words for things matter as much
(`niche/PROFILE.md`, "Vocabulary").

This applies to every real-world object that appears in a film: the hero
first, its parts, and any fixed thing that is in focus or recognisable. Only
far, blurred background objects may be simplified, and even those keep the
right colours and silhouette.

1. **Name the exact model.** Not "a drill": "a Makita DHP485". Not "a coffee
   machine": "a La Marzocco Linea Mini".
   Pick the model that really belongs in the film's place and story. Write
   the model in the script's sources and in the fingerprint.
2. **Collect a reference set before you write any 3D code.** At least six
   photos of that model, saved to `out/<id>-refs/` and each opened with the
   Read tool: front three-quarter, side on, rear or the other end, the top if
   the camera will see it, and two close-ups of the part the film lives on.
   Wikimedia Commons is the easiest source: fetch the category page of the
   model, then the file pages. Photos are references only: never put a photo
   in the film.
3. **Write a spec sheet from the photos** to `out/<id>-refs/SPEC.md`, before
   building: real dimensions with a source; the number and spacing of the
   openings, buttons or parts per side; the shape of each face; the equipment
   on top; the colours as hex values sampled from the photos, with where each
   colour starts and stops; the materials (brushed stainless with ribbing is
   not white paint); any display (position, colour, typeface style, real
   wording); and the five details an insider would recognise the model by. If
   you cannot list five such details, you have not looked hard enough.
4. **Build to the spec, in proportion.** Use the real dimensions in metres.
   Get the silhouette right first (render a flat grey still and compare it
   with the side-on photo), then the openings, then the colours, then the
   small parts. A cylinder with bolts is not a mechanism: the real one has
   parts of a particular shape, and that is what the photo shows.
5. **Compare side by side, and say what differs.** Render stills from the
   same angles as your reference photos (`node tools/frames.mjs <id> hero
   <frames...>`, or a small check composition), open each still next to its
   photo, and list every difference you can see in shape, proportion, colour
   and detail. Fix them and repeat until the list has only things too small to
   see in the film. Keep the last pair of stills as `out/<id>-real-1.png`,
   `out/<id>-real-2.png` for the reviewer.
6. **Real context too.** Real names, numbers and colours on signs and labels,
   the right furniture for that kind of place, the right side of the road.
7. **Still our own drawing of it.** Reproduce the shape, the colours and the
   layout. Do not draw other brands' logos, wordmarks or pictograms (leave that
   patch plain). Model names, numbers and place names are fine.
8. **A cutaway keeps the real shell.** When the film opens the object up, the
   outside that remains, and the parts inside, are still the real ones.
   Simplify by removing parts, never by inventing a different part. If a part
   is drawn exaggerated to explain something, say so on screen.

**Kit parts are not exempt.** Before a kit set-piece is a hero or is seen in
focus, pick its real model, do steps 2 to 5 on it, and change the kit part to
match. Record the model in the kit table in `PRODUCTION.md` when you do.

### The frame

1. **The subject is big.** In its hero shot the object fills at least 35% of
   the frame's height. Never hold a wide shot where the subject is smaller
   than 15% of the frame for more than a second.
2. **Three layers of depth**: something near (a pole, a person, a hand, the
   phone), the subject, and a background that falls away into fog and light.
3. **Light with a reason.** One key light that casts shadows (`KeyLight`), a
   warm practical light near the subject (a lamp, a panel, a screen), and
   bloom on what glows (`Bloom`). Every object touches the ground with a
   shadow.
4. **Never mostly dark, never mostly empty.** If more than half the frame is
   one flat dark tone, move the camera closer or light the ground.
5. **Colour is a system.** A dark base, one accent for data and energy (the
   brand accent in `niche/brand.json`), and the episode's own secondary
   colour. No third bright colour. Real things are the colour they really are.
6. **The upper two thirds are the stage.** The lower third may hold the phone.
   Captions sit at the top.

### The world

1. **People.** A place with no people looks like a diagram. Use `Folk` from
   `kit/folk.tsx`: waiting, walking past, working, using the object.
2. **Specific, not generic.** Use the niche's own words (`niche/PROFILE.md`,
   "Vocabulary"), real names on signs and labels, and real objects ("Real
   things look real", above). One detail an insider will recognise per scene.
3. **Something always moves in the background**: a car passing, a light
   changing, a second person, steam, leaves in light.
4. **Real places are built from real geodata.** When a film is set in a real
   place, its 3D environment comes from real 3D geospatial data, not from
   invented boxes. Every building stands on its mapped footprint at its mapped
   height, and streets, tracks, trees and landmarks are where the data puts
   them. Build it with `tools/geodata.mjs` (OpenStreetMap footprints, heights,
   storey counts, building parts and roof shapes, streets, tracks, trees and
   lamps, in the film's metres) and `kit/geoworld.tsx`. Where a better
   official source is reachable (a national or city digital twin, a city's
   open 3D data), prefer it and say so. Rules:
   - Do not add, move or resize a building by hand. Choose a camera position
     and a stretch of street that work with the real geometry. Move the
     action along the real street rather than move the street.
   - Keep the share of buildings with a real height (a `height` tag or a
     storey count) at 80% or more of those in shot. Report the counts that
     the tool prints (measured height, storey count, default).
   - Materials follow the data and the photos: stone only where a tag or a
     reference photo says so (`stoneLandmarks` in `niche/brand.json`).
   - Things the data does not hold (light poles, bins, the pattern of the
     paving) may follow the reference photos. Say which ones in the report.
   - Credit the data: "© OpenStreetMap contributors" in the end-card credit
     and in captions.md.
   - A straightened frame (`--straighten`) is allowed when the film's track
     or road must be straight. It bends the real street by a degree or two:
     say so.

### Motion

1. **One continuous camera move**, with a different journey in every episode.
2. **Every move has a start, a travel and a settle.** No linear moves except
   slow drifts.
3. **The picture changes on the word.** Check it against `timing.json`.
4. **Calm.** No flashes, no shake, no strobing.

## Part 2: the review (every episode, before the final render)

After your own checks pass (`PRODUCTION.md` step 6), start **one** reviewer:
the `reviewer` agent (`.claude/agents/reviewer.md`) with the Agent tool. It
must be a fresh agent: give it only what is listed here, never your own
opinion of the film.

Give the reviewer the paths of:

- The script (`src/<id>/script.json`).
- `out/<id>-sheet.jpg` and `out/<id>-first3s.jpg` (`node tools/frames.mjs <id> sheets`).
- Eight to twelve half-size stills at the scene changes, as separate files
  (`node tools/frames.mjs <id> review <seconds...>`): a sheet hides detail.
- Three full-size stills of the hero object at its best moments
  (`node tools/frames.mjs <id> hero <frames...>`): small stills hide the
  detail you built.
- The real-object pairs: every photo in `out/<id>-refs/` together with
  `out/<id>-refs/SPEC.md` and your matching stills `out/<id>-real-*.png`.
  Tell the reviewer which model the object is meant to be. Say nothing else
  about it.
- For a real place: the geodata summary (the source, the bounding box and the
  height counts that `tools/geodata.mjs` printed). Say nothing else about it.
- The settled list, from `out/<id>-loop.md`: the facts and written rules that
  limit what the film may show (for example "the rail ahead of the vehicle is
  dead, so it never glows"), and the changes declined in earlier rounds with
  the rule for each. It stops a fresh reviewer from asking for them again.
  It is not your opinion of the film: no praise, no defence of choices.
- The reference frames: the sheets listed in `niche/references.md` (the
  research runs keep it current with the best winners' `-first3s.jpg` and
  `-sheet.jpg` in `research/refs/`), and the newest earlier episodes'
  `-first3s.jpg` and `-sheet.jpg` in `exports/`.

The reviewer agent already holds the instruction and the scoring sheet below.
They are repeated here so that you know what it judges:

```
You are a senior motion designer reviewing a short vertical explainer
before it is published. Be hard to please: the standard is the best short
explainers on the internet, and competent is a fail. Open every image you are
given with the Read tool. Compare the film with the reference frames. For
the "Real" line, put each photo of the real object beside the matching still
and name every difference in shape, proportion, colour and detail; a person
who uses that object every day must recognise the model at a glance. Score
each line of the sheet from 1 to 10 and justify each score in one sentence
that names what you see and at what time. A 10 means you would not change it;
8 means good with one small flaw; 6 means it works but looks amateur; 4 means
it is confusing or ugly. Do not be polite and do not round up. Then list the
five changes that would raise the film most, most important first, each one
specific enough to act on (what, where, at what time). Finally say in one line
whether a stranger scrolling past would stop on frame 0, and why.
```

The scoring sheet:

| # | Line | What a 9 looks like |
|---|---|---|
| 1 | Frame 0 | One striking object, large, lit, already moving; the first caption word; you know what the film is about |
| 2 | The first three seconds | Something changes on each phrase; the clash is visible, not only spoken |
| 3 | Hero object | Looks manufactured and specific: many parts, rounded edges, materials, life inside |
| 4 | Clarity | Each picture shows what the words say at that moment; a viewer with the sound off follows the mechanism |
| 5 | Composition | The subject is large in every frame; no frame is mostly empty or mostly dark |
| 6 | Light and depth | Shadows ground things; glow where light is; near, middle and far |
| 7 | World | People, insider details, background life; a real place is built from real geodata; nothing looks like a diagram unless it is one |
| 8 | Colour and type | One accent, one secondary; captions always readable; nothing clipped or overlapping |
| 9 | Variety | The film visits clearly different pictures; no two long stretches look the same |
| 10 | Unique | Could not be mistaken for an earlier episode: new object, new world, new first frame |
| 11 | Ending | The reframe has a picture of its own; the end card is clean |
| 12 | Real | Every object is recognisably the named real model: silhouette, openings, colours and small parts match the reference photos; an insider would name it without being told |

**About the scores.** Reviewers are strict and they differ: the same film can
get 50 from one and 56 from another. Treat a score as a pointer to a problem,
not as a measurement. What matters is the list of changes: do them.

**The gate.** Every line must score 8 or more. If any line is under 8, fix the
reviewer's changes and run a new review with a new reviewer (never the same
one: it has seen the old version). There is no round limit: keep fixing and
reviewing until the gate passes. An episode that has not passed the gate is
never shipped or marked `done`.

**Your own weakness list is part of the gate.** Before each review, write down
everything you yourself think is weaker than the best earlier episode or than
the bar on this page (a likeness, the people, a dark frame, a shot that does
not read). Fix that list too. The gate passes only when every line is 8 or
more **and** your list is empty. A weakness you would put in the report is a
weakness you fix now.

**When a line will not move.** If a line has the same score or lower for two
rounds in a row, small tweaks are not working: rebuild that part from scratch
with a different method (for an object: trace the side and front profiles
from the reference photos into new geometry; for frame 0: a new shot, not an
adjusted one). Say in the loop file what you changed in method.

**Changes you may decline.** Decline a reviewer change only when it breaks a
rule in this file, in `PRODUCTION.md` or in the facts rules (for example a cut
where the format forbids cuts, a brand logo, or a picture that shows something
false). Write the rule you rely on in the loop file, then raise the score on
that line another way. A declined change never excuses a line under 8.

**The loop file.** Keep `out/<id>-loop.md` up to date after every round: the
round number, each line's score, the reviewer's changes, what you did about
each, what you declined and why, and your own weakness list. A run that ends
before the gate passes (out of time, out of context, a hard blocker) leaves
this file so the next run continues from it.

Record the final scores in `niche/LOG.md` (the Quality table).

What the review cannot do: it sees still frames, not motion, and it cannot
hear. So the motion rules above and the sound check still apply.
