// Sound for an explainer: designed effects, a few generated real-world
// sounds, a music bed, and a mix that is set by measurement.
// Usage: node tools/sound.mjs <id>
//
// The rules behind every choice here are in docs/SOUND.md. In short: few sounds, one family in one key, the
// voice always in front, the bed always present, and a master that survives a
// phone speaker and the platforms' encoders.
//
// Reads src/<id>/sound.mjs, which exports a function
//   ({ L, LE, W, total }) => ({ key, bpm, events, music?, sfx?, musicStops? })
// - key: the episode's key, for example "D minor". Every pitched effect and
//   the music use it.
// - bpm: the music's tempo.
// - events: [name, time in seconds, gain in dB]. Designed names: tick, pop,
//   blip, bell, confirm, chime, whoosh, whooshDown, riser, thump, shimmer,
//   pulse, logo. A pitched name may carry a scale degree: "bell:5". Any other
//   name must be defined in `sfx`.
// - sfx: generated real-world sounds: { name: [prompt, seconds, influence?] }.
// - music: a prompt for the bed. Omit it to use the house bed in this key.
// - musicStops: [[from, to], ...] seconds where the bed drops out (a beat of
//   quiet before the key line).
//
// Writes public/<id>/mix.wav and the stems in out/<id>-stems/ (voice.wav,
// fx.wav, bed.wav), which tools/audio-check.mjs reads. Generated clips are
// cached in cache/ by a hash of their prompt, so a re-run costs no credits.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { elevenKey } from './secrets.mjs';
import { ALIASES, DESIGNED, makeKey, roomTone, writeWav } from './synth.mjs';

const [, , id] = process.argv;
if (!id) throw new Error('Usage: node tools/sound.mjs <id>');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const cacheDir = path.join(root, 'cache');
const outDir = path.join(root, 'public', id);
const stemDir = path.join(root, 'out', `${id}-stems`);
fs.mkdirSync(cacheDir, { recursive: true });
fs.rmSync(stemDir, { recursive: true, force: true });
fs.mkdirSync(stemDir, { recursive: true });

const timing = JSON.parse(fs.readFileSync(path.join(root, 'src', id, 'timing.json'), 'utf8'));
const byKey = Object.fromEntries(timing.lines.map((l) => [l.key, l]));
const line = (k) => {
  if (!byKey[k]) throw new Error(`No line "${k}" in timing.json`);
  return byKey[k];
};
const L = (k) => line(k).start;
const LE = (k) => line(k).end;
const W = (k, prefix) => {
  const w = line(k).words.find((x) => x.text.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!w) throw new Error(`No word "${prefix}" in line ${k}`);
  return w.start;
};
const total = timing.lines.at(-1).end + 1.25;

const ff = (args, opts = {}) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], opts);
/** Integrated loudness (LUFS) and true peak (dBTP) of a file. */
const measure = (file, filter = '') => {
  const log = execFileSync('sh', ['-c', `ffmpeg -nostats -i "${file}" -af "${filter ? `${filter},` : ''}ebur128=peak=true" -f null - 2>&1`], {
    encoding: 'utf8', maxBuffer: 1 << 28,
  });
  const tail = log.slice(log.lastIndexOf('Summary:'));
  return { lufs: Number(/I:\s+(-?[\d.]+) LUFS/.exec(tail)?.[1]), peak: Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(tail)?.[1]) };
};

// --- generated sounds (ElevenLabs), only for things that exist in the world --
const apiKey = elevenKey;
const post = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'xi-api-key': apiKey(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
};
const cached = async (kind, body, url, fallbackBody) => {
  const hash = crypto.createHash('sha1').update(JSON.stringify({ kind, body })).digest('hex').slice(0, 16);
  const file = path.join(cacheDir, `${kind}-${hash}.mp3`);
  if (!fs.existsSync(file)) {
    let data;
    try {
      data = await post(url, body);
    } catch (e) {
      if (!fallbackBody) throw e;
      console.log(`${kind}: ${e.message.slice(0, 100)}; retrying with the older request`);
      data = await post(url, fallbackBody);
    }
    fs.writeFileSync(file, data);
    console.log(`generated ${kind} ${hash}: ${(body.text ?? body.prompt).slice(0, 70)}`);
  }
  return file;
};
// Shared real-world sounds. Episodes define their own under `sfx` in
// src/<id>/sound.mjs. One event per clip, the material and the action named,
// dry, with no music or voices (docs/SOUND.md, "Generated sounds").
const GENERATED = {
  street: ['Quiet city street at night, steady distant traffic hum, soft and even, no horns, no voices, no music', 10, 0.5],
};
const generate = async (name, [text, seconds, influence = 0.6]) => {
  const base = { text, duration_seconds: seconds, prompt_influence: influence };
  const mp3 = await cached('sfx', { ...base, model_id: 'eleven_text_to_sound_v3' },
    'https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192', base);
  // Generated clips differ by up to 40 dB, often start with silence and can be
  // out of phase between left and right. Fold to mono, trim, and bring every
  // one to the same peak, so a gain in the cue list means the same for all.
  const wav = mp3.replace(/\.mp3$/, '.mono.wav');
  if (!fs.existsSync(wav)) {
    const log = execFileSync('sh', ['-c', `ffmpeg -i "${mp3}" -af "pan=mono|c0=0.5*c0+0.5*c1,volumedetect" -f null - 2>&1 | grep max_volume`], { encoding: 'utf8' });
    const gain = Math.min(45, -3 - Number(/max_volume: (-?[\d.]+)/.exec(log)[1]));
    ff(['-i', mp3, '-af', `pan=mono|c0=0.5*c0+0.5*c1,volume=${gain.toFixed(1)}dB,silenceremove=start_periods=1:start_threshold=-36dB:start_silence=0.01,afade=t=in:d=0.004`, '-ar', '48000', wav]);
  }
  return wav;
};

