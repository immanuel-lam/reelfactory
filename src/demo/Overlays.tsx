import React from 'react';
import { FONT } from '../kit/fonts';
import { C } from '../kit/three';
import { EASE, prog } from '../kit/time';
import { RATIO, T } from './timeline';

// DOM overlays: sharp text over the 3D picture. Labels pinned to 3D points use
// makeProjector(CAM) from kit/camera.ts (see the kit table in PRODUCTION.md).

/** line key -> the exact word (with its punctuation) that gets the box in the captions. */
export const KEY_WORDS: Record<string, string> = {
  hook1: 'thumb.',
  hook2: 'hardwood.',
  hook3: 'strength',
  small: 'fast.',
  big: 'five',
  trade: 'harder.',
  turn1: 'never',
  turn2: 'force.',
};

const { W } = T;

/** "5 : 1" pops in on the ratio. */
export const RatioLabel: React.FC<{ t: number }> = ({ t }) => {
  const a = prog(t, W('big', 'five') - 0.05, W('big', 'five') + 0.35, EASE.out);
  const b = 1 - prog(t, W('turn1', 'So') - 0.2, W('turn1', 'So') + 0.2, EASE.in);
  const o = Math.min(a, b);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', opacity: o, translate: `0px ${(1 - a) * 24}px`,
        fontFamily: FONT.mono, fontWeight: 700, fontSize: 84, color: C.amber, letterSpacing: '0.04em',
      }}
    >
      {RATIO} : 1
    </div>
  );
};
