// The rules, checked by a machine before a person reads the code.
// node scripts/check.mjs   (CI runs it on every pull request)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.WIDGETS_DIR || fileURLToPath(new URL('../widgets/', import.meta.url));
const FILES = ['index.jsx', 'widget.css', 'README.md'];
const IMPORTS = ['react', '../../sdk/index.js', './widget.css'];
const MAX_LINES = 200;
const MAX_WIDTH = 220; // longer lines usually mean minified or generated code

// Things a widget never needs. The SDK does networking; the sticker is the whole world.
const BANNED = [
  [/\beval\s*\(|new\s+Function\b|\bFunction\s*\(/, 'runs code from a string'],
  [/innerHTML|outerHTML|dangerouslySetInnerHTML|insertAdjacentHTML|document\.write/, 'writes raw HTML'],
  [/\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/, 'talks to the network directly (use getJson / readValue / useData)'],
  [/\bimport\s*\(|importScripts|new\s+Worker/, 'loads code at runtime'],
  [/localStorage|sessionStorage|indexedDB|document\.cookie|caches\./, 'stores things in the browser'],
  [/\bdocument\.|\bwindow\.|\bglobalThis\b|\bself\.|\btop\.|\bparent\./, 'reaches outside the sticker'],
  [/\blocation\b|\bhistory\.|window\.open|postMessage/, 'navigates or messages other pages'],
  [/<(script|iframe|object|embed|form)\b/i, 'embeds a script, frame or form'],
  [/\\x[0-9a-f]{2}|\\u00[0-9a-f]{2}|atob\s*\(|btoa\s*\(|String\.fromCharCode/i, 'hides text in escapes or base64'],
  [/navigator\.(geolocation|clipboard|mediaDevices|credentials)/, 'asks for personal data or devices'],
];
const CSS_BANNED = [
  [/@import|url\s*\(/i, 'loads something from elsewhere'],
  [/position\s*:\s*fixed/i, 'escapes the sticker'],
  [/expression\s*\(|behavior\s*:|-moz-binding/i, 'runs code from CSS'],
];

// The class names written in a className="…" or className={…} (quoted parts only).
function classTokens(value) {
  const inner = [...value.matchAll(/\$\{([^}]*)\}/g)].map(m => m[1]);
  const outer = value.replace(/\$\{[^}]*\}/g, ' ');
  const out = [];
  for (const part of [outer, ...inner]) for (const [, a, b, c] of part.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)) out.push(...(a ?? b ?? c).split(/\s+/).filter(Boolean));
  return out;
}

const problems = [];
const fail = (file, message) => problems.push(`${file}: ${message}`);

const ids = readdirSync(ROOT, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
for (const id of ids) {
  const dir = join(ROOT, id);
  if (!/^[a-z][a-z0-9-]{1,23}$/.test(id)) fail(id, 'folder name: 2–24 lowercase letters, digits or dashes');
  const files = readdirSync(dir);
  for (const name of files) if (!FILES.includes(name)) fail(`${id}/${name}`, `only ${FILES.join(', ')} belong in a widget folder`);
  if (!files.includes('index.jsx')) { fail(id, 'missing index.jsx'); continue; }

  for (const name of files.filter(n => n !== 'README.md')) {
    const path = `${id}/${name}`;
    const text = readFileSync(join(dir, name), 'utf8');
    const lines = text.split('\n');
    if (lines.length > MAX_LINES) fail(path, `${lines.length} lines; keep it under ${MAX_LINES}`);
    lines.forEach((line, i) => { if (line.length > MAX_WIDTH) fail(`${path}:${i + 1}`, `line is ${line.length} characters; keep it under ${MAX_WIDTH}`); });
    const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

    if (name.endsWith('.jsx')) {
      for (const [, from] of code.matchAll(/\bfrom\s+['"]([^'"]+)['"]|\bimport\s+['"]([^'"]+)['"]/g)) if (from && !IMPORTS.includes(from)) fail(path, `imports "${from}"; only ${IMPORTS.join(', ')}`);
      for (const [, bare] of code.matchAll(/\bimport\s+['"]([^'"]+)['"]/g)) if (!IMPORTS.includes(bare)) fail(path, `imports "${bare}"`);
      if (/\brequire\s*\(/.test(code)) fail(path, 'uses require()');
      for (const [pattern, why] of BANNED) if (pattern.test(code)) fail(path, `${why} (${code.match(pattern)[0]})`);
      const declared = code.match(/\bid:\s*['"]([^'"]+)['"]/)?.[1];
      if (declared !== id) fail(path, `defineWidget id is "${declared}", but the folder is "${id}"`);
      if (!/export\s+default\s+defineWidget\s*\(/.test(code)) fail(path, 'must `export default defineWidget({ … })`');
      for (const [, value] of code.matchAll(/className=("[^"]*"|\{[^\n]*?\}(?=[\s/>]))/g)) {
        for (const c of classTokens(value)) if (!c.startsWith(`w-${id}`)) fail(path, `class "${c}" should start with w-${id}`);
      }
    } else {
      for (const [pattern, why] of CSS_BANNED) if (pattern.test(code)) fail(path, why);
      for (const [selector] of code.matchAll(/[^{}]+(?=\{)/g)) {
        const s = selector.trim();
        if (!s || s.startsWith('@') || /^(from|to|\d+%)/.test(s)) continue;
        for (const part of s.split(',')) if (!part.trim().startsWith(`.w-${id}`)) fail(path, `selector "${part.trim()}" should start with .w-${id}`);
      }
      for (const [, name] of code.matchAll(/@keyframes\s+([\w-]+)/g)) if (!name.startsWith(`w-${id}`)) fail(path, `keyframes "${name}" should start with w-${id}`);
    }
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem${problems.length === 1 ? '' : 's'}:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${ids.length} widgets follow the rules (${ids.join(', ')})`);
