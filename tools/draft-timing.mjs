// Estimated word timing from the script, with no voice and no API key.
// Usage: node tools/draft-timing.mjs <id> [words per second, default 3.0]
//
// Writes src/<id>/timing.json in the same shape as tools/voice.mjs, so you can
// build and look at the pictures before you spend voice credits. tools/voice.mjs
// overwrites it with the real timing; everything tied to L(), LE() and W() then
// moves with the voice.
import fs from 'node:fs';
import path from 'node:path';

const [, , id, wpsArg] = process.argv;
if (!id) throw new Error('Usage: node tools/draft-timing.mjs <id> [words per second]');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const script = JSON.parse(fs.readFileSync(path.join(root, 'src', id, 'script.json'), 'utf8'));
const wps = Number(wpsArg ?? 3.0);

let t = script.leadIn ?? 0.1;
const lines = script.lines.map((line) => {
  const texts = line.text.split(/\s+/).filter(Boolean);
  const start = t;
  const words = texts.map((text) => {
    // Longer words take a little longer; punctuation adds a small pause.
    const d = (0.55 + 0.45 * Math.min(2, text.length / 5)) / wps;
    const w = { text, start: Number(t.toFixed(3)), end: Number((t + d * 0.92).toFixed(3)) };
    t += d + (/[,.?!]$/.test(text) ? 0.08 : 0);
    return w;
  });
  const end = words.at(-1).end;
  t = end + (line.gap ?? 0.15);
  return { key: line.key, text: line.text, start: Number(start.toFixed(3)), end, words };
});
const total = Number(t.toFixed(3));
fs.writeFileSync(path.join(root, 'src', id, 'timing.json'), JSON.stringify({ total, lines, draft: true }, null, 2));
console.log(`src/${id}/timing.json: ${lines.length} lines, ${total} s (estimated at ${wps} words/s; run tools/voice.mjs for the real timing)`);
