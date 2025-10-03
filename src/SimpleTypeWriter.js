/**
 * SimpleTypeWriter - Ultra-simple typing sounds using real mechanical keyboard recordings
 * One mode, one pack, amazing sounds!
 */

export class SimpleTypeWriter {
  constructor(config = {}) {
    this.config = {
      volume: 0.3,
      enabled: true,
      pack: 'cherry-mx-black',
      basePath: './sounds/keyboard-packs/',
      debug: false, // Enable console logging
      debounceMs: 10, // Minimum ms between sounds
      retryAttempts: 3, // Number of retry attempts on load failure
      preloadOnHover: true, // Preload sounds when hovering over inputs
      cacheBuffers: true, // Cache decoded audio buffers
      ...config
    };

    this.audioContext = null;
    this.audioBuffer = null;
    this.configData = null;
    this.loaded = false;
    this.loadingPack = null;
    this.attachedElements = new Set();
    this.lastPlayTime = 0;
    this.activeSources = new Set(); // Track active audio sources for cleanup
    this.retryCount = 0;
    this.bufferCache = new Map(); // Cache for multiple packs
    this.loadPromise = null; // Track current load operation
  }
  
  /**
   * Initialize and load the sound pack
   */
  async init(packName = null) {
    // Use provided pack or default
    const pack = packName || this.config.pack;

    // If already loaded this pack, return
    if (this.loaded && this.loadingPack === pack) return;

    // If already loading, wait for that operation
    if (this.loadPromise && this.loadingPack === pack) {
      return this.loadPromise;
    }

    // Check cache first
    if (this.config.cacheBuffers && this.bufferCache.has(pack)) {
      const cached = this.bufferCache.get(pack);
      this.audioBuffer = cached.buffer;
      this.configData = cached.config;
      this.loaded = true;
      this.loadingPack = pack;
      this.config.pack = pack;
      if (this.config.debug) {
        console.log('🎹 Keyboard sounds loaded from cache:', pack);
      }
      return;
    }

    // Mark as loading this pack
    this.loadingPack = pack;
    this.loaded = false;
    this.retryCount = 0;

    // Start loading and track the promise
    this.loadPromise = this._loadPack(pack);

    try {
      await this.loadPromise;
    } finally {
      this.loadPromise = null;
    }
  }

  async _loadPack(pack) {
    try {
      // Create audio context (required for Web Audio API)
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      // Resume audio context if it's suspended (happens on mobile/Chrome)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Load the config and audio with retry logic
      const basePath = `${this.config.basePath}${pack}/`;
      let configResponse, audioResponse;

      // Retry logic for network failures
      while (this.retryCount < this.config.retryAttempts) {
        try {
          [configResponse, audioResponse] = await Promise.all([
            fetch(basePath + 'config.json'),
            fetch(basePath + 'sound.ogg')
          ]);

          if (configResponse.ok && audioResponse.ok) {
            break; // Success, exit retry loop
          }
        } catch (networkError) {
          this.retryCount++;
          if (this.retryCount >= this.config.retryAttempts) {
            throw networkError;
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, this.retryCount) * 100));
        }
      }

      if (!configResponse.ok) {
        throw new Error(`Config not found at ${basePath}config.json (HTTP ${configResponse.status})`);
      }
      if (!audioResponse.ok) {
        throw new Error(`Audio not found at ${basePath}sound.ogg (HTTP ${audioResponse.status})`);
      }

      this.configData = await configResponse.json();
      const arrayBuffer = await audioResponse.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Cache the loaded pack if caching is enabled
      if (this.config.cacheBuffers) {
        this.bufferCache.set(pack, {
          buffer: this.audioBuffer,
          config: this.configData
        });
      }

      this.loaded = true;
      this.config.pack = pack;
      this.retryCount = 0; // Reset retry count on success

