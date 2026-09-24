/// <reference types="vite/client" />
/**
 * test/config-drift.test.ts
 * -------------------------
 *
 * `WaveformBarConfig` is hand-written — `@arraypress/waveform-bar` ships no
 * `.d.ts` — and `config` goes to `window.WaveformBar.init()` verbatim, so
 * nothing else links the type to the bar's real option set. This test
 * parses the bar's `DEFAULTS` object straight out of the installed
 * package (it publishes `src/`) and `WaveformBarConfig` out of
 * `src/types.ts`, and fails when they drift:
 *
 *   1. every `DEFAULTS` key is typed, or listed in `NOT_TYPED` with a reason;
 *   2. every typed key is in `DEFAULTS`, or listed in `NOT_IN_DEFAULTS`;
 *   3. the typed key set equals `SHARED_CONFIG_KEYS` — the list that is
 *      kept byte-identical in all four bar wrappers (astro / react /
 *      svelte / vue), so a key added to one wrapper's type but not the
 *      others shows up as a failure here.
 *
 * Bumping the `@arraypress/waveform-bar` devDependency re-runs (1) and (2)
 * against the new release.
 */
import { describe, expect, it } from 'vitest';
import coreSource from '@arraypress/waveform-bar/src/js/core.js?raw';
import typesSource from '../src/types.ts?raw';

/**
 * `DEFAULTS` keys deliberately absent from `WaveformBarConfig`.
 * Callbacks aren't exposed: a fresh function per render would re-init the
 * bar (and Astro can't serialise functions into the init script at all).
 * The bar dispatches every one of these as a bubbling `waveformbar:*`
 * CustomEvent — listen with `addEventListener` instead.
 */
const NOT_TYPED: Record<string, string> = {
	onPlay: 'callback — use the waveformbar:play event',
	onPause: 'callback — use the waveformbar:pause event',
	onTrackChange: 'callback — use the waveformbar:trackchange event',
	onQueueChange: 'callback — use the waveformbar:queuechange event',
	onVolumeChange: 'callback — use the waveformbar:volumechange event',
	onShuffleChange: 'callback — use the waveformbar:shufflechange event',
	onFavorite: 'callback — use the waveformbar:favorite event',
	onCart: 'callback — use the waveformbar:cart event',
};

/** Typed keys that legitimately aren't in the installed bar's `DEFAULTS`. */
const NOT_IN_DEFAULTS: Record<string, string> = {
	mode: 'accepted by init() but deliberately not defaulted — derived from waveform/layout there',
	barRadius: 'waveform-bar 1.12.0+; harmless once the devDependency is bumped past it',
};

/**
 * The full `WaveformBarConfig` key set. IDENTICAL in all four bar wrappers
 * (waveform-bar-{astro,react,svelte,vue}/test/config-drift.test.ts) — when
 * you add a key, add it to every wrapper's type and to this list in each.
 */
const SHARED_CONFIG_KEYS = [
	'actions',
	'artworkAlt',
	'autoResume',
	'barRadius',
	'barSpacing',
	'barWidth',
	'collapsible',
	'continuous',
	'crossOrigin',
	'defaultArtwork',
	'errorText',
	'markerColor',
	'maxMeta',
	'mode',
	'persist',
	'playPauseLabel',
	'position',
	'progressColor',
	'repeat',
	'seekValueText',
	'share',
	'shareParam',
	'showMeta',
	'showMute',
	'showPrevNext',
	'showQueue',
	'showRepeat',
	'showShuffle',
	'showTime',
	'showTrackLink',
	'showVolume',
	'shuffle',
	'speedLabel',
	'storageKey',
	'theme',
	'unknownTrackText',
	'volume',
	'waveform',
	'waveformColor',
	'waveformGradient',
	'waveformHeight',
	'waveformStyle',
	'wide',
];

