import { defineWidget, useTime } from '../../sdk/index.js';
import './widget.css';

function Focus({ config, update }) {
  const now = useTime(1000);
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const duration = Math.floor(Math.max(1, Math.min(120, finite(config.minutes, 25)))) * 60;
  const end = Math.max(0, finite(config.ends));
  const paused = Math.ceil(Math.max(0, Math.min(7200, finite(config.remaining))));
  const tally = Math.max(0, Math.floor(finite(config.tally)));
  const running = config.state === 'running' && end > 0;
  const waiting = config.state === 'paused';
  const seconds = running ? Math.max(0, Math.ceil((end - now) / 1000)) : waiting ? paused : duration;
  const complete = (running || waiting) && seconds <= 0;
  const active = running || waiting;
  const display = `${Math.floor(seconds / 60)}:${String(Math.ceil(seconds % 60)).padStart(2, '0')}`;
  const start = () => update?.({ state: 'running', ends: Date.now() + (waiting ? paused : duration) * 1000, remaining: 0 });
  const pause = () => {
    const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    update?.({ state: 'paused', remaining: left, ends: 0 });
  };
  const finish = () => update?.({ state: 'idle', ends: 0, remaining: 0, tally: tally + 1 });
  return <div className={`w-focus-timer ${complete ? 'w-focus-timer-done' : ''}`}>
    <header><b>Focus together</b><span>{tally} finished</span></header>
    <div className="w-focus-timer-clock" role="timer" aria-label={`${Math.floor(seconds / 60)} minutes ${Math.ceil(seconds % 60)} seconds`}>
      {display}
    </div>
    <p>{complete ? 'One good session. Make it count.' : running ? 'One thing at a time.' : waiting ? 'Take a breath. Your place is saved.' : 'A little room for deep work.'}</p>
    <div className="w-focus-timer-actions">
      {complete ? <button type="button" onClick={finish}>Count session ✓</button>
        : running ? <button type="button" onClick={pause}>Pause</button>
          : <button type="button" onClick={start}>{waiting ? 'Resume' : 'Start focus'}</button>}
      {active && !complete && <button type="button" className="w-focus-timer-reset"
        onClick={() => update?.({ state: 'idle', ends: 0, remaining: 0 })}>Reset</button>}
    </div>
    <small>Room-visible focus tally</small>
  </div>;
}

export default defineWidget({
  id: 'focus-timer', name: 'Focus together', about: 'A saved focus timer with a room-visible tally of finished sessions.',
  fields: {
    minutes: { type: 'number', label: 'Next session (minutes)', min: 1, max: 120, default: 25 },
    state: { type: 'choice', label: 'Timer state (saved)', options: [['idle', 'Ready'], ['running', 'Running'], ['paused', 'Paused']], default: 'idle', hidden: true },
    ends: { type: 'number', label: 'End timestamp (saved)', min: 0, default: 0, hidden: true },
    remaining: { type: 'number', label: 'Paused seconds (saved)', min: 0, max: 7200, default: 0, hidden: true },
    tally: { type: 'number', label: 'Finished sessions (saved)', min: 0, default: 0, hidden: true },
  },
  View: Focus,
});
