/**
 * Universal Sound Mapping System
 *
 * Portable sound system that uses the centralized sound configuration.
 * This file connects the universal sound config to actual sound playback.
 * Easy to transfer between apps by copying this + soundConfig.ts
 *
 * @example
 * // Use in any component:
 * import { playSound } from './soundMapping.ts'
 * onClick={() => playSound.primaryClick()}
 * onMouseEnter={() => playSound.hover()}
 *
 * @author Juicy Sounds Team
 * @version 2.0.0 - Simplified universal system
 */

import { SOUND_CATEGORIES } from "./soundConfig.ts";
import { soundService } from "./soundService.ts";

/**
 * Dynamic Sound Mapping - Connects config to actual playback
 *
 * Automatically maps sound categories from config to soundService functions.
 * No need to manually maintain mappings - they're generated from the config!
 */
function createSoundMapping() {
  const mapping: Record<string, any> = {};

  // Map each category from config to actual sound functions  
  for (const [categoryName, categoryConfig] of Object.entries(SOUND_CATEGORIES)) {
    mapping[categoryName] = {};

    // For each action in the category, create the actual function call
    for (const [actionName, soundGetter] of Object.entries(categoryConfig)) {
      if (typeof soundGetter === "function" && actionName !== "description") {
        mapping[categoryName][actionName] = () => {
          // Get the sound file path from config
          const soundFile = soundGetter();
          
          // Play the sound file directly using soundService
          return soundService.playCustomSound(soundFile)?.catch(() => {});
        };
      }
    }
  }

  return mapping;
}

export const SOUND_MAPPING = createSoundMapping();

/**
 * Universal Sound Interface for Components
 *
 * Clean, consistent API auto-generated from sound categories.
 * Easy to extend - just add new categories to soundConfig.ts!
 *
 * @example
 * import { playSound } from './soundMapping.ts'
 * onClick={() => playSound.primaryClick()}
 * onMouseEnter={() => playSound.hover()}
 */
function createPlaySoundInterface() {
  const playSound: Record<string, any> = {};

  // Generate functions for each category and action
  for (const [categoryName, categoryConfig] of Object.entries(SOUND_MAPPING)) {
    if (typeof categoryConfig === "object") {
      for (const [actionName, actionFunction] of Object.entries(categoryConfig)) {
        if (typeof actionFunction === "function") {
          // Create camelCase function names: primaryButtons.click -> primaryClick
          const functionName = 
            categoryName.replace("Controls", "").replace("Buttons", "").replace("Actions", "").replace("Sounds", "") +
            actionName.charAt(0).toUpperCase() + actionName.slice(1);
          playSound[functionName] = actionFunction;
        }
      }
    }
  }

  // Add universal hover function (most commonly used)
  playSound.hover = () => soundService.playCustomSound("scroll-haptic")?.catch(() => {});

  return playSound;
}

export const playSound = createPlaySoundInterface();

// ===================================================================
// SOUND AUDIT HELPERS - For systematic sound application
// ===================================================================

// Development helper - list all available sound functions
export function listAvailableSounds() {
  console.group("🎵 Available Sound Functions:");
  Object.keys(playSound).sort().forEach((soundName) => {
    console.log(`playSound.${soundName}()`);
  });
  console.groupEnd();
}

// Get sound category info for documentation
export function getSoundCategories() {
  return Object.entries(SOUND_CATEGORIES).map(([name, config]) => ({
    name,
    description: (config as any).description || "No description",
    actions: Object.keys(config).filter((k) => k !== "description"),
  }));
}

// ===================================================================
// INTEGRATION HELPERS - Common patterns for sound implementation
// ===================================================================

/**
 * Toggle sound helper - plays appropriate sound based on state
 * @example
 * onClick={() => {
 *   const newState = !currentState;
 *   playToggleSound(newState);
 *   setState(newState);
 * }}
 */
export function playToggleSound(isOn: boolean) {
  return isOn ? playSound.toggleOn() : playSound.toggleOff();
}

/**
 * Selection sound helper - plays sound based on selection state
 * @example
 * onClick={() => {
 *   playSelectionSound(isSelected);
 *   setSelected(!isSelected);
 * }}
 */
export function playSelectionSound(isSelected: boolean) {
  return isSelected ? playSound.selectionDeselect() : playSound.selectionSelect();
}

/**
 * Panel sound helper - plays sound based on expanded state
 * @example
 * onClick={() => {
 *   playPanelSound(isExpanded);
 *   setExpanded(!isExpanded);
 * }}
 */
export function playPanelSound(isExpanded: boolean) {
  return isExpanded ? playSound.panelCollapse() : playSound.panelExpand();
}

// ===================================================================
// BROWSER TEST UTILITIES
// ===================================================================

// Test all sounds function for browser console
export async function testAllSounds() {
  console.group("🎵 Testing Juicy Sounds System");
  
  // List all available sound functions
  console.log("\n📋 Available sound functions:");
  listAvailableSounds();
  
  // Test each sound with delay
  const sounds = Object.keys(playSound);
  for (const soundName of sounds) {
    try {
      console.log(`  Playing ${soundName}...`);
      await playSound[soundName]?.();
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between sounds
    } catch (error) {
      console.error(`  ❌ Failed to play ${soundName}:`, error);
    }
  }
  
  console.groupEnd();
}

// Auto-inject test function in browser environment
if (typeof window !== "undefined") {
  (window as any).testJuicySounds = testAllSounds;
  (window as any).juicySounds = {
    playSound,
    listAvailableSounds,
    getSoundCategories,
    testAll: testAllSounds
  };
  console.log("✨ Juicy Sounds Ready!");
  console.log("Run 'testJuicySounds()' in console to test all sounds");
  console.log("Use 'juicySounds.playSound.primaryClick()' to play individual sounds");
}

export default playSound;