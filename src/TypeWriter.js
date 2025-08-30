/**
 * TypeWriter - Enhanced typing sounds with realistic mechanical keyboard support
 * Supports both simple (lightweight) and realistic (Mechvibes sound packs) modes
 */

import { KeyboardSoundPack } from './KeyboardSoundPack.js';

export class TypeWriter {
  constructor(config = {}) {
    this.config = {
      mode: 'simple',           // 'simple' or 'realistic'
      soundPack: 'cherry-mx-black', // Which pack to use in realistic mode
      volume: 0.3,
      enabled: true,
      pitchVariation: true,
      ...config
    };
    
    this.enabled = this.config.enabled;
    this.attachedElements = new Set();
    this.lastKeyTime = 0;
    
    // For realistic mode
    this.soundPack = null;
    
    // For simple mode
    this.audioCache = new Map();
    this.simpleBasePath = './sounds/interface/';
    
    // Initialize based on mode
    if (this.config.mode === 'realistic') {
      this.initRealisticMode();
    }
  }
  
  /**
   * Initialize realistic mode with sound pack
   */
  async initRealisticMode() {
    if (!this.soundPack) {
      this.soundPack = new KeyboardSoundPack(this.config.soundPack);
      // Preload the pack
      try {
        await this.soundPack.load();
        console.log(`🎹 TypeWriter initialized with ${this.config.soundPack} pack`);
      } catch (error) {
        console.warn('Failed to load sound pack, falling back to simple mode', error);
        this.config.mode = 'simple';
      }
    }
  }
  
  /**
   * Switch between modes
   */
  async setMode(mode) {
    this.config.mode = mode;
    if (mode === 'realistic' && !this.soundPack) {
      await this.initRealisticMode();
    }
  }
  
  /**
   * Change sound pack (realistic mode only)
   */
  async setSoundPack(packName) {
    if (this.soundPack) {
      this.soundPack.dispose();
    }
    this.config.soundPack = packName;
    this.soundPack = new KeyboardSoundPack(packName);
    await this.soundPack.load();
  }
  
  /**
   * Handle key press
   */
  async keyDown(event) {
    if (!this.enabled) return;
    
    const key = event.key;
    const keyCode = event.keyCode;
    
    // Calculate dynamic volume based on typing speed
    const now = Date.now();
    const timeSinceLastKey = now - this.lastKeyTime;
    this.lastKeyTime = now;
    
    // Quieter for rapid typing
    const speedMultiplier = timeSinceLastKey < 100 ? 0.7 : 1.0;
    const volume = this.config.volume * speedMultiplier;
    
    if (this.config.mode === 'realistic' && this.soundPack) {
      await this.playRealisticKey(key, keyCode, volume);
    } else {
      await this.playSimpleKey(key, volume);
    }
  }
  
  /**
   * Play realistic key sound using sound pack
   */
  async playRealisticKey(key, keyCode, volume) {
    const keyId = KeyboardSoundPack.mapKeyToId(key, keyCode);
    
    try {
      await this.soundPack.playKey(keyId, volume);
    } catch (error) {
      // Fallback to simple mode for this key
      console.debug(`No realistic sound for key ${key}, using simple sound`);
      await this.playSimpleKey(key, volume);
    }
  }
  
  /**
   * Play simple key sound (lightweight mode)
   */
  async playSimpleKey(key, volume) {
    let soundFile;
    let pitch = 1.0;
    
    // Map keys to sounds
    switch(key) {
      case ' ':
        soundFile = 'switch_001.ogg';
        pitch = 0.8;
        break;
      case 'Enter':
        soundFile = 'confirmation_001.ogg';
        pitch = 0.9;
        break;
      case 'Backspace':
      case 'Delete':
        soundFile = 'back_001.ogg';
        pitch = 1.1;
        break;
      case 'Tab':
        soundFile = 'select_001.ogg';
        break;
      case 'Escape':
        soundFile = 'error_001.ogg';
        pitch = 0.7;
        break;
      default:
        // Regular keys with some variation
        const variants = ['click_001.ogg', 'click_002.ogg', 'click_003.ogg'];
        soundFile = variants[Math.floor(Math.random() * variants.length)];
        
        // Add slight pitch variation for natural feel
        if (this.config.pitchVariation) {
          pitch = 1 + (Math.random() * 0.1 - 0.05); // ±5% variation
        }
    }
    
    await this.playSound(soundFile, volume, pitch);
  }
  
  /**
   * Play a sound file (simple mode)
   */
  async playSound(filename, volume = 0.3, pitch = 1.0) {
    try {
      const audio = new Audio(this.simpleBasePath + filename);
      audio.volume = volume;
      
      // Apply pitch if supported (Chrome/Edge)
      if (audio.playbackRate !== undefined && pitch !== 1.0) {
        audio.playbackRate = pitch;
      }
      
      await audio.play();
    } catch (error) {
      console.debug('Sound playback failed:', error);
    }
  }
  
  /**
   * Attach to input elements
   */
  attach(selector = 'input, textarea') {
    if (typeof document === 'undefined') return;
    
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
      if (this.attachedElements.has(element)) return;
      
      const keyHandler = (e) => this.keyDown(e);
      element.addEventListener('keydown', keyHandler);
      
      // Store handler for cleanup
      element._typewriterHandler = keyHandler;
      this.attachedElements.add(element);
    });
    
    console.log(`🎹 TypeWriter attached to ${elements.length} elements (${this.config.mode} mode)`);
  }
  
  /**
   * Detach from elements
   */
  detach() {
    this.attachedElements.forEach(element => {
      if (element._typewriterHandler) {
        element.removeEventListener('keydown', element._typewriterHandler);
        delete element._typewriterHandler;
      }
    });
    this.attachedElements.clear();
  }
  
  /**
   * Enable/disable
   */
  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
  toggle() { this.enabled = !this.enabled; }
  
  /**
   * Set volume
   */
  setVolume(volume) {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Get available sound packs
   */
  static getAvailablePacks() {
    return [
      { id: 'cherry-mx-black', name: 'Cherry MX Black', description: 'Smooth linear switches' },
      { id: 'cherry-mx-blue', name: 'Cherry MX Blue', description: 'Clicky tactile switches' },
      { id: 'topre', name: 'Topre', description: 'Premium thocky switches' },
      { id: 'typewriter', name: 'Typewriter', description: 'Vintage typewriter sounds' }
    ];
  }
  
  /**
   * Cleanup
   */
  dispose() {
    this.detach();
    if (this.soundPack) {
      this.soundPack.dispose();
    }
    this.audioCache.clear();
  }
}

// Quick setup function
export function enableTypingSounds(config = {}) {
  const typewriter = new TypeWriter(config);
  typewriter.attach();
  return typewriter;
}

export default TypeWriter;