// Shot 6 — row-embed (adapted from demos/ui-entrance/row-embed/RowEmbed.tsx).
// Kept: texture-crop flyers (backgroundImage of the real capture, never re-drawn), perspective translateY(−120·air)
// + rotateX(16°·air), fall ease bezier(.5,0,.8,.75) that still carries speed into the slot, scale 1.06→0.995 then a
// 4f press back to 1, vertical motion blur from velocity, page-colour patch + faint dashed slot until 2f after
// landing, contact shadow tightening as the row nears, 2px seam at the bottom edge spreading from the centre in 5f
// and fading over 8f, camera easing down + pushing in while the rows fall.
// Changed: six real department-task rows (cues 12/22/31/39/46/52 — gaps 10→6, still accelerating; last lands 64f,
// seam done 72f), seam in product blue, patch = the card's white, rows clipped to the card's inner edge, and a
// 48f hold after the rain for the caption.
import React from 'react';
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { PageCam2D, CamKey2D } from '../fx/PageCam2D';
import { T } from '../tokens';
import layout from '../../public/layout.json';

export const DEPT_DURATION = 130;

const card = layout.detail.card;
const CARD_R = card.x + card.w - 1;
const rows = layout.detail.rows.map((r) => ({ ...r, w: Math.min(r.w, CARD_R - r.x) }));
// The prototype's task table is wider than its card at 1920px: a truncated "Owner c…" action column spills over
// the card edge. Mask that strip (inside and just outside the card border) so it doesn't read as a broken layout.
const FLY_R = 1538; // falling rows are cropped here so they don't carry the overflow fragment
const OVERFLOW = { x0: 1538, x1: 1589, y0: rows[0].y - 46, y1: rows[rows.length - 1].y + rows[rows.length - 1].h };
const PAGE_BG = '#FFFFFF';
const src = staticFile('textures/detail@2x.png');

const CAM: CamKey2D[] = [
  { frame: 0, cx: 1325, cy: 395, zoom: 1.62 }, // card + activity rail; sheet title kept out of frame (no half-cut line)
  { frame: 72, cx: 1372, cy: 400, zoom: 1.75 }, // pan right + push; right edge pinned to the page edge
];
const CUES = [12, 22, 31, 39, 46, 52];
const FLY = 12;
const FLY_EASE = Easing.bezier(0.5, 0, 0.8, 0.75);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const airOf = (frame: number, cue: number) => 1 - interpolate(frame, [cue, cue + FLY], [0, 1], { ...clamp, easing: FLY_EASE });

