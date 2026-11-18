// Shot 2 — crane-rise-reveal (adapted from demos/opening/crane-rise-reveal/CraneRiseReveal.tsx).
// Kept from the demo: hold 24f with a 1.5% breath push, 102f rise on ONE bezier(0.2,0,0.25,1) progress driving
// both the aim point and the scale (translate = screen centre − aim×scale), focus on the tracked row (others at 38%,
// back to 100% ~26f after lift-off), row washes triggered when the view's top edge crosses each row (solved per
// frame, so they stay locked to the camera), window shadow lifting from 6 → 34, backdrop dots at 0.35 parallax,
// CameraMotionBlur only on the fast first segment (to f64), washes on their own layer outside the blur.
// Changed for the product: the world is the REAL 3× capture of the requests page, set as a window on a slate stage;
// the tracked row is M-RQ-00124 (Critical, CRGO Silicon Steel); S0 = 3.4 so the 3× texture is shown ~1:1.
// No status flip in the aftermath (it would invent data) — the caption carries the hold instead.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { bezier, ramp, mix, EASE } from '../fx/Polish';
import { T } from '../tokens';
import layout from '../../public/layout.json';

export const CRANE_DURATION = 165;

const HOLD = 24;
const MOVE_END = 126;
const BLUR_END = 64;
const crane = bezier(0.2, 0, 0.25, 1);

// page (CSS px of the 1920×1080 capture) → world: the page sits as a window on the stage
const K = 0.9;
const WX = 96, WY = 54, WW = 1920 * K, WH = 1080 * K;
const wx = (x: number) => WX + K * x;
const wy = (y: number) => WY + K * y;

const rows = layout.list.rows;
const TRACK = rows.findIndex((r) => r.text.startsWith('M-RQ-00124'));
const HEAD = { y0: 60, y1: 240 }; // page title, tabs and toolbar

// camera
const S0 = 3.4;
const BREATH = 0.015;
const F0X = 440; // aim x: window's rail just off the left edge; ID / Priority / Material name readable
const VIS_TOP0 = wy(347); // opening frame: bottom edge just under the last row, tracked row lower-middle
const F1 = { x: 960, y: 540 };
const camAt = (frame: number) => {
  const breath = ramp(frame, 0, HOLD, EASE.smooth);
  const e = crane(Math.min(1, Math.max(0, (frame - HOLD) / (MOVE_END - HOLD))));
  const s0 = S0 * (1 + BREATH * breath);
  const s = mix(s0, 1, e);
  const fy0 = VIS_TOP0 + 540 / S0;
  const fx = mix(F0X, F1.x, e);
  const fy = mix(fy0, F1.y, e);
  return { s, e, tx: 960 - fx * s, ty: 540 - fy * s, visTop: fy - 540 / s };
};

// wash trigger: first frame the view's top edge passes the row's top (rows already on screen don't wash)
const trigFor = (top: number) => {
  if (camAt(HOLD).visTop <= top) return -1;
  for (let f = HOLD; f <= MOVE_END; f++) if (camAt(f).visTop <= top + 2) return f;
  return MOVE_END;
};
const ROW_TRIG = rows.map((r) => trigFor(wy(r.y)));
const HEAD_TRIG = (() => {
  for (let f = HOLD; f <= MOVE_END; f++) if (camAt(f).visTop <= wy(HEAD.y0) + 60) return f;
  return MOVE_END;
})();

const rgba = (a: number) => `rgba(${T.accentRgb},${a})`;

