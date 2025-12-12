# Healer Toolkit - Integration Guide

**Phase 57 Ultra** - How to integrate the Healer Toolkit into Living Guide, Overseer, or any component.

---

## 📋 Quick Start

The Healer Toolkit provides trauma-informed interventions based on emotional state and risk level. It requires:
- An `EmotionalSnapshot` (from telemetry)
- A `RiskAssessment` (calculated from snapshot)

---

## 🔧 Integration Example

### **Living Guide Integration**

```tsx
// src/apps/living/LivingGuidePageWithHealer.tsx
// Example integration - not a full file

import React from 'react';
import { useEmotionalTelemetry } from '@/hooks/useEmotionalTelemetry';
import { QuickGroundingButton } from '@/components/healer/QuickGroundingButton';

export const LivingGuideWithHealer: React.FC = () => {
  const { latestSnapshot, risk, submitSnapshot } = useEmotionalTelemetry();

  // In reality, snapshot would be built from a check-in UI
  // Here we just guard for when data exists
  const canOffer = latestSnapshot && risk;

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70">
        When things feel heavy, this section offers options that move at the speed of your nervous system, not at the speed of pressure.
      </p>

      {canOffer && (
        <QuickGroundingButton snapshot={latestSnapshot!} risk={risk!} />
      )}

      {!canOffer && (
        <p className="text-xs text-white/50">
          Once you complete a quick emotional check-in, we&apos;ll suggest one or two gentle support options here.
        </p>
      )}
    </div>
  );
};
```

### **Overseer Console Integration**

```tsx
// src/apps/overseer/OverseerConsoleWithHealer.tsx
// Example integration

import React from 'react';
import { useEmotionalTelemetry } from '@/hooks/useEmotionalTelemetry';
import { HealerPanel } from '@/components/healer/HealerPanel';
import { useHealerToolkit } from '@/hooks/useHealerToolkit';
import type { HealerIntervention } from '@/healer/healerTypes';

export const OverseerConsoleWithHealer: React.FC = () => {
  const { latestSnapshot, risk } = useEmotionalTelemetry();
  const { recommendations, computeRecommendations } = useHealerToolkit();

  React.useEffect(() => {
    if (latestSnapshot && risk) {
      computeRecommendations({ snapshot: latestSnapshot, risk }, 3);
    }
  }, [latestSnapshot, risk, computeRecommendations]);

  const handleBeginIntervention = (intervention: HealerIntervention) => {
    // Navigate to intervention flow or start practice
    console.log('Begin intervention:', intervention.id);
    // Example: navigate(`/tools/${intervention.id}`);
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Supportive Interventions
        </h2>
        {recommendations.length > 0 ? (
          <HealerPanel
            interventions={recommendations}
            onBeginIntervention={handleBeginIntervention}
          />
        ) : (
          <p className="text-sm text-white/60">
            Complete an emotional check-in to see recommended interventions.
          </p>
        )}
      </section>
    </div>
  );
};
```

### **Manual Integration (Custom Component)**

```tsx
// Custom component example

import React from 'react';
import { useHealerToolkit } from '@/hooks/useHealerToolkit';
import { HealerPanel } from '@/components/healer/HealerPanel';
import type { EmotionalSnapshot, RiskAssessment } from '@/telemetry/emotionalTypes';
import type { HealerIntervention } from '@/healer/healerTypes';

interface MyComponentProps {
  snapshot: EmotionalSnapshot;
  risk: RiskAssessment;
}

export const MyComponent: React.FC<MyComponentProps> = ({ snapshot, risk }) => {
  const { recommendations, computeRecommendations } = useHealerToolkit();

  React.useEffect(() => {
    computeRecommendations({ snapshot, risk }, 3);
  }, [snapshot, risk, computeRecommendations]);

  const handleBegin = (intervention: HealerIntervention) => {
    // Your custom logic here
  };

  return (
    <div>
      <HealerPanel
        interventions={recommendations}
        onBeginIntervention={handleBegin}
      />
    </div>
  );
};
```

---

## 🎯 Component API Reference

### **`QuickGroundingButton`**

**Props:**
- `snapshot: EmotionalSnapshot` - Current emotional snapshot (required)
- `risk: RiskAssessment` - Current risk assessment (required)

**Usage:**
- Drop-in component for quick access
- Shows "Offer Gentle Support" button
- Displays `HealerPanel` when clicked
- Automatically computes recommendations

### **`HealerPanel`**

