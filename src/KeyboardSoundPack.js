/**
 * KeyboardSoundPack - Loads and plays audio sprites for realistic keyboard sounds
 * Compatible with Mechvibes sound pack format
 */

export class KeyboardSoundPack {
  constructor(packName) {
    this.packName = packName;
    this.basePath = `/sounds/keyboard-packs/${packName}/`;
    this.config = null;
    this.audioBuffer = null;
    this.audioContext = null;
    this.loaded = false;
    this.loading = false;
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Load the sound pack
   */
  async load() {
    if (this.loaded) return;
    if (this.loading) return; // Prevent multiple loads
    
    this.loading = true;
    
    try {
      // Initialize audio context
      this.initAudioContext();
      
      // Load config
      const configResponse = await fetch(this.basePath + 'config.json');
      this.config = await configResponse.json();
      
      // Load audio file
      const audioResponse = await fetch(this.basePath + 'sound.ogg');
      const arrayBuffer = await audioResponse.arrayBuffer();
      
      // Decode audio
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.loaded = true;
      console.log(`✅ Loaded keyboard pack: ${this.config.name}`);
    } catch (error) {
      console.error(`Failed to load pack ${this.packName}:`, error);
      this.loading = false;
      throw error;
    }
  }

  /**
   * Play a specific key sound
   * @param {string|number} keyId - The key identifier (e.g., "65" for 'a', "32" for space)
   * @param {number} volume - Volume level 0-1
   */
  async playKey(keyId, volume = 0.3) {
    if (!this.loaded) {
      await this.load();
    }

    const keyConfig = this.config.defines[keyId];
    if (!keyConfig) {
      console.warn(`No sound for key: ${keyId}`);
      return null;
    }

    const [startMs, durationMs] = keyConfig;
    return this.playSegment(startMs, durationMs, volume);
  }

  /**
   * Play a segment of the audio buffer
   */
  playSegment(startMs, durationMs, volume = 0.3) {
    if (!this.audioBuffer || !this.audioContext) return;

    // Create source
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;

    // Create gain for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Convert ms to seconds
    const startTime = startMs / 1000;
    const duration = durationMs / 1000;

    // Play the segment
    source.start(0, startTime, duration);

    return source;
  }

  /**
   * Map keyboard event key to Mechvibes key ID
   */
  static mapKeyToId(key, keyCode) {
    // Number keys
    if (key >= '0' && key <= '9') {
      return (keyCode - 48).toString(); // Mechvibes uses "1", "2", etc.
    }
    
    // Letter keys
    if (key.length === 1 && key.match(/[a-z]/i)) {
      return keyCode.toString(); // Use keyCode for letters
    }
    
    // Special keys mapping
    const specialKeys = {
      ' ': '32',      // Space
      'Enter': '13',  // Enter
      'Backspace': '14', // Backspace
      'Tab': '15',    // Tab
      'Escape': '41', // Escape
      'Delete': '83', // Delete
      'Shift': '42',  // Shift
      'Control': '43', // Control
      'Alt': '44',    // Alt
      'Meta': '45',   // Cmd/Win
      '.': '46',      // Period
      ',': '44',      // Comma
      '/': '47',      // Slash
      ';': '59',      // Semicolon
      "'": '39',      // Quote
      '[': '27',      // Left bracket
      ']': '29',      // Right bracket
      '-': '12',      // Minus
      '=': '13',      // Equals
    };
    
    return specialKeys[key] || keyCode.toString();
  }

  /**
   * Get pack info
   */
  getInfo() {
    if (!this.config) return null;
    return {
      name: this.config.name,
      id: this.config.id,
      keyCount: Object.keys(this.config.defines).length,
      includesNumpad: this.config.includes_numpad || false
    };
  }

  /**
   * Dispose of resources
   */
  dispose() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioBuffer = null;
    this.config = null;
    this.loaded = false;
  }
}

export default KeyboardSoundPack;