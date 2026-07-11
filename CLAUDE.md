# CLAUDE.md

Project-specific guidance for Claude Code when working on juicy-sounds.

## 📁 Project Overview

**Juicy Sounds** - Dead simple mechanical keyboard sounds for web apps. Make typing feel amazing.

**Status**: 100% ready, needs NPM publish
**Stack**: Vanilla JS (ES6 modules), Web Audio API
**Purpose**: Plug-and-play typing sounds for any web framework

## 🎯 What This Does

Provides real mechanical keyboard sound feedback (Cherry MX Black recordings) for web input elements. Works across Fresh, Next.js, Vite, SvelteKit, vanilla HTML - anywhere JavaScript runs.

**Core Value**: Copy 2 files, call `.attach()`, done. No complex setup, no dependencies.

## 🏗 Architecture

```
juicy-sounds/
├── index.js                      # npm entry (JuicyKeyboard + addKeyboardSounds)
├── src/
│   └── SimpleTypeWriter.js      # Main class (complete)
├── sounds/
│   └── keyboard-packs/          # THE product: real switch recordings
│       ├── cherry-mx-black/     # config.json (88 key mappings) + sound.ogg sprite
│       ├── cherry-mx-blue/
│       └── topre/
├── index.html                    # Demo page (typewriter)
├── simple-demo.html              # Minimal example
├── archive/                      # Retired: legacy interface sounds + old broad-library vision
│   └── legacy-interface/        # (UI cues now live in sibling @softstack/weightless)
├── README.md                     # Integration docs
├── INTEGRATION_FEEDBACK.md       # Real-world learnings
└── CLAUDE.md                     # This file
```

## 👨‍👩‍👧 Sibling: @softstack/weightless

Juicy = real recordings (physical textures, keyboards). Weightless = 0kb synthesis (abstract UI cues).
Never re-add interface/UI sounds here — that territory belongs to weightless. Both libraries
read/write the shared `softstack:sound` localStorage key ({enabled, volume}) unless
`sharedState: false` — one mute silences the family.

## 🔑 Key Technical Decisions

**Web Audio API over Audio() tags**
- Precise playback control (sprite offsets)
- Low latency for typing feel
- Volume/gain node control

**Single OGG sprite file**
- 88 keys in one 2.7MB file
- Timestamp-based playback (config.json defines ranges)
- One HTTP request vs 88 requests

**Configurable `basePath`**
- THE key unlock for framework portability
- Fresh/Next/Vite use `/sounds/` (absolute)
- Vanilla HTML uses `./sounds/` (relative)

**Graceful degradation**
- Sounds fail silently, typing still works
- Helpful error messages with actionable fixes
- `testConnection()` method for debugging

## 🎨 Code Style

- **Vanilla JS** - No build step, no transpilation
- **ES6 modules** - `export class`, works everywhere
- **Simple > clever** - Readable over terse
- **Fail gracefully** - Never break the typing experience
- **Opt-in logging** - `debug: true` for console output

## 📋 Development Commands

```bash
# Test demo locally
python3 -m http.server 8001
open http://localhost:8001/index.html

# Test in framework
cp -r sounds/keyboard-packs ../your-project/static/sounds/
cp src/SimpleTypeWriter.js ../your-project/utils/

# Audit
# Check: metadata, SEO, security, accessibility, utility
```

## 🚨 Important Notes

**DO NOT:**
- Add dependencies (keep it vanilla)
- Add build steps (ship raw JS)
- Break backward compatibility (people are integrating this)
- Add console.log without `debug` flag
- Change default `basePath` (breaks vanilla demo)

**DO:**
- Test changes in vanilla demo first
- Keep error messages helpful
- Document breaking changes clearly
- Consider framework differences (absolute vs relative paths)

## 🎯 Current State

**Completed:**
- ✅ Core typing sound engine
- ✅ 88 key mappings
- ✅ Framework integration (Fresh/Next/Vite/SvelteKit/vanilla)
- ✅ Configurable `basePath` for portability
- ✅ Debug helper (`testConnection()`)
- ✅ Helpful error messages
- ✅ Complete documentation
- ✅ Code audit (redundancy removed)

**Next Steps:**
- 📦 Publish to NPM as `@softstack/juicy-sounds` (scope decision made — sibling of @softstack/weightless)
- 🎨 More sound packs (Browns? Buckling spring? IBM Model M?) — Blue + Topre done
- 🌐 Deploy the demo somewhere public

## 🔧 Integration Pattern

The golden path:
```javascript
import { SimpleTypeWriter } from './SimpleTypeWriter.js';

const typewriter = new SimpleTypeWriter({
  basePath: '/sounds/keyboard-packs/'  // Adjust for framework
});

await typewriter.init();
typewriter.attach('input, textarea');
```

**Common issues:**
- **404 errors**: Wrong `basePath` for framework
- **Sounds don't play**: Forgot `await typewriter.init()`
- **Duplicate sounds**: Called `attach()` multiple times

**Debug pattern:**
```javascript
const typewriter = new SimpleTypeWriter({ debug: true });
await typewriter.testConnection();  // Check paths
await typewriter.init();            // Check load
```

## 💡 Philosophy

This is about **compression over complexity**. The entire API is:
- 1 class
- 1 config object
- 3 main methods (init, attach, detach)
- Everything else is quality-of-life

The goal: Someone should be able to add satisfying typing sounds to their app in 5 minutes, regardless of framework.

---

**Last updated**: 2025-10-01
**Maintained by**: Pablo (@pibulus)
