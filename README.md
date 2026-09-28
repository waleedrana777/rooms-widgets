# Rooms widgets

Small, living stickers for Rooms, the social network for creatives. A clock in a teddy's tummy, the moon tonight, your repo's stars.
Anyone can build one. Merged widgets ship to everyone's sticker wheel.

```bash
npm install
npm run dev      # the preview: every widget, at sticker size, with its settings
npm run check    # the rules, checked by a machine
```

## A widget is one file

```jsx
// widgets/countdown/index.jsx
import { accent, defineWidget, useTime } from '../../sdk/index.js';
import './widget.css';

function Countdown({ config }) {
  const now = useTime(60_000); // redraws once a minute
  const days = Math.ceil((new Date(config.date) - now) / 86_400_000);
  return <div className="w-countdown" style={{ '--w': accent(config.color) }}>
    <b>{days}</b><small>days to {config.title}</small>
  </div>;
}

export default defineWidget({
  id: 'countdown',
  name: 'Countdown',
  about: 'Days until something good.',
  fields: {
    title: { type: 'text', label: 'Until', max: 18, default: 'Launch' },
    date: { type: 'date', label: 'Date', default: '2026-12-31' },
    color: { type: 'color', default: 'pink' },
  },
  View: Countdown,
});
```

- `View({ config })` draws the sticker. `config` is the fields, filled in.
- `fields` become the settings card people see when they click your widget:
  `text`, `number`, `date`, `choice` (`options: [[value, 'Label']]`), `color`.
- Put styles in `widget.css` next to it, every class starting with `w-<id>`.

## What the SDK gives you (`sdk/index.js`)

| | |
|---|---|
| `useTime(step)` | The time, shared by every widget; `step` in ms (1000, 60_000…) |
| `useData(key, load, everyMin)` | Shared data: one fetch per `key` for every copy on the page. Returns `{ data, error, loading }` |
| `readValue(url, path)` | A number or word from any public JSON API, through Rooms' cache |
| `getJson(url)` | JSON from a host on the list in `sdk/index.js` |
| `accent(color)`, `COLORS` | The eight Rooms colours |

That's all a widget can reach. No `fetch`, no storage, no `window` or
`document`: a widget is a sticker, and the sticker is its whole world.

## Interactive widgets and room themes

- `View({ config, update })`: call `update({ done: '1,3' })` to save what
  someone tapped (a tick, a date, a count). Fields marked `hidden: true` hold
  that saved state without showing in the settings card; `lines` is a
  one-item-per-line field (checklists).
- Room backgrounds live in `themes/<id>/` and use `defineTheme({ id, name,
  about, View })`: a full-bleed background drawn in CSS, SVG or canvas, never
  an image. Calm, slow, and still under reduced motion.

## How a widget gets into Rooms

1. Fork, add `widgets/<id>/`, try it in `npm run dev`.
2. `npm run check` passes.
3. Open a pull request. A person reads every line (see
   [CONTRIBUTING.md](CONTRIBUTING.md)).
4. Merged widgets appear in the Rooms sticker wheel with the next release.

Coming next: the Rooms MCP, so your AI can place and set up widgets in rooms
you own, from the merged list, without touching shared code.

MIT licensed.
