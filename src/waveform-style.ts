/**
 * @module waveform-style
 * @description
 * Visual style identifiers shared between the bar and the
 * underlying waveform renderer. Kept in its own module so the
 * bar package can own the type independently.
 */

/**
 * Visual style for the bar's waveform canvas.
 *
 * - `bars`    — vertical bars from the baseline up
 * - `mirror`  — symmetrical bars mirrored around the centre line
 * - `line`    — connected line graph
 * - `blocks`  — chunky square blocks
 * - `dots`    — dotted plot
 * - `seekbar` — minimal seek bar with no peak detail
 */
export type WaveformStyle =
	| 'bars'
	| 'mirror'
	| 'line'
	| 'blocks'
	| 'dots'
	| 'seekbar';
