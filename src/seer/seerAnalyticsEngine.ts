/**
 * WellnessCafe OS - Phase 58 Ultra
 * Seer Insight Engine - Analytical Layer
 * 
 * Clinical-style aggregation and pattern detection.
 * Trauma-informed, non-blaming, information-focused.
 */

import type { EmotionalSnapshot, EmotionalSignal } from '../telemetry/emotionalTypes';
import type { SeerAnalyticsSummary, SignalDistribution } from './seerTypes';

/**
 * Detects if there's a rising stress trend over time.
 */
function detectRisingStressTrend(snapshots: EmotionalSnapshot[]): boolean {
  if (snapshots.length < 3) return false;

  const recent = snapshots.slice(-3);
  const earlier = snapshots.slice(0, Math.min(3, snapshots.length - 3));

  if (earlier.length === 0) return false;

  const recentAvg = recent.reduce((sum, s) => sum + s.stress, 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, s) => sum + s.stress, 0) / earlier.length;

  return recentAvg > earlierAvg + 0.5; // Threshold for meaningful increase
}

/**
 * Detects if emotional states tend to occur more in evening hours.
 */
function detectEveningBias(snapshots: EmotionalSnapshot[]): boolean {
  if (snapshots.length < 3) return false;

  const eveningSnapshots = snapshots.filter((s) => {
    const hour = new Date(s.timestamp).getHours();
    return hour >= 17 || hour <= 2; // 5pm - 2am
  });

  return eveningSnapshots.length / snapshots.length > 0.5;
}

/**
 * Calculates signal distribution from snapshots.
 */
function calculateDistribution(snapshots: EmotionalSnapshot[]): SignalDistribution[] {
  const counts: Record<EmotionalSignal, number> = {
    steady: 0,
    anxious: 0,
    overwhelmed: 0,
    numb: 0,
    shame: 0,
    panic: 0,
    freeze: 0,
    grief: 0,
  };

  snapshots.forEach((s) => {
    counts[s.tag] = (counts[s.tag] || 0) + 1;
  });

  const total = snapshots.length;
  if (total === 0) return [];

  return Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .map(([tag, count]) => ({
      tag: tag as EmotionalSignal,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Generates a human-readable timeframe label.
 */
function generateTimeframeLabel(snapshots: EmotionalSnapshot[]): string {
  if (snapshots.length === 0) return 'No data';

  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const hoursDiff = (last.timestamp - first.timestamp) / (1000 * 60 * 60);

  if (hoursDiff < 1) return 'Last hour';
  if (hoursDiff < 24) return `Last ${Math.round(hoursDiff)} hours`;
  if (hoursDiff < 48) return 'Last 2 days';
  if (hoursDiff < 168) return `Last ${Math.round(hoursDiff / 24)} days`;
  return 'Recent period';
}

/**
 * Finds the dominant emotional signal.
 */
function findDominantSignal(distribution: SignalDistribution[]): EmotionalSignal | null {
  if (distribution.length === 0) return null;
  return distribution[0].tag;
}

/**
 * Generates analytical summary from emotional snapshots.
 * 
 * This is the clinical layer - pure data aggregation and pattern detection.
 * No judgment, no blame, just information.
 */
export function generateAnalyticsSummary(snapshots: EmotionalSnapshot[]): SeerAnalyticsSummary | null {
  if (snapshots.length === 0) return null;

  const distribution = calculateDistribution(snapshots);
  const dominantSignal = findDominantSignal(distribution);

  const stressValues = snapshots.map((s) => s.stress);
  const triggerValues = snapshots.map((s) => s.trigger);

  const averageStress = stressValues.reduce((sum, val) => sum + val, 0) / stressValues.length;
  const averageTrigger = triggerValues.reduce((sum, val) => sum + val, 0) / triggerValues.length;
  const maxStress = Math.max(...stressValues);

  const risingStressTrend = detectRisingStressTrend(snapshots);
  const eveningBias = detectEveningBias(snapshots);

  return {
    totalSamples: snapshots.length,
    timeframeLabel: generateTimeframeLabel(snapshots),
    dominantSignal,
    averageStress: Math.round(averageStress * 10) / 10,
    averageTrigger: Math.round(averageTrigger * 10) / 10,
    maxStress,
    distribution,
    risingStressTrend,
    eveningBias,
  };
}

