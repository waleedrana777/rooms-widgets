import { useEffect, useState, useSyncExternalStore } from 'react';

// The Rooms widget SDK: everything a widget may use, in one small file.
// A widget is one file that calls defineWidget(). It draws itself from
// { config }, reads data only through getJson / useData, and never touches
// the page, storage or the network any other way (scripts/check.mjs).

// The colours a widget can be tinted with (the same eight as Rooms people).
export const COLORS = {
  black: '#1d1d1f', blue: '#304fbd', pink: '#b83b76', teal: '#237765',
  sky: '#28789b', coral: '#b44e3d', violet: '#6b4bc6', olive: '#6f7a2e',
};
export const accent = name => COLORS[name] || COLORS.blue;

// The only places a widget may read from. Adding one is a visible line in a
// pull request, with a reason. Keyless, public, no tracking.
const HOSTS = [
  'rooms-edge.roomsapp.workers.dev', // Rooms' own cache: /widget/json, /widget/quote, /widget/crypto
  'api.open-meteo.com', // weather
  'geocoding-api.open-meteo.com', // city → coordinates
];

let edge = 'https://rooms-edge.roomsapp.workers.dev';
// Rooms points this at its own origin; widgets just call edgeUrl().
export function setEdge(url) { edge = String(url).replace(/\/+$/, ''); }
export const edgeUrl = (route, params = {}) => `${edge}/widget/${route}?${new URLSearchParams(params)}`;

export async function getJson(url) {
  const at = new URL(url, window.location.href);
  const own = at.origin === new URL(edge, window.location.href).origin;
  if (!own && !HOSTS.includes(at.hostname)) throw new Error(`${at.hostname} isn't on the list in sdk/index.js`);
  const response = await fetch(at, { credentials: 'omit' });
  const body = await response.json();
  if (!response.ok || body?.error) throw new Error(body?.error || `HTTP ${response.status}`);
  return body;
}

// A number or word from any public JSON API, through Rooms' cache.
export const readValue = (url, path = '') => getJson(edgeUrl('json', { url, path })).then(body => body.value);

// Shared data: every copy of a widget showing the same `key` shares one fetch,
// refreshed every `everyMin` minutes while the tab is visible. `load` is
// remembered per key the first time, so pass a plain arrow function.
const cache = new Map(); // key → { at, data, error, waiting }
const loaders = new Map();
export function useData(key, load, everyMin = 10) {
  if (key && !loaders.has(key)) loaders.set(key, load);
  const [entry, setEntry] = useState(() => (key ? cache.get(key) : null) || null);
  useEffect(() => {
    if (!key) return undefined;
    let alive = true;
    const everyMs = Math.max(1, everyMin) * 60_000;
    const refresh = async () => {
      const current = cache.get(key);
      if (current?.at && Date.now() - current.at < everyMs) { if (alive) setEntry(current); return; }
      if (!current?.waiting) {
        const waiting = loaders.get(key)().then(
          data => ({ at: Date.now(), data, error: null }),
          error => ({ at: Date.now(), data: current?.data ?? null, error: error.message }),
        );
        cache.set(key, { ...current, waiting });
        cache.set(key, await waiting);
      } else await current.waiting;
      if (alive) setEntry(cache.get(key));
    };
    refresh();
    const timer = setInterval(() => { if (!document.hidden) refresh(); }, Math.min(everyMs, 60_000));
    return () => { alive = false; clearInterval(timer); };
  }, [key, everyMin]);
  return { data: entry?.data ?? null, error: entry?.error || null, loading: Boolean(key) && !entry?.at };
}

// The time, shared by every widget: one ticker, rounded to `step` ms so a
// widget that only shows minutes redraws once a minute.
let now = Date.now();
const listeners = new Set();
let ticker = 0;
function subscribe(listener) {
  listeners.add(listener);
  if (!ticker) ticker = setInterval(() => { now = Date.now(); for (const l of listeners) l(); }, 1000);
  return () => { listeners.delete(listener); if (!listeners.size) { clearInterval(ticker); ticker = 0; } };
}
export const useTime = (step = 1000) => useSyncExternalStore(subscribe, () => Math.floor(now / step) * step);

// Field types for a widget's settings; Rooms draws the settings card from these.
export const FIELD_TYPES = ['text', 'number', 'date', 'choice', 'color'];

export function defineWidget(spec) {
  const { id, name, about, fields = {}, View } = spec;
  if (!/^[a-z][a-z0-9-]{1,23}$/.test(id || '')) throw new Error(`Widget id "${id}": 2–24 lowercase letters, digits or dashes.`);
  if (!name || !about || typeof View !== 'function') throw new Error(`Widget ${id}: needs name, about and View.`);
  for (const [key, field] of Object.entries(fields)) {
    if (!FIELD_TYPES.includes(field.type)) throw new Error(`Widget ${id}: field ${key} has unknown type ${field.type}.`);
  }
  const defaults = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.default ?? '']));
  return Object.freeze({ id, name, about, fields, defaults, View });
}
