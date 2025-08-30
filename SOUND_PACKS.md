# 🎹 Keyboard Sound Packs

## Overview

Juicy Sounds now supports ultra-realistic mechanical keyboard sounds using the Mechvibes sound pack format! This gives you authentic typing sounds recorded from real mechanical keyboards.

## Current Sound Packs

### Cherry MX Black (Linear)
- **Location:** `/sounds/keyboard-packs/cherry-mx-black/`
- **Description:** Smooth linear switches with no tactile bump
- **Size:** 2.7MB
- **Keys:** 88 unique key sounds

## How It Works

Each sound pack consists of:
1. **sound.ogg** - Single audio file containing all key sounds (audio sprite)
2. **config.json** - Maps each key to its timestamp and duration in the audio file

Example config structure:
```json
{
  "name": "Cherry MX Black - ABS keycaps",
  "defines": {
    "65": [2894, 226],  // Key 'A': starts at 2894ms, plays for 226ms
    "32": [36902, 234], // Space bar: starts at 36902ms, plays for 234ms
    ...
  }
}
```

## Adding New Sound Packs

### Method 1: Download from Mechvibes

1. Visit [mechvibes.com/sound-packs](https://mechvibes.com/sound-packs/)
2. Download any sound pack (they're all free!)
3. Extract the ZIP file
4. Copy the folder to `/sounds/keyboard-packs/`
5. Rename the folder to a simple name (e.g., `cherry-mx-blue`)

### Method 2: Create Your Own

1. Record each key press as a separate audio file
2. Combine them into a single audio sprite using ffmpeg or Audacity
3. Create a config.json mapping each key code to its position
4. Place both files in a new folder under `/sounds/keyboard-packs/`

## Usage

### Simple Mode (Default)
Lightweight mode using individual sound files:
```javascript
const typewriter = new TypeWriter();
typewriter.attach('input, textarea');
```

### Realistic Mode
Ultra-realistic mode with mechanical keyboard sounds:
```javascript
const typewriter = new TypeWriter({
  mode: 'realistic',
  soundPack: 'cherry-mx-black',
  volume: 0.3
});
typewriter.attach();
```

### Switch Modes Dynamically
```javascript
// Start simple
const typewriter = new TypeWriter();

// Switch to realistic when ready
await typewriter.setMode('realistic');
await typewriter.setSoundPack('cherry-mx-blue');
```

## Performance Notes

- **Simple Mode:** ~50KB, instant load, uses pitch variation for variety
- **Realistic Mode:** ~2-3MB per pack, lazy loaded, every key unique
- Audio sprites are cached in memory after first load
- Web Audio API ensures low latency playback

## Popular Sound Packs to Add

From Mechvibes community:
- **Cherry MX Blue** - Classic clicky switches
- **Topre** - Premium thocky sound
- **Holy Panda** - Tactile enthusiast favorite
- **IBM Model M** - Retro buckling spring
- **Typewriter** - Vintage mechanical typewriter

## Browser Compatibility

- ✅ Chrome/Edge - Full support with Web Audio API
- ✅ Firefox - Full support
- ✅ Safari - Works after user interaction
- ⚠️ Mobile - Requires user interaction to enable audio

## Demo

Try it out: Open `typing-demo.html` in your browser to experience both modes!