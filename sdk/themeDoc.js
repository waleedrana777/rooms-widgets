// Room themes as data, not code: a small document of layers that Rooms'
// own renderer draws (ThemeDoc.jsx). Nothing in it can run. Validation keeps
// every value in range; anything unknown is dropped.
//
// { v: 1, base: '#fbfbf8', layers: [
//   { kind: 'gradient', from: '#eef5ff', to: '#fff7ec', angle: 160 },
//   { kind: 'dots', color: '#1d2433', size: 24, opacity: 0.12, drift: true },
//   { kind: 'grid', color: '#1877f2', size: 32, opacity: 0.08 },
//   { kind: 'blob', color: '#9be21c', x: 90, y: 85, r: 30, opacity: 0.25, breathe: true },
//   { kind: 'waves', color: '#6fb0f5', count: 3, opacity: 0.2 },
//   { kind: 'rain', color: '#c9d4e8', density: 30, opacity: 0.5 },
// ] }
const HEX = /^#[0-9a-f]{6}$/i;
const num = (v, lo, hi, dflt) => (Number.isFinite(Number(v)) ? Math.min(hi, Math.max(lo, Number(v))) : dflt);
const col = (v, dflt) => (HEX.test(String(v)) ? String(v) : dflt);

export function cleanThemeDoc(doc) {
  if (!doc || typeof doc !== 'object') return null;
  const layers = (Array.isArray(doc.layers) ? doc.layers : []).slice(0, 8).map(l => {
    switch (l?.kind) {
      case 'gradient': return { kind: 'gradient', from: col(l.from, '#ffffff'), to: col(l.to, '#f4f5f8'), angle: num(l.angle, 0, 360, 160) };
      case 'dots': return { kind: 'dots', color: col(l.color, '#1d2433'), size: num(l.size, 8, 80, 24), opacity: num(l.opacity, 0, 0.5, 0.12), drift: !!l.drift };
      case 'grid': return { kind: 'grid', color: col(l.color, '#1877f2'), size: num(l.size, 12, 120, 32), opacity: num(l.opacity, 0, 0.4, 0.08) };
      case 'blob': return { kind: 'blob', color: col(l.color, '#9be21c'), x: num(l.x, 0, 100, 50), y: num(l.y, 0, 100, 50), r: num(l.r, 5, 80, 30), opacity: num(l.opacity, 0, 0.6, 0.25), breathe: !!l.breathe };
      case 'waves': return { kind: 'waves', color: col(l.color, '#6fb0f5'), count: Math.round(num(l.count, 1, 5, 3)), opacity: num(l.opacity, 0, 0.5, 0.2) };
      case 'rain': return { kind: 'rain', color: col(l.color, '#c9d4e8'), density: Math.round(num(l.density, 5, 60, 30)), opacity: num(l.opacity, 0, 0.8, 0.5) };
      default: return null;
    }
  }).filter(Boolean);
  return { v: 1, base: col(doc.base, '#fbfbf8'), layers };
}
