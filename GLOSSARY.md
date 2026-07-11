# GLOSSARY.md

## Core Library
**SimpleTypeWriter** - Main class providing mechanical keyboard sounds for web inputs

## Key Methods
**init(packName)** - Loads sound pack and config, initializes Web Audio API
**attach(selector)** - Attaches typing sounds to DOM elements matching selector
**detach(selector)** - Removes typing sounds from elements
**playSound(key)** - Plays specific key sound from sprite
**testConnection()** - Debug helper checking file paths and load status
**destroy()** - Cleanup method, removes all listeners and stops audio

## Configuration
**volume** - Sound volume (0-1, default 0.3)
**enabled** - Enable/disable sounds (default true)
**pack** - Sound pack name (default 'cherry-mx-black')
**basePath** - Base path to keyboard-packs directory (critical for framework portability)
**debug** - Enable console logging (default false)
**debounceMs** - Minimum milliseconds between sounds (default 10)
**retryAttempts** - Load retry count on failure (default 3)
**preloadOnHover** - Preload on input hover (default true)
**cacheBuffers** - Cache decoded audio buffers (default true)

## Sound Pack Files
**config.json** - 88 key mappings with timestamp ranges
**sound.ogg** - Audio sprite file (2.7MB, all keys in one file)

## Key Mappings
**88 keys total** - Full keyboard layout including modifiers, function keys, numpad
**Timestamp-based playback** - Each key has start/end time in sprite

## Concepts
**Web Audio API** - Low-latency audio playback with gain control
**Audio sprite** - Single file with multiple sounds via timestamps
**Framework portability** - basePath config handles Fresh/Next/Vite/vanilla differences
**Graceful degradation** - Sounds fail silently, never breaks typing
**Event delegation** - Uses bubbling for dynamic input detection
**Buffer caching** - Decoded audio cached for performance
**Cherry MX Black** - Real mechanical keyboard recordings
