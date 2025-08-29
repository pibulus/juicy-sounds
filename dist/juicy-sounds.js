var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/AudioProcessor.ts
var WebAudioProcessor = class {
  // Prevent memory leaks
  constructor() {
    __publicField(this, "context", null);
    __publicField(this, "cache", /* @__PURE__ */ new Map());
    __publicField(this, "maxCacheSize", 100);
    this.initContext();
  }
  /**
   * Initialize or resume audio context
   */
  async initContext() {
    if (typeof window === "undefined") return;
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }
  /**
   * Load and cache an audio buffer with error handling
   */
  async loadSound(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    try {
      await this.initContext();
      if (!this.context) throw new Error("AudioContext not available");
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to load sound: ${response.status} ${response.statusText}`
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`Error loading sound from ${url}:`, error);
      throw error;
    }
  }
  /**
   * Play a sound with optional pitch and volume adjustments
   */
  async playWithPitch(url, options = {}) {
    await this.initContext();
    if (!this.context) throw new Error("AudioContext not available");
    const audioBuffer = await this.loadSound(url);
    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    source.buffer = audioBuffer;
    if (options.pitch !== void 0) {
      const clampedPitch = Math.max(-24, Math.min(24, options.pitch));
      source.playbackRate.value = Math.pow(2, clampedPitch / 12);
    }
    const detuneValue = options.detuneCents ?? options.detune;
    if (detuneValue !== void 0 && "detune" in source) {
      source.detune.value = Math.max(-1200, Math.min(1200, detuneValue));
    }
    if (options.playbackRate !== void 0) {
      source.playbackRate.value = Math.max(
        0.25,
        Math.min(4, options.playbackRate)
      );
    }
    const targetVolume = Math.max(0, Math.min(1, options.volume ?? 1));
    gainNode.gain.setValueAtTime(0, this.context.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      targetVolume,
      this.context.currentTime + 0.01
    );
    let finalNode = gainNode;
    if (options.pan !== void 0 && typeof StereoPannerNode !== "undefined") {
      const pannerNode = new StereoPannerNode(this.context, {
        pan: Math.max(-1, Math.min(1, options.pan))
      });
      gainNode.connect(pannerNode);
      finalNode = pannerNode;
    }
    source.connect(gainNode);
    finalNode.connect(this.context.destination);
    source.start(0);
    return source;
  }
  /**
   * Apply real-time effects to a sound
   */
  async playWithEffects(url, effects = {}, playbackOptions = {}) {
    await this.initContext();
    if (!this.context) throw new Error("AudioContext not available");
    const audioBuffer = await this.loadSound(url);
    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    if (playbackOptions.pitch !== void 0) {
      const clampedPitch = Math.max(-24, Math.min(24, playbackOptions.pitch));
      source.playbackRate.value = Math.pow(2, clampedPitch / 12);
    }
    let currentNode = source;
    if (effects.lowpass && effects.lowpass < 2e4) {
      const filter = this.context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = Math.max(20, effects.lowpass);
      currentNode.connect(filter);
      currentNode = filter;
    }
    if (effects.highpass && effects.highpass > 20) {
      const filter = this.context.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = Math.min(2e4, effects.highpass);
      currentNode.connect(filter);
      currentNode = filter;
    }
    if (effects.delay && effects.delay > 0) {
      const delay = this.context.createDelay(5);
      const feedback = this.context.createGain();
      const mix = this.context.createGain();
      delay.delayTime.value = Math.min(5, effects.delay);
      feedback.gain.value = 0.4;
      mix.gain.value = 0.5;
      currentNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(mix);
      currentNode.connect(mix);
      currentNode = mix;
    }
    const gainNode = this.context.createGain();
    gainNode.gain.value = playbackOptions.volume ?? 1;
    currentNode.connect(gainNode);
    gainNode.connect(this.context.destination);
    source.start(0);
    return source;
  }
  /**
   * Clear the audio cache
   */
  clearCache() {
    this.cache.clear();
  }
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      urls: Array.from(this.cache.keys())
    };
  }
  /**
   * Cleanup resources
   */
  async dispose() {
    this.clearCache();
    if (this.context && this.context.state !== "closed") {
      await this.context.close();
    }
    this.context = null;
  }
};

// src/SoundPack.ts
var SoundPack = class {
  constructor(manifest, options = {}) {
    __publicField(this, "manifest");
    __publicField(this, "basePath");
    __publicField(this, "processor");
    __publicField(this, "formatSupport", /* @__PURE__ */ new Map());
    __publicField(this, "lazyLoad");
    __publicField(this, "loadedSounds", /* @__PURE__ */ new Set());
    __publicField(this, "loadingPromises", /* @__PURE__ */ new Map());
    this.manifest = manifest;
    this.lazyLoad = options.lazyLoad ?? true;
    if (options.cdn || this.lazyLoad) {
      this.basePath = options.basePath || "https://unpkg.com/juicy-sounds@latest/sounds";
    } else {
      this.basePath = options.basePath || "/sounds";
    }
    this.processor = new WebAudioProcessor();
    this.detectFormatSupport();
    if (options.preload && !this.lazyLoad) {
      this.preload().catch(console.error);
    }
  }
  /**
   * Detect which audio formats the browser supports
   */
  detectFormatSupport() {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    const formatTests = {
      "mp3": "audio/mpeg",
      "ogg": "audio/ogg",
      "wav": "audio/wav",
      "webm": "audio/webm"
    };
    for (const [ext, mime] of Object.entries(formatTests)) {
      const canPlay = audio.canPlayType(mime);
      this.formatSupport.set(
        ext,
        canPlay === "probably" || canPlay === "maybe"
      );
    }
  }
  /**
   * Get the best available format for a sound file
   */
  getBestFormat(baseFileName) {
    const cleanName = baseFileName.replace(/\.[^.]+$/, "");
    const preferred = this.manifest.formats?.preferred || ["ogg", "mp3", "wav"];
    for (const format of preferred) {
      if (this.formatSupport.get(format)) {
        return `${cleanName}.${format}`;
      }
    }
    return `${cleanName}.ogg`;
  }
  /**
   * Resolve sound file from manifest
   */
  resolveSound(path) {
    const [category, action = "default"] = path.split(".");
    const soundConfig = this.manifest.sounds[category]?.[action];
    if (!soundConfig) {
      throw new Error(`Sound not found in manifest: ${path}`);
    }
    if (typeof soundConfig === "string") {
      return { file: soundConfig, options: {} };
    }
    return {
      file: soundConfig.default,
      options: {
        pitch: soundConfig.pitch,
        volume: soundConfig.volume
      }
    };
  }
  /**
   * Play a sound by category and action path
   * With lazy loading: only fetches sound on first play
   *
   * @example
   * pack.play('click.primary')
   * pack.play('hover', { volume: 0.5 })
   */
  async play(path, options = {}) {
    try {
      const { file, options: defaultOptions } = this.resolveSound(path);
      const fileName = this.getBestFormat(file);
      const url = `${this.basePath}/${this.manifest.name}/${fileName}`;
      if (this.lazyLoad && !this.loadedSounds.has(url)) {
        if (!this.loadingPromises.has(url)) {
          const loadPromise = this.processor.loadSound(url).then((buffer) => {
            this.loadedSounds.add(url);
            this.loadingPromises.delete(url);
            return buffer;
          }).catch((error) => {
            this.loadingPromises.delete(url);
            throw error;
          });
          this.loadingPromises.set(url, loadPromise);
        }
        await this.loadingPromises.get(url);
      }
      const finalOptions = { ...defaultOptions, ...options };
      return await this.processor.playWithPitch(url, finalOptions);
    } catch (error) {
      console.error(`Error playing sound ${path}:`, error);
      const fallback = this.manifest.formats?.fallback || "silence";
      if (fallback === "error") {
        throw error;
      }
      return {};
    }
  }
  /**
   * Play a random variant of a sound
   */
  async playVariant(path, options = {}) {
    const [category, action = "default"] = path.split(".");
    const soundConfig = this.manifest.sounds[category]?.[action];
    if (!soundConfig || typeof soundConfig === "string") {
      return this.play(path, options);
    }
    const variants = soundConfig.variants || [soundConfig.default];
    const randomFile = variants[Math.floor(Math.random() * variants.length)];
    const fileName = this.getBestFormat(randomFile);
    const url = `${this.basePath}/${this.manifest.name}/${fileName}`;
    const finalOptions = {
      pitch: soundConfig.pitch,
      volume: soundConfig.volume,
      ...options
    };
    return await this.processor.playWithPitch(url, finalOptions);
  }
  /**
   * Create a gradient of sounds for UI elements
   *
   * @example
   * const sounds = pack.createGradient('click.primary', 4);
   * buttons.forEach((btn, i) => {
   *   btn.onclick = () => sounds[i]();
   * });
   */
  createGradient(soundPath, steps = 4, options = {}) {
    const type = options.type || "pitch";
    const range = options.range || 8;
    const sounds = [];
    if (type === "pitch") {
      for (let i = 0; i < steps; i++) {
        const position = i / (steps - 1);
        const pitch = (position - 0.5) * range;
        sounds.push(() => this.play(soundPath, { pitch }));
      }
    } else if (type === "volume") {
      for (let i = 0; i < steps; i++) {
        const volume = 0.3 + 0.7 * (i / (steps - 1));
        sounds.push(() => this.play(soundPath, { volume }));
      }
    } else {
      for (let i = 0; i < steps; i++) {
        sounds.push(() => this.play(soundPath));
      }
    }
    return sounds;
  }
  /**
   * Create harmonic sounds using musical scales
   */
  createHarmonicSet(soundPath, count = 4, scale = "pentatonic") {
    const scales = {
      major: [0, 2, 4, 5, 7, 9, 11, 12],
      minor: [0, 2, 3, 5, 7, 8, 10, 12],
      pentatonic: [0, 2, 4, 7, 9, 12],
      chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    };
    const intervals = scales[scale];
    const sounds = [];
    for (let i = 0; i < count; i++) {
      const noteIndex = i % intervals.length;
      const octave = Math.floor(i / intervals.length);
      const pitch = intervals[noteIndex] + octave * 12;
      sounds.push(() => this.play(soundPath, { pitch }));
    }
    return sounds;
  }
  /**
   * Preload sounds for faster playback
   */
  async preload(categories) {
    const toLoad = categories || Object.keys(this.manifest.sounds);
    const promises = [];
    for (const category of toLoad) {
      const actions = this.manifest.sounds[category];
      if (!actions) continue;
      for (const [action, config] of Object.entries(actions)) {
        const file = typeof config === "string" ? config : config.default;
        const fileName = this.getBestFormat(file);
        const url = `${this.basePath}/${this.manifest.name}/${fileName}`;
        promises.push(this.processor.loadSound(url));
      }
    }
    await Promise.all(promises);
  }
  /**
   * Get pack information
   */
  getInfo() {
    return {
      name: this.manifest.name,
      version: this.manifest.version,
      author: this.manifest.author,
      description: this.manifest.description,
      soundCount: Object.values(this.manifest.sounds).reduce((acc, cat) => acc + Object.keys(cat).length, 0),
      categories: Object.keys(this.manifest.sounds)
    };
  }
  /**
   * Trigger haptic feedback if supported
   */
  triggerHaptic(action) {
    if (typeof window === "undefined" || !("vibrate" in navigator)) return;
    const strength = this.manifest.haptics?.[action] || "light";
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [40, 20, 40]
    };
    navigator.vibrate(patterns[strength]);
  }
  /**
   * Cleanup resources
   */
  dispose() {
    this.processor.dispose();
  }
};
var SoundPackManager = class {
  constructor() {
    __publicField(this, "packs", /* @__PURE__ */ new Map());
    __publicField(this, "activePack", null);
    __publicField(this, "categoryOverrides", /* @__PURE__ */ new Map());
  }
  /**
   * Load a sound pack
   */
  async loadPack(name, manifest, options) {
    const pack = new SoundPack(manifest, options);
    this.packs.set(name, pack);
    if (!this.activePack) {
      this.activePack = name;
    }
    return pack;
  }
  /**
   * Load pack from URL
   */
  async loadPackFromUrl(name, manifestUrl, options) {
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.statusText}`);
    }
    const manifest = await response.json();
    return this.loadPack(name, manifest, options);
  }
  /**
   * Switch active pack
   */
  switchPack(name) {
    if (!this.packs.has(name)) {
      throw new Error(`Pack '${name}' not loaded`);
    }
    this.activePack = name;
    this.categoryOverrides.clear();
  }
  /**
   * Use different packs for different categories
   */
  useMixed(overrides) {
    this.categoryOverrides.clear();
    for (const [category, packName] of Object.entries(overrides)) {
      if (!this.packs.has(packName)) {
        console.warn(
          `Pack '${packName}' not loaded, skipping override for '${category}'`
        );
        continue;
      }
      this.categoryOverrides.set(category, packName);
    }
  }
  /**
   * Play a sound (automatically routes to correct pack)
   */
  async play(path, options) {
    const [category] = path.split(".");
    const packName = this.categoryOverrides.get(category) || this.activePack;
    if (!packName) {
      console.warn(`No pack available for sound: ${path}`);
      return;
    }
    const pack = this.packs.get(packName);
    if (!pack) {
      console.warn(`Pack '${packName}' not found`);
      return;
    }
    return pack.play(path, options);
  }
  /**
   * Create gradient sounds
   */
  createGradient(soundPath, steps, options) {
    const [category] = soundPath.split(".");
    const packName = this.categoryOverrides.get(category) || this.activePack;
    const pack = packName ? this.packs.get(packName) : void 0;
    if (!pack) {
      console.warn(`No pack available for gradient: ${soundPath}`);
      return [];
    }
    return pack.createGradient(soundPath, steps, options);
  }
  /**
   * Get loaded packs info
   */
  getPacksInfo() {
    return Array.from(this.packs.entries()).map(([name, pack]) => ({
      name,
      info: pack.getInfo()
    }));
  }
  /**
   * Get active pack
   */
  getActivePack() {
    return this.activePack ? this.packs.get(this.activePack) : void 0;
  }
  /**
   * Cleanup all packs
   */
  dispose() {
    for (const pack of this.packs.values()) {
      pack.dispose();
    }
    this.packs.clear();
    this.activePack = null;
    this.categoryOverrides.clear();
  }
};

