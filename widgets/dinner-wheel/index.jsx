import { defineWidget } from '../../sdk/index.js';
import './widget.css';

function Dinner({ config, update }) {
  const names = String(config.names || '').split('\n').map(name => name.trim()).filter(Boolean).slice(0, 12);
  const raw = Number.isFinite(Number(config.turn)) ? Math.trunc(Number(config.turn)) : 0;
  const turn = names.length ? ((raw % names.length) + names.length) % names.length : 0;
  const move = delta => update?.({ turn: (turn + delta + names.length) % names.length });
  return <div className="w-dinner-wheel">
    <b>Who's cooking?</b>
    <div className="w-dinner-wheel-plate">
      <small>ON THE MENU</small><strong>{names[turn] || 'Your crew'}</strong>
    </div>
    <p>{names.length > 1 ? `Next: ${names[(turn + 1) % names.length]}` : names.length ? 'A table for one counts, too.' : 'Add names in settings to begin.'}</p>
    <div className="w-dinner-wheel-actions">
      <button type="button" disabled={names.length < 2} onClick={() => move(-1)} aria-label="Previous cook">←</button>
      <button type="button" disabled={names.length < 2} onClick={() => move(1)}>Pass the apron →</button>
    </div>
  </div>;
}

export default defineWidget({
  id: 'dinner-wheel', name: 'Pass the apron', about: 'A fair, visible cooking rotation for your crew.',
  fields: {
    names: { type: 'lines', label: 'Cooks, one display name per line (up to 12)', max: 240, default: 'Alex\nSam\nJo' },
    turn: { type: 'number', label: 'Turn (saved)', min: 0, max: 11, default: 0, hidden: true },
  },
  View: Dinner,
});
