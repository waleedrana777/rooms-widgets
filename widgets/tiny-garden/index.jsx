import { defineWidget, useTime } from '../../sdk/index.js';
import './widget.css';

function Garden({ config, update }) {
  const now = useTime(1000);
  const date = new Date(now);
  const day = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const saved = Number(config.watered);
  const valid = Number.isFinite(saved) && saved > 0 && saved <= now + 1000;
  const previous = new Date(valid ? saved : now);
  const ordinal = value => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / 86400000;
  const missed = valid ? Math.max(0, ordinal(date) - ordinal(previous)) : 0;
  const done = config.day === day;
  const wilted = !done && valid && missed >= 2;
  const count = Math.max(0, Math.min(9999, Math.floor(Number(config.growth) || 0)));
  const leaves = count >= 7 ? 3 : count >= 3 ? 2 : 1;
  const care = () => update?.({ day, watered: Date.now(), growth: Math.min(9999, count + 1) });
  return <div className={`w-tiny-garden ${wilted ? 'w-tiny-garden-wilted' : ''}`}>
    <b>{config.name || 'Our little garden'}</b>
    <div className="w-tiny-garden-plant" aria-hidden="true">
      <div className="w-tiny-garden-stem">
        {Array.from({ length: leaves }, (_, i) => <div className="w-tiny-garden-pair" key={i} style={{ bottom: `${12 + i * 19}px` }}><i /><i /></div>)}
      </div>
      <div className="w-tiny-garden-pot"><span>· ◡ ·</span></div>
    </div>
    <strong>{wilted ? 'Missing your company' : done ? 'A little more alive' : count ? 'Hello again, friend' : 'A tiny beginning'}</strong>
    <p>{count} {count === 1 ? 'day' : 'days'} of care · virtual plant</p>
    <button type="button" disabled={done} onClick={care}>{done ? 'Checked in today ✓' : 'Give a little care +'}</button>
    <small>{done ? 'Come back tomorrow.' : 'One check-in a day helps it grow.'}</small>
  </div>;
}

export default defineWidget({
  id: 'tiny-garden', name: 'Tiny garden', about: 'A virtual plant that grows with daily check-ins and droops when you are away.',
  fields: {
    name: { type: 'text', label: 'Garden name', max: 26, default: 'Our little garden' },
    day: { type: 'text', label: 'Last check-in day (saved)', max: 12, default: '', hidden: true },
    watered: { type: 'number', label: 'Last check-in timestamp (saved)', min: 0, default: 0, hidden: true },
    growth: { type: 'number', label: 'Days of care (saved)', min: 0, max: 9999, default: 0, hidden: true },
  },
  View: Garden,
});
