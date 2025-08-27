# Juice Sounds 🎵

Hey! This is a sound library for web interfaces that actually feels good to use. You know how most UI sounds are either too corporate or too annoying? Yeah, we fixed that.

## What's This About?

Juice Sounds gives your web app that satisfying feedback loop that makes people want to click things. It's like adding haptic feedback to the web, but with actual personality.

Think of it as the sound equivalent of those satisfying button animations you see on Dribbble, except these actually ship to production and work everywhere.

## The Vibe

- **Not Corporate**: No sterile beeps that sound like a 90s ATM
- **Actually Satisfying**: Sounds that make you want to click things twice
- **Lightweight**: ~10KB core, load only what you need
- **Works Everywhere**: iOS, Android, desktop, your grandma's tablet
- **Developer Friendly**: Simple API that doesn't make you read a manual

## Quick Start

### Install It

**NPM/Node:**
```bash
npm install juice-sounds
```

**Deno:**
```typescript
import { playSound } from "https://raw.githubusercontent.com/pibulus/juice-sounds/main/mod.ts";
```

**Or just yolo it:**
```html
<script type="module">
  import { playSound } from 'https://esm.sh/juice-sounds';
</script>
```

### Use It (NEW Simplified API with TypeScript!)

The simplest thing that could possibly work - now with full TypeScript support:

```javascript
import { playSound } from 'juicy-sounds';

// ALL functions are discoverable through IDE autocomplete!
button.onClick = () => playSound.primaryClick();
button.onMouseEnter = () => playSound.hover();

// Handle toggles with proper methods
toggle.onChange = (isOn) => {
  isOn ? playSound.toggleOn() : playSound.toggleOff();
};

// Success/error feedback - direct methods!
try {
  await saveData();
  playSound.success();
} catch {
  playSound.error();
}

// NEW: Gradient panels helper - perfect for color-coded UI
panel.onMouseEnter = () => playSound.gradientPanel('red');
panel2.onMouseEnter = () => playSound.gradientPanel('blue');

// Throttled versions for high-frequency events
slider.onInput = () => playSound.sliderStepThrottled();
```

### Or Use the Original Pack System

```javascript
import { SoundPackManager } from 'juicy-sounds';

// Create your sound manager
const sounds = new SoundPackManager();

// Load some sounds (we include a starter pack)
await sounds.loadPackFromUrl('ui', '/sounds/manifest.json');

// Play them!
sounds.play('click');        // Simple click
sounds.play('hover');        // Hover feedback  
sounds.play('success');      // That sweet success sound
sounds.play('panel.open');   // Swooshy panel
```

### Make It Fancy

Want different sounds for different moods? We got you:

```javascript
// Play with pitch variations (like a gradient!)
sounds.play('click', { pitch: 'high' });    // Higher pitch
sounds.play('click', { pitch: 'low' });     // Lower pitch
sounds.play('click', { pitch: 1.2 });       // Custom pitch

// Volume control for subtle feedback
sounds.play('hover', { volume: 0.3 });      // Gentle hover

// Combine them
sounds.play('success', { 
  pitch: 'high',
  volume: 0.8 
});
```

## Sound Packs & Themes

The library uses a pack system so you can theme your entire app's audio:

```javascript
// Load multiple packs
await sounds.loadPackFromUrl('retro', '/sounds/retro-pack.json');
await sounds.loadPackFromUrl('modern', '/sounds/modern-pack.json');

// Switch between them
sounds.setActivePack('retro');  // Now everything sounds retro!
sounds.setActivePack('modern'); // Back to the future
```

## Creating Your Own Sounds

We include a synthesis engine for creating button sounds programmatically:

```javascript
import { SynthEngine } from 'juice-sounds';

// Create a custom button sound
const customSound = {
  frequency: 280,      // Hz (warm mid-range)
  duration: 0.08,      // seconds (snappy!)
  volume: 0.15,        // subtle
  fadeOut: 0.02,       // quick decay
  type: 'sine'         // smooth waveform
};

await SynthEngine.playSound(customSound);
```

Or use our presets that we've obsessed over:

```javascript
import { SynthEngine, SOUND_PRESETS } from 'juice-sounds';

// These are named after colors to avoid being prescriptive
await SynthEngine.playSound(SOUND_PRESETS.amber);  // Warm, friendly
await SynthEngine.playSound(SOUND_PRESETS.coral);  // Bright, energetic
await SynthEngine.playSound(SOUND_PRESETS.sage);   // Natural, complete
```

## Haptic Feedback

On mobile? We've got haptics too:

```javascript
import { HapticService } from 'juice-sounds';

// Simple haptic patterns
HapticService.light();      // Subtle tap
HapticService.medium();     // Standard feedback
HapticService.heavy();      // Strong confirmation

// Or custom patterns
HapticService.pattern([30, 50, 30]);  // tap-pause-tap
```

## Real World Example

Here's how you might use it in a React component:

```jsx
import { useEffect, useState } from 'react';
import { SoundPackManager } from 'juicy-sounds';

function JuicyButton({ onClick, children }) {
  const [sounds, setSounds] = useState(null);
  
  useEffect(() => {
    const initSounds = async () => {
      const manager = new SoundPackManager();
      await manager.loadPackFromUrl('ui', '/sounds/manifest.json');
      setSounds(manager);
    };
    initSounds();
  }, []);
  
  const handleClick = (e) => {
    sounds?.play('click.primary');
    onClick?.(e);
  };
  
  const handleHover = () => {
    sounds?.play('hover', { volume: 0.3 });
  };
  
  return (
    <button 
      onClick={handleClick}
      onMouseEnter={handleHover}
    >
      {children}
    </button>
  );
}
```

## What's Included?

The default sound pack includes:

- **Clicks**: Primary, secondary, subtle variations
- **Hovers**: Gentle feedback for mouse movement
- **Toggles**: Satisfying on/off switches
- **Panels**: Swooshy opens and closes
- **Success/Error**: Emotional feedback
- **Navigation**: Page transitions, tab switches
- **Selections**: Item picking, color choosing

All carefully tuned to not be annoying even after the 1000th click.

## Philosophy

Look, we've all used apps with bad sound design. Either they're completely silent (boring), or they sound like a casino (exhausting). 

Good sound design is like good typography - you don't notice it consciously, but it makes everything feel better. That's what we're going for here.

## Browser Support

- **Chrome/Edge**: Perfect
- **Safari/iOS**: Great (we handle the weird Web Audio stuff)
- **Firefox**: Solid
- **Your weird browser**: Probably fine?

Falls back gracefully when Web Audio isn't available.

## The Technical Bits

- Built on Web Audio API for performance
- Lazy loads audio files
- Caches decoded audio buffers
- Memory efficient (cleans up after itself)
- TypeScript types included
- Tree-shakeable exports
- Zero dependencies on the core

## Contributing

Found a bug? Want to add a sound pack? Think our sounds aren't juicy enough?

Open an issue or PR! We're pretty chill about contributions. Just keep it friendly and remember - no corporate beeps allowed.

## License

MIT - Use it for whatever, just make it sound good!

## Credits

Built with love in Bangkok by [Pablo](https://github.com/pibulus) while listening to way too much lo-fi hip hop.

Sound assets include selections from:
- Kenney's UI Audio Pack (CC0)
- Custom synthesis engine
- A bunch of late night recording sessions

---

*Remember: Good sound design is felt, not heard. Make it subtle, make it satisfying, make it juice.* 🍊