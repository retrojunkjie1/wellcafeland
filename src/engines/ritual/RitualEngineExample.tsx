/**
 * WellnessCafe OS - Phase 52
 * Ritual Engine V3.5 - Example Usage Component
 * 
 * This file demonstrates how to use the trauma-adaptive ritual engine.
 * DELETE THIS FILE after reviewing - it's for reference only.
 */

import React, { useState } from 'react';
import { useRitualEngine } from '../../hooks/useRitualEngine';
import { useWcOs } from '../../hooks/useWcOs';
import type { UserEmotionalState } from './ritualAdaptiveLogic';

/**
 * Example: Basic Ritual Trigger
 */
export const RitualTriggerExample = () => {
  const { startRitual } = useRitualEngine();
  const { manifest } = useWcOs();

  const handleStart = () => {
    const state: UserEmotionalState = {
      stress: 6,
      trigger: 4,
      freeze: false,
      panic: false,
      shame: false,
    };

    const result = startRitual(state);

    if (result) {
      console.log('Ritual Started:', {
        intensity: result.decision.intensity,
        path: result.decision.nextPath,
        cinematic: result.decision.cinematicMode,
        grounding: result.decision.requiresGrounding,
        steps: result.sequence.length,
      });
    }
  };

  if (!manifest.ritualEngine.enabled) {
    return <div>Ritual Engine is disabled</div>;
  }

  return (
    <button onClick={handleStart} className="px-4 py-2 bg-amber-600 rounded">
      Start Ritual
    </button>
  );
};

/**
 * Example: Panic State Response
 */
export const PanicStateExample = () => {
  const { startRitual } = useRitualEngine();
  const [inPanic, setInPanic] = useState(false);

  const handlePanic = () => {
    setInPanic(true);

    const result = startRitual({
      stress: 10,
      trigger: 9,
      freeze: false,
      panic: true,
      shame: false,
    });

    if (result) {
      // System automatically:
      // - Selects 'low' intensity
      // - Chooses 'anchoringProtocol'
      // - Sets cinematic mode to 'soft'
      // - Triggers grounding intervention
      console.log('Panic protocol activated:', result);
    }
  };

  return (
    <div>
      <button onClick={handlePanic}>Simulate Panic State</button>
      {inPanic && <div className="text-red-400">Panic protocol active</div>}
    </div>
  );
};

/**
 * Example: Shame State Response
 */
export const ShameStateExample = () => {
  const { startRitual } = useRitualEngine();

  const handleShame = () => {
    const result = startRitual({
      stress: 7,
      trigger: 5,
      freeze: false,
      panic: false,
      shame: true,
    });

    if (result) {
      // System automatically:
      // - Selects 'medium' intensity
      // - Chooses 'selfCompassionProtocol'
      // - Sets cinematic mode to 'deep'
      console.log('Self-compassion protocol activated:', result);
    }
  };

  return (
    <button onClick={handleShame} className="px-4 py-2 bg-purple-600 rounded">
      Start Self-Compassion Ritual
    </button>
  );
};

/**
 * Example: Freeze State Response
 */
export const FreezeStateExample = () => {
  const { startRitual } = useRitualEngine();

  const handleFreeze = () => {
    const result = startRitual({
      stress: 8,
      trigger: 6,
      freeze: true,
      panic: false,
      shame: false,
    });

    if (result) {
      // System automatically:
      // - Selects 'low' intensity
      // - Chooses 'orientingProtocol'
      // - Sets cinematic mode to 'soft'
      // - Triggers grounding intervention
      console.log('Orienting protocol activated:', result);
    }
  };

  return (
    <button onClick={handleFreeze} className="px-4 py-2 bg-blue-600 rounded">
      Start Orienting Ritual
    </button>
  );
};

