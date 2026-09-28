import { defineWidget, useTime } from '../../sdk/index.js';
import './widget.css';

// Tonight's moon, worked out from the date alone (no network).
const MONTH = 29.530588853; // days from new moon to new moon
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // a known new moon
const NAMES = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];

function phaseAt(time) {
  const days = (time - NEW_MOON) / 86_400_000;
  return ((days % MONTH) + MONTH) % MONTH / MONTH; // 0 new → .5 full → 1 new
}

// The lit part: half a disc on the lit side, closed by the terminator ellipse.
function litPath(phase) {
  const k = Math.cos(2 * Math.PI * phase); // 1 new, 0 half, -1 full
  const rx = (40 * Math.abs(k)).toFixed(2);
  const waxing = phase < 0.5;
  const crescent = k > 0;
  const edge = waxing ? 'A40 40 0 0 1 50 90' : 'A40 40 0 0 0 50 90';
  const sweep = waxing === crescent ? 0 : 1;
  return `M50 10 ${edge} A${rx} 40 0 0 ${sweep} 50 10z`;
}

function Moon({ config }) {
  const now = useTime(3_600_000);
  const phase = phaseAt(now);
  const name = NAMES[Math.round(phase * 8) % 8];
  const toFull = Math.round(((0.5 - phase + 1) % 1) * MONTH);
  const night = config.sky === 'night';
  return <div className={`w-moon ${night ? 'w-moon-night' : ''}`}>
    <svg viewBox="0 0 100 100" role="img" aria-label={name}>
      {night && <g className="w-moon-stars"><circle cx="12" cy="18" r="1.6" /><circle cx="88" cy="26" r="1.2" /><circle cx="84" cy="84" r="1.5" /></g>}
      <circle cx="50" cy="50" r="40" className="w-moon-dark" />
      <path d={litPath(phase)} className="w-moon-lit" />
    </svg>
    <b>{name}</b>
    <small>{toFull === 0 ? 'Full tonight' : `Full in ${toFull} ${toFull === 1 ? 'day' : 'days'}`}</small>
  </div>;
}

export default defineWidget({
  id: 'moon',
  name: 'Moon',
  about: 'Tonight’s moon and how long until it’s full.',
  fields: {
    sky: { type: 'choice', label: 'Sky', options: [['night', 'Night'], ['paper', 'Paper']], default: 'night' },
  },
  View: Moon,
});
