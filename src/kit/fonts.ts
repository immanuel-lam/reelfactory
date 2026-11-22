import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

// Typefaces (all SIL OFL 1.1; licences in public/fonts/).
// - Manrope (display), Hanken Grotesk (text), Sometype Mono (labels).
// - Instrument Serif (+ italic): large editorial type.
let loading: Promise<void> | null = null;

export const FONT = {
  display: 'Manrope, sans-serif',
  text: 'Hanken, sans-serif',
  mono: '"Sometype Mono", ui-monospace, monospace',
  serif: '"Instrument Serif", serif',
};

export const loadFonts = (): Promise<void> => {
  if (loading) return loading;
  const faces = [
    new FontFace('Manrope', `url(${staticFile('fonts/manrope.woff2')}) format('woff2')`, { weight: '200 800' }),
    new FontFace('Hanken', `url(${staticFile('fonts/hanken.woff2')}) format('woff2')`, { weight: '100 900' }),
    new FontFace('Sometype Mono', `url(${staticFile('fonts/sometype-mono.ttf')}) format('truetype')`, { weight: '400 800' }),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif.ttf')}) format('truetype')`, { weight: '400' }),
    new FontFace('Instrument Serif', `url(${staticFile('fonts/instrument-serif-italic.ttf')}) format('truetype')`, {
      weight: '400',
      style: 'italic',
    }),
  ];
  loading = Promise.all(faces.map((f) => f.load())).then((loaded) => {
    const fontSet = document.fonts as unknown as { add: (face: FontFace) => void };
    loaded.forEach((f) => fontSet.add(f));
  });
  return loading;
};

/** Blocks rendering until every face is loaded (no fallback-font frames). */
export const useFonts = (): boolean => {
  const [handle] = useState(() => delayRender('Loading fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadFonts().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready;
};
