// src/engines/ritual/runRitual.js
// Helper to get the active ritual based on current state

import { chooseRitualPath } from "./ritualDecisionEngine";
import { ritualSequences } from "./ritualSequenceMap";

/**
 * Get the active ritual based on current emotional state and activation level
 * @returns {object|null} The active ritual with name and steps, or null if not found
 */
export function getActiveRitual() {
  const path = chooseRitualPath(); // "light" | "mixed" | "deep"
  const ritual = ritualSequences[path];
  
  if (!ritual) {
    // Fallback to light ritual if path is invalid
    return ritualSequences.light || null;
  }
  
  return ritual;
}

