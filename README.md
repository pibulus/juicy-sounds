# Juicy Sounds 🎵

A delightful sound library for web interfaces that actually feels good to use. No corporate beeps, just pure audio juice.

## ✨ 30-Second Integration

```javascript
import JuicySounds from 'juicy-sounds';
const sounds = new JuicySounds(); // That's it!

// Add sounds to any element
button.onclick = () => sounds.play('click');
button.onmouseenter = () => sounds.play('hover');
```

Sounds are **lazy-loaded from CDN** - 0KB initial bundle size!

## 🎯 What Makes It Juicy

- **Zero Bundle Impact** - Sounds lazy-load from CDN on first play
- **Interface Sounds Pack** - 24 essential UI sounds (was 100, we cleaned house)
- **Synthetic Gradients** - Musical tones generated on-the-fly
- **Smart Defaults** - Pre-configured volumes for each sound type
- **TypeWriter Sounds** - Mechanical keyboard simulator with variants
- **OGG Format** - Smaller files, better quality, works everywhere
- **TypeScript Ready** - Full type definitions included
- **Actually Tested** - Try `examples/quick-start.html` right now

## How It Works

1. **Lazy Loading** - Sounds load from CDN on first play (not in bundle)
2. **Smart Caching** - Once loaded, sounds play instantly
3. **Synthetic Fallback** - Gradient tones generated with Web Audio API
4. **Volume Presets** - Each sound type has optimal volume (hover: 5%, click: 15%)


## Quick Start

### Installation

```bash
# NPM
npm install juicy-sounds

# Deno
import JuicySounds from "https://deno.land/x/juicy_sounds/mod.ts"

# CDN (no install)
<script type="module">
  import JuicySounds from "https://unpkg.com/juicy-sounds";
</script>
```

### Basic Usage

```javascript
import JuicySounds from 'juicy-sounds';

const sounds = new JuicySounds();

// Essential sounds - all lazy loaded!
button.onclick = () => sounds.play('click');
button.onmouseenter = () => sounds.play('hover');

// Handle toggles
toggle.onchange = (e) => {
  sounds.play(e.target.checked ? 'toggle.on' : 'toggle.off');
};

// Success/error feedback
try {
  await saveData();
  sounds.play('success');
} catch {
  sounds.play('error');
}

// Panel animations
panel.onclick = () => {
  const isOpen = panel.classList.toggle('open');
  sounds.play(isOpen ? 'panel.open' : 'panel.close');
};
```

### Auto-Attach Pattern

```javascript
// Automatically attach sounds to elements
sounds.autoAttach({
  'click': 'button',
  'hover': 'button, a',  
  'success': '.success-btn',
  'error': '.danger-btn'
});

// That's it! All matching elements now have sounds
```

## 🎹 The Gradient Sound Solution (Synthetic, Not File-Based!)

**The Problem:** Pre-recorded sound files labeled with _low, _mid, _high often don't have audible pitch differences (we tested them, trust us).

**Our Solution:** Gradient sounds are **synthetically generated** using Web Audio API, NOT pre-recorded files. This guarantees perfect pitch control.

### How It Works:
```javascript
// YOU control the mapping - it's manual, not automatic
panels.forEach((panel, index) => {
  panel.onMouseEnter = () => sounds.playGradientSound(index, panels.length);
});

// Index 0 → 261.63 Hz (C4 - lowest)
// Index 1 → 293.66 Hz (D4)
// Index 2 → 329.63 Hz (E4)
// Index 3 → 392.00 Hz (G4)
// Index 4 → 440.00 Hz (A4)
// Index 5 → 493.88 Hz (B4 - highest)
```

### For Color-Coded UI:
```javascript
// Manual mapping - you decide what sounds "red" or "blue"
const colorToIndex = {
  red: 0,     // Lowest pitch (warm)
  orange: 1,
  yellow: 2,
  green: 3,
  blue: 4,
  purple: 5   // Highest pitch (cool)
};

redPanel.onHover = () => sounds.playGradientSound(colorToIndex.red, 6);
```

