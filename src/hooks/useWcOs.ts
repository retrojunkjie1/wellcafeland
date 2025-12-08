/**
 * WellnessCafe OS - Core Fusion & Guardian Layer
 * Phase 51: Hook for accessing WellnessCafe OS manifest and capabilities
 * 
 * Provides a convenient hook to access the WcOsContext throughout the application.
 * Throws an error if used outside of WcOsProvider.
 * 
 * @example
 * ```tsx
 * const { manifest, isLuxuryEnabled } = useWcOs();
 * 
 * if (!manifest.livingGuide.enabled) return null;
 * ```
 */

import { useContext } from 'react';
import { WcOsContext } from '../core/WcOsProvider';

export const useWcOs = () => {
  const ctx = useContext(WcOsContext);
  if (!ctx) {
    throw new Error(
      'useWcOs must be used within a WcOsProvider. ' +
      'Please wrap your application root with <WcOsProvider>.'
    );
  }
  return ctx;
};

