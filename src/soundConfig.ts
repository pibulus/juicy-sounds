/**
 * Universal Sound Configuration System
 *
 * Portable, modular sound system that can be easily transferred between apps.
 * All sound mappings, categories, and file assignments are centralized here.
 *
 * @author Juicy Sounds Team
 * @version 2.0.0 - Fixed with real sound files
 */

// ===================================================================
// SOUND FILE LIBRARY - Uses actual files from /sounds directory
// ===================================================================

/**
 * Sound file library configuration
 * 
 * Maps to actual sound files included in the package.
 * All paths are relative to the /sounds directory.
 */
export const SOUND_LIBRARY = {
  // INTERACTION SOUNDS - User interface feedback
  interactions: {
    hover: "scroll-haptic", // Gentle hover feedback  
    clickLight: "kenney/variations/click_001", // Light button clicks
    clickMedium: "kenney/variations/click_001_high", // Medium emphasis clicks
    clickHeavy: "echo-button", // Important action clicks
    toggleOn: "pop-on", // Switch/toggle activation
    toggleOff: "pop-off", // Switch/toggle deactivation
  },

  // NAVIGATION SOUNDS - Panel and section changes
  navigation: {
    panelOpen: "kenney/variations/maximize_001", // Opening panels/sections
    panelClose: "kenney/variations/minimize_001", // Closing panels/sections
    tabSwitch: "kenney/variations/switch_001", // Switching between tabs
    pageTransition: "kenney/variations/open_001", // Major page changes
  },

  // SELECTION SOUNDS - Choosing options and values
  selection: {
    colorPick: "paste-drop", // Color selection
    shapeSelect: "kenney/variations/select_001", // Shape/option selection
    themeChange: "kenney/variations/confirmation_001", // Theme switching
    presetSelect: "kenney/variations/select_001_high", // Preset selection
  },

  // CONTROL SOUNDS - Sliders and input controls
  controls: {
    sliderStep: "kenney/variations/tick_001", // Slider movement steps
    sliderRelease: "grab-pop", // Slider release
    inputFocus: "kenney/variations/open_001", // Input field focus
    inputBlur: "kenney/variations/close_001", // Input field blur
  },

  // FEEDBACK SOUNDS - Success, error, completion
  feedback: {
    success: "download", // Successful actions
    error: "sweet-error", // Error states
    warning: "error-banjo", // Warning states
    completion: "computer-ready", // Task completion
    celebration: "KidsCheer", // Special celebrations
  },

  // EXPORT SOUNDS - Copy, save, export actions
  export: {
    copy: "download", // Clipboard copy
    save: "kenney/variations/confirmation_001", // Save operations
    export: "computer-ready", // Export operations
    share: "kenney/variations/glass_001", // Share operations
  },

  // SPECIAL SOUNDS - App-specific unique actions
  special: {
    diceRoll: "grab-pop", // Random/surprise actions
    magic: "kenney/variations/bong_001", // Special effects
    unlock: "kenney/variations/glass_001_high", // Feature unlocks
    achievement: "KidsCheer", // Achievements
    ambient: "thinking-ambient", // Background/loading
    undo: "undo", // Undo actions
  },
};

// ===================================================================
// SOUND CATEGORIES - Logical groupings for different UI elements
// ===================================================================

/**
 * Sound category mappings
 * 
 * Maps UI element types to appropriate sounds from the library.
 * Easy to reassign entire categories to different sounds.
 */