// src/JuicySounds.ts
var JuicySounds = class {
  constructor(config = {}) {
    __publicField(this, "manager");
    __publicField(this, "config");
    __publicField(this, "globalVolume", 1);
    __publicField(this, "isMuted", false);
    __publicField(this, "synthContext", null);
    // Gradient sound frequencies (C major scale)
    __publicField(this, "gradientFrequencies", [
      261.63,
      // C4
      293.66,
      // D4
      329.63,
      // E4
      392,
      // G4
      440,
      // A4
      493.88
      // B4
    ]);
    this.config = {
      lazyLoad: true,
      cdn: config.lazyLoad !== false,
      pack: "interface",
      volume: 1,
      muted: false,
      maxCacheSize: 100,
      synthetic: {
        enabled: true,
        waveform: "sine",
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
  async initializeDefaultPack() {
    const packOptions = {
      lazyLoad: this.config.lazyLoad,
      cdn: this.config.cdn,
      basePath: this.config.basePath,
      maxCacheSize: this.config.maxCacheSize
    };
    const manifest = {
      name: "interface",
      version: "1.0.0",
      formats: {
        preferred: ["ogg", "mp3", "wav"],
        fallback: "silence"
      },
      sounds: {
        click: {
          default: "click_001.ogg",
          variants: ["click_002.ogg", "click_003.ogg"],
          volume: 0.15
        },
        hover: {
          default: "select_001.ogg",
          variants: ["select_002.ogg", "select_003.ogg"],
          volume: 0.05
        },
        success: {
          default: "confirmation_001.ogg",
          variants: ["confirmation_002.ogg", "confirmation_003.ogg"],
          volume: 0.3
        },
        error: {
          default: "error_001.ogg",
          variants: ["error_002.ogg", "error_003.ogg"],
          volume: 0.3
        },
        notification: {
          default: "glass_001.ogg",
          variants: ["glass_002.ogg", "glass_003.ogg"],
          volume: 0.25
        },
        toggle: {
          on: "switch_001.ogg",
          off: "switch_002.ogg",
          volume: 0.2
        },
        panel: {
          open: "open_001.ogg",
          close: "close_001.ogg",
          volume: 0.15
        }
      },
      haptics: {
        click: "light",
        success: "medium",
        error: "medium",
        toggle: "light"
      }
    };
    await this.manager.loadPack("default", manifest, packOptions);
    if (this.config.preload?.length) {
      for (const sound of this.config.preload) {
        try {
          await this.play(sound, { volume: 0 });
        } catch (e) {
        }
      }
    }
  }
  /**
   * Play a sound (lazy loads if needed)
   */
  async play(sound, options = {}) {
    if (this.isMuted) return;
    let pitch = options.pitch;
    if (options.randomPitch && !pitch) {
      const variation = 0.05;
      const randomFactor = 1 + (Math.random() * 2 - 1) * variation;
      pitch = randomFactor;
    }
    const finalOptions = {
      ...options,
      volume: (options.volume ?? 1) * this.globalVolume,
      pitch
    };
    try {
      await this.manager.play(sound, finalOptions);
    } catch (error) {
    }
  }
  /**
   * Quick methods for common sounds
   */
  async playClick() {
    return this.play("click", { randomPitch: true });
  }
  async playHover() {
    return this.play("hover", { volume: 0.3, randomPitch: true });
  }
  async playSuccess() {
    return this.play("success");
  }
  async playError() {
    return this.play("error");
  }
  async playNotification() {
    return this.play("notification");
  }
  /**
   * Play a random click variant
   */
  async playRandomClick() {
    const variants = ["click", "click.variant1", "click.variant2"];
    const random = variants[Math.floor(Math.random() * variants.length)];
    return this.play(random);
  }
  /**
   * Play gradient sound (synthetic)
   */
  playGradientSound(index, total) {
    if (this.isMuted || !this.config.synthetic?.enabled) return;
    if (!this.synthContext) {
      this.synthContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const freqIndex = Math.floor(index / total * this.gradientFrequencies.length);
    const frequency = this.gradientFrequencies[Math.min(freqIndex, this.gradientFrequencies.length - 1)];
    const oscillator = this.synthContext.createOscillator();
    const gainNode = this.synthContext.createGain();
    oscillator.type = this.config.synthetic?.waveform || "sine";
    oscillator.frequency.setValueAtTime(frequency, this.synthContext.currentTime);
    const now = this.synthContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2 * this.globalVolume, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0.15 * this.globalVolume, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.15 * this.globalVolume, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
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
  setGradientScale(scale = "major", rootNote = "C", octave = 4) {
    const scales = {
      major: [0, 2, 4, 5, 7, 9],
      // Happy, bright
      minor: [0, 2, 3, 5, 7, 8],
      // Serious, moody
      pentatonic: [0, 2, 4, 7, 9, 12],
      // Safe, no bad notes
      blues: [0, 3, 5, 6, 7, 10],
      // Playful, soulful
      mixolydian: [0, 2, 4, 5, 7, 9, 10].slice(0, 6)
      // Slightly exotic
    };
    const roots = {
      C: 261.63,
      D: 293.66,
      E: 329.63,
      F: 349.23,
      G: 392,
      A: 440,
      B: 493.88
    };
    const intervals = scales[scale] || scales.major;
    const rootFreq = roots[rootNote.toUpperCase()] || roots.C;
    const octaveMultiplier = Math.pow(2, octave - 4);
    const baseFreq = rootFreq * octaveMultiplier;
    this.gradientFrequencies = intervals.map(
      (semitones) => parseFloat((baseFreq * Math.pow(2, semitones / 12)).toFixed(2))
    );
  }
  /**
   * Set custom gradient frequencies
   */
  setGradientFrequencies(frequencies) {
    this.gradientFrequencies = frequencies;
  }
  /**
   * Set gradient waveform
   */
  setGradientWaveform(waveform) {
    if (this.config.synthetic) {
      this.config.synthetic.waveform = waveform;
    }
  }
  /**
   * Volume control
   */
  setVolume(volume) {
    this.globalVolume = Math.max(0, Math.min(1, volume));
  }
  getVolume() {
    return this.globalVolume;
  }
  /**
   * Mute control
   */
  mute() {
    this.isMuted = true;
  }
  unmute() {
    this.isMuted = false;
  }
  toggle() {
    this.isMuted = !this.isMuted;
  }
  /**
   * Load a different sound pack
   */
  async loadPack(packName) {
    console.log(`Loading pack: ${packName}`);
  }
  /**
   * Set active pack
   */
  setActivePack(packName) {
    this.manager.switchPack(packName);
  }
  /**
   * Auto-attach sounds to elements
   */
  autoAttach(selectors) {
    if (typeof document === "undefined") return;
    for (const [sound, selector] of Object.entries(selectors)) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        if (el.tagName === "BUTTON" || el.getAttribute("role") === "button") {
          el.addEventListener("click", () => this.play(sound));
        } else if (el.tagName === "A") {
          el.addEventListener("mouseenter", () => this.play(sound, { volume: 0.3 }));
        } else {
          el.addEventListener("click", () => this.play(sound));
        }
      });
    }
    console.log(`\u{1F3B5} Auto-attached sounds to ${Object.keys(selectors).length} selectors`);
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
};
var defaultInstance = null;
function getJuicySounds(config) {
  if (!defaultInstance) {
    defaultInstance = new JuicySounds(config);
  }
  return defaultInstance;
}
var playSound = (sound, options) => getJuicySounds().play(sound, options);
var playClick = () => getJuicySounds().playClick();
var playHover = () => getJuicySounds().playHover();
var playSuccess = () => getJuicySounds().playSuccess();
var playError = () => getJuicySounds().playError();

// src/hapticService.ts
var hapticService_exports = {};
__export(hapticService_exports, {
  HAPTIC_PATTERNS: () => HAPTIC_PATTERNS,
  hapticService: () => hapticService
});
var HAPTIC_PATTERNS = {
  // Button interactions
  BUTTON_PRESS: [30],
  BUTTON_SUCCESS: [50, 30, 50],
  BUTTON_ERROR: [100, 50, 100],
  // Slider interactions
  SLIDER_STEP: [15],
  SLIDER_RELEASE: [25],
  // Toggle interactions
  TOGGLE_ON: [40, 20, 20],
  TOGGLE_OFF: [20],
  // Panel interactions
  PANEL_OPEN: [35],
  PANEL_CLOSE: [20],
  // Special interactions
  DICE_ROLL: [30, 40, 30],
  SURPRISE_SUCCESS: [60, 30, 60, 30, 60],
  // Voice recording
  RECORDING_START: [40, 60, 40],
  RECORDING_STOP: [50],
  // Copy/success actions
  COPY_SUCCESS: [25],
  CELEBRATION: [80, 50, 80, 50, 120],
  // Error patterns
  PERMISSION_ERROR: [20, 100, 20, 100, 20],
  GENERAL_ERROR: [20, 150, 20]
};
var HapticService = class {
  constructor() {
    __publicField(this, "isMobile");
    __publicField(this, "isSupported");
    __publicField(this, "enabled");
    this.isMobile = typeof window !== "undefined" && globalThis.innerWidth <= 768;
    this.isSupported = typeof navigator !== "undefined" && "vibrate" in navigator;
    this.enabled = true;
    this.initializeSettings();
  }
  initializeSettings() {
    if (typeof localStorage !== "undefined") {
      const storedValue = localStorage.getItem("buttonstudio-haptics-enabled");
      if (storedValue === "false") {
        this.enabled = false;
      }
    }
    if (typeof window !== "undefined") {
      window.hapticsEnabled = this.enabled;
      console.log("\u{1F4F3} ButtonStudio haptics enabled:", this.enabled);
    }
  }
  vibrate(pattern) {
    if (!this.enabled || !this.isSupported || !this.isMobile) {
      return false;
    }
    try {
      navigator.vibrate(pattern);
      return true;
    } catch (e) {
      console.log(`Vibration failed: ${e.message}`);
      return false;
    }
  }
  // Button interactions
  buttonPress() {
    return this.vibrate(HAPTIC_PATTERNS.BUTTON_PRESS);
  }
  buttonSuccess() {
    return this.vibrate(HAPTIC_PATTERNS.BUTTON_SUCCESS);
  }
  buttonError() {
    return this.vibrate(HAPTIC_PATTERNS.BUTTON_ERROR);
  }
  // Slider interactions
  sliderStep() {
    return this.vibrate(HAPTIC_PATTERNS.SLIDER_STEP);
  }
  sliderRelease() {
    return this.vibrate(HAPTIC_PATTERNS.SLIDER_RELEASE);
  }
  // Toggle interactions
  toggleOn() {
    return this.vibrate(HAPTIC_PATTERNS.TOGGLE_ON);
  }
  toggleOff() {
    return this.vibrate(HAPTIC_PATTERNS.TOGGLE_OFF);
  }
  // Panel interactions
  panelOpen() {
    return this.vibrate(HAPTIC_PATTERNS.PANEL_OPEN);
  }
  panelClose() {
    return this.vibrate(HAPTIC_PATTERNS.PANEL_CLOSE);
  }
  // Special interactions
  diceRoll() {
    return this.vibrate(HAPTIC_PATTERNS.DICE_ROLL);
  }
  surpriseSuccess() {
    return this.vibrate(HAPTIC_PATTERNS.SURPRISE_SUCCESS);
  }
  // Voice recording
  startRecording() {
    return this.vibrate(HAPTIC_PATTERNS.RECORDING_START);
  }
  stopRecording() {
    return this.vibrate(HAPTIC_PATTERNS.RECORDING_STOP);
  }
  // Success actions
  copySuccess() {
    return this.vibrate(HAPTIC_PATTERNS.COPY_SUCCESS);
  }
  celebration() {
    return this.vibrate(HAPTIC_PATTERNS.CELEBRATION);
  }
  // Error handling
  permissionError() {
    return this.vibrate(HAPTIC_PATTERNS.PERMISSION_ERROR);
  }
  generalError() {
    return this.vibrate(HAPTIC_PATTERNS.GENERAL_ERROR);
  }
  // Settings
  enable() {
    this.enabled = true;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("buttonstudio-haptics-enabled", "true");
    }
    this.buttonSuccess();
  }
  disable() {
    this.enabled = false;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("buttonstudio-haptics-enabled", "false");
    }
  }
  isEnabled() {
    return this.enabled;
  }
  isHapticsSupported() {
    return this.isSupported;
  }
  isMobileDevice() {
    return this.isMobile;
  }
};
var hapticService = new HapticService();

// src/TypeWriter.ts
var KEY_SOUNDS = {
  // Regular keys (letters, numbers) - multiple variants prevent repetition
  regular: ["click", "click.variant1", "click.variant2"],
  // Special keys with different sounds
  space: ["switch_001", "switch_002"],
  // Deeper thunk
  enter: ["confirmation_001"],
  // Satisfying clack
  backspace: ["back_001", "back_002"],
  // Higher pitch
  tab: ["select_001", "select_002"],
  // Soft click
  // Modifier keys
  shift: ["hover", "hover.variant1"],
  // Subtle tick
  control: ["hover"],
  alt: ["hover"],
  meta: ["hover"],
  // Cmd/Win key
  // Function keys
  escape: ["error"],
  // Different sound for escape
  delete: ["back_001", "back_002"]
  // Same as backspace
};
var KEY_DETUNE_CENTS = {
  regular: 0,
  // No change
  space: -500,
  // ~5 semitones down
  enter: -300,
  // ~3 semitones down
  backspace: 300,
  // ~3 semitones up
  tab: -100,
  // ~1 semitone down
  shift: 100,
  // ~1 semitone up
  escape: -700
  // ~7 semitones down (perfect fifth down)
};
var KEY_PITCH = {
  regular: 1,
  space: 0.7,
  enter: 0.8,
  backspace: 1.2,
  tab: 0.9,
  shift: 1.1,
  escape: 0.6
};
var STYLE_VOLUMES = {
  mechanical: 0.3,
  // Loud and clicky
  soft: 0.15,
  // Quiet office mode
  vintage: 0.25
  // Old typewriter feel
};
var TypeWriter = class {
  constructor(config = {}) {
    __publicField(this, "sounds");
    __publicField(this, "config");
    __publicField(this, "enabled");
    __publicField(this, "lastKeyTime", 0);
    __publicField(this, "attachedElements", /* @__PURE__ */ new Set());
    this.config = {
      style: "mechanical",
      volume: 0.3,
      enabled: true,
      pitchVariation: true,
      keyUpSounds: false,
      stereoPan: true,
      // Enable by default for richer sound
      detuneCents: true,
      // Use modern cents-based pitch
      ...config
    };
    this.enabled = this.config.enabled || true;
    this.sounds = new JuicySounds({
      volume: this.config.volume || STYLE_VOLUMES[this.config.style || "mechanical"],
      synthetic: { enabled: false }
      // Use real sounds for typing
    });
  }
  /**
   * Handle key down event
   */
  async keyDown(key) {
    if (!this.enabled) return;
    const soundType = this.getKeySound(key);
    const now = Date.now();
    const timeSinceLastKey = now - this.lastKeyTime;
    this.lastKeyTime = now;
    const speedVolume = timeSinceLastKey < 100 ? 0.7 : 1;
    const options = {
      volume: speedVolume
    };
    if (this.config.detuneCents) {
      const baseCents = this.getKeyDetuneCents(key);
      const variation = this.config.pitchVariation ? this.randomCentsVariation() : 0;
      options.detuneCents = baseCents + variation;
    } else {
      const pitch = this.getKeyPitch(key);
      options.pitch = this.config.pitchVariation ? pitch * this.randomVariation() : pitch;
    }
    if (this.config.stereoPan) {
      options.pan = -0.15 + Math.random() * 0.3;
    }
    await this.sounds.play(soundType, options);
  }
  /**
   * Handle key up event (optional mechanical keyboard "release" sound)
   */
  async keyUp(key) {
    if (!this.enabled || !this.config.keyUpSounds) return;
    if (this.config.style === "mechanical") {
      await this.sounds.play("hover", {
        volume: 0.05,
        pitch: 1.5
      });
    }
  }
  /**
   * Get a random sound variant for a key
   */
  getKeySound(key) {
    const keyLower = key.toLowerCase();
    let variants;
    if (key === " ") variants = KEY_SOUNDS.space;
    else if (keyLower === "enter") variants = KEY_SOUNDS.enter;
    else if (keyLower === "backspace") variants = KEY_SOUNDS.backspace;
    else if (keyLower === "tab") variants = KEY_SOUNDS.tab;
    else if (keyLower === "shift") variants = KEY_SOUNDS.shift;
    else if (keyLower === "control" || keyLower === "ctrl") variants = KEY_SOUNDS.control;
    else if (keyLower === "alt") variants = KEY_SOUNDS.alt;
    else if (keyLower === "meta" || keyLower === "cmd") variants = KEY_SOUNDS.meta;
    else if (keyLower === "escape" || keyLower === "esc") variants = KEY_SOUNDS.escape;
    else if (keyLower === "delete" || keyLower === "del") variants = KEY_SOUNDS.delete;
    else variants = KEY_SOUNDS.regular;
    return variants[Math.floor(Math.random() * variants.length)];
  }
  /**
   * Get the pitch adjustment for a key
   */
  getKeyPitch(key) {
    const keyLower = key.toLowerCase();
    if (key === " ") return KEY_PITCH.space;
    if (keyLower === "enter") return KEY_PITCH.enter;
    if (keyLower === "backspace") return KEY_PITCH.backspace;
    if (keyLower === "tab") return KEY_PITCH.tab;
    if (keyLower === "shift") return KEY_PITCH.shift;
    if (keyLower === "escape" || keyLower === "esc") return KEY_PITCH.escape;
    return KEY_PITCH.regular;
  }
  /**
   * Get the detune adjustment in cents for a key
   */
  getKeyDetuneCents(key) {
    const keyLower = key.toLowerCase();
    if (key === " ") return KEY_DETUNE_CENTS.space;
    if (keyLower === "enter") return KEY_DETUNE_CENTS.enter;
    if (keyLower === "backspace") return KEY_DETUNE_CENTS.backspace;
    if (keyLower === "tab") return KEY_DETUNE_CENTS.tab;
    if (keyLower === "shift") return KEY_DETUNE_CENTS.shift;
    if (keyLower === "escape" || keyLower === "esc") return KEY_DETUNE_CENTS.escape;
    return KEY_DETUNE_CENTS.regular;
  }
  /**
   * Random pitch variation for natural feel
   */
  randomVariation() {
    return 1 + (Math.random() * 0.16 - 0.08);
  }
  /**
   * Random cents variation for natural feel
   */
  randomCentsVariation() {
    return Math.random() * 60 - 30;
  }
  /**
   * Attach to input elements
   */
  attach(selector) {
    if (typeof document === "undefined") return;
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (this.attachedElements.has(element)) return;
      element.addEventListener("keydown", (e) => {
        const event = e;
        this.keyDown(event.key);
      });
      if (this.config.keyUpSounds) {
        element.addEventListener("keyup", (e) => {
          const event = e;
          this.keyUp(event.key);
        });
      }
      this.attachedElements.add(element);
    });
    console.log(`\u{1F3B9} TypeWriter attached to ${elements.length} elements`);
  }
  /**
   * Detach from elements
   */
  detach() {
    this.attachedElements.clear();
  }
  /**
   * Enable/disable typing sounds
   */
  enable() {
    this.enabled = true;
  }
  disable() {
    this.enabled = false;
  }
  toggle() {
    this.enabled = !this.enabled;
  }
  /**
   * Set typing style
   */
  setStyle(style) {
    this.config.style = style;
    this.sounds.setVolume(STYLE_VOLUMES[style]);
  }
  /**
   * Set volume
   */
  setVolume(volume) {
    this.sounds.setVolume(volume);
  }
  /**
   * Cleanup
   */
  dispose() {
    this.detach();
    this.sounds.dispose();
  }
};
var defaultTypeWriter = null;
function enableTypingSounds(config) {
  if (!defaultTypeWriter) {
    defaultTypeWriter = new TypeWriter(config);
    defaultTypeWriter.attach("input, textarea");
  }
  return defaultTypeWriter;
}
function disableTypingSounds() {
  if (defaultTypeWriter) {
    defaultTypeWriter.disable();
  }
}

// src/index.ts
var index_default = JuicySounds;
export {
  hapticService_exports as HapticService,
  JuicySounds,
  SoundPack,
  SoundPackManager,
  TypeWriter,
  WebAudioProcessor,
  index_default as default,
  disableTypingSounds,
  enableTypingSounds,
  getJuicySounds,
  playClick,
  playError,
  playHover,
  playSound,
  playSuccess
};
