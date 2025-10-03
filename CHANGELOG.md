# Changelog

All notable changes to the Juicy Sounds project will be documented in this file.

## [1.1.0] - 2025-01-18

### Added
- **Performance Optimizations**
  - Added audio buffer caching for multiple sound packs
  - Implemented preloading on hover/focus for faster initial playback
  - Added debouncing for rapid key presses (configurable via `debounceMs`)
  - Proper cleanup of audio sources to prevent memory leaks

- **Mobile & Browser Support**
  - Added automatic audio context resumption for suspended states
  - New `resumeAudioContext()` method for handling autoplay policies
  - Better handling of Chrome/Safari audio restrictions

- **Error Recovery**
  - Implemented retry logic with exponential backoff for network failures
  - Configurable retry attempts via `retryAttempts` option
  - Graceful degradation when audio fails to load

- **Developer Experience**
  - Added comprehensive test suite (`test/SimpleTypeWriter.test.js`)
  - Enhanced debugging with better error messages
  - Improved configuration options documentation

### Enhanced
- **Memory Management**
  - Proper cleanup in `dispose()` method
  - Tracking and cleanup of active audio sources
  - Removal of all event listeners on detach

- **Configuration**
  - New `preloadOnHover` option (default: true)
  - New `cacheBuffers` option (default: true)
  - New `debounceMs` option (default: 10ms)
  - New `retryAttempts` option (default: 3)

### Fixed
- Fixed potential memory leaks from untracked audio sources
- Fixed event listener cleanup on element detachment
- Fixed audio context suspension issues on mobile devices
- Fixed race conditions when loading same pack multiple times

### Technical Details
- Increased code from ~300 to ~400 lines with all enhancements
- Added proper TypeScript/JSDoc annotations
- Improved error handling throughout the codebase
- Better separation of concerns with `_loadPack` internal method

## [1.0.0] - 2025-01-17

### Initial Release
- Real mechanical keyboard sounds (Cherry MX Black)
- Framework agnostic implementation
- Simple API with init(), attach(), and dispose()
- 88+ keys mapped
- Volume control
- Basic error handling
- Debug mode