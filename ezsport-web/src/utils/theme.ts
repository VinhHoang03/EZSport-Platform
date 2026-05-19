import React from 'react';

// ─── PALETTE ────────────────────────────────────────────────────────────────
export const G = '#1a6b3c';   // Forest Green
export const GL = '#22c55e';  // Green Light (pulse)
export const GD = '#0f3d22';  // Green Dark
export const OG = '#c2632a';  // Clay Orange
export const W = '#ffffff';
export const SL = '#f8fafc';  // slate-50
export const TX = '#0f172a';  // text
export const TX2 = '#64748b'; // text muted

// ─── GLASS STYLES ───────────────────────────────────────────────────────────
export const glass = (strong = false): React.CSSProperties => ({
  background: strong ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)',
  backdropFilter: `blur(${strong ? 40 : 12}px)`,
  WebkitBackdropFilter: `blur(${strong ? 40 : 12}px)`,
  border: '1px solid rgba(255,255,255,0.35)',
  boxShadow: strong
    ? '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.4)'
    : '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)',
});
