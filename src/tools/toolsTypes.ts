/**
 * WellnessCafe OS - Phase 59
 * Tools Bridge Integration Layer - Type Definitions
 * 
 * Unified format for Daily Practice Tools across the system.
 */

export interface DailyPracticeTool {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  steps: {
    label: string;
    description: string;
  }[];
}

