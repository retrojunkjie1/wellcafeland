# Phase 53: Living Guide V3 — Cinematic + Adaptive Sessions

## Overview

Phase 53 upgrades the Living Guide to **V3**, transforming it into the cinematic front door of the WellnessCafe OS. The new version features adaptive sessions that integrate with the Ritual Engine V3.5, wcOsManifest, and provides a luxury-grade, trauma-informed experience.

## Architecture

### Core Files

1. **`src/apps/living/livingGuideTypes.ts`**
   - Type definitions for emotional states and session state
   - Defines `EmotionalStateTag` and `LivingGuideSessionState`

2. **`src/apps/living/LivingGuideSessionContext.tsx`**
   - React context provider for session state management
   - Manages emotional state, stress levels, and ritual information
   - Provides `useLivingGuideSession()` hook

3. **`src/components/living/LivingGuideHeader.tsx`**
   - Cinematic live-session header
   - Pulsing indicator with luxury gold color
   - Displays emotional state and ritual engine status
   - Integrates with wcOsManifest

4. **`src/components/living/AdaptiveMoodBand.tsx`**
   - Adaptive mood band showing nervous system snapshot
   - Stress and trigger level visualization
   - Grounding shortcut button (trauma-informed)
   - Respects manifest trauma rules

5. **`src/apps/living/LivingGuideShell.tsx`**
   - Main shell component wrapping the entire experience
   - Integrates header, mood band, and ritual calibration
   - Provides "Begin Ritual Calibration" functionality
   - Luxury cinematic layout with glassmorphism

6. **`src/apps/living/LivingGuidePageV3.tsx`**
   - New TypeScript page component using LivingGuideShell
   - Ready for integration into routing

## Integration with Previous Phases

### Phase 51 (wcOsManifest)
- Uses `manifest.livingGuide.enabled` to check availability
- Uses `manifest.ikukuLuxury.palette` for luxury colors
- Respects `manifest.traumaInformed` rules

### Phase 52 (Ritual Engine V3.5)
- Integrates `useRitualEngine()` hook
- Passes emotional state to `startRitual()`
- Receives adaptive decision and sequence
- Updates session state with ritual intensity and path

## Features

### Cinematic Front Door
- **Pulsing Live Header**: Gold pulsing indicator showing session is active
- **Emotional State Display**: Real-time emotional tag display
- **Ritual Engine Status**: Shows current ritual intensity or waiting state
- **Luxury Aesthetic**: Deep black gradients, glassmorphism, cinematic spacing

### Adaptive Sessions
- **Session Context**: Centralized state management for emotional and ritual data
- **Stress/Trigger Tracking**: 0-10 scale visualization
- **Adaptive UI**: Adjusts based on emotional intensity and trauma rules
- **Grounding Shortcuts**: Automatically shown when needed (trauma-informed)

### Trauma-Informed Design
- **Polyvagal-Aware**: Respects nervous system states
- **Grounding Always Available**: Shortcut button when stress ≥ 7 or panic/freeze
- **No Pressure**: Gentle, non-forcing language
- **Safety First**: Automatic de-escalation patterns

### Luxury Experience
- **Ikuku Standard**: Uses manifest luxury palette (gold, sand, ink)
- **Glassmorphism**: Backdrop blur effects throughout
- **Cinematic Spacing**: Generous padding and layout
- **Smooth Transitions**: All interactions feel premium

## Usage Examples

### Basic Integration

```tsx
import { LivingGuideShell } from '@/apps/living/LivingGuideShell';

const MyPage = () => {
  return (
    <LivingGuideShell>
      <p>Your custom content here</p>
    </LivingGuideShell>
  );
};
```

### Using Session Context

```tsx
import { useLivingGuideSession } from '@/apps/living/LivingGuideSessionContext';

const MyComponent = () => {
  const { state, setStress, setEmotionalTag } = useLivingGuideSession();

  const handleStressUpdate = (value: number) => {
    setStress(value);
    // UI automatically adapts
  };

  return (
    <div>
      <p>Current stress: {state.stress}/10</p>
      <p>Emotional state: {state.emotionalTag}</p>
      <button onClick={() => setEmotionalTag('anxious')}>
        Set to Anxious
      </button>
    </div>
  );
};
```

