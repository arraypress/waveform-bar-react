/**
 * test/WaveformBar.test.tsx
 * -------------------------
 *
 * Tests for the singleton `<WaveformBar>` mount. The core library
 * is mocked at the module boundary (jsdom has no Web Audio). We
 * assert that init() / destroy() get called at the right
 * lifecycle moments and that config changes trigger re-init.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { WaveformBar } from '../src/WaveformBar';
import type { WaveformBarConfig } from '../src/types';

/**
 * Records every `init()` and `destroy()` call so tests can assert
 * on the lifecycle. Reset before each test.
 */
const initCalls: Array<unknown> = [];
const destroyCalls: number[] = [];

/**
 * Set up `window.WaveformBar` BEFORE the component imports the
 * module dynamically. The dynamic import is awaited, so by the
 * time the effect's .then() runs, the global needs to exist on
 * window. Doing this in `beforeEach` is fine because the
 * component looks it up at effect-time, not module-load-time.
 */
function installBarGlobal() {
	(window as unknown as Record<string, unknown>).WaveformBar = {
		init: (config: unknown) => {
			initCalls.push(config);
		},
		destroy: () => {
			destroyCalls.push(Date.now());
		},
	};
}

/**
 * Mock the dynamic import so the test doesn't try to load the
 * real package (which doesn't exist in node_modules for THIS
 * package's tests — it's a peer dep that consumers install).
 */
vi.mock('@arraypress/waveform-bar', () => ({
	default: {},
	WaveformBar: {},
}));

beforeEach(() => {
	initCalls.length = 0;
	destroyCalls.length = 0;
	cleanup();
	installBarGlobal();
});

describe('<WaveformBar> — host element', () => {
	it('renders a host div with the default id', () => {
		const { container } = render(<WaveformBar />);
		const host = container.querySelector('div');
		expect(host).not.toBeNull();
		expect(host!.id).toBe('waveform-bar-host');
	});

	it('always applies the wb-host class', () => {
		const { container } = render(<WaveformBar />);
		expect(container.querySelector('div')!.className).toContain('wb-host');
	});

	it('honours a custom hostId', () => {
		const { container } = render(<WaveformBar hostId="my-app-bar" />);
		expect(container.querySelector('div')!.id).toBe('my-app-bar');
	});

	it('merges user className with wb-host', () => {
		const { container } = render(<WaveformBar className="theme-dark" />);
		const cls = container.querySelector('div')!.className;
		expect(cls).toContain('wb-host');
		expect(cls).toContain('theme-dark');
	});

	it('forwards inline style', () => {
		const { container } = render(<WaveformBar style={{ minHeight: 64 }} />);
		expect(container.querySelector('div')!.style.minHeight).toBe('64px');
	});

	it('sets data-wb-persist by default', () => {
		const { container } = render(<WaveformBar />);
		expect(container.querySelector('div')!.getAttribute('data-wb-persist')).toBe('true');
	});

	it('omits data-wb-persist when persist=false', () => {
		const { container } = render(<WaveformBar persist={false} />);
		expect(container.querySelector('div')!.hasAttribute('data-wb-persist')).toBe(false);
	});
});

describe('<WaveformBar> — lifecycle', () => {
	it('calls window.WaveformBar.init on mount', async () => {
		render(<WaveformBar />);
		await waitFor(() => expect(initCalls).toHaveLength(1));
	});

	it('passes the config through to init()', async () => {
		const config: WaveformBarConfig = {
			persist: true,
			continuous: true,
			storageKey: 'my-key',
			maxMeta: 1,
		};
		render(<WaveformBar config={config} />);
		await waitFor(() => expect(initCalls).toHaveLength(1));
		expect(initCalls[0]).toEqual(config);
	});

	it('passes an empty / undefined config without throwing', async () => {
		render(<WaveformBar />);
		await waitFor(() => expect(initCalls).toHaveLength(1));
		expect(initCalls[0]).toBeUndefined();
	});

	it('calls destroy() on unmount', async () => {
		const { unmount } = render(<WaveformBar />);
		await waitFor(() => expect(initCalls).toHaveLength(1));
		unmount();
		expect(destroyCalls.length).toBeGreaterThanOrEqual(1);
	});

	it('re-inits when the config changes', async () => {
		const { rerender } = render(<WaveformBar config={{ continuous: true }} />);
		await waitFor(() => expect(initCalls).toHaveLength(1));

		rerender(<WaveformBar config={{ continuous: false }} />);
		await waitFor(() => expect(initCalls.length).toBeGreaterThanOrEqual(2));

		// Second init received the new config
		expect(initCalls[initCalls.length - 1]).toEqual({ continuous: false });
	});

	it('does NOT re-init when the config object is structurally identical', async () => {
		const { rerender } = render(<WaveformBar config={{ continuous: true, maxMeta: 1 }} />);
		await waitFor(() => expect(initCalls).toHaveLength(1));

		// Same shape, different object reference — should NOT re-init.
		rerender(<WaveformBar config={{ continuous: true, maxMeta: 1 }} />);
		/* Give a tick for any spurious init to fire. */
		await new Promise<void>((resolve) => setTimeout(resolve, 30));

		expect(initCalls).toHaveLength(1);
	});
});

describe('<WaveformBar> — missing global', () => {
	it('warns but does not throw when window.WaveformBar is undefined', async () => {
		// Remove the global the test fixture installed
		delete (window as unknown as Record<string, unknown>).WaveformBar;
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		expect(() => render(<WaveformBar />)).not.toThrow();
		// Wait for the dynamic import to resolve
		await new Promise<void>((resolve) => setTimeout(resolve, 30));

		expect(warnSpy).toHaveBeenCalled();
		expect(warnSpy.mock.calls[0]?.[0]).toMatch(/window\.WaveformBar is undefined/);

		warnSpy.mockRestore();
	});
});
