// Shot 1 — blur-slide opener (adapted from demos/typography/blur-slide/BlurSlide.tsx).
// Timings kept from the demo: masthead rule 0–24, eyebrow 4–22, line 1 words 10/14/18 (22f), line 2 after a
// 6f breath with the accent word getting the longer 30f window, subtitle from 34f at 2.4f gaps (20f each),
// footer rule 72–98, slow 1→1.03 push across the shot. y/blur/opacity share ONE progress p per word.
// Re-skinned to the product: Inter 700 instead of serif, slate ink, #0C83DF accent, cube logo masthead.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EASE, ramp } from '../fx/Polish';
import { T } from '../tokens';
import { CubeLogo } from '../Logo';

export const OPEN_DURATION = 120;
const LEFT = 168;

type Word = { text: string; start: number; dur: number; style?: React.CSSProperties; track?: [number, number] };

const Words: React.FC<{ words: Word[]; dy: number; blur: number; gap: string; style: React.CSSProperties }> = ({ words, dy, blur, gap, style }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap, whiteSpace: 'nowrap', ...style }}>
      {words.map((w, i) => {
        const p = ramp(frame, w.start, w.dur, EASE.out);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${((1 - p) * dy).toFixed(2)}px)`,
              filter: p >= 0.999 ? undefined : `blur(${((1 - p) * blur).toFixed(2)}px)`,
              letterSpacing: w.track ? `${(w.track[0] + (w.track[1] - w.track[0]) * p).toFixed(4)}em` : undefined,
              ...w.style,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};

const H1_A: Word[] = ['New', 'materials,'].map((text, i) => ({ text, start: 10 + i * 4, dur: 22 }));
const H1_B: Word[] = [
  { text: 'approved', start: 26, dur: 22 },
  { text: 'faster.', start: 30, dur: 30, track: [0.02, -0.035], style: { color: T.accent } },
];
const H2: Word[] = 'Request, review and activate every material in one place.'
  .split(' ')
  .map((text, i) => ({ text, start: 34 + i * 2.4, dur: 20 }));

export const Open: React.FC = () => {
  const frame = useCurrentFrame();
  const push = 1 + 0.03 * ramp(frame, 0, 119, EASE.smooth);
  const rule = ramp(frame, 0, 24, EASE.snappy);
  const kick = ramp(frame, 4, 18, EASE.out);
  const foot = ramp(frame, 72, 26, EASE.snappy);
  const ghost = ramp(frame, 0, 48, EASE.out);
  const headline: React.CSSProperties = {
    fontFamily: T.font, fontSize: 168, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.045em', color: T.ink,
  };
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFFFFF 0%, ${T.surface} 100%)`, overflow: 'hidden' }}>
      {/* key light + a faint wash of the product blue in the far corner */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 70% at 28% 22%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%), radial-gradient(ellipse 45% 55% at 98% 100%, rgba(${T.accentRgb},0.07), rgba(${T.accentRgb},0) 70%)` }} />
      {/* background: the cube logo at 4% ink, drifting the other way (parallax, as the demo's folio numeral) */}
      <div
        style={{
          position: 'absolute', right: 70, top: 170, opacity: 0.05 * ghost,
          filter: ghost >= 0.999 ? undefined : `blur(${((1 - ghost) * 24).toFixed(2)}px)`,
          transform: `translateX(${(-24 * ramp(frame, 0, 119, EASE.smooth)).toFixed(2)}px)`,
        }}
      >
        <svg width={720} height={720} viewBox="0 0 40 40">
          <path d="M20 3 35 11.5 20 20 5 11.5Z" fill={T.ink} />
          <path d="M5 11.5 20 20v17L5 28.5Z" fill={T.ink} opacity={0.7} />
          <path d="M35 11.5 20 20v17l15-8.5Z" fill={T.ink} opacity={0.45} />
        </svg>
      </div>

      {/* masthead */}
      <div style={{ position: 'absolute', left: LEFT, right: LEFT, top: 86, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4 + 0.6 * rule }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: T.font, fontSize: 34, fontWeight: 700, letterSpacing: '-0.01em', color: T.ink }}>
          <CubeLogo size={46} />
          Material Management
        </div>
        <span style={{ fontFamily: T.font, fontSize: 32, fontWeight: 600, letterSpacing: '0.14em', color: T.muted }}>PE TRANSFORMER ERP</span>
      </div>
      <div style={{ position: 'absolute', left: LEFT, top: 152, width: 1920 - LEFT * 2, height: 1.5, background: 'rgba(2,6,23,0.14)', transform: `scaleX(${rule.toFixed(4)})`, transformOrigin: '0 50%' }} />

      {/* footer rule + label (hold-phase closer) */}
      <div style={{ position: 'absolute', left: LEFT, top: 972, width: 1920 - LEFT * 2, height: 1.5, background: 'rgba(2,6,23,0.12)', transform: `scaleX(${foot.toFixed(4)})`, transformOrigin: '100% 50%' }} />
      <div style={{ position: 'absolute', right: LEFT, top: 990, fontFamily: T.font, fontSize: 32, fontWeight: 600, letterSpacing: '0.14em', color: T.muted, opacity: foot }}>
        MATERIAL CREATION REQUESTS
      </div>

      <div style={{ position: 'absolute', inset: 0, transform: `scale(${push.toFixed(5)})`, transformOrigin: `${LEFT}px 560px` }}>
        <div
          style={{
            position: 'absolute', left: LEFT, top: 300, display: 'flex', alignItems: 'center', gap: 18,
            fontFamily: T.font, fontSize: 34, fontWeight: 700, letterSpacing: '0.12em', color: T.accent,
            opacity: kick, transform: `translateY(${((1 - kick) * 18).toFixed(2)}px)`, filter: kick >= 0.999 ? undefined : `blur(${((1 - kick) * 6).toFixed(2)}px)`,
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: 3, background: T.accent, display: 'inline-block' }} />
          MATERIAL MASTER DATA
        </div>
        <Words words={H1_A} dy={64} blur={18} gap="0.24em" style={{ ...headline, position: 'absolute', left: LEFT - 8, top: 372 }} />
        <Words words={H1_B} dy={64} blur={18} gap="0.24em" style={{ ...headline, position: 'absolute', left: LEFT - 8, top: 556 }} />
        <Words
          words={H2}
          dy={26}
          blur={9}
          gap="0.26em"
          style={{ position: 'absolute', left: LEFT, top: 800, fontFamily: T.font, fontSize: 46, fontWeight: 500, letterSpacing: '-0.015em', color: T.ink2, lineHeight: 1.2 }}
        />
      </div>
    </AbsoluteFill>
  );
};
