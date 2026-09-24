# Changelog

All notable changes to `@arraypress/waveform-bar-react` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]

### Added

- **`waveformGradient` config key** (`'vertical' | 'horizontal' |
  'diagonal'`). The bar has forwarded it to the embedded player since 1.8.0,
  but it was missing from `WaveformBarConfig`, so TypeScript rejected a
  working option.
- **`barRadius` config key** (`number | null`) — rounded bar caps in px,
  `0` = square, `null` = the player's default. Requires
  `@arraypress/waveform-bar` 1.12.0+; older bars ignore it.

### Changed

- **Peer floors raised:** `@arraypress/waveform-bar` `^1.10.0` → `^1.11.0`
  and `@arraypress/waveform-player` `^1.7.2` → `^1.8.0`. `WaveformBarConfig`
  has declared `crossOrigin` since 0.4.0, but the bar only accepts it from
  1.11.0; and the bar drives `audioMode: 'external'` inline players, which
  crashed before core player 1.8.0. The optional `barRadius` / working
  `showTime` (bar 1.12.0) don't raise the floor — older bars ignore them.

### Fixed

- **`waveformColor` / `progressColor` accept gradient stop arrays.** They
  were typed `string | null`, but the bar forwards them verbatim to a player
  that takes `string | string[] | null` — `['#fafafa', '#71717a']` works at
  runtime and now typechecks.
- **`showTime` doc comment** notes that `false` actually hides the time
  display from `@arraypress/waveform-bar` 1.12.0 (earlier bars ignored it).

## [0.4.0] — 2026-07-22

### Added

- **`crossOrigin` config key.** Added to `WaveformBarConfig` and forwarded
  verbatim to `window.WaveformBar.init()`. Requires
  `@arraypress/waveform-bar@^1.11.0` for it to reach the embedded player.

## [0.3.0] — 2026-07-05

### Added

- Accept the new localizable player-string keys — `seekValueText`,
  `playPauseLabel`, `speedLabel`, `artworkAlt`, and `unknownTrackText` — in
  the bar config; they are forwarded to the embedded player. Requires
  `@arraypress/waveform-bar@^1.10.0`.

## [0.2.0] — 2026-07-01

### Changed

- Sync `WaveformBarConfig` to the bar's `mode` API: `layout` → `mode`
  (`'waveform' | 'classic'`), remove `maxWidth`, add `showShuffle` / `shuffle`.
  Matches `@arraypress/waveform-bar` 1.7.0.

## [0.1.1] — 2026-06-27

### Changed

- Bumped the `@arraypress/waveform-player` peer (and dev) dependency to
  `^1.7.2` for the native accessible keyboard / ARIA seek slider. No
  component API changes.

## [0.1.0] — Unreleased

Initial release.

### Added

- **`<WaveformBar>`** — singleton mount component for the persistent
  bottom bar. Renders a persist host `<div>` and runs
  `window.WaveformBar.init(config)` inside an effect. Tears down on
  unmount (StrictMode-safe) and re-inits only when the structural
  shape of the config changes — passing a fresh object reference
  with the same shape doesn't trigger churn. Relocates the bar
  element into the persist host so route changes / re-renders
  don't tear it down.
- **`<WaveformBarTrigger>`** — polymorphic click trigger. Defaults
  to `<button>`; override via `as="a" | "div" | "span"`. Emits the
  full `data-wb-*` attribute contract:
  - Track identity: `url`, `id`, `title`, `artist`, `album`,
    `artwork`, `link`
  - Display chips: `duration`, `bpm`, `musicalKey`, `meta`
  - Audio data: `waveform` (peaks array, URL, or inline JSON),
    `markers` (DJ-mode chapters)
  - Initial state: `favorited`, `inCart`
  - Behaviour: `mode='play' | 'queue'`, `href` (when `as="a"`),
    `aria-label`, `className`, `style`, `noDefaultIcons`, `children`
- Default `play / pause` SVG pair rendered as the trigger's
  children when no custom content is passed. The library's
  `wb-icon-swap` CSS toggles them based on the active track state.
- Auto-generated `aria-label` when one isn't supplied —
  `Play {title}` for play triggers, `Add {title} to queue` for
  queue triggers.
- Public TypeScript types: `WaveformBarProps`, `WaveformBarConfig`,
  `WaveformBarTriggerProps`, `WaveformBarTrackData`,
  `WaveformBarMarker`, `WaveformBarActions`, `WaveformBarAction`,
  `WaveformBarTheme`, `RepeatMode`, `TriggerMode`, `WaveformStyle`.
- Ambient module shim for `@arraypress/waveform-bar` and
  `@arraypress/waveform-player` so the wrapper typechecks cleanly
  until the core libraries ship `.d.ts` of their own.
- SSR / RSC safe: the core library loads via dynamic `import()`
  inside the effect, so the browser-only audio surface never
  evaluates server-side.
- 46 Vitest tests via jsdom + `@testing-library/react`:
  - 28 tests for `<WaveformBarTrigger>` rendering + attribute
    mapping (no module mocking needed)
  - 18 tests for `<WaveformBar>` lifecycle (window global mocked
    since jsdom has no Web Audio)
- Dual ESM (`dist/index.js`) + CJS (`dist/index.cjs`) build via
  `tsup`. `.d.ts` for both. React + the two core libraries
  externalised so they resolve to the consumer's copies.
- README with full prop reference, seven usage patterns, and the
  `waveformbar:*` custom-event API documented as the callback
  alternative.
- `examples/basic.tsx` with seven copy-paste-ready snippets.
