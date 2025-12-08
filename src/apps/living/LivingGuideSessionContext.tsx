/**
 * WellnessCafe OS - Phase 53
 * Living Guide V3 - Session Context
 * 
 * React context provider for managing Living Guide session state,
 * including emotional state, stress levels, and active ritual information.
 */

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import type { LivingGuideSessionState, EmotionalStateTag } from './livingGuideTypes';
import type { RitualIntensity } from '../../engines/ritual/ritualEngineConfig';

export interface LivingGuideSessionContextValue {
  state: LivingGuideSessionState;
  setEmotionalTag: (tag: EmotionalStateTag) => void;
  setStress: (value: number) => void;
  setTrigger: (value: number) => void;
  setFlags: (flags: Partial<Pick<LivingGuideSessionState, 'freeze' | 'panic' | 'shame' | 'grieving'>>) => void;
  setRitualResult: (intensity: RitualIntensity, sequenceKey: string) => void;
}

const defaultState: LivingGuideSessionState = {
  emotionalTag: 'steady',
  stress: 2,
  trigger: 0,
  freeze: false,
  panic: false,
  shame: false,
  grieving: false,
};

const LivingGuideSessionContext = createContext<LivingGuideSessionContextValue | undefined>(undefined);

export const LivingGuideSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LivingGuideSessionState>(defaultState);

  const value = useMemo<LivingGuideSessionContextValue>(
    () => ({
      state,
      setEmotionalTag: (emotionalTag) =>
        setState((prev) => ({ ...prev, emotionalTag })),
      setStress: (stress) =>
        setState((prev) => ({ ...prev, stress })),
      setTrigger: (trigger) =>
        setState((prev) => ({ ...prev, trigger })),
      setFlags: (flags) =>
        setState((prev) => ({ ...prev, ...flags })),
      setRitualResult: (intensity, sequenceKey) =>
        setState((prev) => ({
          ...prev,
          currentRitualIntensity: intensity,
          activeSequenceKey: sequenceKey,
        })),
    }),
    [state]
  );

  return (
    <LivingGuideSessionContext.Provider value={value}>
      {children}
    </LivingGuideSessionContext.Provider>
  );
};

export const useLivingGuideSession = () => {
  const ctx = useContext(LivingGuideSessionContext);
  if (!ctx) {
    throw new Error('useLivingGuideSession must be used within a LivingGuideSessionProvider');
  }
  return ctx;
};

