import { accent, defineWidget, useTime } from '../../sdk/index.js';
import './widget.css';

// Days until something good, on a ticket stub. No network.
const DAY = 86_400_000;

function Countdown({ config }) {
  const now = useTime(60_000);
  const target = new Date(`${config.date}T00:00:00`).getTime();
  const days = Number.isFinite(target) ? Math.ceil((target - now) / DAY) : null;
  const here = days != null && days <= 0;
  return <div className="w-countdown" style={{ '--w': accent(config.color) }}>
    <b>{days == null ? '?' : here ? '🎉' : days}</b>
    <small>{days == null ? 'Pick a date' : here ? `${config.title || 'It'} is here` : `${days === 1 ? 'day' : 'days'} to ${config.title || 'go'}`}</small>
  </div>;
}

export default defineWidget({
  id: 'countdown',
  name: 'Countdown',
  about: 'Days until something good: a launch, a trip, a birthday.',
  fields: {
    title: { type: 'text', label: 'Until', max: 18, placeholder: 'Launch day', default: 'Launch' },
    date: { type: 'date', label: 'Date', default: '2026-12-31' },
    color: { type: 'color', default: 'pink' },
  },
  View: Countdown,
});
