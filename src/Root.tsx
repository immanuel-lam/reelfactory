import React from 'react';
import { Composition } from 'remotion';
import { FPS } from './kit/time';
import * as demo from './demo/Film';

// Episodes: vertical 1080x1920 authored, rendered at --scale=2 (2160x3840).
// Add each new episode here: its id is the folder name in src/.
const EPISODES: Record<string, { Film: React.FC; DURATION: number }> = {
  demo,
};

export const Root: React.FC = () => (
  <>
    {Object.entries(EPISODES).map(([id, ep]) => (
      <Composition key={id} id={id} component={ep.Film} durationInFrames={ep.DURATION} fps={FPS} width={1080} height={1920} />
    ))}
  </>
);
