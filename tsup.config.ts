/**
 * tsup.config.ts
 * --------------
 *
 * Build configuration for `@arraypress/waveform-bar-react`.
 * Same shape as the sibling `@arraypress/waveform-player-react`
 * package — dual ESM + CJS output with `.d.ts` for both.
 *
 * `react`, `react-dom`, `@arraypress/waveform-bar`, and
 * `@arraypress/waveform-player` are all externalised so they
 * resolve to the consumer's installed copies, never bundled in.
 */
import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
	sourcemap: true,
	clean: true,
	treeshake: true,
	external: [
		'react',
		'react-dom',
		'@arraypress/waveform-bar',
		'@arraypress/waveform-player',
	],
});
