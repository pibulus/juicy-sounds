# Juicy Sounds Integration Guide 🎵

A complete guide to integrating Juicy Sounds into your web application for delightful audio feedback.

## Quick Start

```typescript
import { playSound } from 'juicy-sounds/soundMapping'

// Add sounds to any interaction
<button onClick={() => playSound.primaryClick()}>
  Click Me
</button>
```

## Integration Points Checklist

### 1. **Buttons** 
```typescript
// Primary action buttons (submit, create, export)
onClick={() => playSound.primaryClick()}
onMouseEnter={() => playSound.hover()}

// Secondary buttons (cancel, close, reset)
onClick={() => playSound.secondaryClick()}

// Selection buttons (options, themes)
onClick={() => playSound.selectionSelect()}
```

### 2. **Toggles & Switches**
```typescript
// IMPORTANT: Check state to play correct sound
onClick={() => {
  const newState = !isEnabled;
  playSound[newState ? 'toggleOn' : 'toggleOff']();
  setEnabled(newState);
}}
```

### 3. **Panels & Accordions**
```typescript
// Collapsible panels
onClick={() => {
  const isExpanding = !isExpanded;
  playSound[isExpanding ? 'panelExpand' : 'panelCollapse']();
  setExpanded(isExpanding);
}}
```

### 4. **Sliders & Ranges**
```typescript
// Continuous feedback
onInput={() => playSound.sliderStep()}
onChange={() => playSound.sliderRelease()}
```

### 5. **Feedback & Notifications**
```typescript
// After async operations
try {
  await saveData();
  playSound.feedbackSuccess();
} catch (error) {
  playSound.feedbackError();
}
```

### 6. **Color Pickers**
```typescript
// Color selection
onColorSelect={() => playSound.colorSelect()}
onSwatchHover={() => playSound.hover()}
```

## Common Patterns

### Toggle State Handling
```typescript
import { playToggleSound } from 'juicy-sounds/soundMapping'

// Automatic toggle sound based on state
onClick={() => {
  const newState = !currentState;
  playToggleSound(newState);
  setState(newState);
}}
```

### Selection Pattern
```typescript
import { playSelectionSound } from 'juicy-sounds/soundMapping'

// Play appropriate sound for selection/deselection
onClick={() => {
  playSelectionSound(isSelected);
  setSelected(!isSelected);
}}
```

### Panel Pattern
```typescript
import { playPanelSound } from 'juicy-sounds/soundMapping'

// Handle panel expand/collapse
onClick={() => {
  playPanelSound(isExpanded);
  setExpanded(!isExpanded);
}}
```

## Available Sounds Reference

### Primary Interactions
- `playSound.primaryClick()` - Heavy click for main actions
- `playSound.primaryHover()` - Hover feedback

### Secondary Interactions  
- `playSound.secondaryClick()` - Medium click
- `playSound.secondaryHover()` - Hover feedback

### Selection
- `playSound.selectionSelect()` - Item selected
- `playSound.selectionDeselect()` - Item deselected

### Toggles
- `playSound.toggleOn()` - Switch turned on
- `playSound.toggleOff()` - Switch turned off

### Panels
- `playSound.panelExpand()` - Panel opening
- `playSound.panelCollapse()` - Panel closing

### Sliders
- `playSound.sliderStep()` - Slider movement
- `playSound.sliderRelease()` - Slider release

### Colors
- `playSound.colorSelect()` - Color picked

### Export/Actions
- `playSound.exportCopy()` - Copy to clipboard
- `playSound.exportSave()` - Save/download
- `playSound.exportExport()` - Export complete
- `playSound.exportShare()` - Share link

### Feedback
- `playSound.feedbackSuccess()` - Success
- `playSound.feedbackError()` - Error
- `playSound.feedbackWarning()` - Warning
- `playSound.feedbackCompletion()` - Task done
- `playSound.feedbackCelebration()` - Achievement

### Special
- `playSound.specialDiceRoll()` - Random/surprise
- `playSound.specialMagic()` - Magic effects
- `playSound.specialUnlock()` - Feature unlock
- `playSound.specialAchievement()` - Achievement earned

## Testing Your Integration

### Browser Console Testing
```javascript
// Test all sounds
testJuicySounds()

// Test individual sound
juicySounds.playSound.primaryClick()

// List all available sounds
juicySounds.listAvailableSounds()

// Get sound categories info
juicySounds.getSoundCategories()
```

### Volume Guidelines
- Hover: 5% volume (very subtle)
- Clicks: 15% volume (noticeable but not jarring)
- Success/Error: 30-40% volume (important feedback)
- Celebrations: 40-50% volume (special moments)

## File Structure

```
/sounds/
  ├── [custom sounds].mp3      # Custom sounds
  └── kenney/                   # Kenney UI Audio pack
      ├── original/*.mp3        # Original sounds
      └── variations/*.mp3      # High/low pitch variants
```

## Performance Tips

1. **Sounds are lazy-loaded** - First play might have slight delay
2. **Autoplay policies** - Sounds only work after user interaction
3. **Mobile considerations** - Test on actual devices for haptic feedback

## Sound Themes

Switch between different sound packs:

```typescript
import { SOUND_THEMES } from 'juicy-sounds/soundConfig'

// Available themes: default, playful, minimal, retro
setSoundTheme('playful');
```

## Framework Examples

### React
```jsx
function Button({ onClick, children }) {
  return (
    <button 
      onClick={() => {
        playSound.primaryClick();
        onClick?.();
      }}
      onMouseEnter={() => playSound.hover()}
    >
      {children}
    </button>
  );
}
```

### Vue
```vue
<template>
  <button 
    @click="handleClick"
    @mouseenter="playSound.hover()"
  >
    Click Me
  </button>
</template>

<script>
import { playSound } from 'juicy-sounds/soundMapping'

export default {
  methods: {
    handleClick() {
      playSound.primaryClick();
      // Your logic here
    }
  }
}
</script>
```

### Svelte
```svelte
<script>
  import { playSound } from 'juicy-sounds/soundMapping'
  
  function handleClick() {
    playSound.primaryClick();
    // Your logic here
  }
</script>

<button 
  on:click={handleClick}
  on:mouseenter={() => playSound.hover()}
>
  Click Me
</button>
```

## Troubleshooting

### No sound playing?
1. Check browser console for errors
2. Ensure user has interacted with page (autoplay policy)
3. Verify sound files are being served correctly
4. Check if sounds are enabled: `soundService.isSoundEnabled()`

### Wrong sounds playing?
1. Check you're using state-aware patterns for toggles
2. Verify sound file paths in `soundConfig.ts`
3. Test with `juicySounds.playSound.[soundName]()` in console

### Performance issues?
1. Sounds are cached after first play
2. Consider reducing volume for frequently-triggered sounds
3. Disable sounds on low-end devices if needed

## Contributing

Found a bug or want to add sounds? Check our [GitHub repo](https://github.com/pibulus/juicy-sounds)!

---

*Made with 🎵 by the Juicy Sounds team*