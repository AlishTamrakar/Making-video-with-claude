// Narration caption — Q11 sized (56px Inter 600), product tokens, on a frosted white pill.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { T } from './tokens';
import { EASE, ramp } from './fx/Polish';

export const Caption: React.FC<{ text: string; duration: number; bottom?: number }> = ({ text, duration, bottom = 58 }) => {
  const frame = useCurrentFrame();
  const inT = ramp(frame, 0, 12, EASE.out);
  const outT = 1 - ramp(frame, duration - 9, 9, EASE.swift);
  const o = inT * outT;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 22, padding: '16px 36px 18px 30px', borderRadius: 999,
          background: 'rgba(255,255,255,0.94)',
          boxShadow: `0 0 0 1px ${T.line}, 0 18px 48px -18px rgba(15,23,42,0.28), 0 2px 6px rgba(15,23,42,0.06)`,
          fontFamily: T.font, fontSize: 56, fontWeight: 600, letterSpacing: '-0.02em', color: T.ink, lineHeight: 1.1,
          opacity: o, transform: `translateY(${((1 - inT) * 14).toFixed(2)}px)`,
          filter: inT < 0.999 ? `blur(${((1 - inT) * 6).toFixed(2)}px)` : undefined,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 3, background: T.accent, display: 'inline-block', flex: 'none' }} />
        {text}
      </div>
    </div>
  );
};
