/**
 * Juicy Sounds - Delightful audio feedback for web interfaces
 * Now with ultra-realistic mechanical keyboard sounds!
 */

// Core exports
export { TypeWriter, enableTypingSounds } from './TypeWriter.js';
export { KeyboardSoundPack } from './KeyboardSoundPack.js';

// Re-export archive modules for backward compatibility
export { JuicySounds } from '../archive/JuicySounds.ts';
export { SoundPack } from '../archive/SoundPack.ts';

// Default export for simple usage
import { TypeWriter } from './TypeWriter.js';
export default TypeWriter;