#!/usr/bin/env node
// Fast review frames: one bundle, one browser, stills rendered in parallel.
//
//   node tools/frames.mjs <id> sheets            -> out/<id>-sheet.jpg (one frame every 1.1 s, to the end card)
//                                                   and out/<id>-first3s.jpg (5 frames a second for 3 s)
//   node tools/frames.mjs <id> <name> t1 t2 ...  -> out/<id>-<name>/<frame>.png (half size) and out/<id>-<name>-sheet.jpg
//   node tools/frames.mjs <id> hero f1 f2 ...    -> out/<id>-hero-<n>.png at full size (frame numbers)
//
// The same pictures as before (tools/stills.sh, and the sheets of tools/render.sh draft) in a
// fraction of the time, for the review rounds. The full draft video (tools/render.sh <id> draft)
// is still the last check of motion before the final render.
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [id, mode, ...rest] = process.argv.slice(2);
if (!id || !mode) {
  console.error('usage: node tools/frames.mjs <id> sheets | hero <frames...> | <name> <seconds...>');
  process.exit(1);
}
const FPS = 60;
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), onProgress: () => undefined });
const browser = await openBrowser('chrome', { chromiumOptions: { gl: 'angle' } });
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
const last = composition.durationInFrames - 1;

const jobs = [];
if (mode === 'sheets') {
  const dir = path.join(root, 'out', `${id}-sheetframes`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (let t = 0, i = 0; Math.round(t * FPS) <= last; t += 1.1, i++) jobs.push({ frame: Math.round(t * FPS), out: path.join(dir, `s${String(i).padStart(3, '0')}.png`), scale: 0.2 });
  for (let i = 0; i < 15; i++) jobs.push({ frame: Math.round((i / 5) * FPS), out: path.join(dir, `f${String(i).padStart(3, '0')}.png`), scale: 0.25 });
} else if (mode === 'hero') {
  rest.forEach((f, i) => jobs.push({ frame: Math.min(last, Number(f)), out: path.join(root, 'out', `${id}-hero-${i + 1}.png`), scale: 1 }));
} else {
  const dir = path.join(root, 'out', `${id}-${mode}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const s of rest) {
    const frame = Math.min(last, Math.round(Number(s) * FPS));
    jobs.push({ frame, out: path.join(dir, `${String(frame).padStart(5, '0')}.png`), scale: 0.5 });
  }
}

const workers = Math.max(2, Math.min(6, Math.floor(os.cpus().length / 2)));
let next = 0;
const failed = [];
await Promise.all(
  Array.from({ length: workers }, async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      try {
        await renderStill({ composition, serveUrl, output: j.out, frame: j.frame, scale: j.scale, puppeteerInstance: browser, chromiumOptions: { gl: 'angle' }, overwrite: true });
      } catch (e) {
        failed.push(`${j.frame}: ${String(e.message ?? e).slice(0, 160)}`);
      }
    }
  }),
);
await browser.close({ silent: true });
if (failed.length) console.error(`failed frames:\n${failed.join('\n')}`);

const tile = (pattern, cols, w, out) => {
  const n = fs.readdirSync(path.dirname(pattern)).filter((f) => f.startsWith(path.basename(pattern).split('*')[0])).length;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-pattern_type', 'glob', '-i', pattern, '-vf', `scale=${w}:-1,tile=${cols}x${Math.ceil(n / cols)}`, '-frames:v', '1', out]);
  return out;
};
if (mode === 'sheets') {
  const dir = path.join(root, 'out', `${id}-sheetframes`);
  console.log(tile(path.join(dir, 's*.png'), 10, 216, path.join(root, 'out', `${id}-sheet.jpg`)));
  console.log(tile(path.join(dir, 'f*.png'), 5, 270, path.join(root, 'out', `${id}-first3s.jpg`)));
} else if (mode !== 'hero') {
  const dir = path.join(root, 'out', `${id}-${mode}`);
  console.log(tile(path.join(dir, '*.png'), Math.min(6, jobs.length), 360, path.join(root, 'out', `${id}-${mode}-sheet.jpg`)));
} else jobs.forEach((j) => console.log(j.out));
console.log(`${jobs.length} frames, ${workers} at a time, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
