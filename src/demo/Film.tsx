import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Captions } from '../kit/Captions';
import { EndCard } from '../kit/EndCard';
import { useFonts } from '../kit/fonts';
import { Grain } from '../kit/stage';
import { KEY_WORDS, RatioLabel } from './Overlays';
import { END, T } from './timeline';
import { World } from './World';

export const DURATION = T.duration;

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const fontsReady = useFonts();
  if (!fontsReady) return <AbsoluteFill style={{ background: '#05070D' }} />;
  return (
    <AbsoluteFill style={{ background: '#05070D' }}>
      <ThreeCanvas shadows width={width} height={height} camera={{ fov: 32, near: 0.05, far: 200, position: [1.6, 0.9, 5.2] }} gl={{ antialias: true }}>
        <World />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(2,4,9,0.5) 100%)' }} />
      <Grain frame={frame} />
      <RatioLabel t={t} />
      <EndCard t={t} {...END} />
      <Captions t={t} lines={T.lines} keyWords={KEY_WORDS} skip={['cta']} />
      {/* A real episode plays its mix here, after tools/sound.mjs:
          <Audio src={staticFile('<id>/mix.wav')} /> */}
    </AbsoluteFill>
  );
};
