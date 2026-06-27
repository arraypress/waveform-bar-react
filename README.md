# @arraypress/waveform-bar-react

React components for [`@arraypress/waveform-bar`](https://github.com/arraypress/waveform-bar) — a Spotify-style persistent bottom-bar audio player. Two components:

| | |
|---|---|
| **`<WaveformBar>`** | Singleton mount. Render **once** in your root layout. Takes a typed `config` prop. |
| **`<WaveformBarTrigger>`** | Polymorphic click trigger. Render anywhere you want a play / queue button — product cards, modals, track rows. |

The core libraries stay zero-dependency vanilla JS, so they keep working anywhere a `<script>` tag does. This package adds the framework-native ergonomics — typed props, proper attribute serialisation, JSON encoding for arrays — for React developers.

```tsx
import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-react';

function App() {
  return (
    <>
      <WaveformBarTrigger url="/audio/track.mp3" title="My Track" />
      <WaveformBar config={{ persist: true, continuous: true }} />
    </>
  );
}
```

## Installation

```bash
npm install @arraypress/waveform-bar-react \
            @arraypress/waveform-bar \
            @arraypress/waveform-player \
            react
```

Three peer dependencies — you bring them so you control versions. The bar has a strict runtime dependency on the player; both must be present.

## Setup

Load both core libraries' JS + CSS once at your app entry. **Order matters** — the player must load before the bar:

```tsx
// main.tsx (Vite) / app/layout.tsx (Next.js) / root.tsx (Remix)
import '@arraypress/waveform-player/dist/waveform-player.css';
import '@arraypress/waveform-bar/dist/waveform-bar.css';
import '@arraypress/waveform-player';   // installs window.WaveformPlayer
import '@arraypress/waveform-bar';      // installs window.WaveformBar
```

Then mount `<WaveformBar>` exactly once in your layout:

```tsx
function Layout({ children }) {
  return (
    <>
      {children}
      <WaveformBar config={{ persist: true, continuous: true }} />
    </>
  );
}
```

Triggers can render anywhere — they find the bar via document-level click delegation, no React context needed.

## Usage

### Basic play trigger

```tsx
<WaveformBarTrigger
  url="/audio/track.mp3"
  title="My Track"
  artist="Producer"
/>
```

Renders a `<button>` with the play / pause SVG pair the library knows how to toggle.

### With full metadata

```tsx
<WaveformBarTrigger
  url="/audio/beat.mp3"
  id="product-42"
  title="Trap Beat"
  artist="Producer"
  artwork="/img/cover.jpg"
  album="Beat Tape Vol. 3"
  bpm={140}
  musicalKey="Cm"
  duration="3:45"
  link="/products/trap-beat"
  meta={['Stems included', '24-bit']}
/>
```

### Add to queue (no auto-play)

```tsx
<WaveformBarTrigger
  mode="queue"
  url="/audio/track.mp3"
  title="My Track"
>
  + Queue
</WaveformBarTrigger>
```

### Pre-computed waveform peaks

```tsx
<WaveformBarTrigger
  url="/audio/track.mp3"
  waveform="/peaks/track.json"
/>
```

Saves the Web Audio decode at play time. Generate the JSON at build time with [`@arraypress/waveform-gen`](https://github.com/arraypress/waveform-gen).

### DJ-mode markers (multi-chapter mixes)

Title / artist / artwork update as playback crosses each marker boundary.

```tsx
<WaveformBarTrigger
  url="/audio/guest-mix.mp3"
  title="Friday Night Mix"
  artist="DJ One"
  markers={[
    { time: 0,   label: 'Intro', title: 'Opening Track' },
    { time: 180, label: 'Drop',  title: 'Big Tune', bpm: 174, key: 'Am' },
    { time: 360, label: 'Outro', title: 'Cooldown' },
  ]}
>
  Play mix
</WaveformBarTrigger>
```

### Whole-card-as-trigger

Set `as="div"` and pass `noDefaultIcons` so the SVG pair doesn't leak into the card layout:

```tsx
<WaveformBarTrigger
  as="div"
  url="/audio/track.mp3"
  title="Card Track"
  noDefaultIcons
  className="product-card"
>
  <img src={cover} alt="" />
  <h3>{title}</h3>
</WaveformBarTrigger>
```

### Listening to bar events

The bar dispatches every state change as a bubbling `CustomEvent` — listen from any React effect:

```tsx
useEffect(() => {
  const onPlay = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    console.log('playing:', detail.track.title);
  };
  document.addEventListener('waveformbar:play', onPlay);
  return () => document.removeEventListener('waveformbar:play', onPlay);
}, []);
```

Events available: `waveformbar:play`, `waveformbar:pause`, `waveformbar:trackchange`, `waveformbar:favorite`, `waveformbar:cart`, `waveformbar:volumechange`, `waveformbar:markerchange`, `waveformbar:queuechange`.

### Imperative control

The bar's singleton instance is at `window.WaveformBar`. Cast it where you need it:

```tsx
function NextButton() {
  return (
    <button onClick={() => window.WaveformBar?.next()}>
      Next track
    </button>
  );
}
```

Methods: `play(track)`, `pause()`, `togglePlay()`, `next()`, `previous()`, `setVolume(0-1)`, `toggleMute()`, `setRepeat('off'|'all'|'one')`, `cycleRepeat()`, `addToQueue(track)`, `clearQueue()`, `seekToMarker(index)`, `getCurrentTrack()`, `getQueue()`, more — see the [core library README](https://github.com/arraypress/waveform-bar) for the full surface.

## How re-renders are handled

`<WaveformBar>` only re-runs `init()` when the **structure** of the `config` prop changes (compared via JSON.stringify). Reference changes alone don't re-init — so passing a fresh object every render is safe as long as the shape is stable.

`<WaveformBarTrigger>` is a pure render — it just stamps out a `<button>` (or whatever `as` resolves to) with the right `data-wb-*` attributes. The bar's runtime handles clicks via document-level delegation, so trigger re-renders are virtually free.

## Props

### `<WaveformBar>` config

Every field optional — the library has sensible defaults. See [`src/types.ts`](./src/types.ts) for the full JSDoc.

```ts
{
  // Persistence + behaviour
  persist?: boolean;          // default true
  autoResume?: boolean;       // default true
  continuous?: boolean;       // default true
  repeat?: 'off' | 'all' | 'one';

  // UI toggles
  showQueue, showPrevNext, showRepeat, showVolume, showMute,
  showTime, showTrackLink, showMeta: boolean;
  maxMeta: number;

  // Layout + docking
  wide: boolean;              // default false — span full width (lifts the 1400px cap)
  maxWidth: string | null;    // custom content max-width, e.g. '1200px' (overrides wide)
  position: 'bottom' | 'top'; // default 'bottom' — which edge the bar docks to
  collapsible: boolean;       // default false — collapse to a floating transport pill

  // Theming
  theme: 'dark' | 'light' | null;
  defaultArtwork: string;

  // Waveform visualisation
  waveform: boolean;          // default true — false = classic Spotify-style seek bar
  waveformStyle: 'bars' | 'mirror' | 'line' | 'blocks' | 'dots' | 'seekbar';
  waveformHeight, barWidth, barSpacing: number;
  waveformColor, progressColor, markerColor: string;

  // Sharing + errors
  share: boolean;             // default false — show a "copy share link" button
  shareParam: string;         // default 'wt' — URL query param for the shared timestamp
  errorText: string | null;   // custom "audio failed to load" message

  // Volume + persistence keys
  volume: number;
  storageKey: string;

  // Server-side actions
  actions: {
    favorite?: { endpoint, method?, headers? };
    cart?: { endpoint, method?, headers? };
  };
}
```

### `<WaveformBarTrigger>` props

| Prop | Type | Becomes |
|---|---|---|
| `url` *required* | `string` | `data-wb-url` |
| `id` | `string` | `data-wb-id` (falls back to `url`) |
| `title` | `string` | `data-wb-title` |
| `artist` | `string` | `data-wb-artist` |
| `album` | `string` | `data-wb-album` |
| `artwork` | `string` | `data-wb-artwork` |
| `link` | `string` | `data-wb-link` |
| `duration` | `string \| number` | `data-wb-duration` |
| `bpm` | `string \| number` | `data-wb-bpm` |
| `musicalKey` | `string` | `data-wb-key` |
| `meta` | `string[]` | `data-wb-meta` (JSON) |
| `waveform` | `number[] \| string` | `data-wb-waveform` (JSON if array) |
| `markers` | `WaveformBarMarker[]` | `data-wb-markers` (JSON) |
| `favorited` | `boolean` | `data-wb-favorited` |
| `inCart` | `boolean` | `data-wb-in-cart` |
| `mode` | `'play' \| 'queue'` (default `'play'`) | Picks the trigger attribute |
| `as` | `'button' \| 'a' \| 'div' \| 'span'` (default `'button'`) | Element to render |
| `href` | `string` | When `as="a"` |
| `aria-label` | `string` | Falls back to `Play {title}` / `Add {title} to queue` |
| `className` | `string` | Appended to `wb-icon-swap` |
| `style` | `CSSProperties` | Inline style |
| `noDefaultIcons` | `boolean` | Suppress the default play/pause SVGs |
| `children` | `ReactNode` | Replaces the default icon content |

## TypeScript

```ts
import type {
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
} from '@arraypress/waveform-bar-react';
```

`.d.ts` ships for both ESM and CJS consumers.

## Testing

```bash
npm test          # one-shot
npm run test:watch
npm run typecheck
npm run build     # emit dist/index.js, dist/index.cjs, dist/index.d.ts
```

53 tests cover `<WaveformBarTrigger>` rendering + attribute mapping (no module mocking needed) and `<WaveformBar>` lifecycle (window global mocked since jsdom has no Web Audio).

## License

MIT © ArrayPress
