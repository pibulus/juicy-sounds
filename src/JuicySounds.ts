/**
 * JuicySounds - Main API
 * 
 * Simple, friendly API for adding sound to web apps.
 * Features lazy loading, CDN support, and synthetic gradients.
 * 
 * @module juicy-sounds
 * @version 1.0.0
 */

import { SoundPackManager, SoundPackOptions } from "./SoundPack.ts";
import { PlaybackOptions } from "./AudioProcessor.ts";

// ===================================================================
// CONFIGURATION
// ===================================================================

export interface JuicySoundsConfig {
  // Loading strategy
  lazyLoad?: boolean;      // Only load sounds when played (default: true)
  cdn?: boolean;           // Load from CDN (default: true when lazy)
  basePath?: string;       // Custom path for sounds
  
  // Sound pack
  pack?: string;           // Which pack to use (default: 'kenney')
  
  // Audio settings
  volume?: number;         // Global volume (0-1)
  muted?: boolean;         // Start muted
  
  // Performance
  maxCacheSize?: number;   // Max cached sounds (default: 100)
  preload?: string[];      // Sounds to preload immediately
  
  // Synthetic sounds
  synthetic?: {
    enabled?: boolean;     // Use synthesis (default: true)
    waveform?: OscillatorType; // 'sine' | 'square' | 'sawtooth' | 'triangle'
    preferSynthetic?: boolean; // Prefer synth over files
  };
}

// ===================================================================
// MAIN CLASS
// ===================================================================

export class JuicySounds {
  private manager: SoundPackManager;
  private config: JuicySoundsConfig;
  private globalVolume: number = 1;
  private isMuted: boolean = false;
  private synthContext: AudioContext | null = null;
  
