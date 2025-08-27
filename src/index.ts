/**
 * Juice Sounds 🎵
 * 
 * A delightful sound library for web interfaces that actually feels good.
 * No corporate beeps, just pure audio juice.
 * 
 * @module juice-sounds
 * @version 1.0.0
 */

// Core exports
export { SoundPackManager } from './SoundPack.ts';
export { WebAudioProcessor, PlaybackOptions } from './AudioProcessor.ts';
export { SoundService } from './soundService.ts';
export * as SynthEngine from './synthEngine.ts';
export * as HapticService from './hapticService.ts';

// Types
export type {
  SoundPackManifest,
  SoundVariant,
  GradientConfig,
  AudioFormat,
  FallbackStrategy,
  HapticStrength,
  PitchValue,
  SoundPackOptions,
  PlaySoundOptions
} from './SoundPack.ts';

// Quick start helper
export function createSoundManager(options?: any) {
  const { SoundPackManager } = await import('./SoundPack.ts');
  return new SoundPackManager(options);
}

// Browser-friendly default export
export default {
  createSoundManager,
  SoundPackManager: () => import('./SoundPack.ts').then(m => m.SoundPackManager),
  WebAudioProcessor: () => import('./AudioProcessor.ts').then(m => m.WebAudioProcessor),
  SoundService: () => import('./soundService.ts').then(m => m.SoundService),
  SynthEngine: () => import('./synthEngine.ts'),
  HapticService: () => import('./hapticService.ts')
};