/**
 * WellnessCafe OS - Phase 52
 * Ritual Engine V3.5 - Sequence Definitions
 * 
 * Defines all available ritual sequences with step-by-step instructions
 * and timing. Sequences are trauma-informed and designed for adaptive use.
 */

export interface RitualStep {
  step: string;
  duration: number; // milliseconds
}

export interface RitualSequence {
  [key: string]: RitualStep[];
}

/**
 * Standard ritual sequence for general use.
 * 
 * 5-step nervous system protocol: Pause → Ground → Orient → Release → Rebuild
 */
export const ritualSequences: RitualSequence = {
  standardSequence: [
    { step: 'pause_and_arrive', duration: 6000 },
    { step: 'breathe_slow', duration: 8000 },
    { step: 'body_scan_soft', duration: 8000 },
    { step: 'release_tension', duration: 10000 },
  ],

  /**
   * Orienting Protocol
   * 
   * For freeze states - helps user reconnect with present moment and environment.
   * Trauma-informed: gentle, non-overwhelming, sensory-based.
   */
  orientingProtocol: [
    { step: 'look_around_safely', duration: 6000 },
    { step: 'name_5_objects', duration: 8000 },
    { step: 'feel_feet_on_ground', duration: 8000 },
  ],

  /**
   * Anchoring Protocol
   * 
   * For panic states - provides immediate physical and breath-based anchoring.
   * Trauma-informed: simple, repetitive, body-focused.
   */
  anchoringProtocol: [
    { step: 'hand_on_chest', duration: 6000 },
    { step: 'slow_exhale', duration: 8000 },
    { step: 'count_breaths', duration: 8000 },
  ],

  /**
   * Self-Compassion Protocol
   * 
   * For shame states - addresses internalized shame with warmth and compassion.
   * Trauma-informed: non-judgmental, gentle, self-validating.
   */
  selfCompassionProtocol: [
    { step: 'gentle_statement', duration: 6000 },
    { step: 'warm_breath', duration: 8000 },
    { step: 'soften_shame', duration: 8000 },
  ],
};

