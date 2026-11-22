import { Easing } from 'remotion';

// Shared time helpers. Every explainer is timed in SECONDS on its narration
// timeline (src/<id>/timing.json, written by tools/voice.mjs), so the picture
// follows the voice at any frame rate and moves with it when the voice is
// re-recorded.

export const FPS = 60;

export type Word = { text: string; start: number; end: number };
export type Line = { key: string; text: string; start: number; end: number; words: Word[] };
export type Timing = { total: number; lines: Line[] };

export const makeTimeline = (timing: Timing, opts: { tail?: number } = {}) => {
  const lines = timing.lines;
  const byKey = Object.fromEntries(lines.map((l) => [l.key, l]));
  const line = (key: string) => {
    const l = byKey[key];
    if (!l) throw new Error(`No line "${key}" in timing.json`);
    return l;
  };
  /** Start time of a line. */
  const L = (key: string) => line(key).start;
  /** End time of a line. */
  const LE = (key: string) => line(key).end;
  /** Start time of the first word in a line that starts with `prefix`. */
  const W = (key: string, prefix: string) => {
    const w = line(key).words.find((x) => x.text.toLowerCase().startsWith(prefix.toLowerCase()));
    if (!w) throw new Error(`No word "${prefix}" in line ${key}`);
    return w.start;
  };
  const last = lines[lines.length - 1];
  // Hold on the end card for `tail` seconds after the last word.
  const durationS = last.end + (opts.tail ?? 1.25);
  return { lines, L, LE, W, durationS, duration: Math.round(durationS * FPS) };
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.45, 0, 0.25, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  linear: (x: number) => x,
};
/** Eased 0..1 progress of time `t` between `a` and `b`. */
export const prog = (t: number, a: number, b: number, ease: (x: number) => number = EASE.inOut) =>
  ease(clamp01((t - a) / (b - a)));
/** A pop: 0 -> 1 with one small overshoot. */
export const pop = (t: number, at: number, dur = 0.5) => {
  const x = clamp01((t - at) / dur);
  if (x <= 0) return 0;
  return 1 - Math.exp(-6.5 * x) * Math.cos(9 * x) * (1 - x);
};
/** A decaying kick: 1 at `at`, fading out. Use for flashes and pulses. */
export const kick = (t: number, at: number, rate = 4) => (t >= at ? Math.exp(-(t - at) * rate) : 0);

export type V3 = [number, number, number];
export const v3lerp = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const bezier3 = (a: V3, c: V3, b: V3, u: number): V3 => {
  const k = 1 - u;
  return [0, 1, 2].map((i) => k * k * a[i] + 2 * k * u * c[i] + u * u * b[i]) as V3;
};

/** Piecewise value over time: [[t, value, easeIntoThisKey?], ...]. */
export const track = (keys: [number, number, ((x: number) => number)?][]) => (t: number) => {
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, va] = keys[i];
    const [tb, vb, ease] = keys[i + 1];
    if (t <= tb) return lerp(va, vb, (ease ?? EASE.linear)(clamp01((t - ta) / (tb - ta))));
  }
  return keys[keys.length - 1][1];
};
