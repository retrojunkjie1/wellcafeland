# Phase 52: Ritual Engine V3.5 — Trauma-Adaptive Upgrade

## Overview

Phase 52 extends the Ritual Engine from V3 to **V3.5**, introducing a clinically-informed, trauma-adaptive ritual system that dynamically adjusts based on user emotional state, integrates with the wcOsManifest, and provides luxury-grade cinematic experiences.

## Architecture

### Core Files

1. **`src/engines/ritual/ritualEngineConfig.ts`**
   - Configuration interface and defaults
   - Integrates with wcOsManifest
   - Defines intensity levels, pacing rules, and trauma-adaptive settings

2. **`src/engines/ritual/ritualAdaptiveLogic.ts`**
   - Adaptive decision engine
   - Evaluates user emotional state
   - Selects appropriate ritual paths
   - Applies cinematic hooks and trauma guardrails

3. **`src/engines/ritual/ritualSequences.ts`**
   - Complete sequence definitions
   - Four protocol types: standard, orienting, anchoring, self-compassion
   - Trauma-informed step-by-step instructions

4. **`src/hooks/useRitualEngine.ts`**
   - React hook interface
   - Provides `startRitual()` function
   - Returns adaptive decision and sequence

## Integration with Phase 51

The Ritual Engine V3.5 fully integrates with the wcOsManifest:

- Uses `wcOsManifest.ritualEngine.defaultIntensity` for configuration
- Respects `wcOsManifest.cinematicTools.enabled` for cinematic mode
- Applies `wcOsManifest.traumaInformed.deescalationPatternsEnabled` for guardrails
- Updated manifest version to `v3.5`

## User Emotional State

The system evaluates five key emotional indicators:

```typescript
interface UserEmotionalState {
  stress: number;      // 0–10 scale
  trigger: number;     // 0–10 scale
  freeze: boolean;     // Freeze/dissociation state
  panic: boolean;      // Panic/anxiety spike
  shame: boolean;      // Shame spiral active
}
```

## Adaptive Decision Logic

### Intensity Evaluation

The system automatically selects intensity based on user state:

- **Low Intensity**: Panic or freeze states
- **Medium Intensity**: High stress (>7) or shame states
- **High Intensity**: Stable states

### Path Selection

Four adaptive paths are available:

1. **standardSequence**: General use, 5-step nervous system protocol
2. **orientingProtocol**: For freeze states - sensory reconnection
3. **anchoringProtocol**: For panic states - immediate physical anchoring
4. **selfCompassionProtocol**: For shame states - warmth and compassion

### Cinematic Mode

Three cinematic modes based on intensity and system capabilities:

- **soft**: Low intensity or cinematic tools disabled
- **deep**: Medium intensity with cinematic tools enabled
- **immersive**: High intensity with full cinematic experience

### Trauma Guardrails

Automatic grounding intervention triggers:

- Always triggered for panic or freeze states
- Respects `wcOsManifest.traumaInformed.deescalationPatternsEnabled`
- Provides safety net for distressed users

## Usage Examples

### Basic Usage

```tsx
import { useRitualEngine } from '@/hooks/useRitualEngine';

const RitualComponent = () => {
  const { startRitual } = useRitualEngine();

  const handleStart = () => {
    const result = startRitual({
      stress: 8,
      trigger: 6,
      freeze: false,
      panic: false,
      shame: true,
    });

    if (result) {
      console.log('Intensity:', result.decision.intensity);
      console.log('Path:', result.decision.nextPath);
      console.log('Cinematic Mode:', result.decision.cinematicMode);
      console.log('Requires Grounding:', result.decision.requiresGrounding);
      console.log('Sequence Steps:', result.sequence);
    }
  };

  return <button onClick={handleStart}>Start Ritual</button>;
};
```

### Integration with Living Guide

