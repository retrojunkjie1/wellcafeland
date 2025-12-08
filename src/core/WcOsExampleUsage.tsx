/**
 * WellnessCafe OS - Phase 51
 * Example Usage of WcOs Manifest System
 * 
 * This file demonstrates how to use the WcOsProvider and useWcOs hook
 * throughout the WellnessCafe OS application.
 * 
 * DELETE THIS FILE after reviewing - it's for reference only.
 */

import React from 'react';
import { useWcOs } from '../hooks/useWcOs';

/**
 * Example: Living Guide Header Component
 * Shows how to check if Living Guide is enabled and use manifest settings
 */
export const LivingGuideHeaderExample = () => {
  const { manifest, isLuxuryEnabled } = useWcOs();

  // Early return if module is disabled
  if (!manifest.livingGuide.enabled) {
    return null;
  }

  // Use luxury palette from manifest
  const goldColor = manifest.ikukuLuxury.palette.gold;
  const inkColor = manifest.ikukuLuxury.palette.ink;

  return (
    <header
      style={{
        background: isLuxuryEnabled
          ? `linear-gradient(135deg, ${inkColor} 0%, rgba(5, 6, 9, 0.95) 100%)`
          : 'transparent',
        borderBottom: `1px solid ${goldColor}20`,
      }}
      className="p-6"
    >
      {manifest.livingGuide.hasLiveSessionHeader && (
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: goldColor }}
          />
          <span className="text-sm" style={{ color: goldColor }}>
            Live Session Active
          </span>
        </div>
      )}
    </header>
  );
};

/**
 * Example: Ritual Engine Component
 * Shows how to use ritual engine configuration
 */
export const RitualEngineExample = () => {
  const { manifest, isTraumaInformedStrict } = useWcOs();

  if (!manifest.ritualEngine.enabled) {
    return <div>Ritual Engine is currently unavailable.</div>;
  }

  const defaultIntensity = manifest.ritualEngine.defaultIntensity;
  const supportsMultiPath = manifest.ritualEngine.supportsMultiPathSequences;

  return (
    <div className="p-6">
      <h2>Ritual Engine v{manifest.ritualEngine.version}</h2>
      <p>Default Intensity: {defaultIntensity}</p>
      <p>Multi-path Sequences: {supportsMultiPath ? 'Enabled' : 'Disabled'}</p>
      {isTraumaInformedStrict && (
        <p className="text-sm text-amber-400">
          Trauma-informed pacing is active
        </p>
      )}
    </div>
  );
};

/**
 * Example: Cinematic Tools Component
 * Shows how to check cinematic features
 */
export const CinematicToolsExample = () => {
  const { manifest } = useWcOs();

  if (!manifest.cinematicTools.enabled) {
    return null;
  }

  return (
    <div className="p-6">
      {manifest.cinematicTools.panoramicHeroEnabled && (
        <div className="mb-4">
          <h3>Panoramic Hero Section</h3>
          <p>Cinematic visuals enabled</p>
        </div>
      )}
      {manifest.cinematicTools.ambientSoundscapesEnabled && (
        <div>
          <h3>Ambient Soundscapes</h3>
          <p>Atmospheric audio enabled</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Trauma-Informed Safety Check
 * Shows how to enforce trauma-informed rules
 */
export const TraumaInformedSafetyExample = () => {
  const { manifest, isTraumaInformedStrict } = useWcOs();

  // Always show grounding options if trauma-informed rules require it
  const showGrounding = manifest.traumaInformed.showGroundingOptionsInAllFlows;

  return (
    <div className="p-6">
      {showGrounding && (
        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <h3 className="text-amber-400 mb-2">Grounding Options</h3>
          <p className="text-sm text-gray-300">
            You can pause, breathe, or return to safety at any time.
          </p>
        </div>
      )}
      {isTraumaInformedStrict && (
        <p className="text-xs text-gray-500">
          All trauma-informed safety protocols are active
        </p>
      )}
    </div>
  );
};

/**
 * Example: Luxury UI Styling
 * Shows how to use Ikuku luxury standard
 */
export const LuxuryUIExample = () => {
  const { manifest, isLuxuryEnabled } = useWcOs();

  if (!isLuxuryEnabled) {
    return <div>Standard UI mode</div>;
  }

  const { palette } = manifest.ikukuLuxury;
  const useGlass = manifest.ikukuLuxury.useGlassmorphism;

  return (
    <div
      className="p-8 rounded-2xl"
      style={{
        background: useGlass
          ? `linear-gradient(135deg, ${palette.ink}88, ${palette.ink}CC)`
          : palette.ink,
        border: `1px solid ${palette.gold}30`,
        backdropFilter: useGlass ? 'blur(20px)' : 'none',
        boxShadow: `0 8px 32px ${palette.gold}10`,
      }}
    >
      <h2 style={{ color: palette.gold }}>Luxury Experience</h2>
      <p style={{ color: palette.sand }} className="mt-4">
        This component uses the Ikuku luxury standard from the manifest.
      </p>
    </div>
  );
};

