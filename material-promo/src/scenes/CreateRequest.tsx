// Shot 4 — type-and-filter, typing + click grammar (adapted from demos/interaction/type-and-filter/TypeAndFilter.tsx).
// Kept: PageCam2D with the demo's ease, 3f per character, caret solid while typing then an 8f blink, focus ring lit
// 6f before typing, a breath before the camera pulls back to the full view, macOS pointer in page space at constant
// screen size on a slight arc, double concentric ripple (3f apart, 10f each, 14→54/78), lit outline concentric with
// the clicked control, and a push-in handed off under a flash cut.
// Changed (all states are real captures of the prototype):
//   1. type "Copper Busbar 100×10mm" into the real Material name field (zoom 2.0 so the dimmed queue keeps room
//      for the caption);
//   2. click the group "Select" → dissolve to the capture after picking Raw Materials › Conductors (the prototype's own busbar group),
//      where the prototype has generated the code MAT-RM-CU-····; the code field gets one accent ring;
//   3. pull back, click "Save as draft" (the prototype saves drafts without the remaining required fields);
//   4. flash cut to the queue the prototype returns to: new row M-RQ-01046 · Draft at the top + "Draft saved" toast.
import React from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { PageCam2D, CamKey2D } from '../fx/PageCam2D';
import { T } from '../tokens';
import layout from '../../public/layout.json';

const QUERY = 'Copper Busbar 100×10mm';
const TYPE_START = 10;
const TYPE_END = TYPE_START + QUERY.length * 3; // 76
const CLICK1 = 98; // group "Select"
const SWAP = 102; // dissolve to the group-picked capture (6f)
const PULL = 140; // pull back to the full view (16f)
const CLICK2 = 176; // "Save as draft"
export const CREATE_CUT = 186; // hard cut to the queue (flash straddles it)
export const CREATE_DURATION = 266;

const D = layout.drawer;
const INPUT = D.nameInput;
const SEL = D.groupSelect;
const CODE = D.codeInput;
const SAVE = D.saveDraft;
const centre = (b: { x: number; y: number; w: number; h: number }) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const SEL_C = centre(SEL);
const SAVE_C = centre(SAVE);
const ROW = layout.saved.newRow;

const CAM_KEYS: CamKey2D[] = [
  { frame: 0, cx: 1440, cy: 270, zoom: 2.0 }, // drawer right half of frame; dimmed queue on the left holds the caption
  { frame: PULL, cx: 1440, cy: 270, zoom: 2.0 },
  { frame: PULL + 16, cx: 960, cy: 540, zoom: 1.0 },
  { frame: CLICK2 + 1, cx: 960, cy: 540, zoom: 1.0 },
  { frame: CREATE_CUT, cx: 1290, cy: 770, zoom: 1.5 }, // push toward Save as draft into the cut
];
const SAVED_KEYS: CamKey2D[] = [
  { frame: 0, cx: 960, cy: 540, zoom: 1.0 },
  { frame: 34, cx: 770, cy: 430, zoom: 1.3 }, // ease in on the new draft row (ID → Status in frame)
];
const CAM_EASE = Easing.bezier(0.33, 0, 0.15, 1);
const zoomAt = (keys: CamKey2D[], f: number) => {
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f >= a.frame && f <= b.frame) {
      const t = interpolate(f, [a.frame, b.frame], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CAM_EASE });
      return a.zoom + (b.zoom - a.zoom) * t;
    }
  }
  return f < keys[0].frame ? keys[0].zoom : keys[keys.length - 1].zoom;
};

