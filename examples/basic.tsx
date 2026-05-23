/**
 * examples/basic.tsx
 * ------------------
 *
 * Reference React snippets for `<WaveformBar>` + `<WaveformBarTrigger>`.
 *
 * Library setup (do this ONCE in your app entry — typically `main.tsx`,
 * `app/layout.tsx`, or `root.tsx`):
 *
 *   import '@arraypress/waveform-player/dist/waveform-player.css';
 *   import '@arraypress/waveform-bar/dist/waveform-bar.css';
 *   import '@arraypress/waveform-player'; // installs window.WaveformPlayer
 *   import '@arraypress/waveform-bar';    // installs window.WaveformBar
 *
 * Order matters — the bar has a strict runtime dependency on the
 * player, so load the player first.
 */
import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-react';

/* Example 1 — App root. Render <WaveformBar> exactly once. */
export function AppRoot() {
	return (
		<>
			<MainContent />
			<WaveformBar
				config={{
					persist: true,
					autoResume: true,
					continuous: true,
					showQueue: true,
					maxMeta: 1,
					storageKey: 'my-app-bar',
					actions: {
						favorite: { endpoint: '/api/favorites' },
						cart: { endpoint: '/api/cart' },
					},
				}}
			/>
		</>
	);
}

function MainContent() {
	return <h1>Your app</h1>;
}

/* Example 2 — Single play trigger. */
export function MinimalTrigger() {
	return (
		<WaveformBarTrigger
			url="/audio/track.mp3"
			title="My Track"
			artist="Producer"
		/>
	);
}

/* Example 3 — Product card with full metadata. */
export function ProductCardTrigger() {
	const product = {
		id: 'sku-42',
		title: 'Trap Beat',
		artist: 'Producer',
		artwork: '/img/cover.jpg',
		link: '/products/trap-beat',
		audioPreview: '/audio/beat.mp3',
		bpm: 140,
		musicalKey: 'Cm',
	};

	return (
		<article style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
			<img src={product.artwork} alt="" width={64} height={64} />
			<div>
				<h3 style={{ margin: 0 }}>{product.title}</h3>
				<p style={{ margin: 0, color: '#888' }}>
					{product.bpm} BPM · {product.musicalKey}
				</p>
			</div>
			<WaveformBarTrigger
				url={product.audioPreview}
				id={product.id}
				title={product.title}
				artist={product.artist}
				artwork={product.artwork}
				bpm={product.bpm}
				musicalKey={product.musicalKey}
				link={product.link}
			/>
		</article>
	);
}

/* Example 4 — Queue button with custom content. */
export function QueueButton() {
	return (
		<WaveformBarTrigger
			mode="queue"
			url="/audio/another.mp3"
			title="Another Track"
		>
			+ Queue
		</WaveformBarTrigger>
	);
}

/* Example 5 — DJ-mode markers (multi-chapter mix). */
export function MixWithMarkers() {
	return (
		<WaveformBarTrigger
			url="/audio/guest-mix.mp3"
			title="Friday Night Mix"
			artist="DJ One"
			markers={[
				{ time: 0, label: 'Intro', title: 'Opening Track' },
				{ time: 180, label: 'Drop', title: 'Big Tune', artist: 'Producer X', bpm: 174 },
				{ time: 360, label: 'Outro', title: 'Cooldown' },
			]}
		>
			Play mix
		</WaveformBarTrigger>
	);
}

/* Example 6 — Whole card clickable (no embedded button). */
export function CardAsTrigger() {
	return (
		<WaveformBarTrigger
			as="div"
			url="/audio/card.mp3"
			title="Whole-card play"
			artist="Producer"
			noDefaultIcons
			className="card-as-trigger"
			style={{ padding: '1rem', border: '1px solid #ddd', cursor: 'pointer' }}
		>
			<h3 style={{ margin: 0 }}>Click anywhere on this card</h3>
			<p style={{ margin: '0.5rem 0 0', color: '#888' }}>No play icon.</p>
		</WaveformBarTrigger>
	);
}

/* Example 7 — Listen to bar events from your own effect. */
import { useEffect } from 'react';

export function BarEventListener() {
	useEffect(() => {
		const onPlay = (e: Event) => {
			const detail = (e as CustomEvent).detail;
			console.log('playing:', detail?.track?.title);
		};
		const onTrackChange = (e: Event) => {
			const detail = (e as CustomEvent).detail;
			console.log('track changed to:', detail?.track?.title);
		};

		document.addEventListener('waveformbar:play', onPlay);
		document.addEventListener('waveformbar:trackchange', onTrackChange);
		return () => {
			document.removeEventListener('waveformbar:play', onPlay);
			document.removeEventListener('waveformbar:trackchange', onTrackChange);
		};
	}, []);

	return null;
}
