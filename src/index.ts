/**
 * Juicy Sounds 🎵
 *
 * A delightful sound library for web interfaces that actually feels good.
 * No corporate beeps, just pure audio juice.
 *
 * @module juicy-sounds
 * @version 1.0.0
 */

// Main API
export { JuicySounds } from "./JuicySounds.ts";
export type { JuicySoundsConfig } from "./JuicySounds.ts";

// Sound pack system
export { SoundPack, SoundPackManager } from "./SoundPack.ts";
export type {
  SoundPackManifest,
  SoundPackOptions,
  SoundVariant,
  GradientConfig,
  GradientOptions,
  AudioFormat,
  FallbackStrategy,
  HapticStrength,
  MusicalScale
} from "./SoundPack.ts";

// Audio processing
export { WebAudioProcessor } from "./AudioProcessor.ts";
export type { PlaybackOptions, EffectOptions } from "./AudioProcessor.ts";

// Haptic feedback
export * as HapticService from "./hapticService.ts";

// Typing sounds
export { TypeWriter, enableTypingSounds, disableTypingSounds } from "./TypeWriter.ts";
export type { TypeWriterConfig } from "./TypeWriter.ts";

// Quick start - default export
import { JuicySounds } from "./JuicySounds.ts";
export default JuicySounds;

// Convenience functions for quick use
export { 
  getJuicySounds,
  playSound,
  playClick,
  playHover,
  playSuccess,
  playError 
} from "./JuicySounds.ts";