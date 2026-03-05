# Firestore Data Model - God-Eye Control Plane v2

## Collections

### system_settings (singleton doc: "global")
```javascript
{
  theme: {
    mode: "dark" | "light",
    tokens: {
      primary: string,
      accent: string,
      typographyScale: number,
      spacingScale: number,
      cardRadius: number,
      blurIntensity: number,
    }
  },
  ui: {
    density: "compact" | "normal" | "comfortable",
    animations: boolean,
    safeArea: { top: number, bottom: number },
    navStyle: "minimal" | "standard",
    layoutScale: number,
  },
  features: {
    flags: { [key: string]: boolean },
    rollout: { percentage: number, stages: [] }
  },
  guardrails: {
    allowDangerousActions: boolean,
    require2StepForDestructive: boolean,
  }
}
```

### admin_actions (append-only collection)
```javascript
{
  id: string (auto),
  createdAt: Timestamp,
  createdByUid: string,
  createdByEmail: string,
  type: "SET_FEATURE_FLAG" | "SET_THEME_TOKEN" | "FORCE_SIGNOUT_USER" | 
        "DISABLE_USER" | "SET_USER_ROLE" | "RESET_USER_STATE" | "BROADCAST_BANNER",
  target: string, // user uid/email OR "system"
  payload: object,
  status: "proposed" | "approved" | "executed" | "rolled_back" | "failed",
  executedAt: Timestamp | null,
  executedByUid: string | null,
  rollbackPayload: object | null,
  reason: string,
}
```

### telemetry_events (append-only collection)
```javascript
{
  createdAt: Timestamp,
  level: "info" | "warn" | "error",
  source: "client" | "function" | "system",
  type: "auth" | "tool" | "signal" | "ui" | "network" | "crash" | "policy",
  uid: string | null,
  email: string | null,
  metadata: object,
  fingerprint: string,
}
```

### risk_forecast (collection)
```javascript
{
  createdAt: Timestamp,
  uid: string | null,
  email: string | null,
  riskScore: number, // 0-100
  reasons: [string],
  predictedIssues: [{
    type: string,
    probability: number,
    windowMinutes: number,
  }]
}
```

