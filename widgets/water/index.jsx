import { defineWidget, useTime } from '../../sdk/index.js';
import './widget.css';

function Water({ config, update }) {
  const now = new Date(useTime(1000));
  const day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const goal = Math.max(1, Math.min(30, Math.floor(Number(config.goal) || 8)));
  const count = config.day === day ? Math.max(0, Math.min(99, Math.floor(Number(config.count) || 0))) : 0;
  const save = value => update?.({ day, count: value });
  return <div className="w-water">
    <header><b>Water break</b><small>Today's glasses</small></header>
    <div className="w-water-glass" aria-hidden="true">
      <div className="w-water-fill" style={{ height: `${Math.min(100, count / goal * 100)}%` }} />
      <span>{count}</span>
    </div>
    <p>{count >= goal ? 'Goal reached. Nice work!' : `${count} of ${goal} glasses`}</p>
    <div className="w-water-actions">
      <button type="button" disabled={!count} onClick={() => save(count - 1)} aria-label="Undo one glass">−</button>
      <button type="button" disabled={count >= 99} onClick={() => save(count + 1)}>Had a glass +</button>
    </div>
  </div>;
}

export default defineWidget({
  id: 'water', name: 'Water break', about: 'A room-visible daily glass log. Set your own goal.',
  fields: {
    goal: { type: 'number', label: 'Daily goal (glasses)', min: 1, max: 30, default: 8 },
    day: { type: 'text', label: 'Logged day (saved)', max: 12, default: '', hidden: true },
    count: { type: 'number', label: 'Glasses (saved)', min: 0, max: 99, default: 0, hidden: true },
  },
  View: Water,
});
