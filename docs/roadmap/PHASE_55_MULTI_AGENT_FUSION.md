# Phase 55: Multi-Agent Fusion Protocol (Overseer + Seer + Healer)

## Overview

Phase 55 implements a **Multi-Agent Fusion Layer** that orchestrates agent-based recommendations across the WellnessCafe OS. The system reads emotional telemetry, considers OS manifest settings, integrates with the Ritual Engine, and produces intelligent recommendations about what should happen next and which agent should "speak."

## Architecture

### Core Files

1. **`src/agents/agentTypes.ts`**
   - Type definitions for agent roles and capabilities
   - `AgentRole` type (5 agents)
   - `FusionDecision` interface
   - `FusionMessage` interface

2. **`src/agents/agentRegistry.ts`**
   - Static registry of agent profiles
   - Defines capabilities and descriptions
   - Helper function to get agent by ID

3. **`src/agents/agentFusionEngine.ts`**
   - Core fusion logic
   - Chooses dominant agent based on risk
   - Maps risk to actions
   - Builds trauma-informed messages

4. **`src/hooks/useAgentFusion.ts`**
   - React hook for agent fusion
   - `runFusion()` function
   - Returns fusion decision

## Agent Roles

### Overseer
- **Capabilities**: Risk assessment, escalation guard
- **Role**: Monitors the whole system, watches risk, decides when to slow down or escalate
- **Speaks**: In high-risk situations, system-level messages

### Seer
- **Capabilities**: Pattern insight, reflection prompt
- **Role**: Notices patterns over time, offers gentle reflections
- **Speaks**: In low/medium risk, reflection prompts

### Healer
- **Capabilities**: Ritual selection, grounding guidance
- **Role**: Guides nervous-system-safe rituals and grounding sequences
- **Speaks**: When rituals or grounding are recommended

### Sentinel
- **Capabilities**: Escalation guard, risk assessment
- **Role**: Guardian at the gate, especially in critical risk states
- **Speaks**: In critical situations, safety-first messages

### Towncrier
- **Capabilities**: Reflection prompt
- **Role**: Handles announcements, summaries, gentle progress nudges
- **Speaks**: Supportive, never shaming

## Fusion Decision Flow

```
Emotional Snapshot + Risk Assessment
    ↓
Choose Dominant Agent (based on risk level)
    ↓
Map Risk to Action
    ↓
Determine Ritual Intensity
    ↓
Select Ritual Sequence (if needed)
    ↓
Build Agent Messages
    ↓
Return Fusion Decision
```

## Agent Selection Logic

### Risk-Based Agent Selection

- **Critical Risk**: Sentinel (dominant) + Overseer + Healer (supporting)
- **High Risk**: Overseer (dominant) + Healer + Seer (supporting)
- **Medium Risk**: Healer (dominant) + Seer + Towncrier (supporting)
- **Low Risk**: Seer (dominant) + Towncrier (supporting)

### Action Mapping

- **escalate** → `escalate_support`
- **ritual** → `start_ritual`
- **grounding** → `offer_grounding`
- **medium risk** → `offer_grounding` (default)
- **none** → `none`

### Ritual Intensity

- **Critical/High Risk**: `low` intensity (safety first)
- **Medium Risk**: `medium` intensity
- **Low Risk**: Default from manifest

### Ritual Sequence Selection

- **Panic/Freeze**: `anchoringProtocol`
- **Shame**: `selfCompassionProtocol`
- **Other**: `standardSequence`

## Usage Examples

### Basic Usage

```tsx
import { useAgentFusion } from '@/hooks/useAgentFusion';
import { useEmotionalTelemetry } from '@/hooks/useEmotionalTelemetry';

const MyComponent = () => {
  const { latestSnapshot, risk } = useEmotionalTelemetry();
  const { decision, runFusion } = useAgentFusion();

  useEffect(() => {
    if (latestSnapshot && risk) {
      runFusion(latestSnapshot, risk);
    }
  }, [latestSnapshot, risk, runFusion]);

  if (decision) {
    return (
      <div>
        <p>Dominant Agent: {decision.dominantAgent}</p>
        <p>Action: {decision.action}</p>
        {decision.messages.map((msg, i) => (
          <p key={i}>{msg.text}</p>
        ))}
      </div>
    );
  }

  return null;
};
```

### Integration with Living Guide V3

