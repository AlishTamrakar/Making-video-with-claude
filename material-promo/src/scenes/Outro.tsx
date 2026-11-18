// Shot 7 — ui-to-brand-morph · icon-flip-bloom (adapted from demos/outro/ui-to-brand-morph/IconFlipBloomLogo.tsx).
// Kept: 0–10 entrance spring, anticipation wobble -12°/+14°/-18° → 0 (inOut sin, origin 78%) 12–34, flip-thin
// scaleX 1→0.04 with Easing.in(cubic) 34–46 + two ghost trails (0.22/0.14, blur 6), swap at the thinnest frame,
// bloom spring(damping 11, stiffness 130) from the line, second beat 7f later spring(16,170), mark slides aside
// 64–82 and the wordmark lands letter by letter (scale 1.9→1 + blur 14→0, 2.6f stagger, 12f each, origin on baseline).
// Changed: icon = the sidebar's "Material Creation Requests" icon; mark = the product's cube logo, second beat = the
// light-blue inner facet dropping in; wordmark "Material Management" in Inter 700; a kicker line + ≥1 s hold (R1).
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from 'remotion';
import { EASE, ramp } from '../fx/Polish';
import { T } from '../tokens';
import { CubeLogo, RequestIcon } from '../Logo';

export const OUTRO_DURATION = 160;

const MARK = 300;
const WORD = 'Material Management';
const WORD_SIZE = 104;
const MARK_SHIFT = -536; // mark centre left of frame centre once the wordmark arrives (lockup visually centred)
const WORD_GAP = 150; // wordmark start, from the mark centre

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const FLIP_START = 34;
  const FLIP_MID = 46;
  const WORD_START = 66;

  const inT = spring({ frame, fps, config: { damping: 13, stiffness: 140, mass: 0.8 } });
  const wobble = interpolate(frame, [12, 18, 24, 30, FLIP_START], [0, -12, 14, -18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) });
  const flipIn = interpolate(frame, [FLIP_START, FLIP_MID], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const iconScaleX = interpolate(flipIn, [0, 1], [1, 0.04]);
  const bloom = frame < FLIP_MID ? 0 : spring({ frame: frame - FLIP_MID, fps, config: { damping: 11, stiffness: 130, mass: 0.9 } });
  const markScaleX = interpolate(bloom, [0, 1], [0.04, 1]);
  const inner = frame < FLIP_MID + 7 ? 0 : spring({ frame: frame - FLIP_MID - 7, fps, config: { damping: 16, stiffness: 170 } });
  const shift = interpolate(frame, [WORD_START - 2, WORD_START + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const markX = interpolate(shift, [0, 1], [0, MARK_SHIFT]);
  const showIcon = frame < FLIP_MID;
  const ghosts = frame >= FLIP_START && frame < FLIP_MID ? [0.12, 0.24] : [];
  const wordEnd = WORD_START + (WORD.length - 1) * 2.6 + 12;
  const kick = ramp(frame, wordEnd - 6, 18, EASE.out);
  const push = 1 + 0.02 * ramp(frame, wordEnd, 160 - wordEnd, EASE.smooth);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFFFFF 0%, ${T.surface} 60%, #EEF2F7 100%)`, alignItems: 'center', justifyContent: 'center' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 62% 70% at 50% 36%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 72%), radial-gradient(ellipse 55% 60% at 50% 96%, rgba(${T.accentRgb},0.07) 0%, rgba(${T.accentRgb},0) 70%)` }} />
      {/* ground shadow: follows the wobble, narrows with the flip, gone after the bloom */}
      <div
        style={{
          position: 'absolute', left: 960 + markX - 150 * (showIcon ? iconScaleX : markScaleX) + wobble * 2.2, top: 540 + 150,
          width: 300 * (showIcon ? iconScaleX : markScaleX), height: 26, borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.22) 0%, rgba(15,23,42,0) 70%)',
          opacity: inT * (1 - ramp(frame, FLIP_MID, 14, EASE.out)),
        }}
      />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${push.toFixed(5)})`, transformOrigin: '960px 540px' }}>
        <div style={{ position: 'absolute', left: 960 + markX, top: 540, transform: 'translate(-50%, -50%)' }}>
          {showIcon ? (
            <>
              {ghosts.map((g, i) => (
                <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) scaleX(${Math.min(1, iconScaleX + g)})`, opacity: 0.22 - i * 0.08, filter: 'blur(6px)' }}>
                  <RequestIcon size={300} />
                </div>
              ))}
              <div
                style={{
                  transform: `scale(${inT}) rotate(${wobble}deg) scaleX(${iconScaleX})`, transformOrigin: 'center 78%',
                  filter: flipIn > 0.3 ? `blur(${flipIn * 5}px)` : 'none', opacity: inT,
                }}
              >
                <RequestIcon size={300} />
              </div>
            </>
          ) : (
            <div style={{ transform: `scaleX(${markScaleX})` }}>
              <CubeLogo size={MARK} inner={inner} />
            </div>
          )}
        </div>

        <div
          style={{
            position: 'absolute', left: 960 + markX + WORD_GAP, top: 540, transform: 'translateY(-58%)', display: 'flex',
            fontFamily: T.font, fontWeight: 700, fontSize: WORD_SIZE, lineHeight: 1, color: T.ink, letterSpacing: '-0.035em', whiteSpace: 'pre',
          }}
        >
          {WORD.split('').map((ch, i) => {
            const st = WORD_START + i * 2.6;
            const cT = ramp(frame, st, 12, EASE.snappy);
            const op = ramp(frame, st, 5, EASE.out);
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block', opacity: op, transform: `scale(${(1.9 - 0.9 * cT).toFixed(4)})`, transformOrigin: '50% 78%',
                  filter: cT < 0.995 ? `blur(${((1 - cT) * 14).toFixed(2)}px)` : undefined,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div
          style={{
            position: 'absolute', left: 960 + markX + WORD_GAP + 4, top: 540 + 44, display: 'flex', alignItems: 'center', gap: 16,
            fontFamily: T.font, fontSize: 34, fontWeight: 600, letterSpacing: '0.14em', color: T.muted,
            opacity: kick, transform: `translateY(${((1 - kick) * 14).toFixed(2)}px)`, filter: kick < 0.999 ? `blur(${((1 - kick) * 6).toFixed(2)}px)` : undefined,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: 3, background: T.accent, display: 'inline-block' }} />
          PE TRANSFORMER ERP
        </div>
      </div>
    </AbsoluteFill>
  );
};
