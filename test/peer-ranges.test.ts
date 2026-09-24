/**
 * test/peer-ranges.test.ts
 * ------------------------
 *
 * The peer floors must cover everything the wrapper types and relies on:
 *
 *   - `@arraypress/waveform-bar` ≥ 1.11.0 — the newest *required* config
 *     key in `WaveformBarConfig`, `crossOrigin`, arrived in bar 1.11.0.
 *     (`barRadius` and a working `showTime: false` need bar 1.12.0, but
 *     they're optional and older bars simply ignore them, so they're
 *     documented on the type instead of raising the floor.)
 *   - `@arraypress/waveform-player` ≥ 1.8.0 — the bar drives
 *     `audioMode: 'external'` players, which crashed before core 1.8.0.
 *
 * Dev dependencies are held to the same floors so the tests run against
 * a supported version. Kept identical across the four bar wrappers.
 */
import { describe, expect, it } from 'vitest';
import pkg from '../package.json';

const MIN_FLOORS: Record<string, string> = {
	'@arraypress/waveform-bar': '1.11.0',
	'@arraypress/waveform-player': '1.8.0',
};

/** Lower bound of a `^x.y.z` range as a comparable tuple. */
function caretFloor(range: string): [number, number, number] {
	const m = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(range);
	if (!m) throw new Error(`expected a ^x.y.z range, got "${range}"`);
	return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function atLeast(range: string, min: string): boolean {
	const a = caretFloor(range);
	const b = min.split('.').map(Number);
	for (let i = 0; i < 3; i++) {
		if (a[i] !== b[i]) return a[i] > b[i];
	}
	return true;
}

const deps: Record<string, Record<string, string> | undefined> = {
	peerDependencies: pkg.peerDependencies,
	devDependencies: pkg.devDependencies,
};

describe('package.json — peer floors cover what the wrapper relies on', () => {
	for (const [name, min] of Object.entries(MIN_FLOORS)) {
		it(`peerDependencies["${name}"] is at least ^${min}`, () => {
			const range = deps.peerDependencies?.[name];
			expect(range, `${name} must be a peer`).toBeDefined();
			expect(atLeast(range!, min), `${name}@${range} < ${min}`).toBe(true);
		});

		it(`devDependencies["${name}"] (if present) is at least ^${min}`, () => {
			const range = deps.devDependencies?.[name];
			if (range === undefined) return;
			expect(atLeast(range, min), `${name}@${range} < ${min}`).toBe(true);
		});
	}
});
