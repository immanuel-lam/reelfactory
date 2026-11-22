import { CamKey, makeCamera } from '../kit/camera';
import { EASE, makeTimeline, prog } from '../kit/time';
import timing from './timing.json';

// demo: everything that is specific to this film's timing and staging.
// Every time comes from the voice: L(key) is a line's start, LE(key) its end,
// W(key, word) the start of a word. Never hard-code a time that belongs to a word.

export const T = makeTimeline(timing);
const { L, LE, W } = T;

/** Gear sizes (teeth) and the ratio the film is about. */
export const SMALL_TEETH = 10;
export const BIG_TEETH = 50;
export const RATIO = BIG_TEETH / SMALL_TEETH;

/** The small gear's angle: it spins up on "spins" and keeps going. */
export const smallAngle = (t: number) => {
  const start = W('small', 'spins');
  const spin = Math.max(0, t - start);
  // Ease into full speed over 0.8 s, then 2 turns a second.
  const ramp = prog(t, start, start + 0.8, EASE.out);
  return -(spin * 2 * Math.PI * 2) * ramp - 0.2 * t;
};
/** The big gear turns RATIO times slower, the other way. */
export const bigAngle = (t: number) => -smallAngle(t) / RATIO;

/** How much of the force arrow is drawn (it grows on "harder"). */
export const force = (t: number) => prog(t, W('trade', 'harder') - 0.1, W('trade', 'harder') + 0.6, EASE.out);

// One continuous camera move, no cuts.
const keys: CamKey[] = [
  // Frame 0: the two gears where they mesh, close and low.
  { t: 0, p: [2.2, -0.6, 4.6], l: [1.2, 0.2, 0], fov: 34 },
  { t: LE('hook3'), p: [2.0, -0.4, 4.0], l: [1.3, 0.2, 0], fov: 34, ease: EASE.linear },
  // In to the small gear on "tiny".
  { t: W('small', 'tiny') + 0.2, p: [2.4, 0.3, 2.6], l: [1.9, 0.0, 0], fov: 32, ease: EASE.inOut },
  // Out to the whole big gear on "big".
  { t: W('big', 'big') + 0.2, p: [0.2, -1.2, 13.5], l: [-0.6, 0.2, 0], fov: 34, ease: EASE.inOut },
  { t: LE('trade'), p: [-0.6, -1.4, 12.5], l: [-0.8, 0.0, 0], fov: 34, ease: EASE.linear },
  // Up and over both for the reframe.
  { t: L('turn1') + 0.3, p: [0.8, 4.5, 11.5], l: [0.0, 0.0, 0], fov: 36, ease: EASE.inOut },
  { t: T.durationS + 0.5, p: [0.8, 5.0, 12.5], l: [0.0, 0.0, 0], fov: 36, ease: EASE.linear },
];
export const CAM = makeCamera(keys);

/** End card timing, from the last line. */
export const END = { start: L('cta') - 0.35, nameAt: W('cta', 'Your'), freeAt: W('cta', 'Free'), end: T.durationS };
