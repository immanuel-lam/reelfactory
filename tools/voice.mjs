// Voiceover for an explainer: one ElevenLabs clip per line, with word timing.
// Usage: node tools/voice.mjs <id>
//
// Reads src/<id>/script.json. Writes public/<id>/vo.wav (the whole narration
// on one timeline) and src/<id>/timing.json (every word with start/end in
// seconds on that timeline). Raw responses are cached in cache/ by a hash of
// text + voice + model + settings, so re-runs cost no credits.
//
// The API key comes from tools/secrets.mjs (environment, .env or the macOS
// Keychain). It is never written.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { elevenKey } from './secrets.mjs';

const [, , id] = process.argv;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const script = JSON.parse(fs.readFileSync(path.join(root, 'src', id, 'script.json'), 'utf8'));
const cacheDir = path.join(root, 'cache');
const outDir = path.join(root, 'public', id);
fs.mkdirSync(cacheDir, { recursive: true });
fs.mkdirSync(path.join(outDir, 'vo'), { recursive: true });

const readKey = elevenKey;

const V = script.voice;
// v4 ignores the speed setting, so the pace is set here: a small pitch-preserving
// tempo change after generation (1.15 = 15% faster). Word times are scaled to match.
const TEMPO = script.tempo ?? 1;

const fetchLine = async (text, prev, next) => {
  const hash = crypto
    .createHash('sha1')
    .update(JSON.stringify({ text, v: V.voiceId, m: V.modelId, s: V.settings }))
    .digest('hex')
    .slice(0, 16);
  const file = path.join(cacheDir, `${hash}.json`);
  if (!fs.existsSync(file)) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${V.voiceId}/with-timestamps?output_format=mp3_44100_192`,
      {
        method: 'POST',
        headers: { 'xi-api-key': readKey(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: V.modelId,
          voice_settings: V.settings,
          previous_text: prev,
          next_text: next,
        }),
      },
    );
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 400)}`);
    fs.writeFileSync(file, JSON.stringify(await res.json()));
    console.log(`generated ${hash}: ${text}`);
  }
  return { hash, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
};

// Characters -> words. A word is a run of non-space characters.
const wordsOf = (alignment) => {
  const { characters, character_start_times_seconds: st, character_end_times_seconds: en } = alignment;
  const words = [];
  let cur = null;
  characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { text: '', start: st[i], end: en[i] };
    cur.text += ch;
    cur.end = en[i];
  });
  if (cur) words.push(cur);
  return words;
};

const lines = [];
let t = script.leadIn ?? 0.3;
const inputs = [];
for (const [i, line] of script.lines.entries()) {
  const prev = script.lines[i - 1]?.text;
  const next = script.lines[i + 1]?.text;
  const r = await fetchLine(line.text, prev, next);
  const alignment = r.alignment ?? r.normalized_alignment;
  if (!alignment) throw new Error(`No alignment for line ${line.key}`);
  const words = wordsOf(alignment);
  const first = words[0].start;
  const last = words[words.length - 1].end;
  const pad = 0.03;
  const from = Math.max(0, first - pad);
  // A little air after the last word, faded, so a line never ends on a hard cut.
  const to = last + 0.16;
  const mp3 = path.join(cacheDir, `${r.hash}.mp3`);
  fs.writeFileSync(mp3, Buffer.from(r.audio_base64, 'base64'));
  const wav = path.join(outDir, 'vo', `${String(i).padStart(2, '0')}-${line.key}.wav`);
  // Level each line with one measured, fixed gain. (A single-pass loudnorm
  // works in its dynamic mode on clips this short and left lines up to 8 dB
  // apart, which the sound check reads as a wide loudness range.)
  const raw = wav.replace(/\.wav$/, '.raw.wav');
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-i', mp3, '-ss', String(from), '-to', String(to),
    '-af', `afade=t=in:d=0.012,areverse,afade=t=in:d=0.07,areverse,atempo=${TEMPO}`, '-ar', '48000', '-ac', '1', raw,
  ]);
  const meter = execFileSync('sh', ['-c', `ffmpeg -nostats -i "${raw}" -af ebur128 -f null - 2>&1`], { encoding: 'utf8' });
  const lufs = Number(/I:\s+(-?[\d.]+) LUFS/.exec(meter.slice(meter.lastIndexOf('Summary:')))?.[1]);
  const gain = Number.isFinite(lufs) ? Math.max(-20, Math.min(20, -15 - lufs)) : 0;
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-i', raw, '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=0.84:level=false`, '-ar', '48000', '-ac', '1', wav,
  ]);
  fs.rmSync(raw);
  const dur = (to - from) / TEMPO;
  const at = (x) => t + (x - from) / TEMPO;
  lines.push({
    key: line.key,
    text: line.text,
    start: Number(t.toFixed(3)),
    end: Number((t + dur).toFixed(3)),
    words: words.map((w) => ({
      text: w.text,
      start: Number(at(w.start).toFixed(3)),
      end: Number(at(w.end).toFixed(3)),
    })),
  });
  inputs.push({ wav, at: t });
  t += dur + (line.gap ?? 0.15);
}

// One narration track on the shared timeline.
const args = ['-v', 'error', '-y'];
inputs.forEach((x) => args.push('-i', x.wav));
const delays = inputs.map((x, i) => `[${i}:a]adelay=${Math.round(x.at * 1000)}:all=1[a${i}]`).join(';');
const mix = `${inputs.map((_, i) => `[a${i}]`).join('')}amix=inputs=${inputs.length}:normalize=0:dropout_transition=0[out]`;
args.push('-filter_complex', `${delays};${mix}`, '-map', '[out]', '-ar', '48000', '-ac', '1', path.join(outDir, 'vo.wav'));
execFileSync('ffmpeg', args);

const total = Number(t.toFixed(3));
fs.writeFileSync(path.join(root, 'src', id, 'timing.json'), JSON.stringify({ total, lines }, null, 2));
const nWords = lines.reduce((n, l) => n + l.words.length, 0);
console.log(lines.map((l) => `${l.start.toFixed(2)}-${l.end.toFixed(2)}  ${l.text}`).join('\n'));
console.log(`total ${total}s, ${nWords} words, ${(nWords / (lines.at(-1).end - lines[0].start)).toFixed(2)} words/s`);
