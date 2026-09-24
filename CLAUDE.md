# CLAUDE.md — @arraypress/waveform-bar-react

React wrapper for `@arraypress/waveform-bar`. Mounts the bar and calls
`window.WaveformBar.init(config)`.

## Commands
- `npm test` — vitest + jsdom (run before committing).
- `npm run build` — bundles to `dist/`. `prepublishOnly` runs it. `dist/` is gitignored.

## The rule that matters: the type IS the contract

Config passes **verbatim** to `init()` — no per-key runtime allowlist here, so a new
bar option only needs the key added to `WaveformBarConfig` in `src/types.ts`.

The catch: **`waveform-bar` ships no `index.d.ts`.** This type is hand-written and
nothing links it to that package's `DEFAULTS`. It drifts silently — a key can be
missing here (invisible to users) or present here but unsupported by the bar
(typechecks, does nothing). When editing, check it against
`waveform-bar/src/js/core.js` → `DEFAULTS`. All four bar wrappers carry their own
copy of this type; they must be edited together.

`test/config-drift.test.ts` guards this: it parses `DEFAULTS` from the installed
bar (`node_modules/@arraypress/waveform-bar/src/js/core.js`) and fails on a bar key
that isn't typed (unless listed in `NOT_TYPED`, e.g. the `on*` callbacks) or a
typed key the bar doesn't know (unless in `NOT_IN_DEFAULTS`). It also pins
`SHARED_CONFIG_KEYS`, which must stay identical in all four wrappers. Bump the
`@arraypress/waveform-bar` devDependency after a bar release so it checks the
new `DEFAULTS`.

## Conventions
- Add a forwarding test under `test/` + a `CHANGELOG.md` entry.

## Cross-repo
One of 15 packages that must change together — load the `waveform-release` skill.
