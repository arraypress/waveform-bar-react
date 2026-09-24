/**
 * test/config-types.test.ts
 * -------------------------
 *
 * Type-level tests for `WaveformBarConfig`. The bar ships no `.d.ts`,
 * so this hand-written type is the whole contract — and `config` goes to
 * `window.WaveformBar.init()` verbatim, so a key that's wrong here is
 * wrong for every user even though it works at runtime.
 *
 * `expectTypeOf` is a no-op under `vitest run`; these assertions are
 * enforced by the typecheck (`test/` is in tsconfig `include`).
 *
 * Kept identical across the four bar wrappers (astro / react / svelte /
 * vue) apart from the import path.
 */
import { describe, expectTypeOf, it } from 'vitest';
import type { WaveformBarConfig } from '../src/types';

describe('WaveformBarConfig — types match what the bar forwards to the player', () => {
	it('accepts waveformGradient with the core player\'s axis union', () => {
		// waveform-player index.d.ts: 'vertical' | 'horizontal' | 'diagonal'.
		expectTypeOf<WaveformBarConfig['waveformGradient']>().toEqualTypeOf<
			'vertical' | 'horizontal' | 'diagonal' | undefined
		>();
	});

	it('accepts gradient stop arrays for waveformColor / progressColor', () => {
		// The bar forwards these verbatim; the player takes string | string[] | null.
		expectTypeOf<WaveformBarConfig['waveformColor']>().toEqualTypeOf<
			string | string[] | null | undefined
		>();
		expectTypeOf<WaveformBarConfig['progressColor']>().toEqualTypeOf<
			string | string[] | null | undefined
		>();
	});

	it('accepts barRadius as a number (0 = square) or null (player default)', () => {
		expectTypeOf<WaveformBarConfig['barRadius']>().toEqualTypeOf<number | null | undefined>();
	});

	it('still accepts showTime', () => {
		expectTypeOf<WaveformBarConfig['showTime']>().toEqualTypeOf<boolean | undefined>();
	});
});
