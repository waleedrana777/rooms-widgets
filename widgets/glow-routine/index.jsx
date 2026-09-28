import { defineWidget, useTime } from '../../sdk/index.js';
import './widget.css';

// A self-care routine, morning or night: tick the steps, the dewdrop fills,
// and finishing on consecutive days keeps a little glow streak.
const DAY = 86_400_000;
const dayOf = t => new Date(t).toISOString().slice(0, 10);

function GlowRoutine({ config, update }) {
  const now = useTime(60_000);
  const today = dayOf(now);
  const night = config.time === 'pm';
  const steps = String(night ? config.pm : config.am || '').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 6);
  const done = new Set(config.day === today ? String(config.done || '').split(',').filter(Boolean).map(Number) : []);
  const finished = steps.length > 0 && steps.every((_, i) => done.has(i));
  const streak = Number(config.streak) || 0;
  const toggle = i => {
    const next = new Set(done);
    if (next.has(i)) next.delete(i); else next.add(i);
    const all = steps.every((_, k) => next.has(k));
    const kept = all && !finished ? (config.last === dayOf(now - DAY) ? streak + 1 : config.last === today ? streak : 1) : streak;
    update?.({ day: today, done: [...next].join(','), ...(all && !finished ? { streak: kept, last: today } : {}) });
  };
  const fill = steps.length ? done.size / steps.length : 0;
  return <div className={`w-glow-routine ${night ? 'w-glow-routine-pm' : ''}`} style={{ '--fill': fill }}>
    <header><b>{night ? 'Night glow' : 'Morning glow'}</b><span className="w-glow-routine-drop" aria-hidden="true"><i /></span></header>
    <ul>{steps.map((step, i) => <li key={`${i}${step}`}>
      <button type="button" aria-pressed={done.has(i)} onClick={() => toggle(i)}><i aria-hidden="true" />{step}</button>
    </li>)}</ul>
    <footer>{finished ? 'Glowing ✨' : `${done.size} of ${steps.length}`}{streak > 0 && <span> · {streak}-day glow</span>}</footer>
  </div>;
}

export default defineWidget({
  id: 'glow-routine',
  name: 'Glow routine',
  about: 'Your skincare or self-care steps, morning or night. Tick them off and keep your glow streak.',
  fields: {
    time: { type: 'choice', label: 'When', options: [['am', 'Morning'], ['pm', 'Night']], default: 'am' },
    am: { type: 'lines', label: 'Morning steps', max: 200, default: 'Cleanse\nVitamin C\nMoisturise\nSPF' },
    pm: { type: 'lines', label: 'Night steps', max: 200, default: 'Remove makeup\nCleanse\nSerum\nLip balm' },
    day: { type: 'text', label: 'Day (saved)', max: 12, default: '', hidden: true },
    done: { type: 'text', label: 'Done (saved)', max: 20, default: '', hidden: true },
    streak: { type: 'number', label: 'Streak (saved)', min: 0, default: 0, hidden: true },
    last: { type: 'text', label: 'Last full day (saved)', max: 12, default: '', hidden: true },
  },
  View: GlowRoutine,
});