### Customize the Scale:
```javascript
// Simple scale system - 5 scales × 7 notes = 35 combinations!
sounds.setGradientScale('major', 'C');      // Default: happy, bright
sounds.setGradientScale('pentatonic', 'A'); // Safe, no bad notes
sounds.setGradientScale('mixolydian', 'D'); // Slightly exotic
sounds.setGradientScale('minor', 'E');      // Moody, serious
sounds.setGradientScale('blues', 'G');      // Playful, soulful

// Or define custom frequencies:
sounds.setGradientFrequencies([220, 247, 277, 293, 329, 370]);
```

### Change the Synth Sound:
```javascript
// Default is 'sine' wave (pure tone)
sounds.setGradientWaveform('square');   // 8-bit chiptune
sounds.setGradientWaveform('sawtooth'); // Buzzy synthesizer
sounds.setGradientWaveform('triangle'); // Mellow, flute-like
```

Perfect for:
- Color-coded panels (manually map colors to pitches)
- Progress indicators (0-100% mapped to ascending tones)
- Depth layers (surface→deep = high→low frequency)
- Musical interfaces (literal piano keys!)

## Available Sounds

### Interface Sounds Pack (Included)
**24 Essential UI Sounds** (224KB total, lazy loaded)
- **Clicks**: 3 variations
- **Hovers**: 3 subtle variations (5% volume)
- **Success/Error**: 3 variations each (30% volume)
- **Notifications**: 3 glass-like sounds
- **Toggles**: On/off states
- **Panels**: Open/close animations
- **Special**: Pluck & bong effects



## 🆕 TypeWriter - Mechanical Keyboard Sounds

Make every keystroke satisfying with realistic typing sounds:

```javascript
import { TypeWriter } from 'juicy-sounds';

const typewriter = new TypeWriter({
  style: 'mechanical',  // or 'soft', 'vintage'
  volume: 0.3,
  pitchVariation: true   // Natural variety
});

// Auto-attach to all inputs
typewriter.attach('input, textarea');
```

**Features:**
- Different sounds for space, enter, backspace
- Subtle pitch variation for natural feel
- Volume adjusts with typing speed
- Multiple keyboard styles

## Haptic Feedback

On mobile? We've got haptics too:

```javascript
import { HapticService } from "juice-sounds";

// Simple haptic patterns
HapticService.light(); // Subtle tap
HapticService.medium(); // Standard feedback
HapticService.heavy(); // Strong confirmation

// Or custom patterns
HapticService.pattern([30, 50, 30]); // tap-pause-tap
```

## API Reference

```javascript
const sounds = new JuicySounds({
  lazyLoad: true,           // Load sounds on first play (default: true)
  cdn: true,                // Use CDN (default: true when lazy)
  basePath: '/sounds',      // Custom sound path
  volume: 1,                // Global volume (0-1)
  muted: false,            // Start muted
  preload: ['click']       // Sounds to preload immediately
});

// Playback
sounds.play('click');                    // Basic sound
sounds.play('toggle.on');                // Nested sound
sounds.playGradientSound(index, total);  // Synthetic gradient

// Quick methods
sounds.playClick();
sounds.playHover();
sounds.playSuccess();
sounds.playError();
sounds.playRandomClick();

// Control
sounds.setVolume(0.5);
sounds.mute();
sounds.unmute();
sounds.toggle();

// Gradient customization
sounds.setGradientScale('pentatonic', 'A');  // A Pentatonic scale
sounds.setGradientWaveform('square');         // Change synth sound
```

## Try It Now

1. **Quick Start**: `examples/quick-start.html` - Basic integration demo
2. **Test Sounds**: `examples/test-sounds.html` - Try all 24 sounds
3. **TypeWriter**: `examples/typing-sounds.html` - Mechanical keyboard simulator
4. **Advanced**: `examples/advanced-patterns.html` - Gradients, pitch variation, sync

