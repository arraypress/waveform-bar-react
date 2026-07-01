<div align="center">

# Waveform Bar for React

**React components for the Spotify-style persistent bottom-bar audio player.** A singleton `<WaveformBar>` you mount once, plus polymorphic `<WaveformBarTrigger>` play/queue buttons you drop anywhere.

[![npm version](https://img.shields.io/npm/v/@arraypress/waveform-bar-react?style=flat-square&labelColor=09090b&color=3f3f46)](https://www.npmjs.com/package/@arraypress/waveform-bar-react)
[![license](https://img.shields.io/npm/l/@arraypress/waveform-bar-react?style=flat-square&labelColor=09090b&color=3f3f46)](https://github.com/arraypress)

**[Documentation](https://docs.waveformplayer.com/)** · [npm](https://www.npmjs.com/package/@arraypress/waveform-bar-react)

</div>

---

## Install

```bash
npm install @arraypress/waveform-bar-react @arraypress/waveform-bar @arraypress/waveform-player react
```

```tsx
import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-react';

function App() {
  return (
    <>
      {/* Render once in your layout */}
      <WaveformBar config={{ persist: true, continuous: true }} />

      {/* Trigger buttons anywhere */}
      <WaveformBarTrigger url="/audio/track.mp3" title="My Track" artist="Producer" />
    </>
  );
}
```

## Documentation

Full guides, the props reference, and the imperative API live on the docs site.

### -> [docs.waveformplayer.com](https://docs.waveformplayer.com/)

[React guide](https://docs.waveformplayer.com/frameworks/react/) — install, props, the imperative API, and SSR notes. All four React wrappers (player / bar / playlist) are on that page.

## License

MIT © [ArrayPress](https://github.com/arraypress)
