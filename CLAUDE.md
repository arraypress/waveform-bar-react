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

## Conventions
- Add a forwarding test under `test/` + a `CHANGELOG.md` entry.

## Cross-repo
One of 15 packages that must change together — load the `waveform-release` skill.
