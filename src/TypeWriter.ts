/**
 * TypeWriter - Mechanical Keyboard Sound Simulator
 * 
 * Adds satisfying typing sounds to any input or textarea.
 * Features multiple keyboard styles and smart variation.
 * 
 * @module juicy-sounds/TypeWriter
 */

import { JuicySounds } from "./JuicySounds.ts";

// ===================================================================
// CONFIGURATION
// ===================================================================

export interface TypeWriterConfig {
  style?: 'mechanical' | 'soft' | 'vintage';
  volume?: number;
  enabled?: boolean;
  pitchVariation?: boolean;
  keyUpSounds?: boolean;
  stereoPan?: boolean;  // Enable stereo panning
  detuneCents?: boolean; // Use cents instead of pitch ratio
}

// Key sound mappings - now with variants!
const KEY_SOUNDS = {
  // Regular keys (letters, numbers) - multiple variants prevent repetition
  regular: ['click', 'click.variant1', 'click.variant2'],
  
  // Special keys with different sounds
  space: ['switch_001', 'switch_002'],      // Deeper thunk
  enter: ['confirmation_001'],              // Satisfying clack
  backspace: ['back_001', 'back_002'],      // Higher pitch
  tab: ['select_001', 'select_002'],        // Soft click
  
  // Modifier keys
  shift: ['hover', 'hover.variant1'],       // Subtle tick
  control: ['hover'],
  alt: ['hover'],
  meta: ['hover'],                           // Cmd/Win key
  
  // Function keys
  escape: ['error'],                        // Different sound for escape
  delete: ['back_001', 'back_002'],         // Same as backspace
};

// Pitch adjustments in cents (100 cents = 1 semitone, 1200 = 1 octave)
const KEY_DETUNE_CENTS = {
  regular: 0,         // No change
  space: -500,        // ~5 semitones down
  enter: -300,        // ~3 semitones down
  backspace: 300,     // ~3 semitones up
  tab: -100,          // ~1 semitone down
  shift: 100,         // ~1 semitone up
  escape: -700,       // ~7 semitones down (perfect fifth down)
};

// Legacy pitch ratios (for fallback)
const KEY_PITCH = {
  regular: 1.0,
  space: 0.7,
  enter: 0.8,
  backspace: 1.2,
  tab: 0.9,
  shift: 1.1,
  escape: 0.6,
};

// Volume adjustments per style
const STYLE_VOLUMES = {
  mechanical: 0.3,    // Loud and clicky
  soft: 0.15,         // Quiet office mode
  vintage: 0.25,      // Old typewriter feel
};

// ===================================================================
// TYPEWRITER CLASS
// ===================================================================

export class TypeWriter {
  private sounds: JuicySounds;
  private config: TypeWriterConfig;
  private enabled: boolean;
  private lastKeyTime: number = 0;
  private attachedElements: Set<Element> = new Set();
  
  constructor(config: TypeWriterConfig = {}) {
    this.config = {
      style: 'mechanical',
      volume: 0.3,
      enabled: true,
      pitchVariation: true,
      keyUpSounds: false,
      stereoPan: true,      // Enable by default for richer sound
      detuneCents: true,    // Use modern cents-based pitch
      ...config
    };
    
    this.enabled = this.config.enabled || true;
    
    // Initialize sound system
    this.sounds = new JuicySounds({
      volume: this.config.volume || STYLE_VOLUMES[this.config.style || 'mechanical'],
      synthetic: { enabled: false } // Use real sounds for typing
    });
  }
  
  /**
   * Handle key down event
   */
  async keyDown(key: string) {
    if (!this.enabled) return;
    
    // Determine sound and pitch
    const soundType = this.getKeySound(key);
    
    // Add dynamic volume based on typing speed
    const now = Date.now();
    const timeSinceLastKey = now - this.lastKeyTime;
    this.lastKeyTime = now;
    
    // Quieter for rapid typing (feels more natural)
    const speedVolume = timeSinceLastKey < 100 ? 0.7 : 1.0;
    
    // Build playback options
    const options: any = {
      volume: speedVolume
    };
    
    // Add pitch variation (either cents or ratio)
    if (this.config.detuneCents) {
      // Use cents-based pitch (more precise)
      const baseCents = this.getKeyDetuneCents(key);
      const variation = this.config.pitchVariation ? this.randomCentsVariation() : 0;
      options.detuneCents = baseCents + variation;
    } else {
      // Fallback to pitch ratio
      const pitch = this.getKeyPitch(key);
      options.pitch = this.config.pitchVariation ? pitch * this.randomVariation() : pitch;
    }
    
    // Add stereo panning for spatial depth
    if (this.config.stereoPan) {
      options.pan = -0.15 + Math.random() * 0.3; // Random between -0.15 and 0.15
    }
    
    // Play the sound
    await this.sounds.play(soundType, options);
  }
  
  /**
   * Handle key up event (optional mechanical keyboard "release" sound)
   */
  async keyUp(key: string) {
    if (!this.enabled || !this.config.keyUpSounds) return;
    
    // Very subtle release sound for mechanical style only
    if (this.config.style === 'mechanical') {
      await this.sounds.play('hover', {
        volume: 0.05,
        pitch: 1.5
      });
    }
  }
  
