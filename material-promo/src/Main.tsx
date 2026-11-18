// Timeline — SHOTS is the single source of truth; captions, flash cuts and SFX derive from it.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from 'remotion';
import { Open, OPEN_DURATION } from './scenes/Open';
import { Crane, CRANE_DURATION } from './scenes/Crane';
import { TitleCard, TITLE_CARD_DURATION, TitleWord } from './scenes/TitleCard';
import { CreateRequest, CREATE_DURATION } from './scenes/CreateRequest';
import { DeptTasks, DEPT_DURATION } from './scenes/DeptTasks';
import { Outro, OUTRO_DURATION } from './scenes/Outro';
import { Caption } from './Caption';
import { FlashCut } from './FlashCut';

const ORDER = [
  ['open', OPEN_DURATION],
  ['queue', CRANE_DURATION],
  ['card1', TITLE_CARD_DURATION],
  ['create', CREATE_DURATION],
  ['card2', TITLE_CARD_DURATION],
  ['tasks', DEPT_DURATION],
  ['outro', OUTRO_DURATION],
] as const;
type ShotId = (typeof ORDER)[number][0];
export const SHOTS = (() => {
  let at = 0;
  const out = {} as Record<ShotId, { from: number; duration: number }>;
  for (const [id, d] of ORDER) {
    out[id] = { from: at, duration: d };
    at += d;
  }
  return out;
})();
export const TOTAL = Object.values(SHOTS).reduce((a, s) => a + s.duration, 0);

export const TITLE_CARDS: Record<'card1' | 'card2', TitleWord[]> = {
  card1: [{ text: 'New' }, { text: 'material?', br: true }, { text: 'Request' }, { text: 'it' }, { text: 'in' }, { text: 'seconds.', accent: true }],
  card2: [{ text: 'Every' }, { text: 'department,', br: true }, { text: 'one' }, { text: 'material', accent: true }, { text: 'record.', accent: true }],
};

export const CAPTIONS: { from: number; duration: number; text: string; offsetX?: number; bottom?: number }[] = [
  { from: SHOTS.queue.from + 98, duration: 67, text: 'Priority, status and data completion at a glance', bottom: 170 },
  { from: SHOTS.create.from + 22, duration: 112, text: 'Material codes are generated from the group', offsetX: -224 },
  { from: SHOTS.tasks.from + 62, duration: 58, text: 'Overdue tasks surface before they block production', bottom: 40 },
];

// flash cut straddles the hard cut: from = cut − 5, 10f
export const FLASH_CUTS = [SHOTS.card2.from - 5];

export type Sfx = { from: number; src: string; volume: number; duration?: number; note: string };
export const SFX: Sfx[] = [];
// House Vibez starts calm and builds ~18s in, which lands on the department-tasks shot.
export const BGM = { src: 'audio/bgm/house-vibez.mp3', volume: 0.42 } as { src: string; volume: number } | null;

export const MaterialPromo: React.FC<{ bgm?: boolean }> = ({ bgm = true }) => (
  <AbsoluteFill style={{ background: '#fff' }}>
    <Sequence from={SHOTS.open.from} durationInFrames={SHOTS.open.duration}><Open /></Sequence>
    <Sequence from={SHOTS.queue.from} durationInFrames={SHOTS.queue.duration}><Crane /></Sequence>
    <Sequence from={SHOTS.card1.from} durationInFrames={SHOTS.card1.duration}><TitleCard words={TITLE_CARDS.card1} /></Sequence>
    <Sequence from={SHOTS.create.from} durationInFrames={SHOTS.create.duration}><CreateRequest /></Sequence>
    <Sequence from={SHOTS.card2.from} durationInFrames={SHOTS.card2.duration}><TitleCard words={TITLE_CARDS.card2} /></Sequence>
    <Sequence from={SHOTS.tasks.from} durationInFrames={SHOTS.tasks.duration}><DeptTasks /></Sequence>
    <Sequence from={SHOTS.outro.from} durationInFrames={SHOTS.outro.duration}><Outro /></Sequence>
    {CAPTIONS.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={c.duration}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${c.offsetX ?? 0}px)` }}>
          <Caption text={c.text} duration={c.duration} bottom={c.bottom} />
        </div>
      </Sequence>
    ))}
    {FLASH_CUTS.map((f, i) => (
      <Sequence key={i} from={f} durationInFrames={10}><FlashCut /></Sequence>
    ))}
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.duration}>
        <Audio src={staticFile(s.src)} volume={s.volume} />
      </Sequence>
    ))}
    {bgm && BGM ? (
      <Audio
        src={staticFile(BGM.src)}
        volume={(f) => BGM!.volume * interpolate(f, [0, 15, TOTAL - 45, TOTAL - 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    ) : null}
  </AbsoluteFill>
);
