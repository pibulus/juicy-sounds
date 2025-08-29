# Juicy Sounds 🍊

Dead simple UI sounds that actually work. No bloat, no complexity, just audio that feels good.

## ✨ Quick Start

```javascript
import JuicySounds from 'juicy-sounds';
const sounds = new JuicySounds();

// That's literally it
button.onclick = () => sounds.play('click');
```

## 🎯 What You Get

- **1.6KB** - Entire library, minified
- **8 Essential Sounds** - Click, hover, success, error, etc.
- **Synthetic Tones** - Generate any frequency on the fly
- **Zero Dependencies** - Just vanilla JS
- **Works Everywhere** - Falls back gracefully

## How It Actually Works

Simple Audio() API with smart defaults. No complex Web Audio graphs, no streaming, no workers. Just:

```javascript
const audio = new Audio('./sounds/click.ogg');
audio.play();
```

With automatic fallback to MP3 if OGG fails.

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
const sounds = new JuicySounds();

// UI feedback
sounds.play('click');      // Button clicks
sounds.play('hover');       // Hover states  
sounds.play('success');     // Success actions
sounds.play('error');       // Errors
sounds.play('toggle');      // Switches
sounds.play('notification'); // Alerts

// Synthetic tones
sounds.playTone(440, 200);  // Play A4 for 200ms
sounds.playTone(880, 100);  // Higher pitch, shorter

// Volume control
sounds.setVolume(0.5);      // 50% volume
```

## Available Sounds

The library includes these essential UI sounds:
- `click` - Button press
- `hover` - Mouse over  
- `success` - Success action
- `error` - Error/failure
- `notification` - Alert/message
- `toggle` - Switch/checkbox
- `open` - Panel/modal open
- `close` - Panel/modal close

All sounds are in OGG format with MP3 fallback.

## Configuration

```javascript
const sounds = new JuicySounds({
  volume: 0.7,                    // Global volume
  basePath: './sounds/interface/' // Where to find sounds
});
```

## License

MIT - Use it however you want!

---

_Simple tools for juicy interfaces_ 🍊