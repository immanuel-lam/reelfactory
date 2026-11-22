// The sound check: measurements that stand in for ears.
// Usage: node tools/audio-check.mjs <id>     (run after tools/sound.mjs)
//
// It cannot say whether the sound is good. It can say that a mix is outside
// the range of the reference videos, or has a defect that listeners named in
// the research (docs/research-sound.md). Every threshold below comes from a
// measurement of real videos or from a named standard; docs/SOUND.md lists
// them. A FAIL must be fixed. A WARN must be looked at and explained in the
// report if it stays.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [, , id] = process.argv;
if (!id) throw new Error('Usage: node tools/audio-check.mjs <id>');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const mix = path.join(root, 'public', id, 'mix.wav');
const stems = path.join(root, 'out', `${id}-stems`);
const timing = JSON.parse(fs.readFileSync(path.join(root, 'src', id, 'timing.json'), 'utf8'));
const script = JSON.parse(fs.readFileSync(path.join(root, 'src', id, 'script.json'), 'utf8'));

const sh = (cmd) => execFileSync('sh', ['-c', cmd], { encoding: 'utf8', maxBuffer: 1 << 28 });
/** Loudness of a file after an optional filter: summary plus the 100 ms series. */
const loud = (file, filter = '') => {
  const log = sh(`ffmpeg -nostats -i "${file}" -af "${filter ? `${filter},` : ''}ebur128=peak=true" -f null - 2>&1`);
  const tail = log.slice(log.lastIndexOf('Summary:'));
  const series = [...log.matchAll(/t:\s*([\d.]+)\s+TARGET.*?M:\s*(-?[\d.]+)\s+S:\s*(-?[\d.]+)/g)].map((m) => ({
    t: Number(m[1]), m: Number(m[2]), s: Number(m[3]),
  }));
  return {
    lufs: Number(/I:\s+(-?[\d.]+) LUFS/.exec(tail)?.[1]),
    lra: Number(/LRA:\s+(-?[\d.]+) LU/.exec(tail)?.[1]),
    peak: Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(tail)?.[1]),
    series,
  };
};
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : NaN;
};
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);

const rows = [];
const add = (level, name, value, want, why) => rows.push({ level, name, value, want, why });
const judge = (ok, warnOnly = false) => (ok ? 'ok' : warnOnly ? 'WARN' : 'FAIL');

if (!fs.existsSync(mix)) throw new Error(`No ${mix}. Run node tools/sound.mjs ${id} first.`);
const total = timing.lines.at(-1).end + 1.25;
const M = loud(mix);

// 1. Level and ceiling.
add(judge(Math.abs(M.lufs + 14) <= 0.7), 'Loudness', `${M.lufs.toFixed(1)} LUFS`, '-14 ± 0.7', 'The level the platforms and the best reels sit at.');
add(judge(M.peak <= -1.0), 'True peak', `${M.peak.toFixed(1)} dBTP`, '-1.0 or lower', 'Encoders add up to 1 dB; higher peaks distort after upload.');
const aac = path.join(stems, 'check.m4a');
fs.mkdirSync(stems, { recursive: true });
sh(`ffmpeg -v error -y -i "${mix}" -c:a aac -b:a 128k "${aac}"`);
const A = loud(aac);
add(judge(A.peak <= -0.3), 'True peak after AAC', `${A.peak.toFixed(1)} dBTP`, '-0.3 or lower', 'What a viewer receives.');