## Framework Examples

### React
```jsx
import { useEffect, useState } from 'react';
import JuicySounds from 'juicy-sounds';

function App() {
  const [sounds] = useState(() => new JuicySounds());
  
  return (
    <button 
      onClick={() => sounds.play('click')}
      onMouseEnter={() => sounds.play('hover')}
    >
      Click Me
    </button>
  );
}
```

### Vue
```vue
<template>
  <button @click="playClick" @mouseenter="playHover">
    Click Me
  </button>
</template>

<script>
import JuicySounds from 'juicy-sounds';

export default {
  data() {
    return {
      sounds: new JuicySounds()
    };
  },
  methods: {
    playClick() { this.sounds.play('click'); },
    playHover() { this.sounds.play('hover'); }
  }
};
</script>
```


## Comparison to Other Libraries

| Feature | Juicy Sounds | Howler.js | SND.dev | Tone.js |
|---------|--------------|-----------|---------|---------|  
| **Bundle Size** | 10KB | 7KB | 5KB | 180KB |
| **Included Sounds** | 24 | 0 | 10-20 | 0 |
| **Lazy Loading** | ✅ Built-in | ❌ | ❌ | ❌ |
| **CDN Support** | ✅ Automatic | ❌ | ✅ | ❌ |
| **Pitch Variation** | ✅ ±5% random | ✅ Manual | ❌ | ✅ Complex |
| **Gradient Synth** | ✅ C major scale | ❌ | ❌ | ✅ Full synth |
| **Setup Time** | 30 seconds | 5 minutes | 2 minutes | 30+ minutes |
| **Best For** | Quick UI sounds | Games | Simple clicks | Music apps |

**Why Juicy Sounds?** It's the "Goldilocks" solution - simpler than Howler.js, more complete than SND, and actually ships to production (unlike complex Tone.js setups).

## Browser Support

✅ Chrome, Edge, Firefox, Safari (including iOS)
✅ Falls back gracefully when Web Audio isn't available  
✅ Handles Safari's weird autoplay policies

## Bundle Size

- **Core Library**: ~10KB gzipped
- **Sound Files**: 0KB (lazy loaded from CDN)
- **Total Initial Impact**: ~10KB

Sounds load on first play, cache forever. No bundle bloat!

## New Advanced Features

### Pitch Randomization (New!)
Prevents monotony with automatic ±5% pitch variation:
```javascript
// Automatic variation on frequently-used sounds
sounds.play('click', { randomPitch: true });

// Built into quick methods
sounds.playClick(); // Has randomization by default
```

### Professional Sound Design
We've documented industry best practices:
- **[Best Practices Guide](docs/BEST_PRACTICES.md)** - Avoid ear fatigue, create harmony
- **[Sound Resources](docs/SOUND_RESOURCES.md)** - Find more sounds, compare options
- **[Advanced Patterns](examples/advanced-patterns.html)** - Interactive demos

## What's Included

- ✅ 24 essential Interface Sounds (Kenney, CC0)
- ✅ Automatic lazy loading from CDN
- ✅ Pitch randomization to prevent monotony
- ✅ Harmonic gradient synthesis
- ✅ Volume presets per sound type
- ✅ TypeScript definitions
- ✅ Three interactive demo pages

## Contributing

Found a bug? Want to add a sound pack? Think our sounds aren't juicy enough?

Open an issue or PR! We're pretty chill about contributions. Just keep it
friendly and remember - no corporate beeps allowed.

## License

MIT - Use it for whatever, just make it sound good!

## Credits

Built with love in Bangkok by [Pablo](https://github.com/pibulus) while
listening to way too much lo-fi hip hop.

Sound assets include selections from:

- Kenney's UI Audio Pack (CC0)
- Custom synthesis engine
- A bunch of late night recording sessions

---

_Remember: Good sound design is felt, not heard. Make it subtle, make it
satisfying, make it juice._ 🍊
