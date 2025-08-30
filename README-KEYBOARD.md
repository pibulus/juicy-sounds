# 🎹 Juicy Keyboard Sounds

Real mechanical keyboard sounds for the web. **One line of code!**

## ✨ The Simplest Way

```javascript
import { addKeyboardSounds } from 'juicy-sounds';
addKeyboardSounds(); // Default: Cherry MX Black
```

Every input and textarea now has real mechanical keyboard sounds. 

## 🎯 What You Get

- **3 Keyboard Types** - Cherry MX Black, Blue, and Topre switches
- **88 Real Key Sounds** - Every key recorded from actual mechanical keyboards
- **Small Files** - 1.5-2.5MB per pack, loads instantly
- **Zero Config** - Just works, no setup needed
- **Smart Fallback** - Unmapped keys use similar sounds
- **Web Audio API** - Low latency, overlapping sounds supported

## 📦 Installation

```bash
npm install juicy-sounds
```

Or just copy the files:
1. Copy `/src/SimpleTypeWriter.js` to your project
2. Copy `/sounds/keyboard-packs/cherry-mx-black/` folder
3. Import and use!

## 🎮 Basic Usage

```javascript
import JuicyKeyboard, { KEYBOARD_PACKS } from 'juicy-sounds';

// Create instance (default: Cherry MX Black)
const keyboard = new JuicyKeyboard();

// Or choose your switch type
const keyboard = new JuicyKeyboard({ 
  pack: KEYBOARD_PACKS.BLUE  // Clicky!
});

// Attach to all inputs
keyboard.attach();

// Switch packs on the fly
await keyboard.setPack('topre');

// Control volume
keyboard.setVolume(0.5); // 0-1

// Toggle on/off
keyboard.disable();
keyboard.enable();
```

## 🎹 Available Keyboards

- **Cherry MX Black** (`cherry-mx-black`) - Linear, smooth, no tactile bump. Great for gaming.
- **Cherry MX Blue** (`cherry-mx-blue`) - Clicky, tactile, loud. The classic mechanical sound.
- **Topre Purple** (`topre`) - Thocky, premium, hybrid capacitive. Expensive keyboard vibes.

## 🎨 Try It Now

- `keyboard-demo.html` - Try all 3 keyboard types with live switching!
- `simple-demo.html` - Minimal demo with Cherry MX Black

## 🤔 Why This Exists

1. **Typing should feel good** - Mechanical keyboards are popular for a reason
2. **Real > Fake** - Actual recordings beat synthetic sounds every time
3. **Simple > Complex** - One mode, one pack, one line of code
4. **2.7MB is fine** - Smaller than most hero images

## 🎵 The Tech

- Uses the Mechvibes sound pack format (Cherry MX Black - ABS keycaps)
- Audio sprite technique: one .ogg file with all sounds
- Each key maps to a timestamp + duration in the audio file
- Web Audio API for precise playback timing

## 🚀 Performance

- Initial load: ~2.7MB (cached after first load)
- Playback latency: <10ms
- Memory usage: ~3MB (decoded audio buffer)
- Works on: Chrome, Firefox, Safari, Edge

## 📝 License

MIT - Use it anywhere!

## 🙏 Credits

- Sound pack from [Mechvibes](https://mechvibes.com)
- Cherry MX Black recordings by the Mechvibes community