import { defineWidget } from '../../sdk/index.js';
import './widget.css';

const MOODS = [
  ['clear', 'Clear', 'A little energy to share. Say hello.'],
  ['cloudy', 'Cloudy', 'Keep it gentle. One small thing is enough.'],
  ['rain', 'Rainy', 'A quiet moment and some company.'],
  ['breeze', 'Breezy', 'Make space for a fresh idea.'],
];

function Weather({ config, update }) {
  const mood = MOODS.find(item => item[0] === config.mood) || MOODS[0];
  return <div className={`w-room-weather w-room-weather-${mood[0]}`}>
    <b>{config.title || 'My inner weather'}</b>
    <svg viewBox="0 0 120 76" role="img" aria-label={mood[1]}>
      <circle className="w-room-weather-sun" cx="60" cy="32" r="21" />
      {mood[0] !== 'clear' && <path className="w-room-weather-cloud" d="M30 53a13 13 0 0 1 0-26 23 23 0 0 1 43-6 17 17 0 1 1 11 32Z" />}
      {mood[0] === 'rain' && <path className="w-room-weather-lines" d="m40 61-4 8m25-8-4 8m25-8-4 8" />}
      {mood[0] === 'breeze' && <path className="w-room-weather-lines" d="M23 61h58q15 0 9-8M36 69h30" />}
    </svg>
    <strong>{mood[1]}</strong><p>{mood[2]}</p>
    <div className="w-room-weather-picks" role="group" aria-label="Choose your mood">
      {MOODS.map(([key, label]) => <button type="button" key={key} aria-pressed={mood[0] === key}
        onClick={() => update?.({ mood: key })}>{label}</button>)}
    </div>
  </div>;
}

export default defineWidget({
  id: 'room-weather', name: 'Inner weather', about: 'Set a small, visible mood signal for the room.',
  fields: {
    title: { type: 'text', label: 'Title', max: 26, default: 'My inner weather' },
    mood: { type: 'choice', label: 'Weather', options: MOODS.map(([key, label]) => [key, label]), default: 'clear' },
  },
  View: Weather,
});
