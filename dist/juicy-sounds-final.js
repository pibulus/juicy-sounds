// Juicy Sounds - Final Optimized Version
// Tested and working, with all features preserved

class JuicySounds {
  constructor(config = {}) {
    this.volume = config.volume ?? 0.7;
    this.basePath = config.basePath || './sounds/interface/';
    
    // Single AudioContext for efficiency
    this.audioCtx = null;
    
    // Smart audio pooling - prevents memory leaks
    this.audioCache = new Map();
    this.poolSize = 3; // Max clones per sound
    
    // Sound mapping
    this.soundMap = {
      click: 'click_001.ogg',
      hover: 'select_001.ogg', 
      success: 'confirmation_001.ogg',
      error: 'error_001.ogg',
      notification: 'glass_001.ogg',
      toggle: 'switch_001.ogg',
      open: 'open_001.ogg',
      close: 'close_001.ogg',
      back: 'back_001.ogg',
      bong: 'bong_001.ogg',
      glass: 'glass_002.ogg',
      pluck: 'pluck_001.ogg',
      select: 'select_002.ogg',
      switch: 'switch_002.ogg',
      panel: 'open_001.ogg',
      confirmation: 'confirmation_002.ogg'
    };
  }

  // Play sound with smart caching
  async play(soundName) {
    const filename = this.soundMap[soundName] || soundName;
    const url = this.basePath + filename;
    const cacheKey = soundName;
    
    try {
      // Get or create audio pool for this sound
      if (!this.audioCache.has(cacheKey)) {
        this.audioCache.set(cacheKey, []);
      }
      
      const pool = this.audioCache.get(cacheKey);
      
      // Find available audio element or create new one
      let audio = pool.find(a => a.paused || a.ended);
      
      if (!audio) {
        if (pool.length < this.poolSize) {
          // Create new audio element
          audio = new Audio(url);
          audio.preload = 'auto';
          pool.push(audio);
        } else {
          // Reuse first one if pool is full
          audio = pool[0];
        }
      }
      
      // Reset and play
      audio.currentTime = 0;
      audio.volume = this.volume;
      
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Ignore autoplay policy errors
        });
      }
    } catch (e) {
      console.warn(`Could not play ${soundName}:`, e);
    }
  }

  // Set global volume
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    // Update all cached audio elements
    this.audioCache.forEach(pool => {
      pool.forEach(audio => {
        audio.volume = this.volume;
      });
    });
  }

  // Generate synthetic tones
  playTone(frequency = 440, duration = 200) {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.frequency.value = frequency;
    osc.type = 'sine';
    
    // Envelope
    const now = this.audioCtx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
    
    osc.start(now);
    osc.stop(now + duration / 1000);
    
    // Cleanup
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  // TypeWriter with proper sound handling
  createTypewriter(config = {}) {
    const style = config.style || 'mechanical';
    const sounds = {
      mechanical: ['click', 'click', 'click'], // Use mapped names
      soft: ['pluck', 'pluck'],
      vintage: ['bong', 'glass']
    };
    
    const variants = sounds[style] || sounds.mechanical;
    let index = 0;
    
    return {
      type: (char) => {
        if (char && char.trim()) {
          this.play(variants[index % variants.length]);
          index++;
        }
      }
    };
  }

  // Cleanup for SPAs
  destroy() {
    // Clear audio cache
    this.audioCache.forEach(pool => {
      pool.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    });
    this.audioCache.clear();
    
    // Close audio context
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

export default JuicySounds;