// Shots 3 & 5 — paper-title-card (adapted from demos/typography/paper-title-card/PaperTitleCard.tsx).
// Kept: 55f card, word i delay 4 + 4i over 9f with bezier(0.2,0.75,0.3,1), letterpress scale 1.28→1 + blur 7→0 +
// opacity on one t, exactly one accent phrase, 220×6 underline scaleX 16→34f, 8f fade-out at the tail.
// Re-skinned: white surface + faint product-blue light, Inter 700 instead of serif, accent #0C83DF (not italic).
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { T } from '../tokens';

export const TITLE_CARD_DURATION = 55;

export type TitleWord = { text: string; accent?: boolean; br?: boolean };

export const TitleCard: React.FC<{ words: TitleWord[]; kicker?: string }> = ({ words, kicker }) => {
  const frame = useCurrentFrame();
  const d = TITLE_CARD_DURATION;
  const fadeOut = interpolate(frame, [d - 8, d], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const underline = interpolate(frame, [16, 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const subT = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center', opacity: fadeOut,
        backgroundImage: `radial-gradient(1100px 750px at 50% 42%, rgba(${T.accentRgb},0.06), transparent 65%), linear-gradient(180deg, #FFFFFF 0%, ${T.surface} 100%)`,
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 1600 }}>
        <div
          style={{
            fontFamily: T.font, fontSize: 112, fontWeight: 700, lineHeight: 1.12, color: T.ink, letterSpacing: '-0.04em',
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.24em',
          }}
        >
          {words.map((w, i) => {
            const delay = 4 + i * 4;
            const t = interpolate(frame, [delay, delay + 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
            return (
              <React.Fragment key={i}>
                <span
                  style={{
                    opacity: t, transform: `scale(${1.28 - 0.28 * t})`, filter: t < 0.999 ? `blur(${(1 - t) * 7}px)` : undefined,
                    display: 'inline-block', color: w.accent ? T.accent : undefined,
                  }}
                >
                  {w.text}
                </span>
                {w.br && <span style={{ flexBasis: '100%', height: 0 }} />}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ height: 6, width: 220, margin: '40px auto 0', borderRadius: 3, background: T.accent, transform: `scaleX(${underline})` }} />
        {kicker && (
          <div style={{ fontFamily: T.font, fontSize: 32, fontWeight: 600, letterSpacing: '0.14em', color: T.muted, marginTop: 34, opacity: subT, textTransform: 'uppercase' }}>
            {kicker}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