// --- the episode's cue list ---------------------------------------------------
const config = (await import(pathToFileURL(path.join(root, 'src', id, 'sound.mjs')).href)).default({ L, LE, W, total });
const key = makeKey(config.key ?? 'D minor');
const bpm = config.bpm ?? 96;
const generated = { ...GENERATED, ...(config.sfx ?? {}) };
// Cue lists written for the first sound tool keep working: its house effects
// map onto designed ones.
const legacy = { chime: 'chime', whoosh: 'whoosh', rise: 'riser', fall: 'whooshDown', blip: 'blip', pop: 'pop', tick: 'tick', thud: 'thump', shimmer: 'shimmer', pulse: 'pulse', confirm: 'confirm', logo: 'logo' };

const files = {};
for (const full of new Set(config.events.map((e) => e[0]))) {
  const [rawName, degree] = full.split(':');
  const name = ALIASES[rawName] ?? rawName;
  if (generated[name] && !config.designed?.includes(name)) {
    files[full] = await generate(name, generated[name]);
  } else if (DESIGNED[legacy[name] ?? name]) {
    const x = DESIGNED[legacy[name] ?? name](key, degree ? Number(degree) : undefined);
    files[full] = writeWav(path.join(stemDir, `cue-${full.replace(':', '-')}.wav`), x);
  } else {
    throw new Error(`Unknown sound "${full}". Use a designed name or define it under sfx in src/${id}/sound.mjs.`);
  }
}

// --- density: fewer sounds, better chosen ------------------------------------
const AMBIENT = new Set(['street']);
const hits = config.events.filter(([n]) => !AMBIENT.has(n.split(':')[0])).map((e) => e[1]).sort((a, b) => a - b);
const perSecond = hits.length / total;
let worst = 0;
hits.forEach((t, i) => {
  let n = 1;
  while (hits[i + n] !== undefined && hits[i + n] - t < 1) n++;
  worst = Math.max(worst, n);
});
const warnings = [];
if (perSecond > 0.6) warnings.push(`${hits.length} cues in ${total.toFixed(0)} s (${perSecond.toFixed(2)} per second). Aim for 0.5 or fewer: one sound per visual beat. Delete the weakest.`);
if (worst > 3) warnings.push(`${worst} cues start inside one second somewhere. Keep it to 3.`);

// --- voice --------------------------------------------------------------------
// Gentle clean-up and control. The limiter's level=0 matters: by default
// ffmpeg's limiter scales the result back up to full scale.
const voice = path.join(stemDir, 'voice.wav');
ff(['-i', path.join(outDir, 'vo.wav'), '-af',
  'highpass=f=85,deesser=i=0.3:m=0.5:f=0.5,equalizer=f=250:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=0.9:g=1.5,' +
  'acompressor=threshold=0.14:ratio=2:attack=8:release=90:makeup=1.5:knee=4,alimiter=limit=0.8:level=0,apad=whole_dur=' + total.toFixed(2),
  '-ar', '48000', '-ac', '1', voice]);
const Lv = measure(voice).lufs;

// Room tone under everything, so gaps between lines are never digital silence.
const tone = writeWav(path.join(stemDir, 'tone.wav'), roomTone(total));

// --- effects bus ----------------------------------------------------------------
const events = config.events;
const fxArgs = [];
events.forEach(([name]) => fxArgs.push('-i', files[name]));
const fxParts = events.map(([name, t, db], i) => {
  const low = /^(thump|thud)/.test(name);
  // Effects stay out of the deep bass (a phone cannot play it, and it eats
  // headroom) and out of the top end, where they would sound harsh.
  const band = low ? 'highpass=f=45,lowpass=f=6000' : 'highpass=f=140,lowpass=f=10000';
  return `[${i}:a]aresample=48000,aformat=channel_layouts=mono,${band},volume=${db}dB,adelay=${Math.max(0, Math.round(t * 1000))}:all=1[e${i}]`;
});
const fx = path.join(stemDir, 'fx.wav');
ff([...fxArgs, '-filter_complex',
  `${fxParts.join(';')};${events.map((_, i) => `[e${i}]`).join('')}amix=inputs=${events.length}:normalize=0:dropout_transition=0,apad=whole_dur=${total.toFixed(2)},atrim=0:${total.toFixed(2)}[out]`,
  '-map', '[out]', '-ar', '48000', '-ac', '1', fx]);

