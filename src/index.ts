/**
 * @module @arraypress/waveform-bar-react
 * @description
 * Public entry point for the React wrapper around
 * `@arraypress/waveform-bar`.
 *
 * Two components are exported:
 *
 *   - `WaveformBar`         — singleton mount, render once in your
 *                             root layout
 *   - `WaveformBarTrigger`  — polymorphic play / queue trigger,
 *                             render anywhere you want a clickable
 *                             "play this track" element
 *
 * ```tsx
 * import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-react';
 * ```
 */

export { WaveformBar } from './WaveformBar';
export { WaveformBarTrigger } from './WaveformBarTrigger';

export type {
	WaveformBarProps,
	WaveformBarConfig,
	WaveformBarTriggerProps,
	WaveformBarTrackData,
	WaveformBarMarker,
	WaveformBarActions,
	WaveformBarAction,
	WaveformBarTheme,
	RepeatMode,
	TriggerMode,
	WaveformStyle,
} from './types';
