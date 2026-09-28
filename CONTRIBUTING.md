# Contributing a widget

Rooms is built by its community. We merge simple code and turn down anything
we can't trust at a glance, usually with a simpler way to do the same thing.

## The rules

1. **Small and readable.** One folder: `index.jsx`, and `widget.css` if you
   need it. Under 200 lines each. If a reviewer can't follow it in ten
   minutes, it won't be merged.
2. **Only the SDK.** Import `react` and `../../sdk/index.js`, nothing else.
   No new dependencies.
3. **Nothing hidden.** No `eval`, `new Function`, raw HTML, minified,
   generated or encoded code, and nothing loaded at runtime.
4. **Network only through the SDK**, and only when it has to. `readValue` for
   any public JSON API; `getJson` for a host on the list. Adding a host means
   one line in `sdk/index.js` and a reason in your pull request. Keyless,
   public, no tracking, no analytics, no ads.
5. **No personal data.** Settings are public to the room. Don't ask for
   passwords, keys, locations or anything private.
6. **Stays in its sticker.** No `window`, `document`, storage or cookies, and
   no fixed positioning. Every class and animation starts with `w-<id>`.
7. **Plays nicely.** Readable at small size, respects
   `prefers-reduced-motion`, and shares data through `useData` rather than
   fetching once per copy.
8. **Fun is a feature.** Small, alive, delightful beats big and clever.

`npm run check` tests rules 1–3 and 6 by machine. A person checks the rest.

## Review

Every pull request is read line by line. Pull requests that change `sdk/`,
`preview/`, `scripts/` or `package.json` get extra scrutiny, and usually
belong in an issue first.

## Checklist

- [ ] What it does, in one sentence, with a screenshot
- [ ] Any outside service it reads from, and why
- [ ] Tried at small size and with reduced motion on
- [ ] `npm run check` passes
