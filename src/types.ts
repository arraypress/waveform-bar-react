/**
 * @module types
 * @description
 * Public TypeScript types for `@arraypress/waveform-bar-react`.
 *
 * Two component shapes:
 *
 *   1. `<WaveformBar>`         — the persistent bottom-bar
 *                                singleton. Takes a `config` object
 *                                (every option `window.WaveformBar.init()`
 *                                accepts).
 *   2. `<WaveformBarTrigger>`  — polymorphic click trigger. Renders
 *                                a `<button>` by default; emits the
 *                                `data-wb-*` attribute contract the
 *                                core library scans for at runtime.
 *
 * Prop names match the library option / attribute names 1:1
 * (camelCase). The components handle the conversion (init-time
 * JSON for the bar, `data-wb-*` attributes for the trigger).
 *
 * Callbacks are deliberately NOT exposed as props. React can't
 * usefully pass them across the boundary in a stable way (a new
 * inline function each render would re-init the bar), and the
 * core library dispatches every state change as a bubbling
 * `waveformbar:*` `CustomEvent`. Listen via `addEventListener`
 * in your own effect — that's framework-agnostic and avoids the
 * re-init churn.
 *
 * @see {@link https://github.com/arraypress/waveform-bar} — core library
 */

import type { ReactNode, CSSProperties } from 'react';

/* Re-export the WaveformStyle alias for ergonomic consumer imports. */
export type { WaveformStyle } from './waveform-style';
import type { WaveformStyle } from './waveform-style';

/** Visual theme used by the bar. `null` auto-detects from the page. */
export type WaveformBarTheme = 'dark' | 'light' | null;

/**
 * Repeat-mode cycle position.
 *
 * - `off` — play the queue once, then stop
 * - `all` — loop the entire queue
 * - `one` — loop the current track indefinitely
 */
export type RepeatMode = 'off' | 'all' | 'one';

/**
 * Trigger behaviour for `<WaveformBarTrigger>`.
 *
 * - `play`  — (default) immediate play. The core library starts
 *   playback as soon as the trigger is clicked.
 * - `queue` — append to the queue without changing the current
 *   track. Maps to the library's `data-wb-queue` attribute.
 */
export type TriggerMode = 'play' | 'queue';

/**
 * A clickable DJ-mode marker within a single track. Markers fire
 * as playback crosses each `time`; the bar updates its displayed
 * title / artist / artwork / metadata to the marker's values.
 */
export interface WaveformBarMarker {
	time: number;
	label: string;
	title?: string;
	artist?: string;
	artwork?: string;
	bpm?: string | number;
	key?: string;
	color?: string;
}

/**
 * Server-side action endpoint config for favourite / cart toggles.
 *
 * `endpoint` is a URL string. The library performs `fetch()` with
 * the configured `method` (default POST) + optional headers.
 *
 * Note: the core library also accepts a function for `endpoint`,
 * letting you intercept the request in-browser. That form works
 * here too — React can pass functions just fine — but it's still
 * recommended to keep the function reference stable across
 * renders (`useCallback` or hoist it out) to avoid re-init.
 */
export interface WaveformBarAction {
	endpoint: string | ((payload: Record<string, unknown>) => void);
	method?: string;
	headers?: Record<string, string>;
}

export interface WaveformBarActions {
	favorite?: WaveformBarAction;
	cart?: WaveformBarAction;
}

/**
 * Full configuration object for the persistent bar. Mirrors the
 * options accepted by `window.WaveformBar.init(...)`. Every field
 * is optional — pass only the keys you want to override.
 */
