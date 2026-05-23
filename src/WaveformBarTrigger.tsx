/**
 * WaveformBarTrigger.tsx
 * ----------------------
 *
 * Polymorphic React trigger that wires an element up to the
 * persistent `<WaveformBar>`. Emits the `data-wb-*` attribute
 * contract the core library scans for at runtime — the library
 * handles its own click delegation, so we just put the attributes
 * on the element and the rest is plumbed automatically.
 *
 * ## What it renders
 *
 * Defaults to a `<button>` because that's the most accessible
 * choice — keyboard focus, Space / Enter activation, implicit
 * `role="button"`. Override via `as`:
 *
 * ```tsx
 * <WaveformBarTrigger as="div" url={track.url}>
 *   <article className="product-card">…</article>
 * </WaveformBarTrigger>
 * ```
 *
 * ## Default content
 *
 * Without children, the component renders two SVGs the library
 * knows how to toggle:
 *
 * ```html
 * <svg class="wb-show-play">play icon</svg>
 * <svg class="wb-show-pause">pause icon</svg>
 * ```
 *
 * Pass `children` to replace them. Set `noDefaultIcons` to
 * suppress the defaults while still letting children render —
 * useful for programmatic slot detection.
 *
 * @module WaveformBarTrigger
 */
import type { CSSProperties, ReactNode } from 'react';
import type { WaveformBarTriggerProps } from './types';

/**
 * Default play / pause SVG pair. The library's `.wb-icon-swap`
 * CSS toggles their visibility based on whether this trigger's
 * track is currently active.
 */
const DefaultIcons = () => (
	<>
		<svg
			className="wb-show-play"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M8 5v14l11-7z" />
		</svg>
		<svg
			className="wb-show-pause"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M6 5h4v14H6zM14 5h4v14h-4z" />
		</svg>
	</>
);

/**
 * Stringify a value into a `data-*` attribute. Returns `undefined`
 * for nullish so the attribute isn't emitted at all (which lets
 * the library apply its defaults), and JSON-stringifies arrays /
 * objects so the library can `JSON.parse()` them.
 */
function toAttr(value: unknown): string | undefined {
	if (value === undefined || value === null) return undefined;
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	if (typeof value === 'number') return String(value);
	if (typeof value === 'string') return value;
	return JSON.stringify(value);
}

/**
 * `WaveformBarTrigger` — clickable element that tells the
 * persistent `<WaveformBar>` to play / queue a track.
 *
 * @example Card with play button
 *   <article>
 *     <h3>{title}</h3>
 *     <WaveformBarTrigger
 *       url={previewUrl}
 *       id={productId}
 *       title={title}
 *       artist={artist}
 *       artwork={cover}
 *       className="card-play-btn"
 *     />
 *   </article>
 *
 * @example Add-to-queue button with custom icon
 *   <WaveformBarTrigger mode="queue" url={track.url} title={track.title}>
 *     + Queue
 *   </WaveformBarTrigger>
 *
 * @example DJ-mode markers
 *   <WaveformBarTrigger
 *     url="/audio/guest-mix.mp3"
 *     title="Friday Night Mix"
 *     artist="DJ One"
 *     markers={[
 *       { time: 0,   label: 'Intro', title: 'Opening Track' },
 *       { time: 180, label: 'Drop',  title: 'Big Tune', bpm: 174 },
 *       { time: 360, label: 'Outro', title: 'Cooldown' },
 *     ]}
 *   >
 *     Play mix
 *   </WaveformBarTrigger>
 */
export function WaveformBarTrigger(props: WaveformBarTriggerProps) {
	const {
		mode = 'play',
		as = 'button',
		url,
		id,
		title,
		artist,
		album,
		artwork,
		link,
		duration,
		bpm,
		musicalKey,
		meta,
		waveform,
		markers,
		favorited,
		inCart,
		href,
		className,
		style,
		noDefaultIcons = false,
		children,
		...rest
	} = props;

	/**
	 * Build the `data-wb-*` attribute map by hand so omitted props
	 * don't emit empty attributes (which the library would treat
	 * as "set but blank"). Same idiom as the Astro wrapper.
	 */
	const dataAttrs: Record<string, string | undefined> = {
		[mode === 'queue' ? 'data-wb-queue' : 'data-wb-play']: '',
		'data-wb-url': toAttr(url),
		'data-wb-id': toAttr(id ?? url),
		'data-wb-title': toAttr(title),
		'data-wb-artist': toAttr(artist),
		'data-wb-album': toAttr(album),
		'data-wb-artwork': toAttr(artwork),
		'data-wb-link': toAttr(link),
		'data-wb-duration': toAttr(duration),
		'data-wb-bpm': toAttr(bpm),
		'data-wb-key': toAttr(musicalKey),
		'data-wb-meta': Array.isArray(meta) && meta.length > 0 ? JSON.stringify(meta) : undefined,
		'data-wb-waveform':
			Array.isArray(waveform) ? JSON.stringify(waveform) : toAttr(waveform),
		'data-wb-markers':
			Array.isArray(markers) && markers.length > 0
				? JSON.stringify(markers)
				: undefined,
		'data-wb-favorited': toAttr(favorited),
		'data-wb-in-cart': toAttr(inCart),
	};

	/**
	 * Auto-generate an accessible label when the consumer didn't
	 * supply one. "Play $title" / "Add $title to queue" matches
	 * the pattern used across the reference theme.
	 */
	const ariaLabel =
		(rest as { 'aria-label'?: string })['aria-label'] ??
		(mode === 'queue'
			? title
				? `Add ${title} to queue`
				: 'Add to queue'
			: title
				? `Play ${title}`
				: 'Play');

	const mergedClass = ['wb-icon-swap', className].filter(Boolean).join(' ');

	/* Default content — DefaultIcons if the user didn't pass
	 * children and didn't ask for noDefaultIcons. When children
	 * ARE passed, render them instead. */
	const content: ReactNode = children ?? (noDefaultIcons ? null : <DefaultIcons />);

	/**
	 * Build the rendered element with the right tag. We use a
	 * conditional rather than a generic `<Tag>` here because the
	 * `as` prop is a typed string union (not an arbitrary
	 * component), and explicit branches keep the JSX inference
	 * clean for each tag's prop set.
	 */
	const commonProps = {
		...dataAttrs,
		className: mergedClass,
		style: style as CSSProperties | undefined,
		'aria-label': ariaLabel,
	};

	if (as === 'a') {
		return (
			<a href={href} {...commonProps}>
				{content}
			</a>
		);
	}
	if (as === 'div') {
		return <div {...commonProps}>{content}</div>;
	}
	if (as === 'span') {
		return <span {...commonProps}>{content}</span>;
	}
	return (
		<button type="button" {...commonProps}>
			{content}
		</button>
	);
}
