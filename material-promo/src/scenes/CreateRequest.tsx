// Shot 4 — type-and-filter, typing + click half (adapted from demos/interaction/type-and-filter/TypeAndFilter.tsx).
// Kept: PageCam2D with the same ease, 3f per character (the "unhurried" settled value), caret solid while typing then
// an 8f blink, focus ring lit 6f before typing, a breath before the camera pulls back to the full view, macOS pointer
// in page space at constant screen size sliding on a slight arc, double concentric ripple (3f apart, 10f each,
// 14→54/78), lit outline concentric with the clicked control, 16f push-in to hand off under a flash cut.
// Changed: the target is the real "Add New Material" drawer (3× capture); we type a material name into the real input
// (white patch over its placeholder), then click Submit instead of filtering a grid (the drawer has no grid).
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { PageCam2D, CamKey2D } from '../fx/PageCam2D';
import { T } from '../tokens';
import layout from '../../public/layout.json';

export const CREATE_DURATION = 140;

const QUERY = 'Copper Busbar 100×10mm';
const TYPE_START = 10;
const TYPE_END = TYPE_START + QUERY.length * 3;
const CLICK = 116;

const INPUT = layout.drawer.nameInput;
const SUBMIT = layout.drawer.submit;
const CLICK_C = { x: SUBMIT.x + SUBMIT.w / 2, y: SUBMIT.y + SUBMIT.h / 2 };

const CAM_KEYS: CamKey2D[] = [
  { frame: 0, cx: 1520, cy: 225, zoom: 2.4 }, // typing close-up: drawer title, label and field; type ≈ 34px on screen
  { frame: TYPE_END + 11, cx: 1520, cy: 225, zoom: 2.4 },
  { frame: TYPE_END + 27, cx: 960, cy: 540, zoom: 1.0 }, // breath, then the whole page with the drawer
  { frame: CLICK + 2, cx: 960, cy: 540, zoom: 1.0 },
  { frame: CLICK + 18, cx: 1484, cy: 835, zoom: 2.2 }, // push toward Submit, handed off under the flash cut
];
const CAM_EASE = Easing.bezier(0.33, 0, 0.15, 1);
const camZoom = (f: number) => {
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    const a = CAM_KEYS[i];
    const b = CAM_KEYS[i + 1];
    if (f >= a.frame && f <= b.frame) {
      const t = interpolate(f, [a.frame, b.frame], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: CAM_EASE });
      return a.zoom + (b.zoom - a.zoom) * t;
    }
  }
  return f < CAM_KEYS[0].frame ? CAM_KEYS[0].zoom : CAM_KEYS[CAM_KEYS.length - 1].zoom;
};

const PTR_IN = CLICK - 18;
const PTR_FROM = { x: 1640, y: 300 };
const ptrAt = (f: number) => {
  const t = interpolate(f, [PTR_IN + 2, CLICK - 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.45, 0, 0.2, 1) });
  const arc = Math.sin(t * Math.PI) * -60;
  return { x: PTR_FROM.x + (CLICK_C.x - PTR_FROM.x) * t + arc, y: PTR_FROM.y + (CLICK_C.y - PTR_FROM.y) * t };
};
const rgba = (a: number) => `rgba(${T.accentRgb},${a})`;

