// src/components/interaction/dockRegistry.js
// Phase 55A.2: Standard action keys for UnifiedInteractionDock (no auth gate for support)

export const DOCK_ACTIONS = {
  MIC: "mic",
  TOOLS: "tools",
  SUPPORT: "support",
};

export const getSupportRoute = () => "/assistance";
export const getToolsRoute = () => "/tools";
