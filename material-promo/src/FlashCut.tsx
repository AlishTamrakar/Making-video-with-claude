// origin: video-shotcraft assets/lib/FlashCut.tsx — re-tinted to the product's cool white.
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const FlashCut: React.FC<{ duration?: number }> = ({ duration = 10 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, duration * 0.4, duration], [0, 0.85, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none', opacity: o,
        background: 'radial-gradient(ellipse at 50% 45%, rgba(250,252,255,0.98), rgba(240,247,255,0.6) 55%, transparent 80%)',
      }}
    />
  );
};