export const CreateRequest: React.FC = () => {
  const frame = useCurrentFrame();
  const typedCount = frame < TYPE_START ? 0 : Math.min(QUERY.length, Math.floor((frame - TYPE_START) / 3) + 1);
  const caretOn =
    frame >= TYPE_START - 2 && frame <= CLICK + 9 &&
    (frame <= TYPE_END + 4 || Math.floor((frame - (TYPE_END + 4)) / 8) % 2 === 0);
  const focus = interpolate(frame, [TYPE_START - 6, TYPE_START - 2, CLICK, CLICK + 6], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const ptr = ptrAt(frame);
  const ptrO = interpolate(frame, [PTR_IN - 2, PTR_IN + 3, CLICK + 6, CLICK + 11], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ptrPress = interpolate(frame, [CLICK - 1, CLICK + 1, CLICK + 5], [1, 0.86, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ptrScale = (1 / camZoom(frame)) * ptrPress;

  return (
    <AbsoluteFill style={{ backgroundColor: '#fff' }}>
      <PageCam2D src="textures/drawer@3x.png" pageH={1080} keys={CAM_KEYS} bg="#fff">
        {/* white patch over the baked-in placeholder, inside the input's 1px border */}
        <div style={{ position: 'absolute', left: INPUT.x + 2, top: INPUT.y + 2, width: INPUT.w - 4, height: INPUT.h - 4, borderRadius: 5, background: '#fff', opacity: frame >= TYPE_START - 2 ? 1 : 0 }} />
        {/* focus ring: 1px accent border + 3px soft ring, same 6px radius as the control */}
        <div
          style={{
            position: 'absolute', left: INPUT.x - 1, top: INPUT.y - 1, width: INPUT.w + 2, height: INPUT.h + 2, borderRadius: 7,
            boxSizing: 'border-box', border: `1px solid ${rgba(0.85)}`, boxShadow: `0 0 0 3px ${rgba(0.16)}`, opacity: focus,
          }}
        />
        <div
          style={{
            position: 'absolute', left: INPUT.x + 13, top: INPUT.y, height: INPUT.h, display: 'flex', alignItems: 'center',
            fontFamily: T.font, fontSize: 14, color: T.ink, whiteSpace: 'nowrap',
          }}
        >
          <span>{frame >= TYPE_START - 2 ? QUERY.slice(0, typedCount) : ''}</span>
          {caretOn ? <span style={{ display: 'inline-block', width: 1.5, height: 17, marginLeft: 1, borderRadius: 1, background: T.accent }} /> : null}
        </div>

        {/* click ripple: two concentric accent rings */}
        {[0, 1].map((r) => {
          const start = CLICK + r * 3;
          if (frame < start || frame > start + 10) return null;
          const t = interpolate(frame, [start, start + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
          const rad = interpolate(t, [0, 1], [14, r === 0 ? 54 : 78]);
          return (
            <div
              key={r}
              style={{
                position: 'absolute', left: CLICK_C.x - rad, top: CLICK_C.y - rad, width: rad * 2, height: rad * 2, borderRadius: '50%', boxSizing: 'border-box',
                border: `${r === 0 ? 2 : 1.5}px solid ${T.accent}`,
                background: r === 0 ? `radial-gradient(circle, ${rgba(0)} 55%, ${rgba(0.1)} 100%)` : undefined,
                opacity: 1 - t, zIndex: 5,
              }}
            />
          );
        })}
        {/* selected outline on Submit, concentric (6 + 4 radius) */}
        {frame >= CLICK + 2 ? (
          <div
            style={{
              position: 'absolute', left: SUBMIT.x - 4, top: SUBMIT.y - 4, width: SUBMIT.w + 8, height: SUBMIT.h + 8, borderRadius: 10, boxSizing: 'border-box',
              border: `2px solid ${T.accent}`, boxShadow: `0 0 0 4px ${rgba(0.1)}, 0 6px 22px -6px ${rgba(0.45)}`,
              opacity: interpolate(frame, [CLICK + 2, CLICK + 5], [0.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              transform: `scale(${interpolate(frame, [CLICK + 2, CLICK + 7], [1.03, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })})`,
              zIndex: 4,
            }}
          />
        ) : null}
        {/* pointer: page-space, inverse-scaled to a constant on-screen size */}
        {ptrO > 0.001 ? (
          <svg
            width={28} height={28} viewBox="0 0 28 28"
            style={{
              position: 'absolute', left: ptr.x - 2, top: ptr.y - 1, zIndex: 6, opacity: ptrO, overflow: 'visible', transformOrigin: '2px 1px',
              transform: `scale(${(ptrScale * 1.6).toFixed(4)})`,
              filter: 'drop-shadow(0 0.6px 0.6px rgba(2,6,23,0.35)) drop-shadow(0 3px 5px rgba(2,6,23,0.25))',
            }}
          >
            <path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill="#0f172a" stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="round" />
          </svg>
        ) : null}
      </PageCam2D>
    </AbsoluteFill>
  );
};
