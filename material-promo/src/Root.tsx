import React from 'react';
import { Composition } from 'remotion';
import { MaterialPromo, TOTAL } from './Main';

export const RemotionRoot: React.FC = () => (
  <Composition id="MaterialPromo" component={MaterialPromo} durationInFrames={TOTAL} fps={30} width={1920} height={1080} defaultProps={{ bgm: true }} />
);