  // Gradient sound frequencies (C major scale)
  private gradientFrequencies = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    493.88, // B4
  ];

  constructor(config: JuicySoundsConfig = {}) {
    // Smart defaults
    this.config = {
      lazyLoad: true,
      cdn: config.lazyLoad !== false,
      pack: 'interface',
      volume: 1,
      muted: false,
      maxCacheSize: 100,
      synthetic: {
        enabled: true,
        waveform: 'sine',
        preferSynthetic: false
      },
      ...config
    };
    
    this.globalVolume = this.config.volume || 1;
    this.isMuted = this.config.muted || false;
    
    this.manager = new SoundPackManager();
    this.initializeDefaultPack();
  }
  
  /**
   * Initialize the default sound pack
   */
  private async initializeDefaultPack() {
    const packOptions: SoundPackOptions = {
      lazyLoad: this.config.lazyLoad,
      cdn: this.config.cdn,
      basePath: this.config.basePath,
      maxCacheSize: this.config.maxCacheSize,
    };
    
    // Use Interface Sounds manifest structure
    const manifest = {
      name: 'interface', 
      version: '1.0.0',
      formats: {
        preferred: ['ogg', 'mp3', 'wav'],
        fallback: 'silence'
      },
      sounds: {
        click: { 
          default: 'click_001.ogg', 
          variants: ['click_002.ogg', 'click_003.ogg'],
          volume: 0.15
        },
        hover: { 
          default: 'select_001.ogg',
          variants: ['select_002.ogg', 'select_003.ogg'],
          volume: 0.05
        },
        success: { 
          default: 'confirmation_001.ogg',
          variants: ['confirmation_002.ogg', 'confirmation_003.ogg'],
          volume: 0.3
        },
        error: { 
          default: 'error_001.ogg',
          variants: ['error_002.ogg', 'error_003.ogg'],
          volume: 0.3
        },
        notification: { 
          default: 'glass_001.ogg',
          variants: ['glass_002.ogg', 'glass_003.ogg'],
          volume: 0.25
        },
        toggle: {
          on: 'switch_001.ogg',
          off: 'switch_002.ogg',
          volume: 0.2
        },
        panel: {
          open: 'open_001.ogg',
          close: 'close_001.ogg',
          volume: 0.15
        }
      },
      haptics: {
        click: 'light',
        success: 'medium',
        error: 'medium',
        toggle: 'light'
      }
    };
    
    await this.manager.loadPack('default', manifest, packOptions);
    
    // Preload critical sounds if requested
    if (this.config.preload?.length) {
      for (const sound of this.config.preload) {
        try {
          await this.play(sound, { volume: 0 }); // Silent preload
        } catch (e) {
          // Silently fail preload
        }
      }
    }
  }
  
  /**
   * Play a sound (lazy loads if needed)
   */
  async play(sound: string, options: PlaybackOptions & { randomPitch?: boolean } = {}): Promise<void> {
    if (this.isMuted) return;
    
    // Add pitch randomization if requested (±5% variation)
    let pitch = options.pitch;
    if (options.randomPitch && !pitch) {
      const variation = 0.05; // 5% variation
      const randomFactor = 1 + (Math.random() * 2 - 1) * variation;
      pitch = randomFactor; // Results in 0.95 to 1.05
    }
    
    const finalOptions = {
      ...options,
      volume: (options.volume ?? 1) * this.globalVolume,
      pitch
    };
    
    try {
      await this.manager.play(sound, finalOptions);
    } catch (error) {
      // Silently fail - sounds should never break functionality
    }
  }
  
  /**
   * Quick methods for common sounds
   */
  async playClick() { return this.play('click', { randomPitch: true }); }
  async playHover() { return this.play('hover', { volume: 0.3, randomPitch: true }); }
  async playSuccess() { return this.play('success'); }
  async playError() { return this.play('error'); }
  async playNotification() { return this.play('notification'); }
  
  /**
   * Play a random click variant
   */
  async playRandomClick() {
    const variants = ['click', 'click.variant1', 'click.variant2'];
    const random = variants[Math.floor(Math.random() * variants.length)];
    return this.play(random);
  }
  
  /**
   * Play gradient sound (synthetic)
   */
  playGradientSound(index: number, total: number): void {
    if (this.isMuted || !this.config.synthetic?.enabled) return;
    
    // Initialize audio context if needed
    if (!this.synthContext) {
      this.synthContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Map index to frequency
    const freqIndex = Math.floor((index / total) * this.gradientFrequencies.length);
    const frequency = this.gradientFrequencies[Math.min(freqIndex, this.gradientFrequencies.length - 1)];
    
    // Create oscillator
    const oscillator = this.synthContext.createOscillator();
    const gainNode = this.synthContext.createGain();
    
    oscillator.type = this.config.synthetic?.waveform || 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.synthContext.currentTime);
    
    // ADSR envelope
    const now = this.synthContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2 * this.globalVolume, now + 0.01); // Attack
    gainNode.gain.linearRampToValueAtTime(0.15 * this.globalVolume, now + 0.05); // Decay
    gainNode.gain.linearRampToValueAtTime(0.15 * this.globalVolume, now + 0.1); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15); // Release
    
    // Connect and play
    oscillator.connect(gainNode);
    gainNode.connect(this.synthContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }
  
  /**
   * Set gradient scale - simple and friendly!
   * @param scale Scale type: 'major', 'minor', 'pentatonic', 'blues', 'mixolydian'
   * @param rootNote Root note: 'C', 'D', 'E', 'F', 'G', 'A', 'B'
   * @param octave Octave number (default: 4)
   * @example
   * sounds.setGradientScale('mixolydian', 'D');  // D Mixolydian!
   * sounds.setGradientScale('pentatonic', 'A');  // A Pentatonic
   */
  setGradientScale(scale: string = 'major', rootNote: string = 'C', octave: number = 4) {
    // The useful scales - covers 95% of use cases
    const scales: Record<string, number[]> = {
      major: [0, 2, 4, 5, 7, 9],       // Happy, bright
      minor: [0, 2, 3, 5, 7, 8],       // Serious, moody
      pentatonic: [0, 2, 4, 7, 9, 12], // Safe, no bad notes
      blues: [0, 3, 5, 6, 7, 10],      // Playful, soulful
      mixolydian: [0, 2, 4, 5, 7, 9, 10].slice(0, 6), // Slightly exotic
    };
    
    // Simple root notes (no sharps/flats needed for UI sounds)
    const roots: Record<string, number> = {
      C: 261.63,
      D: 293.66,
      E: 329.63,
      F: 349.23,
      G: 392.00,
      A: 440.00,
      B: 493.88,
    };
    
    // Get intervals and root frequency
    const intervals = scales[scale] || scales.major;
    const rootFreq = roots[rootNote.toUpperCase()] || roots.C;
    
    // Adjust for octave (4 is middle)
    const octaveMultiplier = Math.pow(2, octave - 4);
    const baseFreq = rootFreq * octaveMultiplier;
    
    // Generate frequencies (6 notes is perfect for UI)
    this.gradientFrequencies = intervals.map(semitones => 
      parseFloat((baseFreq * Math.pow(2, semitones / 12)).toFixed(2))
    );
  }
  
  /**
   * Set custom gradient frequencies
   */
  setGradientFrequencies(frequencies: number[]) {
    this.gradientFrequencies = frequencies;
  }
  
  /**
   * Set gradient waveform
   */
  setGradientWaveform(waveform: OscillatorType) {
    if (this.config.synthetic) {
      this.config.synthetic.waveform = waveform;
    }
  }
  
  /**
   * Volume control
   */
  setVolume(volume: number) {
    this.globalVolume = Math.max(0, Math.min(1, volume));
  }
  
  getVolume(): number {
    return this.globalVolume;
  }
  
  /**
   * Mute control
   */
  mute() { this.isMuted = true; }
  unmute() { this.isMuted = false; }
  toggle() { this.isMuted = !this.isMuted; }
  
  /**
   * Load a different sound pack
   */
  async loadPack(packName: string) {
    // This would fetch the manifest from CDN or local
    console.log(`Loading pack: ${packName}`);
    // Implementation depends on where packs are hosted
  }
  
  /**
   * Set active pack
   */
  setActivePack(packName: string) {
    this.manager.switchPack(packName);
  }
  
  /**
   * Auto-attach sounds to elements
   */
  autoAttach(selectors: Record<string, string>) {
    if (typeof document === 'undefined') return;
    
    for (const [sound, selector] of Object.entries(selectors)) {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach(el => {
        // Detect appropriate event
        if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') {
          el.addEventListener('click', () => this.play(sound));
        } else if (el.tagName === 'A') {
          el.addEventListener('mouseenter', () => this.play(sound, { volume: 0.3 }));
        } else {
          el.addEventListener('click', () => this.play(sound));
        }
      });
    }
    
    console.log(`🎵 Auto-attached sounds to ${Object.keys(selectors).length} selectors`);
  }
  
  /**
   * Get loading stats
   */
  getStats() {
    const pack = this.manager.getActivePack();
    if (!pack) return null;
    
    return {
      packInfo: pack.getInfo(),
      lazyLoading: this.config.lazyLoad,
      cdn: this.config.cdn,
      muted: this.isMuted,
      volume: this.globalVolume
    };
  }
  
  /**
   * Cleanup
   */
  dispose() {
    this.manager.dispose();
    if (this.synthContext) {
      this.synthContext.close();
    }
  }
}

// ===================================================================
// CONVENIENCE EXPORT
// ===================================================================

// Default instance for quick use
let defaultInstance: JuicySounds | null = null;

export function getJuicySounds(config?: JuicySoundsConfig): JuicySounds {
  if (!defaultInstance) {
    defaultInstance = new JuicySounds(config);
  }
  return defaultInstance;
}

// Quick play functions using default instance
export const playSound = (sound: string, options?: PlaybackOptions) => 
  getJuicySounds().play(sound, options);

export const playClick = () => getJuicySounds().playClick();
export const playHover = () => getJuicySounds().playHover();
export const playSuccess = () => getJuicySounds().playSuccess();
export const playError = () => getJuicySounds().playError();

// Export everything
export default JuicySounds;