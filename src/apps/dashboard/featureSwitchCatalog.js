export const FEATURE_SWITCH_CATALOG = Object.freeze({
  aiSessions: {
    label: "Custom AI sessions",
    description: "Controls new AI-written practice plans. The AI Guide and saved practices stay available.",
    connected: true,
  },
  recoveryTracking: {
    label: "Recovery tracking",
    description: "This saved switch is not connected to recovery-tracking behavior yet.",
    connected: false,
  },
  toolsCatalog: {
    label: "Practice catalog",
    description: "Show or pause optional practice collections. Saved and practitioner-shared practices stay available; the change applies on the next visit or refresh.",
    connected: true,
  },
  providersMarketplace: {
    label: "Practitioner directory",
    description: "Controls WellnessCafe-reviewed and nearby public practitioner discovery. Existing connections, appointments, and practitioner applications stay available.",
    connected: true,
  },
  telemetry: {
    label: "Operational telemetry",
    description: "This saved switch does not change telemetry collection yet.",
    connected: false,
  },
  riskRadar: {
    label: "Risk Radar",
    description: "Controls risk-signal summaries in the God-Eye console. System metrics and agent events remain available.",
    connected: true,
  },
  notifications: {
    label: "Notifications",
    description: "This saved switch is not connected to notification delivery yet.",
    connected: false,
  },
  sessionSharing: {
    label: "Session sharing",
    description: "Controls practitioner access to client-shared check-ins and assessment answers. When paused, existing choices stay saved and clients can still revoke them; messages, appointments, and practice support remain available.",
    connected: true,
  },
});

export function getFeatureSwitchPresentation(featureId) {
  return FEATURE_SWITCH_CATALOG[featureId] || {
    label: featureId,
    description: "This setting has no connected product behavior yet.",
    connected: false,
  };
}
