import { accent, defineWidget } from '../../sdk/index.js';
import './widget.css';

// A checklist you tick right on the sticker. Items come from settings (one per
// line); ticks are saved with update(), so the room sees your progress.
function Checklist({ config, update }) {
  const items = String(config.items || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 8);
  const done = new Set(String(config.done || '').split(',').filter(Boolean).map(Number));
  const toggle = i => {
    const next = new Set(done);
    if (next.has(i)) next.delete(i); else next.add(i);
    update?.({ done: [...next].sort((a, b) => a - b).join(',') });
  };
  const count = items.filter((_, i) => done.has(i)).length;
  return <div className="w-checklist" style={{ '--w': accent(config.color) }}>
    <header><b>{config.title || 'Checklist'}</b><small>{count}/{items.length}</small></header>
    <ul>{items.map((item, i) => <li key={`${i}${item}`}>
      <button type="button" className={done.has(i) ? 'w-checklist-on' : ''} aria-pressed={done.has(i)} onClick={() => toggle(i)}>
        <i aria-hidden="true" />{item}
      </button>
    </li>)}</ul>
    {items.length > 0 && count === items.length && <p className="w-checklist-all">All done</p>}
  </div>;
}

export default defineWidget({
  id: 'checklist',
  name: 'Checklist',
  about: 'Tick things off right on the sticker. Everyone sees how far you got.',
  fields: {
    title: { type: 'text', label: 'Title', max: 24, default: 'Today' },
    items: { type: 'lines', label: 'Items, one per line', max: 300, default: 'Glass of water\nSketch for 20 min\nPost progress' },
    done: { type: 'text', label: 'Ticked (saved for you)', max: 40, default: '' },
    color: { type: 'color', default: 'black' },
  },
  View: Checklist,
});