/**
 * Top-level keys of the `{ … }` block that follows `marker` in `source`.
 * A deliberately tiny scanner — skips strings, template literals and
 * comments, tracks brace/bracket/paren depth, and collects every
 * `name:` / `name?:` that sits directly inside the block. Enough for an
 * object literal of simple values or an interface of property signatures;
 * it throws rather than guess when the marker isn't found.
 */
function topLevelKeys(source: string, marker: RegExp, what: string): string[] {
	const m = marker.exec(source);
	if (!m) throw new Error(`${what} not found — was it renamed or restructured?`);
	let i = m.index + m[0].length; // just past the opening "{"
	let depth = 1;
	let atEntryStart = true; // after "{", ",", ";" or a newline at depth 1
	const keys: string[] = [];
	while (i < source.length && depth > 0) {
		const c = source[i];
		const next = source[i + 1];
		if (c === '/' && next === '/') {
			i = source.indexOf('\n', i);
			if (i === -1) break;
			continue;
		}
		if (c === '/' && next === '*') {
			i = source.indexOf('*/', i + 2) + 2;
			continue;
		}
		if (c === "'" || c === '"' || c === '`') {
			i++;
			while (i < source.length && source[i] !== c) i += source[i] === '\\' ? 2 : 1;
			i++;
			atEntryStart = false;
			continue;
		}
		if (c === '{' || c === '[' || c === '(') depth++;
		else if (c === '}' || c === ']' || c === ')') depth--;
		if (depth === 1 && (c === ',' || c === ';' || c === '\n' || c === '{')) {
			atEntryStart = true;
			i++;
			continue;
		}
		if (depth === 1 && atEntryStart && /[A-Za-z_$]/.test(c)) {
			const key = /^([A-Za-z_$][\w$]*)\s*\??\s*:/.exec(source.slice(i));
			if (key) keys.push(key[1]);
			atEntryStart = false;
		} else if (!/\s/.test(c)) {
			atEntryStart = false;
		}
		i++;
	}
	return keys;
}

/** Keys of the `const DEFAULTS = { … }` object literal in the bar's core.js. */
function defaultsKeys(source: string): string[] {
	return topLevelKeys(source, /\bconst\s+DEFAULTS\s*=\s*\{/, 'const DEFAULTS = {…} in waveform-bar core.js');
}

/** Property names declared on `interface WaveformBarConfig`. */
function configKeys(source: string): string[] {
	return topLevelKeys(source, /\binterface\s+WaveformBarConfig\s*\{/, 'interface WaveformBarConfig');
}

const defaults = defaultsKeys(coreSource);
const typed = configKeys(typesSource);

describe('WaveformBarConfig ↔ waveform-bar DEFAULTS drift', () => {
	it('parses a plausible number of keys from both sides', () => {
		expect(defaults.length).toBeGreaterThan(30);
		expect(typed.length).toBeGreaterThan(30);
	});

	it('types every DEFAULTS key, or excludes it with a reason', () => {
		const missing = defaults.filter((k) => !typed.includes(k) && !(k in NOT_TYPED));
		expect(missing, 'bar options missing from WaveformBarConfig').toEqual([]);
	});

	it('only types keys the bar knows about', () => {
		const unknown = typed.filter((k) => !defaults.includes(k) && !(k in NOT_IN_DEFAULTS));
		expect(unknown, 'WaveformBarConfig keys absent from the bar DEFAULTS').toEqual([]);
	});

	it('keeps NOT_TYPED honest (every excluded key still exists and is still untyped)', () => {
		for (const k of Object.keys(NOT_TYPED)) {
			expect(defaults, `stale NOT_TYPED entry: ${k}`).toContain(k);
			expect(typed, `${k} is typed now — drop it from NOT_TYPED`).not.toContain(k);
		}
	});

	it('declares exactly the key set shared by all four bar wrappers', () => {
		expect([...typed].sort()).toEqual(SHARED_CONFIG_KEYS);
	});
});
