# Juicy Sounds 🍊

Dead simple mechanical keyboard sounds for web apps. Make typing feel amazing.

## ✨ Features

- 🎹 **Real Mechanical Keyboard Sounds** - Cherry MX Black recordings with 88+ keys mapped
- 🔧 **Framework Agnostic** - Works with Fresh, Next.js, Vite, SvelteKit, or vanilla JS
- 🎚️ **Simple API** - One class, intuitive methods, graceful fallbacks
- 🪶 **Lightweight** - No complex dependencies, just Web Audio API
- 🎯 **Plug & Play** - Copy files, import, done

## 🎹 Quick Start

```javascript
import { SimpleTypeWriter } from './SimpleTypeWriter.js';

const typewriter = new SimpleTypeWriter({
  basePath: '/sounds/keyboard-packs/' // Framework-dependent, see below
});

await typewriter.init();
typewriter.attach('input, textarea');
```

## 🚀 Framework Integration

### Fresh / Deno

**Step 1**: Copy sound files
```bash
cp -r sounds/keyboard-packs static/sounds/
```

**Step 2**: Import and use
```javascript
import { SimpleTypeWriter } from "../utils/SimpleTypeWriter.js";

const typewriter = new SimpleTypeWriter({
  basePath: '/sounds/keyboard-packs/'
});

await typewriter.init();
typewriter.attach('input, textarea');
```

### Next.js / React

**Step 1**: Copy sound files
```bash
cp -r sounds/keyboard-packs public/sounds/
```

**Step 2**: Import and use
```javascript
import { SimpleTypeWriter } from '@/utils/SimpleTypeWriter';

useEffect(() => {
  const typewriter = new SimpleTypeWriter({
    basePath: '/sounds/keyboard-packs/'
  });

  typewriter.init().then(() => {
    typewriter.attach('input, textarea');
  });

  return () => typewriter.dispose();
}, []);
```

### Vite / SvelteKit

**Step 1**: Copy sound files
```bash
cp -r sounds/keyboard-packs public/sounds/  # Vite
cp -r sounds/keyboard-packs static/sounds/  # SvelteKit
```

**Step 2**: Import and use
```javascript
import { SimpleTypeWriter } from './SimpleTypeWriter';

const typewriter = new SimpleTypeWriter({
  basePath: '/sounds/keyboard-packs/'
});

await typewriter.init();
typewriter.attach('input, textarea');
```

### Vanilla HTML

**Step 1**: Include the script
```html
<script type="module">
  import { SimpleTypeWriter } from './src/SimpleTypeWriter.js';

  const typewriter = new SimpleTypeWriter({
    basePath: './sounds/keyboard-packs/'
  });

  await typewriter.init();
  typewriter.attach('input, textarea');
</script>
```

## 🔧 Configuration Options

```javascript
const typewriter = new SimpleTypeWriter({
  volume: 0.3,                         // Volume (0-1, default: 0.3)
  enabled: true,                        // Enable/disable sounds (default: true)
  pack: 'cherry-mx-black',              // Sound pack name (default: 'cherry-mx-black')
  basePath: '/sounds/keyboard-packs/',  // Where to find sound files
  debug: false                          // Enable console logging (default: false)
});
```

## 🐛 Debugging Integration Issues

If sounds aren't loading, use the test helper:

```javascript
const typewriter = new SimpleTypeWriter();
await typewriter.testConnection(); // Check if files are accessible

// Console output shows:
// ✅ Success! Found: Cherry MX Black
// Keys mapped: 88
// OR
// ❌ HTTP 404 - Config file not found
// Expected location: /sounds/keyboard-packs/cherry-mx-black/config.json
```

## 📁 File Structure

Your project should look like:

**Fresh / Next.js / Vite:**
```
your-project/
├── static/ (or public/)
│   └── sounds/
│       └── keyboard-packs/
│           └── cherry-mx-black/
│               ├── config.json (7.4KB)
│               └── sound.ogg (2.7MB)
└── utils/
    └── SimpleTypeWriter.js
```

**Vanilla HTML:**
```
your-project/
├── sounds/
│   └── keyboard-packs/
│       └── cherry-mx-black/
│           ├── config.json
│           └── sound.ogg
└── src/
    └── SimpleTypeWriter.js
```

## 🎛️ API Reference

### Methods

```javascript
// Initialize and load sounds
await typewriter.init();
await typewriter.init('cherry-mx-black'); // Load specific pack

// Attach to elements
typewriter.attach('input, textarea');     // CSS selector
typewriter.attach('#my-input');           // Single element

// Switch sound packs
await typewriter.setPack('cherry-mx-black');

// Debug connection
await typewriter.testConnection();        // Returns true/false

// Controls
typewriter.enable();                      // Enable sounds
typewriter.disable();                     // Disable sounds
typewriter.setVolume(0.5);                // Set volume (0-1)

// Cleanup
typewriter.detach();                      // Remove from all elements
typewriter.dispose();                     // Full cleanup
```

### Events

Sounds play automatically on `keydown` events for attached elements. All 88 keys are mapped including:
- Letters A-Z
- Numbers 0-9
- Space, Enter, Backspace, Tab, Escape
- Shift, Control, Alt, Command/Windows
- Punctuation: . , / ; ' [ ]

## 🎨 Available Sound Packs

Currently included:
- **cherry-mx-black** - Cherry MX Black mechanical switches (2.7MB)

More packs coming soon! Contribute your own recordings.

## 📦 Installation

**Manual (Current method)**
```bash
# Clone or download this repo
git clone https://github.com/pibulus/juicy-sounds.git

# Copy into your project
cp -r juicy-sounds/sounds/keyboard-packs your-project/static/sounds/
cp juicy-sounds/src/SimpleTypeWriter.js your-project/utils/
```

**NPM (Coming Soon)**
```bash
npm install @juicy-sounds/typewriter
```

## License

MIT - Use it however you want!

---

_Simple tools for juicy interfaces_ 🍊