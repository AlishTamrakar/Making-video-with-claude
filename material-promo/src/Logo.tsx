// The prototype's own cube logo (from the rail), with an optional "inner" beat for the outro bloom.
import React from 'react';
import { T } from './tokens';

export const CubeLogo: React.FC<{ size: number; inner?: number; style?: React.CSSProperties }> = ({ size, inner = 1, style }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
    <path d="M20 3 35 11.5 20 20 5 11.5Z" fill={T.logo.top} />
    <path d="M5 11.5 20 20v17L5 28.5Z" fill={T.logo.left} />
    <path d="M35 11.5 20 20v17l15-8.5Z" fill={T.logo.right} />
    <g style={{ transformOrigin: '20px 16.5px', transform: `translateY(${((1 - inner) * -7).toFixed(3)}px) scale(${(0.4 + 0.6 * inner).toFixed(4)})`, opacity: Math.min(1, inner * 1.6) }}>
      <path d="M20 12.5 27 16.5 20 20.5 13 16.5Z" fill={T.logo.inner} />
    </g>
  </svg>
);

// Sidebar "Material Creation Requests" icon (document + plus), stroked.
export const RequestIcon: React.FC<{ size: number; color?: string; stroke?: number }> = ({ size, color = T.logo.top, stroke = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" fill="#fff" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M9 15h6" />
    <path d="M12 18v-6" />
  </svg>
);