// 2. Is the sound continuous? (The first mix dropped away between phrases.)
const body = M.series.filter((x) => x.t > 2 && x.t < total - 2.5 && x.s > -60);
const sMed = median(body.map((x) => x.s));
const sd = Math.sqrt(mean(body.map((x) => (x.s - sMed) ** 2)));
const dip = Math.min(...body.map((x) => x.s)) - sMed;
add(judge(M.lra <= 4.5, M.lra <= 6), 'Loudness range', `${M.lra.toFixed(1)} LU`, '4.5 or less', 'Reference explainers: 1.6 to 3.3. A wide range on a phone sounds like parts going missing.');
add(judge(sd <= 3.0, true), 'Level steadiness', `${sd.toFixed(1)} dB`, '3.0 or less', 'Spread of the short-term level. References: 1.1 to 2.7.');
add(judge(dip >= -12, dip >= -16), 'Deepest dip', `${dip.toFixed(1)} dB`, '-12 or higher', 'The bed must not vanish in the pauses. References: -4 to -15.');
const floor = Math.min(...M.series.filter((x) => x.t > 0.5 && x.t < total - 0.6).map((x) => x.m));
add(judge(floor > -60), 'Quietest moment', `${floor.toFixed(0)} LUFS`, 'above -60', 'No digital silence between lines: room tone or bed is always there.');

// 3. The start and the end.
const mid = median(M.series.filter((x) => x.t > 5 && x.t < total - 5).map((x) => x.s));
// The meter needs 0.4 s to fill its window, so the first reading that counts is at 0.4 s.
const head = mean(M.series.filter((x) => x.t >= 0.4 && x.t <= 1.3).map((x) => x.m));
const tail = mean(M.series.filter((x) => x.t >= total - 2.2 && x.t <= total - 0.3).map((x) => x.m));
add(judge(head - mid <= 3 && head - mid >= -6, true), 'First second against the middle', `${(head - mid).toFixed(1)} dB`, '-6 to +3', 'The loudest moment must not be the first one.');
add(judge(tail - mid >= -8, tail - mid >= -11), 'Last two seconds against the middle', `${(tail - mid).toFixed(1)} dB`, '-8 or higher', 'The ending holds its level until the last fade. References: 0 to -5.');
const peakAt = body.reduce((a, b) => (b.m > a.m ? b : a), body[0] ?? { t: 0, m: 0 });
add(judge(peakAt.t / total >= 0.15, true), 'Loudest moment', `at ${(100 * peakAt.t / total).toFixed(0)}% of the film`, 'after the first 15%', 'Professional films place the peak late and keep quiet just before it.');

// 4. A phone speaker and a single speaker.
const phone = loud(mix, 'highpass=f=350:p=2,lowpass=f=8000');
add(judge(M.lufs - phone.lufs <= 3), 'Loss on a phone speaker', `${(M.lufs - phone.lufs).toFixed(1)} LU`, '3 or less', 'Phones play little below about 300 Hz.');
const left = loud(mix, 'pan=mono|c0=c0');
const mono = loud(mix, 'pan=mono|c0=0.5*c0+0.5*c1');
add(judge(left.lufs - mono.lufs <= 1.5), 'Loss in mono', `${(left.lufs - mono.lufs).toFixed(1)} LU`, '1.5 or less', 'Out-of-phase sounds cancel on a single speaker.');

// 5. Voice in front of the bed and the effects.
const stem = (n) => path.join(stems, `${n}.wav`);
if (fs.existsSync(stem('voice'))) {
  const V = loud(stem('voice'));
  if (fs.existsSync(stem('bed'))) {
    const B = loud(stem('bed'));
    const d = V.lufs - B.lufs;
    add(judge(d >= 15 && d <= 26, d >= 12 && d <= 30), 'Voice above the music', `${d.toFixed(1)} LU`, '15 to 26', 'Reference median 19. Below 12 the music fights the voice; above 30 nobody hears it.');
  } else {
    add('WARN', 'Music bed', 'none', 'a bed, or a reason', 'Most reference explainers carry a quiet bed.');
  }
  if (fs.existsSync(stem('fx'))) {
    const F = loud(stem('fx'));
    // Loudest effect moment against the voice's own level.
    const fxPeak = Math.max(...F.series.map((x) => x.m));
    add(judge(fxPeak - V.lufs <= 4, fxPeak - V.lufs <= 7), 'Loudest effect against the voice', `${(fxPeak - V.lufs).toFixed(1)} LU`, '+4 or less', 'Effects sit behind the voice. More than 6 dB above it reads as cheap and loud.');
  }
}

