import { useState } from 'react';
import { defineWidget, useTime } from '../../sdk/index.js';
import './widget.css';

// Days till a date you pick right on the sticker: tap the date to change it.
const DAY = 86_400_000;

function DaysTill({ config, update }) {
  const now = useTime(60_000);
  const [picking, setPicking] = useState(false);
  const target = new Date(`${config.date}T00:00:00`).getTime();
  const days = Number.isFinite(target) ? Math.ceil((target - now) / DAY) : null;
  const label = days == null ? 'Pick a date' : days > 1 ? 'days to go' : days === 1 ? 'day to go' : days === 0 ? 'It’s today' : `${-days} days ago`;
  const pretty = Number.isFinite(target) ? new Date(target).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  return <div className="w-days-till">
    <small>{config.title || 'Days till'}</small>
    <b>{days == null ? '?' : Math.abs(days)}</b>
    <span>{label}</span>
    {picking && update
      ? <input type="date" className="w-days-till-pick" defaultValue={config.date} aria-label="Pick a date" autoFocus
        onChange={event => { if (event.target.value) { update({ date: event.target.value }); setPicking(false); } }} onBlur={() => setPicking(false)} />
      : <button type="button" className="w-days-till-date" onClick={() => setPicking(true)} disabled={!update}>{pretty || 'Set a date'}</button>}
  </div>;
}

export default defineWidget({
  id: 'days-till',
  name: 'Days till',
  about: 'How many days until the date you pick. Tap the date to change it.',
  fields: {
    title: { type: 'text', label: 'Till what', max: 20, default: 'Summer trip' },
    date: { type: 'date', label: 'Date', default: '2026-12-24' },
  },
  View: DaysTill,
});
