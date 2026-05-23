/**
 * test/WaveformBarTrigger.test.tsx
 * --------------------------------
 *
 * Tests for the polymorphic trigger. No module mocking needed —
 * the component is a pure renderer that emits `data-wb-*`
 * attributes and stops there. We assert on the rendered HTML.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { WaveformBarTrigger } from '../src/WaveformBarTrigger';

beforeEach(cleanup);

describe('<WaveformBarTrigger> — minimal', () => {
	it('renders a <button> by default with data-wb-play and data-wb-url', () => {
		const { container } = render(<WaveformBarTrigger url="/audio/a.mp3" />);
		const btn = container.querySelector('button');
		expect(btn).not.toBeNull();
		expect(btn!.getAttribute('data-wb-play')).toBe('');
		expect(btn!.getAttribute('data-wb-url')).toBe('/audio/a.mp3');
	});

	it('always applies the wb-icon-swap class', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" />);
		expect(container.querySelector('button')!.className).toContain('wb-icon-swap');
	});

	it('always has type="button" when rendering a <button>', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" />);
		expect(container.querySelector('button')!.getAttribute('type')).toBe('button');
	});

	it('falls back data-wb-id to the url when id is unset', () => {
		const { container } = render(<WaveformBarTrigger url="/audio/a.mp3" />);
		expect(container.querySelector('button')!.getAttribute('data-wb-id')).toBe('/audio/a.mp3');
	});

	it('uses explicit id when provided', () => {
		const { container } = render(<WaveformBarTrigger url="/audio/a.mp3" id="sku-42" />);
		expect(container.querySelector('button')!.getAttribute('data-wb-id')).toBe('sku-42');
	});

	it('omits optional data-wb-* attrs when their props are unset', () => {
		const { container } = render(<WaveformBarTrigger url="/audio/a.mp3" />);
		const btn = container.querySelector('button')!;
		expect(btn.hasAttribute('data-wb-title')).toBe(false);
		expect(btn.hasAttribute('data-wb-artist')).toBe(false);
		expect(btn.hasAttribute('data-wb-album')).toBe(false);
		expect(btn.hasAttribute('data-wb-artwork')).toBe(false);
		expect(btn.hasAttribute('data-wb-link')).toBe(false);
		expect(btn.hasAttribute('data-wb-duration')).toBe(false);
		expect(btn.hasAttribute('data-wb-bpm')).toBe(false);
		expect(btn.hasAttribute('data-wb-key')).toBe(false);
		expect(btn.hasAttribute('data-wb-meta')).toBe(false);
		expect(btn.hasAttribute('data-wb-waveform')).toBe(false);
		expect(btn.hasAttribute('data-wb-markers')).toBe(false);
		expect(btn.hasAttribute('data-wb-favorited')).toBe(false);
		expect(btn.hasAttribute('data-wb-in-cart')).toBe(false);
	});
});

describe('<WaveformBarTrigger> — mode prop', () => {
	it('emits data-wb-play in default mode', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" />);
		const btn = container.querySelector('button')!;
		expect(btn.hasAttribute('data-wb-play')).toBe(true);
		expect(btn.hasAttribute('data-wb-queue')).toBe(false);
	});

	it('emits data-wb-queue in queue mode', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" mode="queue" />);
		const btn = container.querySelector('button')!;
		expect(btn.hasAttribute('data-wb-queue')).toBe(true);
		expect(btn.hasAttribute('data-wb-play')).toBe(false);
	});
});

describe('<WaveformBarTrigger> — polymorphic as prop', () => {
	it('renders an <a> when as="a"', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" as="a" href="/foo" />);
		const a = container.querySelector('a');
		expect(a).not.toBeNull();
		expect(a!.getAttribute('href')).toBe('/foo');
		// no type attribute on <a>
		expect(a!.hasAttribute('type')).toBe(false);
	});

	it('drops href when as is not "a"', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" href="/should-not-render" />);
		const btn = container.querySelector('button')!;
		expect(btn.hasAttribute('href')).toBe(false);
	});

	it('renders <div> when as="div"', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" as="div" />);
		expect(container.querySelector('div')).not.toBeNull();
		expect(container.querySelector('button')).toBeNull();
	});

	it('renders <span> when as="span"', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" as="span" />);
		expect(container.querySelector('span')).not.toBeNull();
	});
});

describe('<WaveformBarTrigger> — metadata', () => {
	it('forwards primitive metadata fields', () => {
		const { container } = render(
			<WaveformBarTrigger
				url="/a.mp3"
				title="My Track"
				artist="Artist"
				album="The Album"
				artwork="/img/cover.jpg"
				link="/products/abc"
			/>
		);
		const btn = container.querySelector('button')!;
		expect(btn.getAttribute('data-wb-title')).toBe('My Track');
		expect(btn.getAttribute('data-wb-artist')).toBe('Artist');
		expect(btn.getAttribute('data-wb-album')).toBe('The Album');
		expect(btn.getAttribute('data-wb-artwork')).toBe('/img/cover.jpg');
		expect(btn.getAttribute('data-wb-link')).toBe('/products/abc');
	});

	it('coerces numeric duration / bpm to strings', () => {
		const { container } = render(
			<WaveformBarTrigger url="/a.mp3" duration={234} bpm={174} />
		);
		const btn = container.querySelector('button')!;
		expect(btn.getAttribute('data-wb-duration')).toBe('234');
		expect(btn.getAttribute('data-wb-bpm')).toBe('174');
	});

	it('emits musicalKey under data-wb-key', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" musicalKey="Cm" />);
		expect(container.querySelector('button')!.getAttribute('data-wb-key')).toBe('Cm');
	});
});

describe('<WaveformBarTrigger> — array props', () => {
	it('JSON-stringifies meta', () => {
		const meta = ['Stems', 'Stereo'];
		const { container } = render(<WaveformBarTrigger url="/a.mp3" meta={meta} />);
		expect(container.querySelector('button')!.getAttribute('data-wb-meta')).toBe(JSON.stringify(meta));
	});

	it('omits data-wb-meta when array is empty', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" meta={[]} />);
		expect(container.querySelector('button')!.hasAttribute('data-wb-meta')).toBe(false);
	});

	it('JSON-stringifies waveform peaks when an array', () => {
		const peaks = [0.1, 0.5, 0.9];
		const { container } = render(<WaveformBarTrigger url="/a.mp3" waveform={peaks} />);
		expect(container.querySelector('button')!.getAttribute('data-wb-waveform')).toBe(JSON.stringify(peaks));
	});

	it('passes a string waveform URL through verbatim', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" waveform="/peaks/track.json" />);
		expect(container.querySelector('button')!.getAttribute('data-wb-waveform')).toBe('/peaks/track.json');
	});

	it('JSON-stringifies markers', () => {
		const markers = [
			{ time: 0, label: 'Intro' },
			{ time: 60, label: 'Drop', bpm: 174 },
		];
		const { container } = render(<WaveformBarTrigger url="/a.mp3" markers={markers} />);
		expect(container.querySelector('button')!.getAttribute('data-wb-markers')).toBe(JSON.stringify(markers));
	});

	it('omits data-wb-markers when empty', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" markers={[]} />);
		expect(container.querySelector('button')!.hasAttribute('data-wb-markers')).toBe(false);
	});
});

describe('<WaveformBarTrigger> — initial state flags', () => {
	it('emits favorited as "true" / "false"', () => {
		const yes = render(<WaveformBarTrigger url="/a.mp3" favorited={true} />);
		expect(yes.container.querySelector('button')!.getAttribute('data-wb-favorited')).toBe('true');
		cleanup();

		const no = render(<WaveformBarTrigger url="/a.mp3" favorited={false} />);
		expect(no.container.querySelector('button')!.getAttribute('data-wb-favorited')).toBe('false');
	});

	it('emits inCart under data-wb-in-cart', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" inCart={true} />);
		expect(container.querySelector('button')!.getAttribute('data-wb-in-cart')).toBe('true');
	});
});

describe('<WaveformBarTrigger> — slot / default icons', () => {
	it('renders default play/pause SVGs when no children are passed', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" />);
		expect(container.querySelector('.wb-show-play')).not.toBeNull();
		expect(container.querySelector('.wb-show-pause')).not.toBeNull();
	});

	it('replaces defaults when children are passed', () => {
		const { container } = render(
			<WaveformBarTrigger url="/a.mp3">Custom label</WaveformBarTrigger>
		);
		expect(container.querySelector('.wb-show-play')).toBeNull();
		expect(container.querySelector('.wb-show-pause')).toBeNull();
		expect(container.querySelector('button')!.textContent).toContain('Custom label');
	});

	it('suppresses defaults when noDefaultIcons is true (no children)', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" noDefaultIcons />);
		expect(container.querySelector('.wb-show-play')).toBeNull();
		expect(container.querySelector('.wb-show-pause')).toBeNull();
	});
});

describe('<WaveformBarTrigger> — aria-label', () => {
	it('auto-generates "Play {title}" by default', () => {
		const { container } = render(<WaveformBarTrigger url="/a.mp3" title="My Track" />);
		expect(container.querySelector('button')!.getAttribute('aria-label')).toBe('Play My Track');
	});

	it('auto-generates "Add {title} to queue" in queue mode', () => {
		const { container } = render(
			<WaveformBarTrigger url="/a.mp3" title="My Track" mode="queue" />
		);
		expect(container.querySelector('button')!.getAttribute('aria-label')).toBe('Add My Track to queue');
	});

	it('falls back to bare verbs when no title', () => {
		const play = render(<WaveformBarTrigger url="/a.mp3" />);
		expect(play.container.querySelector('button')!.getAttribute('aria-label')).toBe('Play');
		cleanup();

		const queue = render(<WaveformBarTrigger url="/a.mp3" mode="queue" />);
		expect(queue.container.querySelector('button')!.getAttribute('aria-label')).toBe('Add to queue');
	});

	it('honours an explicit aria-label override', () => {
		const { container } = render(
			<WaveformBarTrigger url="/a.mp3" aria-label="Custom label" />
		);
		expect(container.querySelector('button')!.getAttribute('aria-label')).toBe('Custom label');
	});
});

describe('<WaveformBarTrigger> — class merging', () => {
	it('appends user className to wb-icon-swap', () => {
		const { container } = render(
			<WaveformBarTrigger url="/a.mp3" className="card-play-btn" />
		);
		const className = container.querySelector('button')!.className;
		expect(className).toContain('wb-icon-swap');
		expect(className).toContain('card-play-btn');
	});
});

describe('<WaveformBarTrigger> — kitchen sink', () => {
	it('handles every prop together without dropping or mangling attributes', () => {
		const { container } = render(
			<WaveformBarTrigger
				url="/audio/track.mp3"
				id="sku-42"
				title="Trap Beat"
				artist="Producer"
				album="The Album"
				artwork="/img/cover.jpg"
				link="/products/trap-beat"
				duration="3:45"
				bpm={174}
				musicalKey="Cm"
				meta={['Stems included']}
				waveform={[0.1, 0.5, 0.9]}
				markers={[
					{ time: 0, label: 'Intro' },
					{ time: 60, label: 'Drop' },
				]}
				favorited={true}
				inCart={false}
				mode="play"
				className="product-card-play"
				aria-label="Preview Trap Beat"
			/>
		);
		const btn = container.querySelector('button')!;
		expect(btn.hasAttribute('data-wb-play')).toBe(true);
		expect(btn.getAttribute('data-wb-url')).toBe('/audio/track.mp3');
		expect(btn.getAttribute('data-wb-id')).toBe('sku-42');
		expect(btn.getAttribute('data-wb-title')).toBe('Trap Beat');
		expect(btn.getAttribute('data-wb-artist')).toBe('Producer');
		expect(btn.getAttribute('data-wb-artwork')).toBe('/img/cover.jpg');
		expect(btn.getAttribute('data-wb-link')).toBe('/products/trap-beat');
		expect(btn.getAttribute('data-wb-duration')).toBe('3:45');
		expect(btn.getAttribute('data-wb-bpm')).toBe('174');
		expect(btn.getAttribute('data-wb-key')).toBe('Cm');
		expect(btn.getAttribute('data-wb-meta')).toBe('["Stems included"]');
		expect(btn.getAttribute('data-wb-waveform')).toBe('[0.1,0.5,0.9]');
		expect(btn.getAttribute('data-wb-markers')).toBe(
			'[{"time":0,"label":"Intro"},{"time":60,"label":"Drop"}]'
		);
		expect(btn.getAttribute('data-wb-favorited')).toBe('true');
		expect(btn.getAttribute('data-wb-in-cart')).toBe('false');
		expect(btn.getAttribute('aria-label')).toBe('Preview Trap Beat');
	});
});