```tsx
import { useRitualEngine } from '@/hooks/useRitualEngine';
import { useWcOs } from '@/hooks/useWcOs';

const LivingGuideRitualTrigger = ({ emotionalState }) => {
  const { startRitual } = useRitualEngine();
  const { manifest } = useWcOs();

  if (!manifest.ritualEngine.enabled) {
    return <div>Ritual Engine unavailable</div>;
  }

  const result = startRitual(emotionalState);

  if (result?.decision.requiresGrounding) {
    return <GroundingInterventionPanel />;
  }

  return <RitualPlayer sequence={result.sequence} mode={result.decision.cinematicMode} />;
};
```

### Trauma-Adaptive Example

```tsx
const AdaptiveRitualFlow = () => {
  const { startRitual } = useRitualEngine();
  const [userState, setUserState] = useState({
    stress: 5,
    trigger: 3,
    freeze: false,
    panic: false,
    shame: false,
  });

  // When user enters panic state
  useEffect(() => {
    if (userState.panic) {
      const result = startRitual(userState);
      // System automatically selects 'anchoringProtocol' with 'low' intensity
      // and triggers grounding intervention
    }
  }, [userState.panic]);

  return <RitualInterface />;
};
```

## Sequence Definitions

### Standard Sequence
- **Duration**: ~32 seconds
- **Steps**: Pause → Breathe → Body Scan → Release
- **Use Case**: General stabilization and regulation

### Orienting Protocol
- **Duration**: ~22 seconds
- **Steps**: Look Around → Name Objects → Feel Ground
- **Use Case**: Freeze/dissociation states
- **Trauma-Informed**: Gentle, sensory-based, non-overwhelming

### Anchoring Protocol
- **Duration**: ~22 seconds
- **Steps**: Hand on Chest → Slow Exhale → Count Breaths
- **Use Case**: Panic/anxiety spikes
- **Trauma-Informed**: Simple, repetitive, body-focused

### Self-Compassion Protocol
- **Duration**: ~22 seconds
- **Steps**: Gentle Statement → Warm Breath → Soften Shame
- **Use Case**: Shame spirals
- **Trauma-Informed**: Non-judgmental, gentle, self-validating

## Configuration

### Ritual Engine Config

```typescript
{
  version: 'v3.5',
  defaultIntensity: 'medium', // From wcOsManifest
  pacing: {
    baseDurationMs: 30000,
    allowSlowdown: true,
    allowIntensify: true,
  },
  trauma: {
    enableDownshift: true,
    enableDeescalationFallback: true,
    enableGroundingInterrupt: true,
  },
}
```

## Best Practices

1. **Always check emotional state** before starting rituals
2. **Respect trauma guardrails** - never bypass safety checks
3. **Use adaptive paths** - let the system select the appropriate protocol
4. **Integrate with cinematic tools** - enhance experience when available
5. **Monitor user state** - update emotional state in real-time for adaptive adjustments

## Clinical Considerations

### Trauma-Informed Design

- **Polyvagal-informed**: Respects nervous system states
- **Non-overwhelming**: Never forces intensity beyond user capacity
- **Safety-first**: Always provides grounding options
- **De-escalation**: Automatic intervention for distress

### Luxury Experience

- **Cinematic integration**: Seamless visual and audio experience
- **Ikuku standard**: Maintains luxury feel throughout
- **Adaptive pacing**: Adjusts to user needs without feeling mechanical

## Migration Notes

- Existing Ritual Engine V3 code continues to work
- New components should use `useRitualEngine()` hook
- Manifest updated to reflect V3.5 version
- No breaking changes to existing ritual sequences

## Future Enhancements

Potential Phase 53+ additions:

- Real-time emotional telemetry integration
- Machine learning for pattern recognition
- Personalized sequence recommendations
- Multi-session ritual progress tracking
- Advanced cinematic scene selection

---

**Phase 52 Complete** ✅
- Ritual Engine V3.5 implemented
- Trauma-adaptive logic integrated
- Cinematic hooks applied
- Trauma guardrails enforced
- Full wcOsManifest integration