**Props:**
- `interventions: HealerIntervention[]` - Array of interventions to display (required)
- `onBeginIntervention?: (intervention: HealerIntervention) => void` - Callback when user starts an intervention

**Usage:**
- Displays primary intervention prominently
- Shows secondary options
- Empty state with trauma-informed message
- Luxury, cinematic styling

### **`useHealerToolkit` Hook**

**Returns:**
- `lastContext: HealerMatchContext | null` - Last context used for matching
- `recommendations: HealerIntervention[]` - Current recommendations
- `computeRecommendations: (ctx: HealerMatchContext, max?: number) => HealerIntervention[]` - Compute new recommendations

**Usage:**
```tsx
const { recommendations, computeRecommendations } = useHealerToolkit();

// Compute recommendations
const results = computeRecommendations({ snapshot, risk }, 3);
```

---

## 📐 Design Principles

### **1. No Blame**
Never imply the user caused their distress by failing.
- ❌ "You should have done this earlier"
- ✅ "This is a difficult moment, and support is available"

### **2. No Pressure**
Interventions are invitations, not demands.
- ❌ "You must complete this practice"
- ✅ "If this feels right, you can try it"

### **3. Always Permission-Based**
Emphasize "you can stop at any time."
- ❌ "Complete all steps"
- ✅ "You can pause or stop at any time"

### **4. Trauma-Informed**
Keep exposure soft, not overwhelming.
- ❌ "Face your fears head-on"
- ✅ "Move at a pace that feels safe"

### **5. Shame-Safe**
Language should normalize struggle and complexity.
- ❌ "You're being too sensitive"
- ✅ "This is a normal response to difficulty"

### **6. Nervous-System Aware**
Short, clear steps; simple, body-based focus.
- ❌ Long, complex instructions
- ✅ Simple, body-focused practices

---

## 🎨 Content Guidelines

### **Intervention Names**
- Clear, descriptive
- Non-clinical when possible
- Invitational tone

**Examples:**
- ✅ "5-4-3-2-1 Senses Grounding"
- ✅ "Hand-on-Heart Shame Soften"
- ❌ "Cognitive Behavioral Grounding Technique"

### **Summaries**
- Brief (1-2 sentences)
- Focus on what it does, not what's wrong
- Invitational language

**Examples:**
- ✅ "A short, sensory grounding sequence to help reconnect to the present moment when things feel too loud inside."
- ❌ "This will fix your anxiety"

### **Step Descriptions**
- Action-oriented
- Body-focused
- Permission-based
- Clear and simple

**Examples:**
- ✅ "Gently look around and name 5 things you can see, either out loud or silently."
- ❌ "You must identify exactly 5 visual objects"

### **Notes**
- Always include permission to stop
- Validate experience
- No pressure or blame

**Examples:**
- ✅ "Keep pace gentle, no forcing. If any step feels like too much, it is okay to stop early."
- ❌ "Complete all steps for best results"

---

## 🔗 Integration Points

### **Emotional Telemetry**
The Healer Toolkit integrates with:
- `useEmotionalTelemetry()` hook - Provides latest snapshot and risk
- `recordSnapshot()` - Records new emotional snapshots
- `assessRisk()` - Calculates risk from snapshot

### **Ritual Sequences**
Interventions can link to ritual sequences:
- `linkedRitualSequenceKey` - Optional field in interventions
- Connects to `ritualSequences.ts`
- Enables deeper ritual integration

### **Navigation**
When user begins an intervention:
- Can navigate to dedicated practice page
- Can start ritual sequence
- Can show step-by-step guide
- Can integrate with existing tools

---

## ✅ Best Practices

1. **Always check for data** - Guard against missing snapshots/risk
2. **Show empty states** - Provide helpful guidance when no data
3. **Respect user choice** - Never force interventions
4. **Provide context** - Explain why interventions are suggested
5. **Allow dismissal** - Users can close/ignore recommendations
6. **Track usage** - Log when interventions are used (anonymously)
7. **Update dynamically** - Recompute when snapshot/risk changes

---

## 🚀 Next Steps

1. **Integrate into Living Guide** - Add QuickGroundingButton
2. **Add to Overseer Console** - Show recommendations in monitoring
3. **Create practice flows** - Build step-by-step intervention experiences
4. **Connect to rituals** - Link interventions to ritual sequences
5. **Track effectiveness** - Monitor which interventions help most

---

**Phase 57 Ultra - Healer Toolkit Integration Guide** ✅