// --- music bed ------------------------------------------------------------------
// Sparse, in the episode's key, no lead in the voice's range. The level is set
// by measurement: 18 LU under the voice, then a light duck while the voice speaks.
const HOUSE_BED = `Instrumental only, ${bpm} BPM, in ${key.name}. Start with just a soft muted pluck pulse for two bars, then bring in a warm pad and a light marimba pattern. Sparse and curious, no lead melody, no vocals, no big drums, dry and close. Gentle lift in the last third, end on one soft chord that rings out.`;
let bed = null;
const prompt = config.music === false ? null : config.music ?? HOUSE_BED;
if (prompt) {
  try {
    const src = await cached('music', { prompt, music_length_ms: Math.max(60000, Math.ceil(total + 15) * 1000), force_instrumental: true },
      'https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', { prompt, music_length_ms: Math.max(60000, Math.ceil(total + 15) * 1000) });
    const eq = 'highpass=f=110,equalizer=f=2500:t=q:w=0.8:g=-3';
    const Lb = measure(src, `atrim=0:${total.toFixed(2)},${eq}`).lufs;
    const gain = Lv - 18 - Lb;
    // A stop is a short dip to near silence with 60 ms ramps, so it never clicks.
    const stops = (config.musicStops ?? [])
      .map(([a, b]) => `(1-0.94*(clip((t-${(a - 0.06).toFixed(3)})/0.06\\,0\\,1)-clip((t-${b.toFixed(3)})/0.06\\,0\\,1)))`)
      .join('*');
    // The music comes forward under the end card, where no voice needs the room,
    // so the film ends at full level, not on a long fade.
    const liftAt = timing.lines.at(-1).start;
    const lift = `(1+${(Math.pow(10, (config.endLift ?? 11) / 20) - 1).toFixed(3)}*clip((t-${liftAt.toFixed(3)})/1.2\\,0\\,1))`;
    bed = path.join(stemDir, 'bed.wav');
    ff(['-i', src, '-i', voice, '-filter_complex',
      `[0:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${total.toFixed(2)},${eq},volume=${gain.toFixed(2)}dB` +
      `${stops ? `,volume=eval=frame:volume='${stops}'` : ''},afade=t=in:d=0.25[b0];` +
      `[b0][1:a]sidechaincompress=threshold=0.05:ratio=2:attack=20:release=350,volume=eval=frame:volume='${lift}',afade=t=out:st=${(total - 0.45).toFixed(2)}:d=0.45[out]`,
      '-map', '[out]', '-ar', '48000', bed]);
  } catch (e) {
    warnings.push(`No music bed (${e.message.slice(0, 120)}).`);
  }
}

// --- sum and master ---------------------------------------------------------------
// The level is set with one fixed gain, so the balance between voice, effects
// and bed stays exactly as mixed. Then a limiter with a ceiling that still
// holds after AAC or Opus encoding.
const sum = path.join(stemDir, 'sum.wav');
const inputs = ['-i', voice, '-i', fx, '-i', tone];
if (bed) inputs.push('-i', bed);
ff([...inputs, '-filter_complex',
  `[0:a]aformat=channel_layouts=stereo[v];[1:a]aformat=channel_layouts=stereo[f];[2:a]aformat=channel_layouts=stereo,volume=-52dB[t];` +
  `${bed ? '[v][f][t][3:a]amix=inputs=4' : '[v][f][t]amix=inputs=3'}:normalize=0:dropout_transition=0,atrim=0:${total.toFixed(2)}[out]`,
  '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_f32le', sum]);
const before = measure(sum).lufs;
const mix = path.join(outDir, 'mix.wav');
ff(['-i', sum, '-af',
  `volume=${(-14 - before).toFixed(2)}dB,alimiter=limit=0.84:attack=3:release=40:level=0,afade=t=in:d=0.02,afade=t=out:st=${(total - 0.2).toFixed(2)}:d=0.2`,
  '-ar', '48000', mix]);
const done = measure(mix);

console.log(`mix.wav ${total.toFixed(2)} s | key ${key.name}, ${bpm} BPM | ${hits.length} cues (${perSecond.toFixed(2)} per second)${bed ? ' + bed' : ', no bed'}`);
console.log(`voice ${Lv.toFixed(1)} LUFS | master ${done.lufs.toFixed(1)} LUFS, true peak ${done.peak.toFixed(1)} dBTP`);
warnings.forEach((w) => console.log(`WARNING: ${w}`));
console.log(`Now run: node tools/audio-check.mjs ${id}`);