// 6. The cue list: fewer sounds, never on top of each other.
const cfgFile = path.join(root, 'src', id, 'sound.mjs');
if (fs.existsSync(cfgFile)) {
  const byKey = Object.fromEntries(timing.lines.map((l) => [l.key, l]));
  const L = (k) => byKey[k].start;
  const LE = (k) => byKey[k].end;
  const W = (k, p) => byKey[k].words.find((x) => x.text.toLowerCase().startsWith(p.toLowerCase())).start;
  const cfg = (await import(`file://${cfgFile}`)).default({ L, LE, W, total });
  const hits = cfg.events.filter(([n]) => n.split(':')[0] !== 'street').map((e) => e[1]).sort((a, b) => a - b);
  const rate = hits.length / total;
  add(judge(rate <= 0.6, rate <= 0.8), 'Effects per second', `${rate.toFixed(2)} (${hits.length} cues)`, '0.6 or less', 'One sound per visual beat. "Every movement has a sound effect" is the named amateur mistake.');
  let worst = 0;
  hits.forEach((t, i) => {
    let n = 1;
    while (hits[i + n] !== undefined && hits[i + n] - t < 1) n++;
    worst = Math.max(worst, n);
  });
  add(judge(worst <= 3), 'Most cues inside one second', String(worst), '3 or fewer', 'More than three onsets a second turn to mush.');
  const big = cfg.events.filter(([n]) => /^(thump|thud|riser|rise)/.test(n)).length;
  add(judge(big <= 3, true), 'Big hits and risers', String(big), '3 or fewer', 'One build and one big hit carry a short film. Four cancel each other.');
  add(judge(Boolean(cfg.key), true), 'Key', cfg.key ?? 'not set', 'set', 'Pitched effects and music share one key, or they clash.');
  const stops = (cfg.musicStops ?? []).length;
  add(judge(stops >= 1, true), 'A beat of quiet before the key line', stops ? `${stops} music stop(s)` : 'none', 'at least one', 'Contrast: five of seven professional films go quiet just before their loudest moment.');
}

// 7. The voice.
const words = timing.lines.flatMap((l) => l.words);
const pace = words.length / (timing.lines.at(-1).end - timing.lines[0].start);
add(judge(pace >= 2.8 && pace <= 3.6, pace >= 2.6 && pace <= 3.8), 'Speaking pace', `${pace.toFixed(2)} words/s`, '2.8 to 3.6', 'Reference narrators: 2.9 to 3.6, median 3.2.');
const gaps = timing.lines.slice(1).map((l, i) => l.start - timing.lines[i].end);
const longest = Math.max(...gaps);
add(judge(longest >= 0.6, true), 'Longest pause between lines', `${longest.toFixed(2)} s`, '0.6 or more, before the reveal', 'A held beat before the answer. Without one, reveals arrive with no weight.');
add(judge((script.tempo ?? 1) <= 1.2), 'Voice tempo change', String(script.tempo ?? 1), '1.2 or less', 'A larger speed-up starts to sound processed.');

// --- print ----------------------------------------------------------------------
const pad = (s, n) => String(s).padEnd(n);
console.log(`\nSound check for ${id}\n`);
for (const r of rows) console.log(`${pad(r.level, 5)} ${pad(r.name, 38)} ${pad(r.value, 24)} want ${r.want}`);
const fails = rows.filter((r) => r.level === 'FAIL');
const warns = rows.filter((r) => r.level === 'WARN');
if (fails.length || warns.length) {
  console.log('');
  for (const r of [...fails, ...warns]) console.log(`${r.level} ${r.name}: ${r.why}`);
}
console.log(`\n${fails.length} FAIL, ${warns.length} WARN, ${rows.length - fails.length - warns.length} ok`);
console.log('This check measures. It does not hear: a person should still listen to each new kind of sound once.');
process.exit(fails.length ? 1 : 0);
