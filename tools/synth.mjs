// Designed sounds, made from maths. No samples, no generation, no ears needed:
// the parameters ARE the description of each sound, the result is identical
// on every run, and every pitched sound is tuned to the episode's key, so the
// set sounds like one family and never clashes with the music.
//
// All sounds are mono (safe on a phone's single speaker) at 48 kHz, and each
// is returned as a Float32Array with its transient at sample 0.
import fs from 'node:fs';

export const SR = 48000;

// --- small helpers ----------------------------------------------------------
const rng = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const buf = (seconds) => new Float32Array(Math.ceil(seconds * SR));
const TAU = Math.PI * 2;
const normalise = (x, peakDb = -3) => {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  const g = m > 0 ? Math.pow(10, peakDb / 20) / m : 1;
  for (let i = 0; i < x.length; i++) x[i] *= g;
  // A few milliseconds of fade at the end, so nothing ever clicks.
  const n = Math.min(x.length, Math.round(0.006 * SR));
  for (let i = 0; i < n; i++) x[x.length - 1 - i] *= i / n;
  return x;
};
const mixInto = (dst, src, at = 0, gain = 1) => {
  const o = Math.round(at * SR);
  for (let i = 0; i < src.length && o + i < dst.length; i++) dst[o + i] += src[i] * gain;
  return dst;
};
/** Chamberlin state-variable band-pass with a moving centre frequency. */
const sweptBandpass = (x, f0, f1, q = 1.4) => {
  const y = new Float32Array(x.length);
  let low = 0;
  let band = 0;
  for (let i = 0; i < x.length; i++) {
    const u = i / x.length;
    const fc = f0 * Math.pow(f1 / f0, u);
    const f = 2 * Math.sin((Math.PI * fc) / SR);
    low += f * band;
    const high = x[i] - low - band / q;
    band += f * high;
    y[i] = band;
  }
  return y;
};
const onePoleLow = (x, fc) => {
  const a = Math.exp((-TAU * fc) / SR);
  let s = 0;
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    s = (1 - a) * x[i] + a * s;
    y[i] = s;
  }
  return y;
};

// --- key and notes ----------------------------------------------------------
const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
const SCALES = { minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11] };

/** "D minor" -> a function from scale degree (1 = root, 8 = octave) to Hz. */
export const makeKey = (name = 'D minor') => {
  const [root, mode = 'minor'] = name.trim().split(/\s+/);
  if (!(root in NOTE) || !(mode in SCALES)) throw new Error(`Unknown key "${name}". Use for example "D minor" or "G major".`);
  const scale = SCALES[mode];
  // Root in octave 4 (C4 = MIDI 60).
  const rootMidi = 60 + NOTE[root];
  const hz = (degree, octave = 0) => {
    const d = degree - 1;
    const midi = rootMidi + scale[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7) + 12 * octave;
    return 440 * Math.pow(2, (midi - 69) / 12);
  };
  return { name: `${root} ${mode}`, hz };
};

// --- the sounds -------------------------------------------------------------
/** A tiny dry click: text landing, a small UI event. About 30 ms. */
export const tick = () => {
  const x = buf(0.035);
  const r = rng(7);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] = (r() * 2 - 1) * Math.exp(-t * 900) * 0.6 + Math.sin(TAU * 1900 * t) * Math.exp(-t * 260) * 0.7;
  }
  return normalise(x);
};

/** A soft pop: something appears. Pitch falls two octaves in 40 ms. */
export const pop = (f = 300) => {
  const x = buf(0.13);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const fr = f * 2 * Math.pow(0.25, Math.min(1, t / 0.04));
    ph += (TAU * fr) / SR;
    x[i] = Math.sin(ph) * Math.exp(-t * 34) * Math.min(1, t / 0.002);
  }
  return normalise(x);
};

/** A short pitched blip: a report, a ping, a count. */
export const blip = (f = 880) => {
  const x = buf(0.2);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] = (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * 2 * f * t)) * Math.exp(-t * 24) * Math.min(1, t / 0.006);
  }
  return normalise(x);
};

/** A warm FM bell with a tail: a state change, an arrival. */
export const bell = (f = 587, seconds = 1.3) => {
  const x = buf(seconds);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const index = 4.2 * Math.exp(-t * 5);
    const body = Math.sin(TAU * f * t + index * Math.sin(TAU * f * 3.5 * t));
    const hum = 0.35 * Math.sin(TAU * f * 0.5 * t);
    x[i] = (body + hum) * Math.exp(-t * (4.2 / seconds)) * Math.min(1, t / 0.003);
  }
  return normalise(x);
};

/** Two bells, one after the other (rising = good news, falling = closing). */
export const twoNote = (f1, f2, gap = 0.11) => {
  const x = buf(gap + 1.1);
  mixInto(x, bell(f1, 0.7), 0, 0.85);
  mixInto(x, bell(f2, 1.0), gap, 1);
  return normalise(x);
};

/** Air moving: a band of noise that sweeps up (or down) and swells in the middle. */
export const whoosh = (seconds = 0.7, up = true) => {
  const r = rng(up ? 11 : 12);
  const n = buf(seconds);
  for (let i = 0; i < n.length; i++) n[i] = r() * 2 - 1;
  const y = up ? sweptBandpass(n, 320, 3600) : sweptBandpass(n, 3600, 320);
  for (let i = 0; i < y.length; i++) {
    const u = i / y.length;
    y[i] *= Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 2);
  }
  return normalise(y, -6);
};

