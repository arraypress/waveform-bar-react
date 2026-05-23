/**
 * @module core-module-shim
 * @description
 * Ambient declarations for `@arraypress/waveform-bar` and
 * `@arraypress/waveform-player`. Neither core library ships
 * `.d.ts` types yet; without these shims `tsc` errors on the
 * dynamic imports inside our components.
 *
 * Delete these files once the core libraries ship their own
 * types — TypeScript will pick those up automatically.
 */
declare module '@arraypress/waveform-bar' {
	const WaveformBar: unknown;
	export default WaveformBar;
	export { WaveformBar };
}

declare module '@arraypress/waveform-player' {
	const WaveformPlayer: unknown;
	export default WaveformPlayer;
	export { WaveformPlayer };
}
