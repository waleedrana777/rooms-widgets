import { defineWidget } from '../../sdk/index.js';
import './widget.css';

function Bill({ config, update }) {
  const bounded = (value, fallback, max) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(max, Number(value))) : fallback;
  const total = Math.round(bounded(config.total, 0, 1000000) * 100);
  const tip = Math.round(total * bounded(config.tip, 0, 100) / 100);
  const people = Math.max(1, Math.floor(bounded(config.people, 2, 100)));
  const cents = total + tip;
  const share = Math.floor(cents / people);
  const extra = cents % people;
  const currency = ['EUR', 'USD', 'GBP'].includes(config.currency) ? config.currency : 'EUR';
  const money = value => `${currency} ${(value / 100).toFixed(2)}`;
  return <div className="w-bill-split">
    <header><b>Split it fairly</b><span>THE ROOM TAB</span></header>
    <strong>{money(share)}</strong><small>{extra ? 'Base share per person' : 'Each person pays'}</small>
    <p>{extra ? `${extra} pay ${money(share + 1)}; ${people - extra} pay ${money(share)}.` : 'Even split. No spare cents.'}</p>
    <dl><div><dt>Bill</dt><dd>{money(total)}</dd></div><div><dt>Tip</dt><dd>{money(tip)}</dd></div>
      <div><dt>Total</dt><dd>{money(cents)}</dd></div></dl>
    <div className="w-bill-split-party">
      <button type="button" aria-label="One fewer person" disabled={people <= 1} onClick={() => update?.({ people: people - 1 })}>−</button>
      <span>{people} {people === 1 ? 'person' : 'people'}</span>
      <button type="button" aria-label="One more person" disabled={people >= 100} onClick={() => update?.({ people: people + 1 })}>+</button>
    </div>
  </div>;
}

export default defineWidget({
  id: 'bill-split', name: 'Split it fairly', about: 'A shared bill with the last cent accounted for.',
  fields: {
    total: { type: 'number', label: 'Bill before tip', min: 0, max: 1000000, default: 42 },
    tip: { type: 'number', label: 'Tip percent', min: 0, max: 100, default: 10 },
    people: { type: 'number', label: 'People', min: 1, max: 100, default: 3 },
    currency: { type: 'choice', label: 'Currency', options: [['EUR', 'EUR'], ['USD', 'USD'], ['GBP', 'GBP']], default: 'EUR' },
  },
  View: Bill,
});