export const SOUND_CATEGORIES = {
  // PRIMARY ACTION BUTTONS - Main call-to-action buttons
  primaryButtons: {
    click: () => SOUND_LIBRARY.interactions.clickHeavy,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Main action buttons (submit, create, export)",
  },

  // SECONDARY BUTTONS - Supporting action buttons
  secondaryButtons: {
    click: () => SOUND_LIBRARY.interactions.clickMedium,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Secondary actions (cancel, reset, clear)",
  },

  // SELECTION BUTTONS - Option selection buttons
  selectionButtons: {
    select: () => SOUND_LIBRARY.selection.shapeSelect,
    deselect: () => SOUND_LIBRARY.interactions.clickLight,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Shape, theme, effect selection buttons",
  },

  // TOGGLE CONTROLS - Switches, checkboxes, radio buttons
  toggleControls: {
    on: () => SOUND_LIBRARY.interactions.toggleOn,
    off: () => SOUND_LIBRARY.interactions.toggleOff,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Switches, checkboxes, toggle buttons",
  },

  // PANEL CONTROLS - Collapsible sections and navigation
  panelControls: {
    expand: () => SOUND_LIBRARY.navigation.panelOpen,
    collapse: () => SOUND_LIBRARY.navigation.panelClose,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Collapsible panels, accordions, tabs",
  },

  // SLIDER CONTROLS - Range inputs and continuous controls
  sliderControls: {
    step: () => SOUND_LIBRARY.controls.sliderStep,
    release: () => SOUND_LIBRARY.controls.sliderRelease,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Sliders, range inputs, continuous controls",
  },

  // COLOR CONTROLS - Color picker interactions
  colorControls: {
    select: () => SOUND_LIBRARY.selection.colorPick,
    hover: () => SOUND_LIBRARY.interactions.hover,
    description: "Color pickers, palette interactions",
  },

  // EXPORT ACTIONS - Copy, save, export operations
  exportActions: {
    copy: () => SOUND_LIBRARY.export.copy,
    save: () => SOUND_LIBRARY.export.save,
    export: () => SOUND_LIBRARY.export.export,
    share: () => SOUND_LIBRARY.export.share,
    description: "Export, copy, save operations",
  },

  // FEEDBACK - User notifications and confirmations
  feedbackSounds: {
    success: () => SOUND_LIBRARY.feedback.success,
    error: () => SOUND_LIBRARY.feedback.error,
    warning: () => SOUND_LIBRARY.feedback.warning,
    completion: () => SOUND_LIBRARY.feedback.completion,
    celebration: () => SOUND_LIBRARY.feedback.celebration,
    description: "Success, error, completion notifications",
  },

  // SPECIAL EFFECTS - Unique interactions
  specialEffects: {
    diceRoll: () => SOUND_LIBRARY.special.diceRoll,
    magic: () => SOUND_LIBRARY.special.magic,
    unlock: () => SOUND_LIBRARY.special.unlock,
    achievement: () => SOUND_LIBRARY.special.achievement,
    ambient: () => SOUND_LIBRARY.special.ambient,
    undo: () => SOUND_LIBRARY.special.undo,
    description: "Special effects and achievements",
  },
};

// ===================================================================
// SOUND MANIFEST - Document what's actually available
// ===================================================================

export const SOUND_MANIFEST = {
  version: "2.0.0",
  totalSounds: 100,
  
  customSounds: [
    "scroll-haptic.mp3",
    "echo-button.mp3",
    "pop-on.mp3",
    "pop-off.mp3",
    "grab-pop.mp3",
    "paste-drop.mp3",
    "download.mp3",
    "sweet-error.mp3",
    "error-banjo.mp3",
    "computer-ready.mp3",
    "KidsCheer.mp3",
    "pop-up-warm.mp3",
    "thinking-ambient.mp3",
    "undo.mp3"
  ],
  
  kenneyPack: {
    categories: [
      "back", "bong", "click", "close", "confirmation",
      "drop", "error", "glass", "glitch", "maximize",
      "minimize", "open", "pluck", "question", "scratch",
      "scroll", "select", "switch", "tick", "toggle"
    ],
    variations: {
      description: "Each sound has normal, high, and low pitch variants",
      pattern: "[sound]_001.mp3, [sound]_001_high.mp3, [sound]_001_low.mp3"
    }
  },

  usage: {
    import: "import { SOUND_LIBRARY, SOUND_CATEGORIES } from './soundConfig.ts'",
    example: "const hoverSound = SOUND_CATEGORIES.primaryButtons.hover()",
    playback: "soundService.playCustomSound(hoverSound)"
  }
};

// ===================================================================
// SOUND THEMES - Support for multiple sound packs
// ===================================================================

export const SOUND_THEMES = {
  default: {
    name: "Juicy Default",
    description: "Balanced mix of playful and professional",
    overrides: {}
  },
  
  playful: {
    name: "Extra Juicy",
    description: "More fun and bouncy sounds",
    overrides: {
      "interactions.clickLight": "kenney/variations/pluck_001",
      "interactions.clickMedium": "kenney/variations/bong_001",
      "feedback.success": "KidsCheer"
    }
  },
  
  minimal: {
    name: "Subtle",
    description: "Quiet, minimal feedback",
    overrides: {
      "interactions.clickLight": "kenney/variations/tick_001",
      "interactions.clickMedium": "kenney/variations/tick_001_high",
      "interactions.hover": "kenney/variations/scroll_001"
    }
  },
  
  retro: {
    name: "8-bit",
    description: "Glitchy, retro game sounds",
    overrides: {
      "interactions.clickLight": "kenney/variations/glitch_001",
      "interactions.clickMedium": "kenney/variations/glitch_001_high",
      "feedback.error": "kenney/variations/error_001"
    }
  }
};

export default {
  SOUND_LIBRARY,
  SOUND_CATEGORIES,
  SOUND_MANIFEST,
  SOUND_THEMES
};