      if (this.config.debug) {
        console.log('🎹 Keyboard sounds loaded:', this.configData.name);
      }
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('🎹 Failed to load keyboard sounds');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Pack:', pack);
      console.error('Base path:', this.config.basePath);
      console.error('Error:', error.message);
      console.error('Retry attempts:', this.retryCount);
      console.error('');
      console.error('💡 Common fixes:');
      console.error('  1. Check sound files exist in your static/public folder');
      console.error('  2. For Fresh/Next/Vite: use basePath: "/sounds/keyboard-packs/"');
      console.error('  3. For vanilla HTML: use basePath: "./sounds/keyboard-packs/"');
      console.error('  4. Run testConnection() to debug path issues');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      // Fail gracefully - typing still works without sounds
    }
  }
  
  /**
   * Switch to a different sound pack
   */
  async setPack(packName) {
    await this.init(packName);
  }

  /**
   * Resume audio context (call on user interaction for mobile support)
   * Returns true if context was resumed, false if already running
   */
  async resumeAudioContext() {
    if (!this.audioContext) {
      if (!this.loaded) {
        await this.init();
      }
      return false;
    }

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        if (this.config.debug) {
          console.log('🎹 Audio context resumed');
        }
        return true;
      } catch (error) {
        if (this.config.debug) {
          console.error('Failed to resume audio context:', error);
        }
        return false;
      }
    }
    return false;
  }

  /**
   * Test if sound files are accessible (useful for debugging integration issues)
   */
  async testConnection() {
    const pack = this.config.pack;
    const basePath = `${this.config.basePath}${pack}/`;
    const configPath = basePath + 'config.json';

    console.log('🎹 Testing keyboard sound connection...');
    console.log('Pack:', pack);
    console.log('Base path:', this.config.basePath);
    console.log('Full config path:', configPath);

    try {
      const response = await fetch(configPath);
      if (response.ok) {
        const config = await response.json();
        console.log('✅ Success! Found:', config.name);
        console.log('Keys mapped:', Object.keys(config.defines).length);
        return true;
      } else {
        console.error('❌ HTTP', response.status, '- Config file not found');
        console.error('Check that sound files are copied to static/public folder');
        console.error('Expected location:', configPath);
        return false;
      }
    } catch (err) {
      console.error('❌ Fetch failed:', err.message);
      console.error('This usually means:');
      console.error('  1. Sound files are not in the right location');
      console.error('  2. basePath config is incorrect for your framework');
      console.error('  3. CORS issues (unlikely with local files)');
      return false;
    }
  }
  
  /**
   * Play a key sound with debouncing and audio context check
   */
  async play(event) {
    if (!this.config.enabled || !this.loaded) return;

    // Debounce rapid key presses
    const now = Date.now();
    if (now - this.lastPlayTime < this.config.debounceMs) return;
    this.lastPlayTime = now;

    // Resume audio context if needed (mobile/Chrome autoplay policy)
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (resumeError) {
        if (this.config.debug) {
          console.warn('Could not resume audio context:', resumeError);
        }
        return;
      }
    }

    // Map the key to a sound ID
    const keyId = this.getKeyId(event);
    const soundData = this.configData.defines[keyId];

    if (!soundData) {
      // Try a fallback for unmapped keys
      const fallbackId = '65'; // Use 'A' key sound as fallback
      const fallbackData = this.configData.defines[fallbackId];
      if (fallbackData) {
        this.playSound(fallbackData[0], fallbackData[1]);
      }
      return;
    }

    const [startMs, durationMs] = soundData;
    this.playSound(startMs, durationMs);
  }
  
  /**
   * Play a specific segment of the audio buffer with proper cleanup
   */
  playSound(startMs, durationMs) {
    if (!this.audioBuffer || !this.audioContext) return;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.config.volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Convert ms to seconds
      const startTime = startMs / 1000;
      const duration = durationMs / 1000;

      // Track this source for cleanup
      this.activeSources.add(source);

      // Clean up when sound ends
      source.onended = () => {
        this.activeSources.delete(source);
        try {
          source.disconnect();
          gainNode.disconnect();
        } catch (e) {
          // Ignore disconnect errors (already disconnected)
        }
      };

      source.start(0, startTime, duration);
    } catch (error) {
      if (this.config.debug) {
        console.error('Error playing sound:', error);
      }
    }
  }
  
  /**
   * Map keyboard event to Mechvibes key ID
   */
  getKeyId(event) {
    const key = event.key;
    
    // Special keys first
    const specialMap = {
      ' ': '57',      // Space
      'Enter': '28',  // Enter  
      'Backspace': '14', // Backspace
      'Tab': '15',    // Tab
      'Escape': '41', // Escape
      'Shift': '42',  // Shift
      'Control': '17', // Control
      'Alt': '18',    // Alt
      'Meta': '3675', // Cmd/Win
      '.': '52',      // Period
      ',': '51',      // Comma
      '/': '53',      // Slash
      ';': '39',      // Semicolon
      "'": '40',      // Quote
      '[': '26',      // Left bracket
      ']': '27',      // Right bracket
    };
    
    if (specialMap[key]) return specialMap[key];
    
    // Letters A-Z (65-90)
    if (key.length === 1 && key.match(/[a-zA-Z]/)) {
      return String(key.toUpperCase().charCodeAt(0));
    }
    
    // Numbers 0-9
    if (key >= '0' && key <= '9') {
      // Mechvibes uses 1-10 for number keys
      if (key === '0') return '11';
      return String(Number(key) + 1);
    }
    
    // Default fallback
    return '65'; // 'A' key
  }
  
  /**
   * Attach to input elements with optional preloading
   */
  attach(selector = 'input, textarea') {
    // Auto-initialize on first attach
    if (!this.loaded) {
      this.init();
    }

    const elements = document.querySelectorAll(selector);

    elements.forEach(element => {
      if (this.attachedElements.has(element)) return;

      const handler = (e) => this.play(e);
      element.addEventListener('keydown', handler);
      element._typewriterHandler = handler;

      // Add preloading on hover/focus
      if (this.config.preloadOnHover) {
        const preloadHandler = () => {
          if (!this.loaded && !this.loadPromise) {
            this.init(); // Start loading on hover/focus
          }
        };
        element.addEventListener('mouseenter', preloadHandler);
        element.addEventListener('focus', preloadHandler);
        element._typewriterPreloadHandler = preloadHandler;
      }

      this.attachedElements.add(element);
    });

    if (this.config.debug) {
      console.log(`🎹 Keyboard sounds attached to ${elements.length} elements`);
    }
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
      if (element._typewriterPreloadHandler) {
        element.removeEventListener('mouseenter', element._typewriterPreloadHandler);
        element.removeEventListener('focus', element._typewriterPreloadHandler);
        delete element._typewriterPreloadHandler;
      }
    });
    this.attachedElements.clear();
  }
  
  /**
   * Simple controls
   */
  enable() { this.config.enabled = true; }
  disable() { this.config.enabled = false; }
  setVolume(v) { this.config.volume = Math.max(0, Math.min(1, v)); }
  
  /**
   * Cleanup with proper resource management
   */
  dispose() {
    // Detach all event listeners
    this.detach();

    // Stop all active audio sources
    this.activeSources.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Ignore errors for already stopped sources
      }
    });
    this.activeSources.clear();

    // Clear references to free memory
    this.audioBuffer = null;
    this.configData = null;
    this.loaded = false;
    this.loadingPack = null;

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {
        // Ignore close errors
      });
      this.audioContext = null;
    }
  }
}

// Super simple export
export default SimpleTypeWriter;