  /**
   * Get a random sound variant for a key
   */
  private getKeySound(key: string): string {
    // Special keys
    const keyLower = key.toLowerCase();
    
    let variants: string[];
    
    if (key === ' ') variants = KEY_SOUNDS.space;
    else if (keyLower === 'enter') variants = KEY_SOUNDS.enter;
    else if (keyLower === 'backspace') variants = KEY_SOUNDS.backspace;
    else if (keyLower === 'tab') variants = KEY_SOUNDS.tab;
    else if (keyLower === 'shift') variants = KEY_SOUNDS.shift;
    else if (keyLower === 'control' || keyLower === 'ctrl') variants = KEY_SOUNDS.control;
    else if (keyLower === 'alt') variants = KEY_SOUNDS.alt;
    else if (keyLower === 'meta' || keyLower === 'cmd') variants = KEY_SOUNDS.meta;
    else if (keyLower === 'escape' || keyLower === 'esc') variants = KEY_SOUNDS.escape;
    else if (keyLower === 'delete' || keyLower === 'del') variants = KEY_SOUNDS.delete;
    else variants = KEY_SOUNDS.regular;
    
    // Pick a random variant
    return variants[Math.floor(Math.random() * variants.length)];
  }
  
  /**
   * Get the pitch adjustment for a key
   */
  private getKeyPitch(key: string): number {
    const keyLower = key.toLowerCase();
    
    if (key === ' ') return KEY_PITCH.space;
    if (keyLower === 'enter') return KEY_PITCH.enter;
    if (keyLower === 'backspace') return KEY_PITCH.backspace;
    if (keyLower === 'tab') return KEY_PITCH.tab;
    if (keyLower === 'shift') return KEY_PITCH.shift;
    if (keyLower === 'escape' || keyLower === 'esc') return KEY_PITCH.escape;
    
    return KEY_PITCH.regular;
  }
  
  /**
   * Get the detune adjustment in cents for a key
   */
  private getKeyDetuneCents(key: string): number {
    const keyLower = key.toLowerCase();
    
    if (key === ' ') return KEY_DETUNE_CENTS.space;
    if (keyLower === 'enter') return KEY_DETUNE_CENTS.enter;
    if (keyLower === 'backspace') return KEY_DETUNE_CENTS.backspace;
    if (keyLower === 'tab') return KEY_DETUNE_CENTS.tab;
    if (keyLower === 'shift') return KEY_DETUNE_CENTS.shift;
    if (keyLower === 'escape' || keyLower === 'esc') return KEY_DETUNE_CENTS.escape;
    
    return KEY_DETUNE_CENTS.regular;
  }
  
  /**
   * Random pitch variation for natural feel
   */
  private randomVariation(): number {
    // ±8% variation for natural typing sound
    return 1 + (Math.random() * 0.16 - 0.08);
  }
  
  /**
   * Random cents variation for natural feel
   */
  private randomCentsVariation(): number {
    // ±30 cents variation (less than a semitone)
    return Math.random() * 60 - 30;
  }
  
  /**
   * Attach to input elements
   */
  attach(selector: string) {
    if (typeof document === 'undefined') return;
    
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
      // Skip if already attached
      if (this.attachedElements.has(element)) return;
      
      // Add event listeners
      element.addEventListener('keydown', (e) => {
        const event = e as KeyboardEvent;
        this.keyDown(event.key);
      });
      
      if (this.config.keyUpSounds) {
        element.addEventListener('keyup', (e) => {
          const event = e as KeyboardEvent;
          this.keyUp(event.key);
        });
      }
      
      this.attachedElements.add(element);
    });
    
    console.log(`🎹 TypeWriter attached to ${elements.length} elements`);
  }
  
  /**
   * Detach from elements
   */
  detach() {
    // Note: In production, we'd store and remove the actual event listeners
    // For simplicity, we're just clearing the set
    this.attachedElements.clear();
  }
  
  /**
   * Enable/disable typing sounds
   */
  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
  toggle() { this.enabled = !this.enabled; }
  
  /**
   * Set typing style
   */
  setStyle(style: 'mechanical' | 'soft' | 'vintage') {
    this.config.style = style;
    this.sounds.setVolume(STYLE_VOLUMES[style]);
  }
  
  /**
   * Set volume
   */
  setVolume(volume: number) {
    this.sounds.setVolume(volume);
  }
  
  /**
   * Cleanup
   */
  dispose() {
    this.detach();
    this.sounds.dispose();
  }
}

// ===================================================================
// QUICK SETUP
// ===================================================================

let defaultTypeWriter: TypeWriter | null = null;

/**
 * Quick setup for typing sounds
 */
export function enableTypingSounds(config?: TypeWriterConfig): TypeWriter {
  if (!defaultTypeWriter) {
    defaultTypeWriter = new TypeWriter(config);
    // Auto-attach to all inputs and textareas
    defaultTypeWriter.attach('input, textarea');
  }
  return defaultTypeWriter;
}

/**
 * Disable typing sounds
 */
export function disableTypingSounds() {
  if (defaultTypeWriter) {
    defaultTypeWriter.disable();
  }
}

// Export everything
export default TypeWriter;