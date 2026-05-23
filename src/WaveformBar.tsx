/**
 * WaveformBar.tsx
 * ---------------
 *
 * Singleton mount component for `@arraypress/waveform-bar`.
 *
 * Render this **once** in your root layout / app entry. It renders
 * a persist host `<div>` and runs `window.WaveformBar.init(config)`
 * inside an effect — the core library scans the page for
 * `[data-wb-play]` / `[data-wb-queue]` triggers (rendered by
 * `<WaveformBarTrigger>`) and binds click handlers automatically.
 *
 * ## Setup
 *
 * Load both core libraries' JS + CSS in your app entry (the bar
 * has a strict runtime dependency on the player):
 *
 * ```tsx
 * // main.tsx
 * import '@arraypress/waveform-player/dist/waveform-player.css';
 * import '@arraypress/waveform-bar/dist/waveform-bar.css';
 * import '@arraypress/waveform-player';   // sets window.WaveformPlayer
 * import '@arraypress/waveform-bar';      // sets window.WaveformBar
 * ```
 *
 * Then drop `<WaveformBar>` once in your layout:
 *
 * ```tsx
 * function App() {
 *   return (
 *     <>
 *       <MainContent />
 *       <WaveformBar config={{ persist: true, continuous: true }} />
 *     </>
 *   );
 * }
 * ```
 *
 * ## What the component does
 *
 * - Renders a `<div id={hostId}>` for the persist host.
 * - On mount, dynamically `import()`s the core library (SSR-safe)
 *   and calls `window.WaveformBar.init(config)`.
 * - When `config` changes, calls `init()` again — the library
 *   handles destroy-and-recreate internally, so callers don't have
 *   to manage it.
 * - On unmount, calls `window.WaveformBar.destroy()` so the bar
 *   doesn't leak listeners across app remounts (StrictMode dev).
 *
 * @module WaveformBar
 */
import { useEffect, useRef } from 'react';
import type { WaveformBarProps } from './types';

/**
 * Stable string key built from a config object so the effect's
 * dep array can compare deep structure without forcing the consumer
 * to memoise. JSON.stringify is good enough — the config is small
 * (a few dozen primitive fields) and changes are rare. Functions
 * inside `actions.endpoint` get dropped (JSON can't serialise
 * them), so callers passing function endpoints need to memoise
 * the whole config object themselves to avoid re-init churn.
 */
function configKey(config: WaveformBarProps['config']): string {
	if (!config) return '';
	try {
		return JSON.stringify(config, (_key, value) => {
			if (typeof value === 'function') return '<<fn>>';
			return value;
		});
	} catch {
		return '';
	}
}

/**
 * The singleton mount. Render this exactly ONCE per app. Multiple
 * mounts result in repeated `init()` calls — the last one wins,
 * the earlier ones get torn down.
 *
 * @example Bare
 *   <WaveformBar />
 *
 * @example With config
 *   <WaveformBar
 *     hostId="my-app-bar"
 *     config={{
 *       persist: true,
 *       continuous: true,
 *       showQueue: true,
 *       maxMeta: 1,
 *       storageKey: 'my-app-bar',
 *       actions: {
 *         favorite: { endpoint: '/api/favorites' },
 *         cart:     { endpoint: '/api/cart' },
 *       },
 *     }}
 *   />
 */
export function WaveformBar(props: WaveformBarProps) {
	const {
		config,
		persist = true,
		hostId = 'waveform-bar-host',
		className,
		style,
	} = props;

	/**
	 * Persist host — bar element gets relocated into here so it
	 * survives across route changes / re-renders. The `data-wb-persist`
	 * attribute is informational; the bar library doesn't act on it
	 * but consumers may want to target it in CSS.
	 */
	const hostRef = useRef<HTMLDivElement | null>(null);

	/**
	 * Init / re-init effect. Runs on mount and whenever the config
	 * key changes. The library's `init()` is idempotent — it
	 * destroys the previous instance before creating a new one.
	 */
	useEffect(() => {
		let cancelled = false;
		let mod: { default?: unknown; WaveformBar?: unknown } | null = null;

		void import('@arraypress/waveform-bar')
			.then((imported) => {
				if (cancelled) return;
				mod = imported as { default?: unknown; WaveformBar?: unknown };

				const WaveformBarGlobal =
					(typeof window !== 'undefined' &&
						(window as unknown as { WaveformBar?: { init: (c?: unknown) => void; destroy?: () => void } }).WaveformBar) ||
					null;

				if (!WaveformBarGlobal) {
					console.error(
						'[waveform-bar-react] window.WaveformBar is undefined after import. ' +
						'Make sure @arraypress/waveform-player is loaded BEFORE @arraypress/waveform-bar.'
					);
					return;
				}

				try {
					WaveformBarGlobal.init(config);
				} catch (err) {
					console.error('[waveform-bar-react] init failed:', err);
					return;
				}

				/* Relocate the bar element under our persist host so
				 * routing changes / view transitions don't tear it
				 * down. The library appends `.waveform-bar` to <body>
				 * by default; we move it under our host. */
				if (persist) {
					const host = hostRef.current;
					const bar = document.querySelector('.waveform-bar');
					if (host && bar && bar.parentElement !== host) {
						host.appendChild(bar);
					}
				}
			})
			.catch((err) => {
				console.error('[waveform-bar-react] Failed to load library:', err);
			});

		return () => {
			cancelled = true;
			/* Tear down the bar on unmount so StrictMode double-mounts
			 * and route changes don't leak listeners. The library's
			 * destroy() is safe to call when already destroyed. */
			const WaveformBarGlobal =
				(typeof window !== 'undefined' &&
					(window as unknown as { WaveformBar?: { destroy?: () => void } }).WaveformBar) ||
				null;
			try {
				WaveformBarGlobal?.destroy?.();
			} catch (err) {
				console.warn('[waveform-bar-react] destroy() threw:', err);
			}
			mod = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [configKey(config), persist]);

	return (
		<div
			ref={hostRef}
			id={hostId}
			className={['wb-host', className].filter(Boolean).join(' ')}
			style={style}
			data-wb-persist={persist ? 'true' : undefined}
		/>
	);
}
