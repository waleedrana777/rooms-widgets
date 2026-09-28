import { COLORS } from './index.js';

// A widget's settings, drawn from its `fields` (Rooms and the preview use this).
// text:   { label, max, placeholder }
// lines:  { label, max, placeholder } — one item per line (checklists)
// number: { label, min, max }
// date:   { label }
// choice: { label, options: [[value, 'Label'], …] }
// color:  { label } — the eight Rooms colours
export default function Fields({ fields, value, onChange }) {
  return Object.entries(fields).map(([key, field]) => {
    const set = next => onChange({ [key]: next });
    const current = value[key] ?? field.default ?? '';
    if (field.type === 'choice') return <div key={key} className="wcf-seg" role="group" aria-label={field.label || key}>
      {field.options.map(([option, label]) => <button key={option} type="button" aria-pressed={current === option} onClick={() => set(option)}>{label}</button>)}
    </div>;
    if (field.type === 'color') return <div key={key} className="wcf-colors" role="group" aria-label={field.label || 'Colour'}>
      {Object.entries(COLORS).map(([name, hex]) => <button key={name} type="button" aria-label={name} aria-pressed={current === name} style={{ background: hex }} onClick={() => set(name)} />)}
    </div>;
    if (field.type === 'lines') return <label key={key}>{field.label || key}<textarea rows={4} maxLength={field.max || 400} placeholder={field.placeholder} value={current} onChange={event => set(event.target.value)} /></label>;
    const input = field.type === 'number'
      ? <input type="number" min={field.min} max={field.max} value={current} onChange={event => set(event.target.value === '' ? '' : Number(event.target.value))} />
      : <input type={field.type === 'date' ? 'date' : 'text'} maxLength={field.max || 60} placeholder={field.placeholder} value={current} onChange={event => set(event.target.value)} />;
    return <label key={key}>{field.label || key}{input}</label>;
  });
}
