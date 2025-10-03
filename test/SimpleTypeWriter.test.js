/**
 * SimpleTypeWriter Test Suite
 * Tests core functionality, error handling, and edge cases
 */

import { SimpleTypeWriter } from '../src/SimpleTypeWriter.js';

// Mock Web Audio API for testing
class MockAudioContext {
  constructor() {
    this.state = 'suspended';
    this.destination = {};
  }

  async resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  async close() {
    this.state = 'closed';
    return Promise.resolve();
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
      onended: null
    };
  }

  createGain() {
    return {
      gain: { value: 1 },
      connect: () => {},
      disconnect: () => {}
    };
  }

  async decodeAudioData(buffer) {
    return { duration: 10, sampleRate: 44100 };
  }
}

// Test utilities
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const createMockFetch = (success = true) => {
  return jest.fn(() => Promise.resolve({
    ok: success,
    status: success ? 200 : 404,
    json: () => Promise.resolve({
      name: 'Test Keyboard Pack',
      defines: {
        '65': [0, 100],
        '66': [100, 100],
        '57': [200, 150]
      }
    }),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
  }));
};

describe('SimpleTypeWriter', () => {
  let originalFetch;
  let originalAudioContext;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalAudioContext = global.AudioContext;
    global.AudioContext = MockAudioContext;
    global.fetch = createMockFetch();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.AudioContext = originalAudioContext;
  });

  describe('Constructor', () => {
    test('should initialize with default config', () => {
      const typewriter = new SimpleTypeWriter();
      expect(typewriter.config.volume).toBe(0.3);
      expect(typewriter.config.enabled).toBe(true);
      expect(typewriter.config.pack).toBe('cherry-mx-black');
      expect(typewriter.config.basePath).toBe('./sounds/keyboard-packs/');
      expect(typewriter.config.debug).toBe(false);
      expect(typewriter.config.debounceMs).toBe(10);
      expect(typewriter.config.retryAttempts).toBe(3);
    });

    test('should merge custom config', () => {
      const typewriter = new SimpleTypeWriter({
        volume: 0.5,
        pack: 'cherry-mx-blue',
        debug: true
      });
      expect(typewriter.config.volume).toBe(0.5);
      expect(typewriter.config.pack).toBe('cherry-mx-blue');
      expect(typewriter.config.debug).toBe(true);
    });
  });

  describe('Initialization', () => {
    test('should load sound pack successfully', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init();

      expect(typewriter.loaded).toBe(true);
      expect(typewriter.audioContext).toBeDefined();
      expect(typewriter.audioBuffer).toBeDefined();
      expect(typewriter.configData).toBeDefined();
      expect(typewriter.configData.name).toBe('Test Keyboard Pack');
    });

    test('should handle load failure gracefully', async () => {
      global.fetch = createMockFetch(false);
      const typewriter = new SimpleTypeWriter({ debug: false });
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      await typewriter.init();

      expect(typewriter.loaded).toBe(false);
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    test('should not reload if pack already loaded', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init();

      const fetchSpy = jest.spyOn(global, 'fetch');
      await typewriter.init(); // Second init with same pack

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    test('should resume suspended audio context', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init();

      expect(typewriter.audioContext.state).toBe('running');
    });

    test('should retry on network failure', async () => {
      let callCount = 0;
      global.fetch = jest.fn(() => {
        callCount++;
        if (callCount < 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ name: 'Test', defines: {} }),
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
        });
      });

      const typewriter = new SimpleTypeWriter({ retryAttempts: 3 });
      await typewriter.init();

      expect(callCount).toBe(2); // Failed once, succeeded on second try
      expect(typewriter.loaded).toBe(true);
    });
  });

  describe('Audio Playback', () => {
    test('should play sound for mapped key', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init();

      const playSound = jest.spyOn(typewriter, 'playSound');
      await typewriter.play({ key: 'a' });

      expect(playSound).toHaveBeenCalledWith(0, 100);
    });

    test('should use fallback for unmapped key', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init();

      const playSound = jest.spyOn(typewriter, 'playSound');
      await typewriter.play({ key: '©' }); // Unmapped character

      expect(playSound).toHaveBeenCalledWith(0, 100); // Fallback to 'A'
    });

    test('should debounce rapid key presses', async () => {
      const typewriter = new SimpleTypeWriter({ debounceMs: 50 });
      await typewriter.init();

      const playSound = jest.spyOn(typewriter, 'playSound');

      await typewriter.play({ key: 'a' });
      await typewriter.play({ key: 'a' }); // Too fast

      expect(playSound).toHaveBeenCalledTimes(1);

      await delay(60);
      await typewriter.play({ key: 'a' }); // After debounce

      expect(playSound).toHaveBeenCalledTimes(2);
    });

    test('should not play when disabled', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init();
      typewriter.disable();

      const playSound = jest.spyOn(typewriter, 'playSound');
      await typewriter.play({ key: 'a' });

      expect(playSound).not.toHaveBeenCalled();
    });

    test('should track and clean up audio sources', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init();

      await typewriter.play({ key: 'a' });
      expect(typewriter.activeSources.size).toBe(1);

      // Simulate source ended
      const source = Array.from(typewriter.activeSources)[0];
      if (source.onended) source.onended();

      expect(typewriter.activeSources.size).toBe(0);
    });
  });

  describe('Element Attachment', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input id="input1" />
        <input id="input2" />
        <textarea id="textarea1"></textarea>
      `;
    });

    test('should attach to elements matching selector', () => {
      const typewriter = new SimpleTypeWriter();
      typewriter.attach('input, textarea');

      expect(typewriter.attachedElements.size).toBe(3);
    });

    test('should not attach to same element twice', () => {
      const typewriter = new SimpleTypeWriter();
      typewriter.attach('#input1');
      typewriter.attach('#input1');

      expect(typewriter.attachedElements.size).toBe(1);
    });

    test('should handle keydown events', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init();
      typewriter.attach('#input1');

      const playSpy = jest.spyOn(typewriter, 'play');
      const input = document.getElementById('input1');
      const event = new KeyboardEvent('keydown', { key: 'a' });
      input.dispatchEvent(event);

      expect(playSpy).toHaveBeenCalled();
    });

    test('should detach from all elements', () => {
      const typewriter = new SimpleTypeWriter();
      typewriter.attach('input, textarea');

      expect(typewriter.attachedElements.size).toBe(3);

      typewriter.detach();
      expect(typewriter.attachedElements.size).toBe(0);

      // Check event listeners removed
      const input = document.getElementById('input1');
      expect(input._typewriterHandler).toBeUndefined();
    });
  });

  describe('Volume Control', () => {
    test('should set volume within valid range', () => {
      const typewriter = new SimpleTypeWriter();

      typewriter.setVolume(0.5);
      expect(typewriter.config.volume).toBe(0.5);

      typewriter.setVolume(1.5); // Too high
      expect(typewriter.config.volume).toBe(1);

      typewriter.setVolume(-0.5); // Too low
      expect(typewriter.config.volume).toBe(0);
    });
  });

  describe('Pack Switching', () => {
    test('should switch to different sound pack', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init('cherry-mx-black');

      expect(typewriter.config.pack).toBe('cherry-mx-black');

      await typewriter.setPack('cherry-mx-blue');
      expect(typewriter.config.pack).toBe('cherry-mx-blue');
    });
  });

  describe('Audio Context Resume', () => {
    test('should resume suspended context', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init();

      // Force suspended state
      typewriter.audioContext.state = 'suspended';

      const resumed = await typewriter.resumeAudioContext();
      expect(resumed).toBe(true);
      expect(typewriter.audioContext.state).toBe('running');
    });

    test('should return false if already running', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init();

      const resumed = await typewriter.resumeAudioContext();
      expect(resumed).toBe(false);
    });
  });

  describe('Cleanup', () => {
    test('should properly dispose resources', async () => {
      const typewriter = new SimpleTypeWriter();
      await typewriter.init();
      typewriter.attach('input');

      // Add a mock active source
      const mockSource = {
        stop: jest.fn(),
        disconnect: jest.fn()
      };
      typewriter.activeSources.add(mockSource);

      typewriter.dispose();

      expect(typewriter.attachedElements.size).toBe(0);
      expect(typewriter.activeSources.size).toBe(0);
      expect(typewriter.audioBuffer).toBeNull();
      expect(typewriter.configData).toBeNull();
      expect(typewriter.audioContext).toBeNull();
      expect(mockSource.stop).toHaveBeenCalled();
      expect(mockSource.disconnect).toHaveBeenCalled();
    });
  });

  describe('Key Mapping', () => {
    test('should map letters correctly', () => {
      const typewriter = new SimpleTypeWriter();

      expect(typewriter.getKeyId({ key: 'a' })).toBe('65');
      expect(typewriter.getKeyId({ key: 'A' })).toBe('65');
      expect(typewriter.getKeyId({ key: 'z' })).toBe('90');
    });

    test('should map numbers correctly', () => {
      const typewriter = new SimpleTypeWriter();

      expect(typewriter.getKeyId({ key: '1' })).toBe('2');
      expect(typewriter.getKeyId({ key: '0' })).toBe('11');
    });

    test('should map special keys correctly', () => {
      const typewriter = new SimpleTypeWriter();

      expect(typewriter.getKeyId({ key: ' ' })).toBe('57');
      expect(typewriter.getKeyId({ key: 'Enter' })).toBe('28');
      expect(typewriter.getKeyId({ key: 'Backspace' })).toBe('14');
    });

    test('should use fallback for unknown keys', () => {
      const typewriter = new SimpleTypeWriter();

      expect(typewriter.getKeyId({ key: '©' })).toBe('65'); // Fallback to 'A'
    });
  });

  describe('Test Connection', () => {
    test('should test connection successfully', async () => {
      const typewriter = new SimpleTypeWriter();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await typewriter.testConnection();

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Success'));
      consoleSpy.mockRestore();
    });

    test('should handle connection failure', async () => {
      global.fetch = createMockFetch(false);
      const typewriter = new SimpleTypeWriter();
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      const result = await typewriter.testConnection();

      expect(result).toBe(false);
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('not found'));
      consoleError.mockRestore();
    });
  });
});

// Export for test runners
export default describe;