// pointer path (page space): in from the right, to the group Select, then down to Save as draft
const PTR0 = { x: 1905, y: 420 };
const ptrAt = (f: number) => {
  const ease = Easing.bezier(0.45, 0, 0.2, 1);
  const t1 = interpolate(f, [CLICK1 - 14, CLICK1 - 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const t2 = interpolate(f, [PULL + 18, CLICK2 - 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const a = { x: PTR0.x + (SEL_C.x - PTR0.x) * t1, y: PTR0.y + (SEL_C.y - PTR0.y) * t1 - Math.sin(t1 * Math.PI) * 20 };
  return { x: a.x + (SAVE_C.x - a.x) * t2 - Math.sin(t2 * Math.PI) * 60, y: a.y + (SAVE_C.y - a.y) * t2 };
};
const rgba = (a: number) => `rgba(${T.accentRgb},${a})`;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Ripple: React.FC<{ frame: number; at: number; c: { x: number; y: number } }> = ({ frame, at, c }) => (
  <>
    {[0, 1].map((r) => {
      const start = at + r * 3;
      if (frame < start || frame > start + 10) return null;
      const t = interpolate(frame, [start, start + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
      const rad = interpolate(t, [0, 1], [14, r === 0 ? 54 : 78]);
      return (
        <div
          key={r}
          style={{
            position: 'absolute', left: c.x - rad, top: c.y - rad, width: rad * 2, height: rad * 2, borderRadius: '50%', boxSizing: 'border-box',
            border: `${r === 0 ? 2 : 1.5}px solid ${T.accent}`, background: r === 0 ? `radial-gradient(circle, ${rgba(0)} 55%, ${rgba(0.1)} 100%)` : undefined,
            opacity: 1 - t, zIndex: 5,
          }}
        />
      );
    })}
  </>
);

const Outline: React.FC<{ frame: number; at: number; b: { x: number; y: number; w: number; h: number } }> = ({ frame, at, b }) =>
  frame >= at + 2 ? (
    <div
      style={{
        position: 'absolute', left: b.x - 4, top: b.y - 4, width: b.w + 8, height: b.h + 8, borderRadius: 10, boxSizing: 'border-box',
        border: `2px solid ${T.accent}`, boxShadow: `0 0 0 4px ${rgba(0.1)}, 0 6px 22px -6px ${rgba(0.45)}`,
        opacity: interpolate(frame, [at + 2, at + 5, at + 18, at + 26], [0.5, 1, 1, 0], clamp),
        transform: `scale(${interpolate(frame, [at + 2, at + 7], [1.03, 1], { ...clamp, easing: Easing.out(Easing.cubic) })})`,
        zIndex: 4,
      }}
    />
  ) : null;

const Pointer: React.FC<{ frame: number; zoom: number; p: { x: number; y: number }; o: number; press: number }> = ({ zoom, p, o, press }) =>
  o > 0.001 ? (
    <svg
      width={28} height={28} viewBox="0 0 28 28"
      style={{
        position: 'absolute', left: p.x - 2, top: p.y - 1, zIndex: 6, opacity: o, overflow: 'visible', transformOrigin: '2px 1px',
        transform: `scale(${((1 / zoom) * press * 1.6).toFixed(4)})`,
        filter: 'drop-shadow(0 0.6px 0.6px rgba(2,6,23,0.35)) drop-shadow(0 3px 5px rgba(2,6,23,0.25))',
      }}
    >
      <path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill="#0f172a" stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  ) : null;

const Form: React.FC = () => {
  const frame = useCurrentFrame();
  const typedCount = frame < TYPE_START ? 0 : Math.min(QUERY.length, Math.floor((frame - TYPE_START) / 3) + 1);
  const caretOn = frame >= TYPE_START - 2 && frame < CLICK1 && (frame <= TYPE_END + 4 || Math.floor((frame - (TYPE_END + 4)) / 8) % 2 === 0);
  const focus = interpolate(frame, [TYPE_START - 6, TYPE_START - 2, CLICK1, CLICK1 + 6], [0, 1, 1, 0], clamp);
  const swap = interpolate(frame, [SWAP, SWAP + 6], [0, 1], clamp);
  const codeRing = interpolate(frame, [SWAP + 6, SWAP + 12, PULL + 10, PULL + 20], [0, 1, 1, 0], clamp);
  const ptr = ptrAt(frame);
  const ptrO = interpolate(frame, [CLICK1 - 16, CLICK1 - 11, CLICK2 + 5, CLICK2 + 9], [0, 1, 1, 0], clamp);
  const press = (at: number) => interpolate(frame, [at - 1, at + 1, at + 5], [1, 0.86, 1], clamp);
  return (
    <PageCam2D src="textures/drawer@3x.png" pageH={1080} keys={CAM_KEYS} bg="#fff">
      {/* typing overlay on the empty-form capture */}
      <div style={{ position: 'absolute', left: INPUT.x + 2, top: INPUT.y + 2, width: INPUT.w - 4, height: INPUT.h - 4, borderRadius: 5, background: '#fff', opacity: frame >= TYPE_START - 2 ? 1 : 0 }} />
      <div style={{ position: 'absolute', left: INPUT.x - 1, top: INPUT.y - 1, width: INPUT.w + 2, height: INPUT.h + 2, borderRadius: 7, boxSizing: 'border-box', border: `1px solid ${rgba(0.85)}`, boxShadow: `0 0 0 3px ${rgba(0.16)}`, opacity: focus }} />
      <div style={{ position: 'absolute', left: INPUT.x + 13, top: INPUT.y, height: INPUT.h, display: 'flex', alignItems: 'center', fontFamily: T.font, fontSize: 14, color: T.ink, whiteSpace: 'nowrap' }}>
        <span>{frame >= TYPE_START - 2 ? QUERY.slice(0, typedCount) : ''}</span>
        {caretOn ? <span style={{ display: 'inline-block', width: 1.5, height: 17, marginLeft: 1, borderRadius: 1, background: T.accent }} /> : null}
      </div>
      {/* the real "group picked" state: group path, generated code, pre-filled attribute template */}
      {/* always mounted so the <Img> has loaded (the renderer waits for it) before the dissolve */ true && (
        <div style={{ position: 'absolute', left: 1472, top: 0, width: 448, height: 1080, opacity: swap, overflow: 'hidden', visibility: swap > 0 ? 'visible' : 'hidden' }}>
          <Img src={staticFile('textures/drawer-filled@3x.png')} style={{ position: 'absolute', left: -1472, top: 0, width: 1920, height: 1080 }} />
        </div>
      )}
      {/* one accent ring on the generated code (the shot's single highlight) */}
      <div style={{ position: 'absolute', left: CODE.x - 3, top: CODE.y - 3, width: CODE.w + 6, height: CODE.h + 6, borderRadius: 9, boxSizing: 'border-box', border: `2px solid ${T.accent}`, boxShadow: `0 0 0 4px ${rgba(0.12)}`, opacity: codeRing, zIndex: 3 }} />
      <Ripple frame={frame} at={CLICK1} c={SEL_C} />
      <Outline frame={frame} at={CLICK1} b={SEL} />
      <Ripple frame={frame} at={CLICK2} c={SAVE_C} />
      <Outline frame={frame} at={CLICK2} b={SAVE} />
      <Pointer frame={frame} zoom={zoomAt(CAM_KEYS, frame)} p={ptr} o={ptrO} press={frame < PULL ? press(CLICK1) : press(CLICK2)} />
    </PageCam2D>
  );
};

const Saved: React.FC = () => {
  const frame = useCurrentFrame();
  const tint = interpolate(frame, [6, 18], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <PageCam2D src="textures/saved@2x.png" pageH={1080} keys={SAVED_KEYS} bg="#fff">
      <div
        style={{
          position: 'absolute', left: ROW.x + 2, top: ROW.y + 2, width: ROW.w - 4, height: ROW.h - 4, borderRadius: 8, opacity: tint,
          background: `linear-gradient(90deg, ${rgba(0.11)} 0%, ${rgba(0.05)} 60%, ${rgba(0.03)} 100%)`, boxShadow: `inset 0 0 0 1px ${rgba(0.28)}`,
        }}
      />
    </PageCam2D>
  );
};

export const CreateRequest: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#fff' }}>
    <Sequence durationInFrames={CREATE_CUT}><Form /></Sequence>
    <Sequence from={CREATE_CUT}><Saved /></Sequence>
  </AbsoluteFill>
);