export const DeptTasks: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <PageCam2D src="textures/detail@2x.png" pageH={1080} keys={CAM} bg={PAGE_BG}>
        <div style={{ position: 'absolute', left: OVERFLOW.x0, top: OVERFLOW.y0, width: CARD_R - OVERFLOW.x0 - 0.5, height: OVERFLOW.y1 - OVERFLOW.y0, background: '#fff' }} />
        <div style={{ position: 'absolute', left: CARD_R + 1.5, top: OVERFLOW.y0, width: OVERFLOW.x1 - CARD_R - 1.5, height: OVERFLOW.y1 - OVERFLOW.y0, background: '#fff' }} />
        {rows.map((r, i) => {
          const cue = CUES[i];
          const land = cue + FLY;
          const patchOpacity = interpolate(frame, [land, land + 2], [1, 0], clamp);
          const slotHint = interpolate(frame, [cue - 6, cue + 4], [0.55, 1], clamp);

          let flyer: React.ReactNode = null;
          let contact: React.ReactNode = null;
          if (frame >= cue && frame < land + 4) {
            const air = airOf(frame, cue);
            const p = 1 - air;
            const appear = interpolate(frame, [cue, cue + 3], [0, 1], clamp);
            const scale = frame < land ? 1.06 - 0.065 * p : interpolate(frame, [land, land + 4], [0.995, 1], { ...clamp, easing: Easing.out(Easing.quad) });
            const vy = 120 * (airOf(frame - 0.5, cue) - airOf(frame + 0.5, cue));
            const mb = frame < land ? Math.min(3.2, vy * 0.22) : 0;
            flyer = (
              <div
                style={{
                  position: 'absolute', left: r.x, top: r.y, width: FLY_R - r.x, height: r.h, opacity: appear, zIndex: 3,
                  transform: `perspective(900px) translateY(${(-120 * air).toFixed(2)}px) rotateX(${(16 * air).toFixed(3)}deg) scale(${scale.toFixed(4)})`,
                  filter: mb > 0.25 ? `url(#dept-mb-${i})` : undefined,
                }}
              >
                {mb > 0.25 && (
                  <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
                    <filter id={`dept-mb-${i}`} x="-5%" y="-30%" width="110%" height="160%">
                      <feGaussianBlur stdDeviation={`0 ${mb.toFixed(2)}`} />
                    </filter>
                  </svg>
                )}
                <div
                  style={{
                    position: 'absolute', inset: 0, borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff',
                    backgroundImage: `url(${src})`, backgroundSize: '1920px 1080px', backgroundPosition: `-${r.x}px -${r.y}px`,
                    boxShadow:
                      `inset 0 1px 0 rgba(255,255,255,${(0.9 * air).toFixed(3)}), ` +
                      `0 0 0 1px rgba(15,23,42,${(0.08 * air).toFixed(3)}), ` +
                      `0 ${(34 * air).toFixed(1)}px ${(64 * air).toFixed(1)}px -${(10 * air).toFixed(1)}px rgba(15,23,42,${(0.24 * air).toFixed(3)}), ` +
                      `0 ${(6 * air).toFixed(1)}px ${(14 * air).toFixed(1)}px rgba(15,23,42,${(0.1 * air).toFixed(3)})`,
                  }}
                />
              </div>
            );
            const near = interpolate(air, [0, 0.5], [1, 0], clamp);
            const contactOp = frame < land ? near * 0.5 : interpolate(frame, [land, land + 3], [0.5, 0], clamp);
            contact = (
              <div
                style={{
                  position: 'absolute', left: r.x + 10, top: r.y + 6, width: r.w - 20, height: r.h - 6, borderRadius: 10, zIndex: 2,
                  boxShadow: `0 ${(2 + 6 * air).toFixed(1)}px ${(6 + 18 * air).toFixed(1)}px rgba(15,23,42,${(0.22 * contactOp).toFixed(3)})`,
                }}
              />
            );
          }

          let seam: React.ReactNode = null;
          if (frame >= land && frame < land + 8) {
            const spread = interpolate(frame, [land, land + 5], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
            const seamOpacity = interpolate(frame, [land, land + 2, land + 8], [1, 1, 0], clamp);
            const seamW = r.w * spread;
            seam = (
              <div
                style={{
                  position: 'absolute', left: r.x + (r.w - seamW) / 2, top: r.y + r.h - 2, width: seamW, height: 2, borderRadius: 1,
                  background: `linear-gradient(90deg, rgba(${T.accentRgb},0) 0%, rgba(${T.accentRgb},0.9) 18%, #38BDF8 50%, rgba(${T.accentRgb},0.9) 82%, rgba(${T.accentRgb},0) 100%)`,
                  boxShadow: `0 0 7px rgba(${T.accentRgb},0.38)`, opacity: seamOpacity, zIndex: 4,
                }}
              />
            );
          }

          return (
            <React.Fragment key={i}>
              {patchOpacity > 0 ? (
                <div style={{ position: 'absolute', left: r.x - 8, top: r.y - 1, width: r.w + 8, height: r.h + 2, background: PAGE_BG, opacity: patchOpacity, zIndex: 1 }}>
                  <div
                    style={{
                      position: 'absolute', left: 8, top: 6, width: r.w - 8, height: r.h - 10, borderRadius: 8, boxSizing: 'border-box',
                      border: '1px dashed rgba(100,116,139,0.32)', background: 'rgba(100,116,139,0.025)', opacity: slotHint,
                    }}
                  />
                </div>
              ) : null}
              {contact}
              {flyer}
              {seam}
            </React.Fragment>
          );
        })}
      </PageCam2D>
      <AbsoluteFill style={{ pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 80% at 50% 45%, rgba(15,23,42,0) 60%, rgba(15,23,42,0.08) 100%)' }} />
    </AbsoluteFill>
  );
};
