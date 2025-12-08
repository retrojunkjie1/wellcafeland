/**
 * WellnessCafe OS - Phase 54
 * Risk Radar Engine
 * 
 * Central function that processes emotional snapshots:
 * - Records snapshot into telemetry buffer
 * - Assesses risk level
 * - Returns risk assessment with recommended action
 */

import type { EmotionalSnapshot, RiskAssessment } from './emotionalTypes';
import { recordSnapshot, assessRisk } from './emotionalTelemetry';

/**
 * Processes an emotional snapshot through the risk radar system.
 * 
 * @param snapshot - The emotional snapshot to process
 * @returns Risk assessment with recommended action
 */
export function processSnapshot(snapshot: EmotionalSnapshot): RiskAssessment {
  recordSnapshot(snapshot);
  return assessRisk(snapshot);
}

