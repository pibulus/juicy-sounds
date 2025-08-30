/**
 * Juicy Sounds - The simplest way to add real mechanical keyboard sounds to your app
 * 
 * Usage:
 *   import JuicyKeyboard from 'juicy-sounds';
 *   const keyboard = new JuicyKeyboard();
 *   keyboard.attach(); // That's it!
 */

import SimpleTypeWriter from './src/SimpleTypeWriter.js';

// Main export - just works!
export class JuicyKeyboard extends SimpleTypeWriter {
  constructor(config = {}) {
    super(config);
    // Auto-initialize on creation
    this.init();
  }
}

// Quick function for instant setup
export function addKeyboardSounds(pack = 'cherry-mx-black') {
  const keyboard = new JuicyKeyboard({ pack });
  keyboard.attach();
  return keyboard;
}

// Export available packs
export const KEYBOARD_PACKS = {
  BLACK: 'cherry-mx-black',  // Smooth linear
  BLUE: 'cherry-mx-blue',     // Clicky tactile
  TOPRE: 'topre'              // Thocky premium
};

// Default export
export default JuicyKeyboard;