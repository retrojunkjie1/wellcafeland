/**
 * WellnessCafe OS - Core Fusion & Guardian Layer
 * Phase 51: React Context Provider for System Manifest
 * 
 * Provides runtime access to the WellnessCafe OS manifest and capabilities
 * throughout the application component tree.
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { wcOsManifest, WcOsManifest } from './wcOsManifest';

export interface WcOsProviderProps {
  children: ReactNode;
  manifestOverride?: Partial<WcOsManifest>;
}

export interface WcOsContextValue {
  manifest: WcOsManifest;
  isLuxuryEnabled: boolean;
  isTraumaInformedStrict: boolean;
}

export const WcOsContext = createContext<WcOsContextValue | undefined>(undefined);

/**
 * WcOsProvider
 * 
 * Wraps the application to provide access to the WellnessCafe OS manifest.
 * Supports optional manifest overrides for testing and feature flagging.
 * 
 * @example
 * ```tsx
 * <WcOsProvider>
 *   <App />
 * </WcOsProvider>
 * ```
 */
export const WcOsProvider: React.FC<WcOsProviderProps> = ({
  children,
  manifestOverride,
}) => {
  const mergedManifest: WcOsManifest = useMemo(() => {
    return {
      ...wcOsManifest,
      ...manifestOverride,
      phases: {
        ...wcOsManifest.phases,
        ...manifestOverride?.phases,
      },
      livingGuide: {
        ...wcOsManifest.livingGuide,
        ...manifestOverride?.livingGuide,
      },
      ritualEngine: {
        ...wcOsManifest.ritualEngine,
        ...manifestOverride?.ritualEngine,
      },
      cinematicTools: {
        ...wcOsManifest.cinematicTools,
        ...manifestOverride?.cinematicTools,
      },
      intelligentContent: {
        ...wcOsManifest.intelligentContent,
        ...manifestOverride?.intelligentContent,
      },
      traumaInformed: {
        ...wcOsManifest.traumaInformed,
        ...manifestOverride?.traumaInformed,
      },
      ikukuLuxury: {
        ...wcOsManifest.ikukuLuxury,
        ...manifestOverride?.ikukuLuxury,
        palette: {
          ...wcOsManifest.ikukuLuxury.palette,
          ...manifestOverride?.ikukuLuxury?.palette,
        },
      },
    };
  }, [manifestOverride]);

  const value: WcOsContextValue = useMemo(
    () => ({
      manifest: mergedManifest,
      isLuxuryEnabled: mergedManifest.ikukuLuxury.enabled,
      isTraumaInformedStrict:
        mergedManifest.traumaInformed.polyvagalPacing &&
        mergedManifest.traumaInformed.showGroundingOptionsInAllFlows &&
        mergedManifest.traumaInformed.deescalationPatternsEnabled,
    }),
    [mergedManifest]
  );

  return <WcOsContext.Provider value={value}>{children}</WcOsContext.Provider>;
};

