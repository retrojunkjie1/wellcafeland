// src/tools/toolResolver.ts
// Phase 59B: Global Tool Resolver
// Unifies all tool sources into a single resolver

import { dailyPracticeTools } from './toolsBridge';
import { legacyTools } from '../data/tools';

export const allTools = [
  ...dailyPracticeTools,
  ...(legacyTools ?? [])
];

export const getToolById = (id: string) =>
  allTools.find(t => t.id === id) || null;

