import React, { useMemo } from 'react';
import { FONT } from './fonts';
import { C } from './three';
import { EASE, Line, lerp, prog } from './time';

// Burned-in captions: one short chunk at a time near the top of the frame.
// Each word lands as it is spoken, spoken words go grey, and one key word per
// line sits in an amber box (choose it when you write the script).

type Chunk = { words: { text: string; start: number; end: number; hot: boolean }[]; start: number; end: number };

export const buildChunks = (lines: Line[], keyWords: Record<string, string>, skip: string[] = []) => {
  const out: Chunk[] = [];
  for (const line of lines) {
    if (skip.includes(line.key)) continue;
    let cur: Chunk['words'] = [];
    const flush = () => {
      if (cur.length) out.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    };
    line.words.forEach((w, i) => {
      cur.push({ ...w, hot: w.text === keyWords[line.key] });
      const chars = cur.reduce((n, x) => n + x.text.length + 1, 0);
      const next = line.words[i + 1];
      // At most three words and about 15 characters on screen at once.
      if (/[,.?!]$/.test(w.text) || cur.length >= 3 || (next && chars + next.text.length > 15)) flush();
    });
    flush();
  }
  out.forEach((c, i) => {
    const next = out[i + 1];
    c.end = next ? Math.min(next.start, c.end + 0.7) : c.end + 0.7;
  });
  return out;
};

export const Captions: React.FC<{
  t: number;
  lines: Line[];
  /** line key -> the exact word (with its punctuation) to box. */
  keyWords: Record<string, string>;
  /** line keys with no caption (for example the end card line). */
  skip?: string[];
  top?: number;
}> = ({ t, lines, keyWords, skip, top = 250 }) => {
  const chunks = useMemo(() => buildChunks(lines, keyWords, skip), [lines, keyWords, skip]);
  const chunk = chunks.find((c, i) => (i === 0 || t >= c.start - 0.02) && t < c.end);
  if (!chunk) return null;
  const out = 1 - prog(t, chunk.end - 0.1, chunk.end, EASE.in);
  return (
    <div
      style={{
        position: 'absolute', left: 90, right: 90, top, display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: '6px 20px', fontFamily: FONT.display, fontWeight: 800, fontSize: 92, lineHeight: 1.08, letterSpacing: '-0.02em',
        opacity: out,
      }}
    >
      {chunk.words.map((w, i) => {
        // The very first word is already on screen in frame 0 (the thumbnail).
        const p = chunk === chunks[0] && i === 0 ? 1 : prog(t, w.start - 0.03, w.start + 0.13, EASE.out);
        const spoken = t >= w.end + 0.02;
        const color = w.hot ? '#12100A' : spoken ? 'rgba(210,219,238,0.62)' : C.white;
        return (
          <span
            key={i}
            style={{
              position: 'relative', display: 'inline-block', color, opacity: p, translate: `0px ${(1 - p) * 22}px`,
              textShadow: w.hot ? 'none' : '0 2px 18px rgba(3,5,12,0.9), 0 0 3px rgba(3,5,12,0.8)',
              padding: w.hot ? '0 16px 4px' : 0,
            }}
          >
            {w.hot ? (
              <span
                style={{
                  position: 'absolute', inset: 0, borderRadius: 16, background: C.amber, scale: `${lerp(0.7, 1, p)} 1`,
                  boxShadow: `0 6px 34px ${C.amber}61`,
                }}
              />
            ) : null}
            <span style={{ position: 'relative' }}>{w.text}</span>
          </span>
        );
      })}
    </div>
  );
};
