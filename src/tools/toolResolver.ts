// src/tools/toolResolver.ts
// Phase 59B: Global Tool Resolver
// Unifies all tool sources into a single resolver
// Seed tools (8 Daily Practice protocols) take precedence over healer/ritual equivalents

import { dailyPracticeTools } from './toolsBridge';
import { legacyTools } from '../data/tools';
import { getSeedToolsForDisplay } from '@/services/toolLoader';

const SEED_SLUGS = [
  'box-breathing-4x4',
  'grounding-54321',
  'panic-anchoring-feet-breath',
  'anchoring-protocol',
  'standard-ritual-sequence',
  'hand-on-heart-shame-soften',
  'grief-wave-seat',
  'orienting-protocol',
];

const HEALER_RITUAL_IDS_REPLACED_BY_SEED = [
  'ground_5_4_3_2_1',
  'breath_box_4_4_4_4',
  'panic_anchoring_feet',
  'shame_hand_on_heart',
  'grief_wave_seat',
  'ritual-standardSequence',
  'ritual-orientingProtocol',
  'ritual-anchoringProtocol',
];

const seedToolsDisplay = getSeedToolsForDisplay();
const otherPracticeTools = dailyPracticeTools.filter(
  (t) => !HEALER_RITUAL_IDS_REPLACED_BY_SEED.includes(t.id)
);

export const allTools = [
  ...seedToolsDisplay,
  ...otherPracticeTools,
  ...(legacyTools ?? []),
];

export const getToolById = (id: string) =>
  allTools.find((t) => t.id === id) || null;

export const isSeedToolSlug = (slug: string) =>
  SEED_SLUGS.includes(slug);

