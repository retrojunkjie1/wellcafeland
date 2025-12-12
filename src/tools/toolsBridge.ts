/**
 * WellnessCafe OS - Phase 59
 * Tools Bridge Integration Layer
 * 
 * Connects Healer Toolkit → Ritual Engine → Explore Daily Practice UI
 * Maps interventions and sequences into unified DailyPracticeTool format.
 */

import { healerRegistry } from '../healer/healerRegistry';
import { ritualSequences } from '../engines/ritual/ritualSequences';
import type { DailyPracticeTool } from './toolsTypes';

/**
 * Category normalization for UI chips
 * Maps internal category IDs to user-friendly display names
 * Includes all possible categories - filtering happens at display level
 */
const categoryMap: Record<string, string> = {
  grounding: 'Grounding',
  breathwork: 'Breathing',
  somatic: 'Somatic',
  panic_calm: 'Emergency',
  stabilization: 'Grounding',
  shame_rescue: 'Emotional',
  grief_support: 'Emotional',
  urge_surfing: 'Urge Management',
  sleep_reset: 'Sleep',
};

/**
 * Map Healer Toolkit interventions to Daily Practice Tools format
 */
const mapHealerInterventions = (): DailyPracticeTool[] => {
  return healerRegistry.map((iv) => {
    const mappedCategory = categoryMap[iv.category] ?? 'General';

    return {
      id: iv.id,
      title: iv.name,
      category: mappedCategory,
      tags: [mappedCategory.toLowerCase(), iv.category, ...iv.suitableForSignals],
      summary: iv.summary,
      steps: iv.steps.map((s) => ({
        label: s.label,
        description: s.description,
      })),
    };
  });
};

/**
 * Map Ritual Engine sequences to Daily Practice Tools format (optional)
 */
const mapRitualSequences = (): DailyPracticeTool[] => {
  const ritualTools: DailyPracticeTool[] = [];
  
  // Map ritual sequences to tools
  Object.entries(ritualSequences).forEach(([key, steps]) => {
    const stepLabels: Record<string, string> = {
      'pause_and_arrive': 'Pause and Arrive',
      'breathe_slow': 'Breathe Slowly',
      'body_scan_soft': 'Soft Body Scan',
      'release_tension': 'Release Tension',
      'look_around_safely': 'Look Around Safely',
      'name_5_objects': 'Name 5 Objects',
      'feel_feet_on_ground': 'Feel Feet on Ground',
      'hand_on_chest': 'Hand on Chest',
      'slow_exhale': 'Slow Exhale',
      'count_breaths': 'Count Breaths',
      'gentle_statement': 'Gentle Statement',
      'warm_breath': 'Warm Breath',
      'soften_shame': 'Soften Shame',
    };

    const stepDescriptions: Record<string, string> = {
      'pause_and_arrive': 'Take a moment to pause and arrive in this space.',
      'breathe_slow': 'Breathe slowly and naturally, letting your body settle.',
      'body_scan_soft': 'Gently scan your body from head to toe, noticing sensations.',
      'release_tension': 'Release any tension you notice, without forcing.',
      'look_around_safely': 'Look around your environment, noticing what feels safe.',
      'name_5_objects': 'Name 5 objects you can see in your environment.',
      'feel_feet_on_ground': 'Feel your feet on the ground, noticing the support beneath you.',
      'hand_on_chest': 'Place your hand on your chest, feeling the warmth and pressure.',
      'slow_exhale': 'Exhale slowly, making your exhale longer than your inhale.',
      'count_breaths': 'Count your breaths, giving your mind something to focus on.',
      'gentle_statement': 'Offer yourself a gentle, compassionate statement.',
      'warm_breath': 'Breathe warmth into your body, imagining gentle light.',
      'soften_shame': 'Soften around any shame, offering yourself compassion.',
    };

    const ritualCategoryMap: Record<string, string> = {
      'standardSequence': 'Grounding', // Maps to 'Grounding' via categoryMap
      'orientingProtocol': 'Grounding',
      'anchoringProtocol': 'Emergency',
      'selfCompassionProtocol': 'Emotional',
    };

    const titleMap: Record<string, string> = {
      'standardSequence': 'Standard Ritual Sequence',
      'orientingProtocol': 'Orienting Protocol',
      'anchoringProtocol': 'Anchoring Protocol',
      'selfCompassionProtocol': 'Self-Compassion Protocol',
    };

    const summaryMap: Record<string, string> = {
      'standardSequence': 'A gentle nervous system protocol: pause, ground, orient, release.',
      'orientingProtocol': 'For freeze states - helps you reconnect with the present moment.',
      'anchoringProtocol': 'For panic states - provides immediate physical and breath-based anchoring.',
      'selfCompassionProtocol': 'For shame states - addresses internalized shame with warmth and compassion.',
    };

    ritualTools.push({
      id: `ritual-${key}`,
      title: titleMap[key] || key,
      category: ritualCategoryMap[key] || 'Grounding',
      tags: [ritualCategoryMap[key]?.toLowerCase() || 'grounding', 'ritual'],
      summary: summaryMap[key] || 'A ritual sequence for nervous system support.',
      steps: steps.map(s => ({
        label: stepLabels[s.step] || s.step,
        description: stepDescriptions[s.step] || 'Follow this step with presence and care.',
      }))
    });
  });

  return ritualTools;
};

/**
 * Unified Daily Practice Tools registry
 * 
 * Combines Healer Toolkit interventions and Ritual Engine sequences
 * into a single format for the Explore UI.
 */
export const dailyPracticeTools: DailyPracticeTool[] = [
  ...mapHealerInterventions(),
  ...mapRitualSequences(),
];

/**
 * Get tools by category
 */
export function getDailyPracticeToolsByCategory(category: string): DailyPracticeTool[] {
  if (category === 'All Tools' || category === 'all') {
    return dailyPracticeTools;
  }
  return dailyPracticeTools.filter(tool => tool.category === category);
}

/**
 * Get all unique categories that have at least one tool
 */
export function getDailyPracticeCategories(): string[] {
  const categories = new Set(dailyPracticeTools.map(tool => tool.category));
  // Only return categories that actually have tools
  return ['All Tools', ...Array.from(categories).sort()];
}

/**
 * Get count of tools in a category
 */
export function getCategoryCount(category: string): number {
  if (category === 'All Tools' || category === 'all') {
    return dailyPracticeTools.length;
  }
  return dailyPracticeTools.filter(t => t.category === category).length;
}

/**
 * Get tool by ID
 */
export function getDailyPracticeToolById(id: string): DailyPracticeTool | null {
  return dailyPracticeTools.find(tool => tool.id === id) || null;
}