```tsx
import { useAgentFusion } from '@/hooks/useAgentFusion';
import { useEmotionalTelemetry } from '@/hooks/useEmotionalTelemetry';
import { useLivingGuideSession } from '@/apps/living/LivingGuideSessionContext';

const LivingGuideWithAgents = () => {
  const { latestSnapshot, risk, submitSnapshot } = useEmotionalTelemetry();
  const { decision, runFusion } = useAgentFusion();
  const { state } = useLivingGuideSession();

  // Submit snapshot when session state changes
  useEffect(() => {
    const snapshot = {
      tag: state.emotionalTag,
      stress: state.stress,
      trigger: state.trigger,
      timestamp: Date.now(),
    };
    submitSnapshot(snapshot);
  }, [state, submitSnapshot]);

  // Run fusion when risk assessment is available
  useEffect(() => {
    if (latestSnapshot && risk) {
      runFusion(latestSnapshot, risk);
    }
  }, [latestSnapshot, risk, runFusion]);

  // Display agent recommendations
  if (decision?.action === 'start_ritual') {
    return <RitualRecommendation decision={decision} />;
  }

  return <NormalFlow />;
};
```

### Integration with Ritual Engine V3.5

```tsx
import { useAgentFusion } from '@/hooks/useAgentFusion';
import { useRitualEngine } from '@/hooks/useRitualEngine';

const AgentGuidedRitual = () => {
  const { decision } = useAgentFusion();
  const { startRitual } = useRitualEngine();

  const handleStartRitual = () => {
    if (decision?.ritualSequenceKey && decision.intensity) {
      // Use agent's recommended sequence and intensity
      const result = startRitual({
        stress: 7,
        trigger: 5,
        freeze: false,
        panic: false,
        shame: false,
      });
      // Handle result
    }
  };

  return (
    <div>
      {decision?.messages.map((msg, i) => (
        <div key={i} className={`message-${msg.channel}`}>
          <strong>{msg.from}:</strong> {msg.text}
        </div>
      ))}
      {decision?.action === 'start_ritual' && (
        <button onClick={handleStartRitual}>
          Begin {decision.ritualSequenceKey}
        </button>
      )}
    </div>
  );
};
```

## Message Channels

### System Channel
- **Purpose**: Critical system-level messages
- **Used by**: Overseer, Sentinel
- **Example**: "We are slowing things down and prioritizing your safety."

### UI Hint Channel
- **Purpose**: Actionable suggestions in the UI
- **Used by**: Healer
- **Example**: "Let's try a short grounding moment together."

### Reflection Channel
- **Purpose**: Gentle, insight-based prompts
- **Used by**: Seer, Towncrier
- **Example**: "There might be a pattern in how stress rises for you."

## Trauma-Informed Design Principles

All agent messages and decisions MUST:

1. **Be Non-Judgmental**: Never blame the user
2. **Be Shame-Safe**: Never trigger shame responses
3. **Assume Distress**: Assume user might be dysregulated
4. **Offer Options**: Provide choices, not demands
5. **Respect Autonomy**: Allow "not now" without punishment
6. **Prioritize Safety**: Safety first, always

## Integration Points

### Phase 51 (wcOsManifest)
- Uses `wcOsManifest.ritualEngine.defaultIntensity`
- Respects manifest settings for ritual capabilities

### Phase 52 (Ritual Engine V3.5)
- Provides ritual sequence recommendations
- Suggests appropriate intensity levels
- Maps emotional states to protocols

### Phase 53 (Living Guide V3)
- Can read agent recommendations
- Displays agent messages
- Adapts UI based on fusion decisions

### Phase 54 (Emotional Telemetry V2)
- Reads emotional snapshots
- Uses risk assessments
- Responds to risk levels

## Future Enhancements

Potential Phase 56+ additions:

- **Admin Console Integration**: Overseer dashboard for providers
- **Provider Portals**: Therapist/coach views of agent decisions
- **Oracle-Level Insights**: Narrative insights from agent patterns
- **LLM Integration**: Connect agents to actual language models
- **Multi-Session Patterns**: Agent learning across sessions
- **Personalized Agents**: User-specific agent preferences

## Best Practices

1. **Always Check Decision**: Verify `decision` exists before using
2. **Respect Agent Recommendations**: Follow suggested actions
3. **Display Messages Appropriately**: Use correct channel styling
4. **Handle All Actions**: Support all `FusionRecommendedAction` types
5. **Maintain Trauma-Informed**: Never override safety recommendations

---

**Phase 55 Complete** ✅
- Multi-Agent Fusion Protocol implemented
- Agent registry with 5 core agents
- Fusion engine with risk-based selection
- React hook interface ready
- Full integration with Phases 51-54
- Trauma-informed and luxury-grade

