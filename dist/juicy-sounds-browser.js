// Juicy Sounds Browser Bundle - Simple and Working
class JuicySounds {
  constructor(config = {}) {
    this.config = {
      volume: config.volume || 1,
      basePath: config.basePath || './sounds/interface/',
      ...config
    };
    
    this.audioContext = null;
    this.sounds = {};
    this.soundMap = {
      // Map friendly names to actual files
      'click': 'click_001.ogg',
      'hover': 'select_001.ogg', 
      'success': 'confirmation_001.ogg',
      'error': 'error_001.ogg',
      'notification': 'glass_001.ogg',
      'toggle': 'switch_001.ogg',
      'panel': 'open_001.ogg',
      'open': 'open_001.ogg',
      'close': 'close_001.ogg',
      'back': 'back_001.ogg',
      'bong': 'bong_001.ogg',
      'glass': 'glass_002.ogg',
      'pluck': 'pluck_001.ogg',
      'select': 'select_002.ogg',
      'switch': 'switch_002.ogg',
      'confirmation': 'confirmation_002.ogg'
    };
  }

  async play(soundName) {
    // Get the actual filename
    const filename = this.soundMap[soundName] || soundName;
    const url = this.config.basePath + filename;
    
    try {
      // Check if we have it cached
      if (!this.sounds[soundName]) {
        const audio = new Audio(url);
        audio.volume = this.config.volume;
        this.sounds[soundName] = audio;
      }
      
      // Clone and play for overlapping sounds
      const audio = this.sounds[soundName].cloneNode();
      audio.volume = this.config.volume;
      audio.play().catch(e => {
        console.warn(`Could not play sound ${soundName}:`, e);
      });
    } catch (e) {
      console.warn(`Error playing sound ${soundName}:`, e);
    }
  }

  setVolume(level) {
    this.config.volume = Math.max(0, Math.min(1, level));
  }

  // Play synthetic tone
  async playTone(frequency = 440, duration = 200) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(this.config.volume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  // Create typewriter for typing sounds
  createTypewriter(config = {}) {
    const style = config.style || 'mechanical';
    const soundMap = {
      'mechanical': ['click_001.ogg', 'click_002.ogg', 'click_003.ogg'],
      'soft': ['pluck_001.ogg', 'pluck_002.ogg'],
      'vintage': ['bong_001.ogg', 'glass_001.ogg']
    };
    
    let lastSound = 0;
    const sounds = soundMap[style] || soundMap.mechanical;
    
    return {
      type: (char) => {
        if (char && char !== ' ') {
          // Rotate through sound variants
          const soundFile = sounds[lastSound % sounds.length];
          this.play(soundFile);
          lastSound++;
        }
      }
    };
  }
}

export default JuicySounds;