### Ritual Integration

The shell automatically handles ritual calibration:

```tsx
// Inside LivingGuideShell, when "Begin Ritual Calibration" is clicked:
const result = startRitual({
  stress: state.stress,
  trigger: state.trigger,
  freeze: state.freeze,
  panic: state.panic,
  shame: state.shame,
});

// Result includes:
// - decision.intensity (low/medium/high)
// - decision.nextPath (protocol name)
// - decision.cinematicMode (soft/deep/immersive)
// - decision.requiresGrounding (boolean)
// - sequence (array of steps with timing)
```

## Emotional State Tags

Six emotional state tags are available:

- **steady**: Baseline, regulated state
- **anxious**: Elevated anxiety, some activation
- **overwhelmed**: High activation, approaching overwhelm
- **numb**: Dissociation, freeze state
- **shame**: Shame spiral active
- **grieving**: Grief surge active

## Session State Structure

```typescript
interface LivingGuideSessionState {
  emotionalTag: EmotionalStateTag;
  stress: number;   // 0–10
  trigger: number;  // 0–10
  freeze: boolean;
  panic: boolean;
  shame: boolean;
  grieving: boolean;
  currentRitualIntensity?: RitualIntensity;
  activeSequenceKey?: string;
}
```

## Adaptive Behavior

### Stress Level Labels
- **0-3**: "Steady"
- **4-6**: "Elevated"
- **7-10**: "High Load"

### Grounding Shortcut Display
The grounding shortcut button appears when:
- `manifest.traumaInformed.showGroundingOptionsInAllFlows` is true, OR
- Stress level ≥ 7, OR
- Freeze state is active, OR
- Panic state is active

### Ritual Calibration
When "Begin Ritual Calibration" is clicked:
1. Current session state is passed to `useRitualEngine()`
2. Adaptive decision is computed
3. Session state is updated with intensity and sequence key
4. UI reflects the new ritual state
5. (Future: Navigate to ritual player)

## Styling

### Color Palette (from wcOsManifest)
- **Gold**: `#F5C26B` - Pulsing indicator, accents
- **Sand**: `#E4D4BD` - Secondary text
- **Ink**: `#050609` - Deep background
- **Accent**: `#B88946` - Additional accents

### Layout
- **Max Width**: `max-w-5xl` (1280px)
- **Padding**: Responsive (px-4 on mobile, larger on desktop)
- **Spacing**: Generous gaps (gap-4, gap-6)
- **Border Radius**: `rounded-3xl` for major sections

### Effects
- **Backdrop Blur**: `backdrop-blur-md` on headers and cards
- **Glassmorphism**: `bg-white/5` with `border-white/10`
- **Shadows**: `shadow-xl shadow-black/50` for depth
- **Transitions**: `transition-colors` on interactive elements

## Migration Notes

### From Living Guide V2
- Old `LivingGuidePage.jsx` still exists for backward compatibility
- New `LivingGuidePageV3.tsx` uses the new shell system
- Can gradually migrate routes to use V3

### Integration Steps
1. Ensure `WcOsProvider` wraps app root (Phase 51)
2. Import `LivingGuideShell` in your page component
3. Wrap page content with `LivingGuideShell`
4. Use `useLivingGuideSession()` to access/manage state
5. Ritual integration happens automatically via shell

## Best Practices

1. **Always check manifest**: Use `useWcOs()` to verify Living Guide is enabled
2. **Respect trauma rules**: Never bypass grounding shortcuts
3. **Update state gradually**: Don't make sudden emotional state changes
4. **Use luxury palette**: Pull colors from manifest, not hardcoded values
5. **Maintain cinematic feel**: Keep spacing generous, effects subtle

## Future Enhancements

Potential Phase 54+ additions:

- Real-time emotional telemetry integration
- Animated transitions between states
- Personalized greeting messages
- Session history and progress tracking
- Advanced ritual player integration
- Multi-session ritual sequences

---

**Phase 53 Complete** ✅
- Living Guide V3 implemented
- Cinematic header with pulsing indicator
- Adaptive mood band with grounding shortcuts
- Session context for state management
- Full Ritual Engine V3.5 integration
- Luxury Ikuku standard maintained
- Trauma-informed safety preserved

