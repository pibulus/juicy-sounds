// Dead simple version that WILL work
class JuicySounds {
  constructor(config = {}) {
    this.volume = config.volume || 0.7;
    this.basePath = config.basePath || './sounds/interface/';
    this.cache = {};
  }

  play(soundName) {
    // Map of sound names to files
    const files = {
      click: 'click_001.ogg',
      hover: 'select_001.ogg',
      success: 'confirmation_001.ogg',
      error: 'error_001.ogg',
      notification: 'glass_001.ogg',
      toggle: 'switch_001.ogg',
      open: 'open_001.ogg',
      close: 'close_001.ogg',
      bong: 'bong_001.ogg',
      glass: 'glass_001.ogg',
      pluck: 'pluck_001.ogg',
      select: 'select_001.ogg'
    };
    
    const filename = files[soundName] || soundName;
    const url = this.basePath + filename;
    
    // Create new audio each time (simple but works)
    const audio = new Audio(url);
    audio.volume = this.volume;
    audio.play().catch(() => {
      // Try mp3 fallback
      const fallback = new Audio('./sounds/pop-on.mp3');
      fallback.volume = this.volume;
      fallback.play().catch(() => {});
    });
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  playTone(freq = 440, duration = 200) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine'; // cleaner sound
    osc.frequency.value = freq;
    
    // Start at 0, fade in quickly, sustain, then fade out
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.15, now + 0.01); // Quick fade in, lower volume
    gain.gain.linearRampToValueAtTime(this.volume * 0.15, now + (duration / 1000) - 0.01);
    gain.gain.linearRampToValueAtTime(0, now + (duration / 1000)); // Fade out
    
    osc.start(now);
    osc.stop(now + (duration / 1000));
    setTimeout(() => ctx.close(), duration + 100);
  }

  createTypewriter() {
    return {
      type: () => this.play('click')
    };
  }
}

export default JuicySounds;