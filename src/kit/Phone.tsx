import React from 'react';
import { FONT } from './fonts';
import { C } from './three';

// A phone held at the bottom of the frame. Put your own screen inside it as
// children. It is DOM, so the text stays sharp at any render scale.

export const PHONE = { w: 620, h: 1260, top: 830 };

export const Roundel: React.FC<{ code: string; size: number; color?: string }> = ({ code, size, color = C.accent2 }) => (
  <div
    style={{
      minWidth: size * 1.5, height: size, padding: '0 14px', borderRadius: size * 0.28, background: color, color: '#fff',
      fontFamily: FONT.display, fontWeight: 800, fontSize: size * 0.56, display: 'flex', alignItems: 'center',
      justifyContent: 'center', letterSpacing: '-0.01em', boxSizing: 'border-box',
    }}
  >
    {code}
  </div>
);

/** The phone body. `drop` (px) slides it down out of the frame; `t` drives a slow sway. */
export const PhoneShell: React.FC<{ t: number; drop?: number; children: React.ReactNode }> = ({ t, drop = 0, children }) => {
  if (drop > 1200) return null;
  const sway = Math.sin(t * 0.9) * 0.6;
  return (
    <div style={{ position: 'absolute', left: (1080 - PHONE.w) / 2, top: PHONE.top, width: PHONE.w, height: PHONE.h, perspective: 2200, translate: `0px ${drop}px` }}>
      <div
        style={{
          width: '100%', height: '100%', borderRadius: 92, background: '#05070C', padding: 14, boxSizing: 'border-box',
          transformOrigin: '50% 100%', rotate: `x ${20 + sway * 0.4}deg`, transform: `rotateZ(${-2.2 + sway * 0.25}deg)`,
          boxShadow: '0 0 0 2px #3A4460, 0 0 0 5px #0B0E15, 0 40px 120px rgba(0,0,0,0.75), 0 -10px 130px rgba(170,190,255,0.26)',
        }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: 80, background: '#1F2125', overflow: 'hidden', position: 'relative', fontFamily: FONT.text, color: '#ECEDE8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '30px 54px 0', fontFamily: FONT.display, fontWeight: 700, fontSize: 28 }}>
            <span>8:09</span>
            <span style={{ width: 30, height: 16, borderRadius: 5, border: '2px solid #ECEDE8', opacity: 0.9, boxSizing: 'border-box', padding: 2 }}>
              <span style={{ display: 'block', width: '78%', height: '100%', background: '#ECEDE8', borderRadius: 2 }} />
            </span>
          </div>
          <div style={{ position: 'absolute', left: '50%', top: 22, width: 170, height: 46, marginLeft: -85, borderRadius: 24, background: '#000' }} />
          {children}
        </div>
      </div>
    </div>
  );
};
