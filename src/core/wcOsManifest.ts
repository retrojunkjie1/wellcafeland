/**
 * WellnessCafe OS - Core Fusion & Guardian Layer
 * Phase 51: System Manifest & Configuration Registry
 * 
 * This manifest serves as the central source of truth for all active modules,
 * versions, and standards across the WellnessCafe OS ecosystem.
 */

export type RitualIntensityLevel = 'low' | 'medium' | 'high';

export interface LivingGuideConfig {
  version: 'v3';
  enabled: boolean;
  hasLiveSessionHeader: boolean;
  usesEmotionalTelemetry: boolean;
}

export interface RitualEngineConfig {
  version: 'v3.5';
  enabled: boolean;
  defaultIntensity: RitualIntensityLevel;
  supportsMultiPathSequences: boolean;
  traumaSafePacing: boolean;
}

export interface CinematicToolsConfig {
  version: 'v4';
  enabled: boolean;
  panoramicHeroEnabled: boolean;
  ambientSoundscapesEnabled: boolean;
}

export interface IntelligentContentConfig {
  version: 'v5';
  enabled: boolean;
  traumaInformedCopy: boolean;
  shameSafeLanguage: boolean;
  adaptiveScripts: boolean;
}

export interface TraumaInformedRules {
  polyvagalPacing: boolean;
  showGroundingOptionsInAllFlows: boolean;
  neverBlameUserInCopy: boolean;
  deescalationPatternsEnabled: boolean;
}

export interface IkukuLuxuryStandard {
  enabled: boolean;
  palette: {
    gold: string;
    sand: string;
    ink: string;
    accent?: string;
  };
  useGlassmorphism: boolean;
  cinematicSpacing: boolean;
}

export interface WcOsManifest {
  phases: {
    min: number;
    max: number;
    currentPhase: number;
  };
  livingGuide: LivingGuideConfig;
  ritualEngine: RitualEngineConfig;
  cinematicTools: CinematicToolsConfig;
  intelligentContent: IntelligentContentConfig;
  traumaInformed: TraumaInformedRules;
  ikukuLuxury: IkukuLuxuryStandard;
}

/**
 * Core WellnessCafe OS Manifest
 * 
 * This is the central registry that defines:
 * - Active module versions and capabilities
 * - Trauma-informed safety rules
 * - Ikuku luxury standard configuration
 * - Phase awareness and feature flags
 */
export const wcOsManifest: WcOsManifest = {
  phases: {
    min: 1,
    max: 50,
    currentPhase: 55, // Multi-Agent Fusion Protocol (Overseer + Seer + Healer)
  },
  livingGuide: {
    version: 'v3',
    enabled: true,
    hasLiveSessionHeader: true,
    usesEmotionalTelemetry: true,
  },
  ritualEngine: {
    version: 'v3.5',
    enabled: true,
    defaultIntensity: 'medium',
    supportsMultiPathSequences: true,
    traumaSafePacing: true,
  },
  cinematicTools: {
    version: 'v4',
    enabled: true,
    panoramicHeroEnabled: true,
    ambientSoundscapesEnabled: true,
  },
  intelligentContent: {
    version: 'v5',
    enabled: true,
    traumaInformedCopy: true,
    shameSafeLanguage: true,
    adaptiveScripts: true,
  },
  traumaInformed: {
    polyvagalPacing: true,
    showGroundingOptionsInAllFlows: true,
    neverBlameUserInCopy: true,
    deescalationPatternsEnabled: true,
  },
  ikukuLuxury: {
    enabled: true,
    palette: {
      gold: '#F5C26B',
      sand: '#E4D4BD',
      ink: '#050609',
      accent: '#B88946',
    },
    useGlassmorphism: true,
    cinematicSpacing: true,
  },
};

