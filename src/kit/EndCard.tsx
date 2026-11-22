import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { brand } from './brand';
import { FONT } from './fonts';
import { C } from './three';
import { EASE, clamp01, pop, prog } from './time';

/** The brand's logo from niche/brand.json, or a rounded tile with its initial. */
export const AppIcon: React.FC<{ size: number }> = ({ size }) =>
  brand.logo ? (
    <Img
      src={staticFile(brand.logo)}
      style={{ width: size, height: size, borderRadius: size * 0.225, boxShadow: '0 0 0 2px rgba(242,245,250,0.14), 0 20px 70px rgba(0,0,0,0.6)' }}
    />
  ) : (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.225, background: C.navy, color: C.amber, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: size * 0.56,
        boxShadow: '0 0 0 2px rgba(242,245,250,0.14), 0 20px 70px rgba(0,0,0,0.6)',
      }}
    >
      {brand.name.slice(0, 1)}
    </div>
  );

/**
 * The house end card: logo, name, tagline and the call to action, all from
 * niche/brand.json. `start` is when the veil comes down, `nameAt` and `freeAt`
 * are the moments the voice says the name and the offer, `end` is the film's
 * length.
 */
export const EndCard: React.FC<{
  t: number; start: number; nameAt: number; freeAt: number; end: number;
  /** Small credit line. OpenStreetMap and most open data need one. */
  credit?: string;
}> = ({ t, start, nameAt, freeAt, end, credit = brand.credit }) => {
  if (t < start) return null;
  const veil = prog(t, start, start + 0.6, EASE.out);
  const icon = pop(t, start + 0.12, 0.6);
  const name = prog(t, nameAt - 0.02, nameAt + 0.4, EASE.out);
  const free = prog(t, freeAt - 0.05, freeAt + 0.4, EASE.out);
  const settle = 1 + 0.015 * (1 - prog(t, start, end, EASE.out));
  return (
    <AbsoluteFill style={{ background: `rgba(7,11,22,${veil})`, alignItems: 'center', scale: String(settle) }}>
      <div style={{ marginTop: 560, scale: String(icon), opacity: clamp01(icon * 1.6) }}>
        <AppIcon size={300} />
      </div>
      <div style={{ marginTop: 64, opacity: name, translate: `0px ${(1 - name) * 30}px`, textAlign: 'center', fontFamily: FONT.display, color: C.white }}>
        <div style={{ fontWeight: 800, fontSize: brand.name.length > 12 ? 96 : 138, letterSpacing: '-0.045em', lineHeight: 1 }}>{brand.name}</div>
        {brand.tagline ? (
          <div style={{ fontWeight: 600, fontSize: 52, letterSpacing: '-0.01em', color: '#A9B4CC', marginTop: 14 }}>{brand.tagline}</div>
        ) : null}
      </div>
      {brand.cta ? (
        <div
          style={{
            marginTop: 78, opacity: free, translate: `0px ${(1 - free) * 30}px`, padding: '26px 54px 30px', borderRadius: 60,
            background: C.amber, color: '#12100A', fontFamily: FONT.display, fontWeight: 800, fontSize: 60, letterSpacing: '-0.02em',
            boxShadow: '0 14px 70px rgba(0,0,0,0.35)',
          }}
        >
          {brand.cta}
        </div>
      ) : null}
      {credit ? (
        <div
          style={{
            position: 'absolute', top: 1392, left: 0, right: 0, textAlign: 'center', opacity: free * 0.75, fontFamily: FONT.text,
            fontWeight: 500, fontSize: 25, letterSpacing: '0.01em', color: '#7F8AA6',
          }}
        >
          {credit}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