export interface WaveformBarConfig {
	// ── Persistence + behaviour ────────────────────────────────────────
	persist?: boolean;
	autoResume?: boolean;
	continuous?: boolean;
	repeat?: RepeatMode;
	// ── UI toggles ─────────────────────────────────────────────────────
	showQueue?: boolean;
	showPrevNext?: boolean;
	showRepeat?: boolean;
	showVolume?: boolean;
	showMute?: boolean;
	showTime?: boolean;
	showTrackLink?: boolean;
	showMeta?: boolean;
	maxMeta?: number;
	// ── Defaults + theming ─────────────────────────────────────────────
	defaultArtwork?: string | null;
	theme?: WaveformBarTheme;
	// ── Waveform visualisation ─────────────────────────────────────────
	waveformStyle?: WaveformStyle;
	waveformHeight?: number;
	barWidth?: number;
	barSpacing?: number;
	waveformColor?: string | null;
	progressColor?: string | null;
	markerColor?: string;
	// ── Volume + persistence keys ──────────────────────────────────────
	volume?: number;
	storageKey?: string;
	// ── Server-side actions ────────────────────────────────────────────
	actions?: WaveformBarActions | null;
}

/**
 * Props accepted by `<WaveformBar>` — render this **once** in your
 * root layout. The bar library installs a global on
 * `window.WaveformBar`; calling init() twice destroys the first
 * instance and creates a fresh one.
 */
export interface WaveformBarProps {
	/**
	 * Bar configuration. Pass any subset of `WaveformBarConfig`.
	 * Changing a primitive value here re-runs `init()` so the
	 * change takes effect; non-primitive changes (objects /
	 * arrays) only re-init when their reference changes — wrap
	 * with `useMemo` if your config is built on the fly.
	 */
	config?: WaveformBarConfig;

	/**
	 * Render a persist host `<div>` that the bar element gets
	 * relocated into on mount. Useful in apps with custom
	 * routing where you want the bar to survive route changes.
	 *
	 * @default true
	 */
	persist?: boolean;

	/**
	 * DOM `id` for the persist host.
	 *
	 * @default 'waveform-bar-host'
	 */
	hostId?: string;

	/** Class name forwarded to the persist host. */
	className?: string;

	/** Inline style forwarded to the persist host. */
	style?: CSSProperties;
}

/**
 * Track metadata the bar reads from `<WaveformBarTrigger>`. Every
 * field is optional except `url` (the unique identity / play
 * target).
 */
export interface WaveformBarTrackData {
	url: string;
	id?: string;
	title?: string;
	artist?: string;
	album?: string;
	artwork?: string;
	link?: string;
	duration?: string | number;
	bpm?: string | number;
	musicalKey?: string;
	meta?: string[];
	waveform?: number[] | string;
	markers?: WaveformBarMarker[];
	favorited?: boolean;
	inCart?: boolean;
}

/**
 * Props accepted by `<WaveformBarTrigger>`.
 *
 * The component is polymorphic via the `as` prop — defaults to
 * `<button>` because that gives keyboard focus + Space/Enter
 * activation for free.
 */
export interface WaveformBarTriggerProps extends WaveformBarTrackData {
	/**
	 * Whether clicking plays the track (`'play'`) or just appends
	 * to the queue (`'queue'`).
	 *
	 * @default 'play'
	 */
	mode?: TriggerMode;

	/**
	 * HTML tag for the rendered element. Override to `'a'` for a
	 * real link, `'div'` to wrap a whole card, `'span'` for inline
	 * usage.
	 *
	 * @default 'button'
	 */
	as?: 'button' | 'a' | 'div' | 'span';

	/** `href` when `as="a"`. Ignored otherwise. */
	href?: string;

	/** Accessible label. Auto-generated from `title` when absent. */
	'aria-label'?: string;

	/** Extra class names appended to `wb-icon-swap`. */
	className?: string;

	/** Inline style. */
	style?: CSSProperties;

	/**
	 * Suppress the default play / pause SVG content the component
	 * injects. Use this when you want to wrap a whole card or
	 * provide a completely custom icon set via children.
	 *
	 * @default false
	 */
	noDefaultIcons?: boolean;

	/** Custom child content — overrides the default SVGs. */
	children?: ReactNode;
}
