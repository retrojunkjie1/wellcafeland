/**
 * WellnessCafe OS - Phase 54
 * Emotional Telemetry V2 - Core Engine
 * 
 * Holds a rolling window of emotional snapshots, detects trends,
 * and outputs risk assessments. Trauma-informed and clinically-informed.
 */

import type { EmotionalSnapshot, EmotionalSignal, RiskAssessment, RiskLevel } from './emotionalTypes';

const WINDOW_SIZE = 12; // last 12 readings (e.g., one per minute)
let telemetryBuffer: EmotionalSnapshot[] = [];

/**
 * Records a new emotional snapshot into the telemetry buffer.
 * Maintains a rolling window of the last WINDOW_SIZE snapshots.
 */
export function recordSnapshot(snapshot: EmotionalSnapshot) {
  telemetryBuffer.push(snapshot);
  if (telemetryBuffer.length > WINDOW_SIZE) {
    telemetryBuffer.shift();
  }
}

/**
 * Returns the current telemetry window (all snapshots in buffer).
 */
export function getTelemetryWindow(): EmotionalSnapshot[] {
  return telemetryBuffer;
}

/**
 * Analyzes trends in the telemetry buffer.
 * 
 * Detects:
 * - Rising stress patterns
 * - Rising trigger patterns
 * - Collapse patterns (panic/shame → numb)
 * - Overall volatility
 */
export function analyzeTrends(): {
  risingStress: boolean;
  risingTrigger: boolean;
  collapsePattern: boolean;
  volatility: number;
} {
  if (telemetryBuffer.length < 3) {
    return { risingStress: false, risingTrigger: false, collapsePattern: false, volatility: 0 };
  }

  const last = telemetryBuffer[telemetryBuffer.length - 1];
  const prev = telemetryBuffer[telemetryBuffer.length - 2];
  const first = telemetryBuffer[0];

  const risingStress = last.stress > prev.stress && last.stress > first.stress;
  const risingTrigger = last.trigger > prev.trigger && last.trigger > first.trigger;

  // Collapse pattern = movement from panic/shame → numb
  const collapsePattern =
    prev.tag !== 'numb' && last.tag === 'numb';

  // Volatility = average deviation from current stress level
  const volatility =
    telemetryBuffer.reduce((sum, s) => sum + Math.abs(s.stress - last.stress), 0) /
    telemetryBuffer.length;

  return { risingStress, risingTrigger, collapsePattern, volatility };
}

/**
 * Assesses risk level based on current snapshot and trend analysis.
 * 
 * Trauma-informed: Prioritizes safety, detects collapse patterns,
 * and provides appropriate action recommendations.
 */
export function assessRisk(snapshot: EmotionalSnapshot): RiskAssessment {
  const trends = analyzeTrends();
  const factors: string[] = [];
  let risk: RiskLevel = 'low';
  let recommendedAction: RiskAssessment['recommendedAction'] = 'none';

  // Acute stress load
  if (snapshot.stress >= 8 || snapshot.trigger >= 8) {
    risk = 'high';
    factors.push('acute stress load');
  }

  // Nervous system override (panic/freeze)
  if (snapshot.tag === 'panic' || snapshot.tag === 'freeze') {
    risk = 'critical';
    factors.push('nervous system override');
  }

  // Shame collapse risk
  if (snapshot.tag === 'shame') {
    risk = risk === 'critical' ? 'critical' : 'high';
    factors.push('shame collapse risk');
  }

  // Collapse pattern detected
  if (trends.collapsePattern) {
    risk = 'critical';
    factors.push('collapse pattern detected');
  }

  // Rising stress trend (escalates medium to high)
  if (risk === 'medium' && trends.risingStress) {
    factors.push('rising stress trend');
  }

  // Determine recommended action based on risk level
  if (risk === 'critical') {
    recommendedAction = 'escalate';
  } else if (risk === 'high') {
    recommendedAction = 'ritual';
  } else if (risk === 'medium') {
    recommendedAction = 'grounding';
  } else {
    recommendedAction = 'none';
  }

  return { risk, factors, recommendedAction };
}

