// src/engines/tools/index.js
// Luxury Tools Engine - Unified Export
// Phase 36B: OS Integration

// Core Engines
export { 
  OrbAnimationController,
  OrbStates,
  OrbThemes,
  generateOrbKeyframes,
  calculateOrbScale,
  getOrbInstruction
} from './OrbEngine';

export {
  SoundscapeEngine,
  Soundscapes,
  getSoundscapeEngine
} from './SoundscapeEngine';

export {
  MetricsEngine,
  MetricTypes
} from './SessionEngine';

// Tools Registry
export {
  ToolsRegistry,
  getToolById,
  getToolsByCategory,
  getAllCategories,
  getToolsByIntensity,
  searchTools
} from './ToolsRegistry';

// Voice Engine (if needed later)
export { VoiceEngine, getVoiceEngine, BreathPatterns } from '../../../apps/tools/engine/VoiceEngine';