/** A build: tone and air rising for `seconds`, ending cleanly at its peak. */
export const riser = (seconds = 1.6, f = 220) => {
  const r = rng(21);
  const n = buf(seconds);
  for (let i = 0; i < n.length; i++) n[i] = r() * 2 - 1;
  const air = sweptBandpass(n, 500, 6500, 1.1);
  const x = buf(seconds);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const u = i / x.length;
    ph += (TAU * f * Math.pow(2, u)) / SR;
    const g = Math.pow(u, 2.2);
    x[i] = (Math.sin(ph) * 0.5 + air[i] * 0.8) * g;
  }
  return normalise(x, -6);
};

/**
 * A low hit that a phone can still play. The sine drop carries the weight on
 * big speakers; the knock at 250 to 700 Hz and the soft-clipped harmonics are
 * what a phone speaker reproduces.
 */
export const thump = (f = 73) => {
  const x = buf(0.7);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const fr = f * 1.6 * Math.pow(0.42, Math.min(1, t / 0.22));
    ph += (TAU * fr) / SR;
    const sub = Math.tanh(Math.sin(ph) * 2.6) * Math.exp(-t * 6.5);
    const knock = Math.sin(TAU * f * 4 * t) * Math.exp(-t * 26) * 0.75 + Math.sin(TAU * f * 6 * t) * Math.exp(-t * 40) * 0.4;
    x[i] = (sub + knock) * Math.min(1, t / 0.0015);
  }
  return normalise(x);
};

/** Many small high notes switching on: a crowd of things appearing. */
export const shimmer = (key, seconds = 2.2) => {
  const r = rng(31);
  const x = buf(seconds + 0.6);
  const degrees = [1, 3, 5, 8, 10, 12];
  const count = Math.round(seconds * 22);
  for (let k = 0; k < count; k++) {
    // More and more notes towards the end.
    const at = seconds * Math.pow(r(), 0.6);
    const f = key.hz(degrees[Math.floor(r() * degrees.length)], 1 + Math.floor(r() * 2));
    mixInto(x, blip(f), at, 0.12 + 0.2 * (at / seconds));
  }
  return normalise(x, -8);
};

/** A soft wave going out: a sweep, a scan. Mid-range, so a phone plays it. */
export const pulse = (f = 147) => {
  const r = rng(41);
  const n = buf(1.1);
  for (let i = 0; i < n.length; i++) n[i] = r() * 2 - 1;
  const air = onePoleLow(sweptBandpass(n, 900, 260, 1.2), 2400);
  const x = buf(1.1);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.09) * Math.exp(-t * 4.2);
    x[i] = (Math.sin(TAU * f * 2 * t) * 0.8 + Math.sin(TAU * f * 3 * t) * 0.3 + air[i] * 0.5) * env;
  }
  return normalise(x, -6);
};

/** The series' sonic logo: four rising notes in the episode's key, then a held fifth. */
export const logo = (key) => {
  const x = buf(2.4);
  [1, 3, 5, 8].forEach((d, i) => mixInto(x, bell(key.hz(d), 0.9), i * 0.115, 0.55 + i * 0.1));
  mixInto(x, bell(key.hz(1, -1), 1.9), 0.46, 0.5);
  mixInto(x, bell(key.hz(5), 1.9), 0.46, 0.45);
  return normalise(x, -4);
};

/** Quiet air for the gaps between lines, so the voice never sits on digital silence. */
export const roomTone = (seconds) => {
  const r = rng(51);
  const n = buf(seconds);
  for (let i = 0; i < n.length; i++) n[i] = r() * 2 - 1;
  const y = onePoleLow(onePoleLow(n, 900), 900);
  let m = 0;
  for (const v of y) m = Math.max(m, Math.abs(v));
  for (let i = 0; i < y.length; i++) y[i] = (y[i] / m) * 0.5;
  return y;
};

// --- names used in sound cue lists -------------------------------------------
/**
 * Builds a sound from its cue name. A pitched name may carry a scale degree,
 * for example "bell:5" or "blip:3" (1 = the key's root, 8 = an octave up).
 */
export const DESIGNED = {
  tick: () => tick(),
  pop: (key, d = 1) => pop(key.hz(d, -1)),
  blip: (key, d = 5) => blip(key.hz(d, 1)),
  bell: (key, d = 1) => bell(key.hz(d)),
  confirm: (key) => twoNote(key.hz(5), key.hz(8)),
  chime: (key) => twoNote(key.hz(5), key.hz(3), 0.16),
  whoosh: () => whoosh(0.7, true),
  whooshDown: () => whoosh(0.7, false),
  riser: (key) => riser(1.6, key.hz(1, -1)),
  thump: (key) => thump(key.hz(1, -2)),
  shimmer: (key) => shimmer(key),
  pulse: (key) => pulse(key.hz(1, -1)),
  logo: (key) => logo(key),
};
// Names from the first version of the sound tool.
export const ALIASES = { rise: 'riser', fall: 'whooshDown', thud: 'thump' };

export const writeWav = (file, x) => {
  const data = Buffer.alloc(44 + x.length * 2);
  data.write('RIFF', 0);
  data.writeUInt32LE(36 + x.length * 2, 4);
  data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(x.length * 2, 40);
  for (let i = 0; i < x.length; i++) data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i])) * 32767), 44 + i * 2);
  fs.writeFileSync(file, data);
  return file;
};
