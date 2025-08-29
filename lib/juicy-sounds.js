// Juicy Sounds - Browser Build
// This is a simplified version for direct browser use

class JuicySounds {
  constructor(config = {}) {
    this.config = {
      volume: 1,
      basePath: './sounds/',
      cdn: false,
      lazyLoad: true,
      muted: false,
      ...config
    };
    
    this.audioContext = null;
    this.sounds = new Map();
    this.loadedSounds = new Map();
    this.gradientConfig = {
      scale: 'major',
      rootNote: 'C',
      octave: 4,
      waveform: 'sine'
    };
  }
  
  async initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
  
  async play(soundName, options = {}) {
    if (this.config.muted) return;
    
    await this.initContext();
    
    // Map sound names to files
    const soundMap = {
      'click': 'interface/click_001.ogg',
      'click.variant1': 'interface/click_002.ogg',
      'click.variant2': 'interface/click_003.ogg',
      'hover': 'interface/select_001.ogg',
      'hover.variant1': 'interface/select_002.ogg',
      'success': 'interface/confirmation_001.ogg',
      'error': 'interface/error_001.ogg',
      'toggle.on': 'interface/switch_001.ogg',
      'toggle.off': 'interface/switch_002.ogg',
      'notification': 'interface/glass_001.ogg',
      'panel.open': 'interface/open_001.ogg',
      'panel.close': 'interface/close_001.ogg',
      'pluck': 'interface/pluck_001.ogg',
      'bong': 'interface/bong_001.ogg',
      'back': 'interface/back_001.ogg'
    };
    
    const soundFile = soundMap[soundName];
    if (!soundFile) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }
    
    const soundPath = this.config.basePath + soundFile;
    
    try {
      // Load and cache the sound
      if (!this.loadedSounds.has(soundPath)) {
        const response = await fetch(soundPath);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.loadedSounds.set(soundPath, audioBuffer);
      }
      
      const audioBuffer = this.loadedSounds.get(soundPath);
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      
      // Apply volume
      const volume = (options.volume ?? 1) * this.config.volume;
      gainNode.gain.value = volume;
      
      // Apply pitch if specified
      if (options.pitch) {
        source.playbackRate.value = options.pitch;
      }
      
      // Add some randomization to prevent monotony
      if (options.randomPitch !== false && soundName.includes('click')) {
        source.playbackRate.value = 1 + (Math.random() * 0.1 - 0.05); // ±5% variation
      }
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start(0);
      
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  }
  
  async playGradientSound(index, total, options = {}) {
    await this.initContext();
    if (this.config.muted) return;
    
    // Musical scales
    const scales = {
      major: [0, 2, 4, 5, 7, 9],
      minor: [0, 2, 3, 5, 7, 8],
      pentatonic: [0, 2, 4, 7, 9, 12],
      blues: [0, 3, 5, 6, 7, 10],
      mixolydian: [0, 2, 4, 5, 7, 9, 10].slice(0, 6),
    };
    
    const noteFreqs = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
      'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };
    
    const scale = scales[this.gradientConfig.scale] || scales.major;
    const rootFreq = noteFreqs[this.gradientConfig.rootNote] || 261.63;
    const octaveMultiplier = Math.pow(2, this.gradientConfig.octave - 4);
    
    // Map index to scale degree
    const scaleDegree = Math.floor((index / Math.max(1, total - 1)) * (scale.length - 1));
    const semitones = scale[scaleDegree];
    const frequency = rootFreq * octaveMultiplier * Math.pow(2, semitones / 12);
    
    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = this.gradientConfig.waveform || 'sine';
    oscillator.frequency.value = frequency;
    
    const volume = (options.volume ?? 0.3) * this.config.volume;
    
    // ADSR envelope
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Attack
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, now + 0.05); // Decay
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3); // Release
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }
  
  setGradientScale(scale, rootNote = 'C') {
    this.gradientConfig.scale = scale;
    this.gradientConfig.rootNote = rootNote;
  }
  
  setGradientWaveform(waveform) {
    this.gradientConfig.waveform = waveform;
  }
  
  setVolume(volume) {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }
  
  mute() {
    this.config.muted = true;
  }
  
  unmute() {
    this.config.muted = false;
  }
  
  // Quick play methods
  playClick() { return this.play('click', { randomPitch: true }); }
  playHover() { return this.play('hover', { volume: 0.3 }); }
  playSuccess() { return this.play('success'); }
  playError() { return this.play('error'); }
}

// TypeWriter class
class TypeWriter {
  constructor(config = {}) {
    this.config = {
      style: 'mechanical',
      volume: 0.3,
      enabled: true,
      pitchVariation: true,
      ...config
    };
    
    this.sounds = new JuicySounds({
      volume: this.config.volume,
      basePath: './sounds/'
    });
    
    this.enabled = this.config.enabled;
    this.lastKeyTime = 0;
    this.attachedElements = new Set();
  }
  
  async keyDown(key) {
    if (!this.enabled) return;
    
    // Determine sound based on key
    let sound = 'click';
    let pitch = 1.0;
    
    if (key === ' ') {
      sound = 'toggle.on';
      pitch = 0.7;
    } else if (key === 'Enter') {
      sound = 'confirmation_001';
      pitch = 0.8;
    } else if (key === 'Backspace') {
      sound = 'back';
      pitch = 1.2;
    }
    
    // Add variation
    if (this.config.pitchVariation) {
      pitch *= (1 + (Math.random() * 0.16 - 0.08));
    }
    
    // Dynamic volume based on typing speed
    const now = Date.now();
    const timeSinceLastKey = now - this.lastKeyTime;
    this.lastKeyTime = now;
    const speedVolume = timeSinceLastKey < 100 ? 0.7 : 1.0;
    
    await this.sounds.play(sound, {
      pitch: pitch,
      volume: speedVolume * this.config.volume
    });
  }
  
  attach(selector) {
    if (typeof document === 'undefined') return;
    
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (this.attachedElements.has(element)) return;
      
      element.addEventListener('keydown', (e) => {
        this.keyDown(e.key);
      });
      
      this.attachedElements.add(element);
    });
  }
  
  setStyle(style) {
    this.config.style = style;
    const volumes = {
      mechanical: 0.3,
      soft: 0.15,
      vintage: 0.25
    };
    this.config.volume = volumes[style] || 0.3;
    this.sounds.setVolume(this.config.volume);
  }
  
  setVolume(volume) {
    this.config.volume = volume;
    this.sounds.setVolume(volume);
  }
  
  enable() { this.enabled = true; }
  disable() { this.enabled = false; }
}

// Export for use
window.JuicySounds = JuicySounds;
window.TypeWriter = TypeWriter;