# Phase 51: Core Fusion & Guardian Layer (Ikuku Standard)

## Overview

Phase 51 introduces a **central manifest and guardian layer** that serves as the single source of truth for all WellnessCafe OS modules, versions, capabilities, and standards. This layer ensures consistency, enforces trauma-informed rules, and maintains the Ikuku luxury standard across the entire platform.

## Architecture

### Core Files

1. **`src/core/wcOsManifest.ts`**
   - TypeScript type definitions for all system modules
   - Central manifest constant with current configuration
   - Defines versions, capabilities, and standards

2. **`src/core/WcOsProvider.tsx`**
   - React context provider that wraps the application
   - Exposes manifest and runtime flags
   - Supports manifest overrides for testing/feature flags

3. **`src/hooks/useWcOs.ts`**
   - Convenient hook to access the WcOs context
   - Throws helpful error if used outside provider

## Integration

The `WcOsProvider` is integrated into the app root (`src/main.jsx`):

```tsx
<WcOsProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</WcOsProvider>
```

## Usage Examples

### Basic Usage

```tsx
import { useWcOs } from '@/hooks/useWcOs';

const MyComponent = () => {
  const { manifest, isLuxuryEnabled, isTraumaInformedStrict } = useWcOs();

  // Check if module is enabled
  if (!manifest.livingGuide.enabled) {
    return null;
  }

  // Use luxury palette
  const goldColor = manifest.ikukuLuxury.palette.gold;

  // Check trauma-informed rules
  if (manifest.traumaInformed.showGroundingOptionsInAllFlows) {
    // Show grounding options
  }

  return <div>Component content</div>;
};
```

### Living Guide Integration

```tsx
import { useWcOs } from '@/hooks/useWcOs';

const LivingGuideHeader = () => {
  const { manifest } = useWcOs();

  if (!manifest.livingGuide.enabled) return null;

  return (
    <header>
      {manifest.livingGuide.hasLiveSessionHeader && (
        <LiveSessionIndicator />
      )}
    </header>
  );
};
```

### Ritual Engine Integration

```tsx
import { useWcOs } from '@/hooks/useWcOs';

const RitualSequence = () => {
  const { manifest } = useWcOs();

  const defaultIntensity = manifest.ritualEngine.defaultIntensity;
  const supportsMultiPath = manifest.ritualEngine.supportsMultiPathSequences;

  // Use manifest settings to configure ritual
  return <RitualPlayer intensity={defaultIntensity} />;
};
```

### Trauma-Informed Safety

```tsx
import { useWcOs } from '@/hooks/useWcOs';

const SafetyCheck = () => {
  const { manifest, isTraumaInformedStrict } = useWcOs();

  // Always show grounding if required
  if (manifest.traumaInformed.showGroundingOptionsInAllFlows) {
    return <GroundingOptionsPanel />;
  }

  return null;
};
```

### Luxury UI Styling

```tsx
import { useWcOs } from '@/hooks/useWcOs';

const LuxuryCard = () => {
  const { manifest, isLuxuryEnabled } = useWcOs();

  if (!isLuxuryEnabled) {
    return <StandardCard />;
  }

  const { palette } = manifest.ikukuLuxury;
  const useGlass = manifest.ikukuLuxury.useGlassmorphism;

  return (
    <div
      style={{
        background: useGlass
          ? `linear-gradient(135deg, ${palette.ink}88, ${palette.ink}CC)`
          : palette.ink,
        border: `1px solid ${palette.gold}30`,
        backdropFilter: useGlass ? 'blur(20px)' : 'none',
      }}
    >
      <h2 style={{ color: palette.gold }}>Luxury Content</h2>
    </div>
  );
};
```

## Manifest Structure

### Phases
- `phases.min`: Minimum phase number (1)
- `phases.max`: Maximum phase number (50)
- `phases.currentPhase`: Current phase (51)

### Living Guide (v2)
- `enabled`: Whether Living Guide is active
- `hasLiveSessionHeader`: Show live session indicators
- `usesEmotionalTelemetry`: Integrate with emotional telemetry

### Ritual Engine (v3)
- `enabled`: Whether Ritual Engine is active
- `defaultIntensity`: Default intensity level ('low' | 'medium' | 'high')
- `supportsMultiPathSequences`: Multi-path sequence support
- `traumaSafePacing`: Trauma-informed pacing enabled

### Cinematic Tools (v4)
- `enabled`: Whether Cinematic Tools are active
- `panoramicHeroEnabled`: Panoramic hero sections
- `ambientSoundscapesEnabled`: Ambient audio support

### Intelligent Content (v5)
- `enabled`: Whether Intelligent Content Engine is active
- `traumaInformedCopy`: Trauma-informed micro-copy
- `shameSafeLanguage`: Shame-safe language enforcement
- `adaptiveScripts`: Adaptive script generation

### Trauma-Informed Rules
- `polyvagalPacing`: Polyvagal-informed pacing
- `showGroundingOptionsInAllFlows`: Always show grounding
- `neverBlameUserInCopy`: Never blame user in messages
- `deescalationPatternsEnabled`: De-escalation patterns active

### Ikuku Luxury Standard
- `enabled`: Whether luxury standard is active
- `palette`: Color palette (gold, sand, ink, accent)
- `useGlassmorphism`: Glassmorphism effects
- `cinematicSpacing`: Cinematic spacing standards

## Runtime Flags

The `useWcOs()` hook provides convenient flags:

- `isLuxuryEnabled`: Quick check if luxury standard is enabled
- `isTraumaInformedStrict`: Check if all trauma-informed rules are active

## Testing & Overrides

You can override the manifest for testing:

```tsx
<WcOsProvider
  manifestOverride={{
    livingGuide: {
      enabled: false, // Disable for testing
    },
    ikukuLuxury: {
      enabled: false, // Test standard UI
    },
  }}
>
  <App />
</WcOsProvider>
```

## Best Practices

1. **Always check `enabled` flags** before rendering module-specific UI
2. **Use manifest palette** for consistent luxury styling
3. **Respect trauma-informed rules** - never bypass safety checks
4. **Use runtime flags** (`isLuxuryEnabled`, `isTraumaInformedStrict`) for quick checks
5. **Keep manifest as source of truth** - don't duplicate configuration

## Migration Notes

- Existing components can gradually adopt `useWcOs()` hook
- No breaking changes - all existing code continues to work
- New components should use the manifest system from the start

## Future Phases

The manifest system will expand to include:
- Feature flags for experimental features
- A/B testing configurations
- Environment-specific overrides
- User preference integration

---

**Phase 51 Complete** ✅
- Core Fusion & Guardian Layer implemented
- TypeScript support added
- Manifest system integrated
- Documentation complete