const World: React.FC<{ frame: number }> = ({ frame }) => {
  const elev = mix(6, 34, ramp(frame, HOLD + 30, MOVE_END - HOLD - 20, EASE.swift));
  const focus = mix(0.38, 1, ramp(frame, HOLD - 2, 28, EASE.out));
  const headOn = ramp(frame, HEAD_TRIG - 8, 20, EASE.out);
  const tr = rows[TRACK];
  const beat = 0.5 + 0.5 * Math.sin(frame / 5.5);
  const ty = wy(tr.y + tr.h / 2);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute', left: WX, top: WY, width: WW, height: WH, borderRadius: 18, overflow: 'hidden', background: '#fff',
          boxShadow: `0 0 0 1px rgba(15,23,42,0.08), 0 ${(elev * 0.5).toFixed(1)}px ${(elev * 1.4).toFixed(1)}px rgba(15,23,42,0.10), 0 ${(elev * 2).toFixed(1)}px ${(elev * 4).toFixed(1)}px -${elev.toFixed(1)}px rgba(15,23,42,0.18)`,
        }}
      >
        <Img src={staticFile('textures/list@3x.png')} style={{ position: 'absolute', left: 0, top: 0, width: WW, height: WH }} />
        {/* focus: everything except the tracked row is pulled back to 38% (white veil), released after lift-off */}
        {focus < 0.999 && (
          <>
            <div style={{ position: 'absolute', left: 0, top: 0, width: WW, height: K * tr.y, background: '#fff', opacity: 1 - focus }} />
            <div style={{ position: 'absolute', left: 0, top: K * (tr.y + tr.h), width: WW, height: WH - K * (tr.y + tr.h), background: '#fff', opacity: 1 - focus }} />
          </>
        )}
        {/* page header reads at 35% until the camera reaches it */}
        <div style={{ position: 'absolute', left: K * 72, top: K * HEAD.y0, width: WW, height: K * (HEAD.y1 - HEAD.y0), background: '#fff', opacity: 0.65 * (1 - headOn) * focus }} />
      </div>
      {/* tracked row: accent tint + hairline ring + breathing tracking dot in the gutter */}
      <div
        style={{
          position: 'absolute', left: wx(tr.x) + 2, top: wy(tr.y) + 2, width: K * tr.w - 4, height: K * tr.h - 4, borderRadius: 8,
          background: `linear-gradient(90deg, ${rgba(0.11)} 0%, ${rgba(0.05)} 60%, ${rgba(0.03)} 100%)`,
          boxShadow: `inset 0 0 0 1px ${rgba(0.28)}`,
        }}
      />
      <div style={{ position: 'absolute', left: wx(tr.x) - 13, top: ty - 4, width: 8, height: 8, borderRadius: 4, background: T.accent }} />
      <div
        style={{
          position: 'absolute', left: wx(tr.x) - 13 - 5 * beat, top: ty - 4 - 5 * beat, width: 8 + 10 * beat, height: 8 + 10 * beat,
          borderRadius: 20, border: `1.2px solid ${rgba(0.5 * (1 - beat))}`,
        }}
      />
    </div>
  );
};

const Cam: React.FC<{ frame: number; children: React.ReactNode }> = ({ frame, children }) => {
  const { s, tx, ty } = camAt(frame);
  return (
    <div style={{ position: 'absolute', width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
      {children}
    </div>
  );
};

const DOTS = (() => {
  const out: { x: number; y: number }[] = [];
  for (let y = -600; y <= 1700; y += 48) for (let x = -900; x <= 2800; x += 48) out.push({ x, y });
  return out;
})();
const BackDots: React.FC<{ frame: number }> = ({ frame }) => {
  const { s, tx, ty } = camAt(frame);
  const k = 0.35;
  const sp = 1 + (s - 1) * k;
  const px = 960 + (tx + 960 * s - 960) * k - 960 * sp;
  const py = 540 + (ty + 540 * s - 540) * k - 540 * sp;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${px.toFixed(2)} ${py.toFixed(2)}) scale(${sp.toFixed(4)})`}>
        {DOTS.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={1.6} fill="rgba(15,23,42,0.12)" />)}
      </g>
    </svg>
  );
};

const Page: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #F1F5F9 0%, #E9EEF5 55%, #E2E8F0 100%)` }}>
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 58% 62% at 50% 2%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)' }} />
        <BackDots frame={frame} />
      </AbsoluteFill>
      <Cam frame={frame}>
        <World frame={frame} />
      </Cam>
    </AbsoluteFill>
  );
};

const Sweeps: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
    <Cam frame={frame}>
      {rows.map((r, i) => {
        const t = ROW_TRIG[i];
        if (t < 0 || i === TRACK) return null;
        const p = ramp(frame, t, 20, EASE.out);
        const op = Math.min(1, ramp(frame, t, 3, EASE.linear)) * (1 - ramp(frame, t + 6, 18, EASE.out));
        if (op <= 0.002) return null;
        const head = mix(-0.2, 1.1, p);
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: wx(r.x) + 2, top: wy(r.y) + 2, width: K * r.w - 4, height: K * r.h - 4, borderRadius: 8, opacity: op,
              background: `linear-gradient(90deg, ${rgba(0.03)} 0%, ${rgba(0.14)} ${(head * 100).toFixed(1)}%, ${rgba(0)} ${((head + 0.22) * 100).toFixed(1)}%)`,
              boxShadow: `inset 0 0 0 1px ${rgba(0.18)}`,
            }}
          />
        );
      })}
    </Cam>
  </AbsoluteFill>
);

export const Crane: React.FC = () => {
  const frame = useCurrentFrame();
  const fast = frame > HOLD + 1 && frame < BLUR_END;
  const vig = 1 - ramp(frame, HOLD, 60, EASE.swift);
  return (
    <AbsoluteFill style={{ background: '#E9EEF5', overflow: 'hidden' }}>
      {fast ? (
        <CameraMotionBlur shutterAngle={150} samples={10}>
          <Page />
        </CameraMotionBlur>
      ) : (
        <Page />
      )}
      <Sweeps frame={frame} />
      <AbsoluteFill
        style={{
          pointerEvents: 'none', opacity: vig,
          background: 'radial-gradient(ellipse 75% 70% at 45% 55%, rgba(15,23,42,0) 55%, rgba(15,23,42,0.14) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
