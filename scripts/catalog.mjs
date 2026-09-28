// The library as the widget agent sees it: every widget's id, name, about and
// its settings (fields), so the agent can set one up instead of writing code.
// node scripts/catalog.mjs > ../ops/widget-agent/catalog.json && cp ../ops/widget-agent/catalog.json ../edge/src/catalog.json
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../widgets/', import.meta.url));
const pick = (code, key) => code.match(new RegExp(`\\b${key}:\\s*['"\`]([^'"\`]+)['"\`]`))?.[1] || '';
const entries = readdirSync(ROOT, { withFileTypes: true }).filter(e => e.isDirectory()).map(({ name }) => {
  const code = readFileSync(`${ROOT}${name}/index.jsx`, 'utf8');
  const fields = (code.match(/fields:\s*\{([\s\S]*?)\n\s{2}\},\n/)?.[1] || '').split('\n').map(l => l.trim()).filter(l => l && !/hidden:\s*true/.test(l)).join(' ');
  return { id: pick(code, 'id'), name: pick(code, 'name'), about: pick(code, 'about'), fields };
});
// Rooms' built-in widgets (drawn by the app itself).
entries.push(
  { id: 'clock', name: 'Clock', about: 'Hands that move, in any city’s time zone.', fields: "tz: IANA time zone like 'Europe/Amsterdam' ('' = local); style: 'analog' | 'digital'; color: one of black blue pink teal sky coral violet olive" },
  { id: 'weather', name: 'Weather', about: 'The sky right now in a city.', fields: "city: city name; unit: 'C' | 'F'; color" },
  { id: 'chart', name: 'Chart', about: 'A price line for a stock or a coin.', fields: "market: 'stock' | 'crypto'; symbol: 'AAPL', '^GSPC', 'EURUSD=X' or a CoinGecko id like 'bitcoin'; color" },
  { id: 'api', name: 'Live value', about: 'One number or word from any public JSON API, refreshed every few minutes.', fields: "url: https JSON API; path: 'a.b.0'; label; unit; every: minutes; color" },
  { id: 'calendar', name: 'Calendar', about: 'Today’s date, tear-off style.', fields: "tz; color" },
  { id: 'teddy', name: 'Teddy clock', about: 'A teddy with a clock in its tummy.', fields: 'none needed' },
);
console.log(JSON.stringify(entries, null, 1));
