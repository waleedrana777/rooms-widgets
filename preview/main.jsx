import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import widgets from '../widgets/index.js';
import Fields from '../sdk/Fields.jsx';
import './preview.css';

// The preview: every widget on dotted paper, the way Rooms shows stickers.
// Click one to open its settings card, exactly as people will in a room.
function Preview() {
  const [configs, setConfigs] = useState(() => Object.fromEntries(widgets.map(w => [w.id, { ...w.defaults }])));
  const [open, setOpen] = useState(widgets[0]?.id || null);
  const [small, setSmall] = useState(false);
  const widget = widgets.find(w => w.id === open);
  const set = patch => setConfigs(all => ({ ...all, [open]: { ...all[open], ...patch } }));
  return <main className="pv">
    <header className="pv-top">
      <b>Rooms widgets</b>
      <span>{widgets.length} widgets · click one to set it up</span>
      <label><input type="checkbox" checked={small} onChange={event => setSmall(event.target.checked)} /> Small size</label>
    </header>
    <section className={`pv-board ${small ? 'pv-small' : ''}`}>
      {widgets.map(w => <div key={w.id} role="button" tabIndex={0} className="pv-slot" aria-pressed={open === w.id} onClick={() => setOpen(w.id)}>
        <span className="wdg"><w.View config={configs[w.id]} update={patch => setConfigs(all => ({ ...all, [w.id]: { ...all[w.id], ...patch } }))} /></span>
        <small>{w.name}</small>
      </div>)}
    </section>
    {widget && <aside className="wcf">
      <header><strong>{widget.name}</strong><small>{widget.about}</small></header>
      <Fields fields={widget.fields} value={configs[open]} onChange={set} />
      <div className="wcf-preview"><span className="wdg"><widget.View config={configs[open]} update={set} /></span></div>
      <pre>{JSON.stringify(configs[open], null, 1)}</pre>
    </aside>}
  </main>;
}

createRoot(document.getElementById('root')).render(<StrictMode><Preview /></StrictMode>);
