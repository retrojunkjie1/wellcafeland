const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { requireAdminScope } = require("./adminAuthorization");

const IMPLEMENTED_AGENT_IDS = Object.freeze(["seer", "oracle", "overseer", "sentinel", "healer_spiritual"]);
const CONTROLS_REF = "admin/agentControls";
const SYSTEM_SETTINGS_REF = "admin/systemSettings";
const MAX_RECENT_EVENTS = 100;
const MAX_RADAR_EVENTS = 500;

function normalizeControls(data = {}) {
  const enabled = Object.fromEntries(IMPLEMENTED_AGENT_IDS.map((id) => [id, true]));
  for (const id of IMPLEMENTED_AGENT_IDS) {
    if (typeof data.enabled?.[id] === "boolean") enabled[id] = data.enabled[id];
  }
  return enabled;
}

async function getAgentAvailability(agentId, firestore = admin.firestore()) {
  if (!IMPLEMENTED_AGENT_IDS.includes(agentId)) {
    return { implemented: false, enabled: false, reason: "This agent does not have a production handler yet." };
  }

  try {
    const snapshot = await firestore.doc(CONTROLS_REF).get();
    const enabled = snapshot.exists ? normalizeControls(snapshot.data())[agentId] : true;
    return enabled
      ? { implemented: true, enabled: true, reason: null }
      : { implemented: true, enabled: false, reason: "An administrator has paused this agent." };
  } catch (error) {
    console.error("[agentOperations] Could not read agent controls", { code: error?.code || "UNKNOWN" });
    return { implemented: true, enabled: false, reason: "Agent controls are temporarily unavailable." };
  }
}

const getAdminAgentControls = onCall({ region: "us-central1", enforceAppCheck: true }, async (request) => {
  await requireAdminScope(request, "platform.operations.view");
  const db = admin.firestore();
  try {
    const snapshot = await db.doc(CONTROLS_REF).get();
    const data = snapshot.exists ? snapshot.data() : {};
    return {
      implementedAgentIds: IMPLEMENTED_AGENT_IDS,
      enabled: normalizeControls(data),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
      updatedBy: data.updatedBy || null,
    };
  } catch (error) {
    console.error("[agentOperations] Admin could not load agent controls", { uid: request.auth.uid, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "Agent controls could not be loaded. Try again.");
  }
});

const setAdminAgentControl = onCall({ region: "us-central1", enforceAppCheck: true }, async (request) => {
  const { uid } = await requireAdminScope(request, "platform.operations.control");
  const { agentId, enabled } = request.data || {};
  if (!IMPLEMENTED_AGENT_IDS.includes(agentId)) {
    throw new HttpsError("invalid-argument", "Choose an agent with a production handler.");
  }
  if (typeof enabled !== "boolean") {
    throw new HttpsError("invalid-argument", "Choose whether the agent should be enabled or paused.");
  }

  const db = admin.firestore();
  const ref = db.doc(CONTROLS_REF);
  const auditRef = db.collection("admin_agent_control_events").doc();
  try {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const current = snapshot.exists ? snapshot.data() : {};
      const currentEnabled = normalizeControls(current);
      const priorValue = currentEnabled[agentId];
      transaction.set(ref, {
        enabled: { ...currentEnabled, [agentId]: enabled },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: uid,
      }, { merge: true });
      transaction.create(auditRef, {
        agentId,
        previousEnabled: priorValue,
        enabled,
        actorUid: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return { agentId, enabled };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[agentOperations] Admin agent control update failed", { uid, agentId, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "The setting was not changed. Try again.");
  }
});

function asDate(value) {
  if (value?.toDate) return value.toDate();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildRiskSummary(eventDocs, now = new Date()) {
  const dailyCountsMap = {};
  let warningCount = 0;
  let criticalCount = 0;
  let totalEvents = 0;
  const days = [];

  for (const doc of eventDocs) {
    const event = doc.data();
    if (event.eventType !== "risk_signal") continue;
    totalEvents += 1;
    if (event.severity === "warning" || event.severity === "high") warningCount += 1;
    if (event.severity === "critical") criticalCount += 1;
    const date = asDate(event.timestamp);
    if (date) {
      const dayKey = date.toISOString().slice(0, 10);
      dailyCountsMap[dayKey] = (dailyCountsMap[dayKey] || 0) + 1;
    }
  }

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    const dayKey = date.toISOString().slice(0, 10);
    days.push({
      date: dayKey,
      count: dailyCountsMap[dayKey] || 0,
      label: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
    });
  }

  return {
    warningCount,
    criticalCount,
    totalEvents,
    topEventTypes: [],
    dailyCounts: days,
    sampled: eventDocs.length >= MAX_RADAR_EVENTS,
  };
}

/**
 * Admin-only system overview. Uses the Admin SDK so the client never needs
 * broad access to user or agent-event collections. Returned events contain
 * operational fields only; message, meta, uid and userId are never returned.
 */
const getAdminOperationalSnapshot = onCall({ region: "us-central1", enforceAppCheck: true }, async (request) => {
  await requireAdminScope(request, "platform.operations.view");
  const db = admin.firestore();
  const now = Date.now();
  const dayAgo = admin.firestore.Timestamp.fromMillis(now - 24 * 60 * 60 * 1000);
  const weekAgo = admin.firestore.Timestamp.fromMillis(now - 7 * 24 * 60 * 60 * 1000);

  try {
    const usersRef = db.collection("users");
    const sessionsRef = db.collection("sessions");
    const eventsRef = db.collection("agent_events");
    const checkinsRef = db.collection("checkins");
    const settingsSnapshot = await db.doc(SYSTEM_SETTINGS_REF).get();
    const storedRiskRadarEnabled = settingsSnapshot.data()?.settings?.features?.riskRadar;
    const riskRadarEnabled = typeof storedRiskRadarEnabled === "boolean"
      ? storedRiskRadarEnabled
      : DEFAULT_SYSTEM_SETTINGS.features.riskRadar;
    const [usersCount, activeUsersCount, sessionsCount, executionsCount, checkinsCount, recentCheckinsCount, recentSnapshot, riskSnapshot] = await Promise.all([
      usersRef.count().get(),
      db.collection("user_runtime").where("lastActiveAt", ">=", dayAgo).count().get(),
      sessionsRef.count().get(),
      eventsRef.where("eventType", "in", ["agent_execution", "agent_execution_error"]).count().get(),
      checkinsRef.count().get(),
      checkinsRef.where("timestamp", ">=", weekAgo).count().get(),
      eventsRef.orderBy("timestamp", "desc").limit(MAX_RECENT_EVENTS).get(),
      riskRadarEnabled
        ? eventsRef.where("timestamp", ">=", weekAgo).orderBy("timestamp", "desc").limit(MAX_RADAR_EVENTS).get()
        : Promise.resolve({ docs: [] }),
    ]);

    const visibleOperationalDocs = recentSnapshot.docs.filter((doc) =>
      riskRadarEnabled || doc.data().eventType !== "risk_signal"
    );
    const recentEvents = visibleOperationalDocs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        agentId: typeof data.agentId === "string" ? data.agentId : "unknown",
        eventType: typeof data.eventType === "string" ? data.eventType : "unknown",
        severity: typeof data.severity === "string" ? data.severity : null,
        success: typeof data.success === "boolean" ? data.success : null,
        responseTime: Number.isFinite(data.responseTime) ? data.responseTime : null,
        errorCode: typeof data.errorCode === "string" ? data.errorCode : null,
        timestamp: asDate(data.timestamp)?.toISOString() || null,
      };
    });
    const executionEvents = recentSnapshot.docs.filter((doc) =>
      ["agent_execution", "agent_execution_error"].includes(doc.data().eventType)
    );
    const responseTimes = executionEvents
      .map((doc) => doc.data().responseTime)
      .filter((value) => Number.isFinite(value) && value >= 0);
    const failedExecutions = recentSnapshot.docs
      .filter((doc) => doc.data().eventType === "agent_execution_error").length;
    const executionSample = recentSnapshot.docs.filter((doc) =>
      ["agent_execution", "agent_execution_error"].includes(doc.data().eventType)
    ).length;
    const errorRate = executionSample ? (failedExecutions / executionSample) * 100 : 0;
    const agentMetrics = Object.fromEntries(IMPLEMENTED_AGENT_IDS.map((agentId) => [agentId, {
      runCount: 0,
      errorCount: 0,
      responseTimes: [],
      lastRunAt: null,
    }]));
    for (const doc of executionEvents) {
      const event = doc.data();
      const agentId = typeof event.agentId === "string" ? event.agentId : "unknown";
      if (!agentMetrics[agentId]) agentMetrics[agentId] = { runCount: 0, errorCount: 0, responseTimes: [], lastRunAt: null };
      const stats = agentMetrics[agentId];
      stats.runCount += 1;
      if (event.success === false || event.eventType === "agent_execution_error") stats.errorCount += 1;
      if (Number.isFinite(event.responseTime) && event.responseTime >= 0) stats.responseTimes.push(event.responseTime);
      if (!stats.lastRunAt) stats.lastRunAt = asDate(event.timestamp)?.toISOString() || null;
    }
    for (const stats of Object.values(agentMetrics)) {
      stats.avgResponseTime = stats.responseTimes.length
        ? Math.round(stats.responseTimes.reduce((sum, value) => sum + value, 0) / stats.responseTimes.length)
        : null;
      stats.health = stats.runCount && (stats.errorCount / stats.runCount) > 0.25 ? "degraded" : stats.runCount ? "healthy" : "unknown";
      stats.sampled = stats.runCount > 0;
      delete stats.responseTimes;
    }

    return {
      generatedAt: new Date(now).toISOString(),
      window: { recentEvents: "latest 100", riskSignals: "last 7 days" },
      metrics: {
        totalUsers: usersCount.data().count,
        activeUsers: activeUsersCount.data().count,
        totalSessions: sessionsCount.data().count,
        totalCheckins: checkinsCount.data().count,
        checkinsLast7Days: recentCheckinsCount.data().count,
        agentExecutions: executionsCount.data().count,
        systemHealth: executionSample === 0 ? "not_measured" : errorRate > 25 ? "degraded" : errorRate > 10 ? "watch" : "healthy",
        errorRate: Math.round(errorRate * 10) / 10,
        avgResponseTime: responseTimes.length
          ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length)
          : null,
      },
      agentMetrics,
      events: recentEvents,
      riskRadarEnabled,
      riskRadar: buildRiskSummary(riskSnapshot.docs, new Date(now)),
    };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[agentOperations] Admin operational snapshot failed", {
      uid: request.auth.uid,
      code: error?.code || "UNKNOWN",
    });
    throw new HttpsError("unavailable", "System visibility is temporarily unavailable. Try refreshing.");
  }
});

/** Return aggregate queue sizes only; application records and PII stay in their review screens. */
const getAdminApplicationQueueCounts = onCall({ region: "us-central1", enforceAppCheck: true }, async (request) => {
  await requireAdminScope(request, "platform.operations.view");
  const db = admin.firestore();
  try {
    const [practitioners, communityGivers] = await Promise.all([
      db.collection("practitioner_applications").where("status", "==", "pending").count().get(),
      db.collection("community_supporter_applications").where("status", "==", "pending").count().get(),
    ]);
    let meetingSources = null;
    try {
      await requireAdminScope(request, "meeting_sources.manage");
      const pendingMeetingSources = await db.collection("recovery_meeting_source_applications")
        .where("status", "==", "pending")
        .count()
        .get();
      meetingSources = pendingMeetingSources.data().count;
    } catch (error) {
      if (!(error instanceof HttpsError) || error.code !== "permission-denied") throw error;
    }
    return {
      practitioner: practitioners.data().count,
      communityGivers: communityGivers.data().count,
      meetingSources,
    };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[agentOperations] Admin application queue counts failed", { uid: request.auth.uid, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "Application queue counts could not be loaded. Try again.");
  }
});

const DEFAULT_SYSTEM_SETTINGS = Object.freeze({
  features: {
    aiSessions: true,
    recoveryTracking: true,
    toolsCatalog: true,
    providersMarketplace: true,
    telemetry: true,
    riskRadar: true,
    notifications: true,
    sessionSharing: true,
  },
  thresholds: {
    riskLevelLow: 3,
    riskLevelMedium: 6,
    riskLevelHigh: 8,
    sessionCompletionRate: 0.7,
    activeUserThreshold: 1,
    errorRateThreshold: 0.1,
  },
  notifications: {
    enabled: true,
    riskAlerts: true,
    sessionReminders: true,
    streakMilestones: true,
    systemUpdates: false,
    frequency: "moderate",
    quietHours: { enabled: true, start: 22, end: 7 },
  },
  agentAutoRun: {
    sentinel: { enabled: true, interval: 15 },
    towncrier: { enabled: true, interval: 5 },
    seer: { enabled: false, interval: null },
    oracle: { enabled: false, interval: null },
    overseer: { enabled: false, interval: null },
  },
});

async function isProductFeatureEnabled(featureId, firestore = admin.firestore()) {
  if (!Object.prototype.hasOwnProperty.call(DEFAULT_SYSTEM_SETTINGS.features, featureId)) {
    throw new TypeError(`Unknown product feature: ${featureId}`);
  }
  const snapshot = await firestore.doc(SYSTEM_SETTINGS_REF).get();
  const storedValue = snapshot.data()?.settings?.features?.[featureId];
  return typeof storedValue === "boolean"
    ? storedValue
    : DEFAULT_SYSTEM_SETTINGS.features[featureId];
}

function normalizeSystemSettings(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpsError("invalid-argument", "Settings must be an object.");
  }
  const result = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
  for (const [key, value] of Object.entries(input.features || {})) {
    if (!(key in result.features) || typeof value !== "boolean") {
      throw new HttpsError("invalid-argument", "A feature setting is invalid.");
    }
    result.features[key] = value;
  }
  const thresholdRanges = {
    riskLevelLow: [0, 10], riskLevelMedium: [0, 10], riskLevelHigh: [0, 10],
    sessionCompletionRate: [0, 1], activeUserThreshold: [0, 365], errorRateThreshold: [0, 1],
  };
  for (const [key, value] of Object.entries(input.thresholds || {})) {
    const range = thresholdRanges[key];
    if (!range || typeof value !== "number" || !Number.isFinite(value) || value < range[0] || value > range[1]) {
      throw new HttpsError("invalid-argument", "A risk or system threshold is invalid.");
    }
    if (key.startsWith("riskLevel") && !Number.isInteger(value)) {
      throw new HttpsError("invalid-argument", "Risk level thresholds must be whole numbers.");
    }
    result.thresholds[key] = value;
  }
  const { riskLevelLow, riskLevelMedium, riskLevelHigh } = result.thresholds;
  if (!(riskLevelLow <= riskLevelMedium && riskLevelMedium <= riskLevelHigh)) {
    throw new HttpsError("invalid-argument", "Risk levels must stay in low-to-high order.");
  }
  const notificationKeys = ["enabled", "riskAlerts", "sessionReminders", "streakMilestones", "systemUpdates"];
  for (const key of notificationKeys) {
    if (key in (input.notifications || {})) {
      if (typeof input.notifications[key] !== "boolean") throw new HttpsError("invalid-argument", "A notification setting is invalid.");
      result.notifications[key] = input.notifications[key];
    }
  }
  const frequency = input.notifications?.frequency;
  if (frequency !== undefined) {
    if (!["low", "moderate", "high"].includes(frequency)) throw new HttpsError("invalid-argument", "Notification frequency is invalid.");
    result.notifications.frequency = frequency;
  }
  const quietHours = input.notifications?.quietHours;
  if (quietHours !== undefined) {
    if (!quietHours || typeof quietHours !== "object" || typeof quietHours.enabled !== "boolean"
      || !Number.isInteger(quietHours.start) || quietHours.start < 0 || quietHours.start > 23
      || !Number.isInteger(quietHours.end) || quietHours.end < 0 || quietHours.end > 23) {
      throw new HttpsError("invalid-argument", "Quiet hours are invalid.");
    }
    result.notifications.quietHours = { enabled: quietHours.enabled, start: quietHours.start, end: quietHours.end };
  }
  // Auto-run is deliberately not remotely configurable until scheduled agent
  // execution is implemented and observable.
  return result;
}

const getAdminSystemSettings = onCall({ region: "us-central1", enforceAppCheck: true }, async (request) => {
  await requireAdminScope(request, "platform.operations.view");
  try {
    const snapshot = await admin.firestore().doc(SYSTEM_SETTINGS_REF).get();
    return {
      settings: normalizeSystemSettings(snapshot.exists ? snapshot.data().settings : {}),
      hasSavedSettings: snapshot.exists && Boolean(snapshot.data().updatedAt),
      updatedAt: snapshot.data()?.updatedAt?.toDate?.()?.toISOString?.() || null,
    };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[agentOperations] Admin system settings read failed", { code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "System settings could not be loaded. Try again.");
  }
});

// Public clients need only the availability of optional practice discovery.
// Keep this response to allowlisted booleans; never expose the admin settings
// document, audit metadata, thresholds, or notification configuration.
const getPublicPracticeAvailability = onCall({ region: "us-central1", enforceAppCheck: true }, async () => {
  try {
    const snapshot = await admin.firestore().doc(SYSTEM_SETTINGS_REF).get();
    const savedFeatures = snapshot.data()?.settings?.features || {};
    return {
      toolsCatalog: typeof savedFeatures.toolsCatalog === "boolean" ? savedFeatures.toolsCatalog : true,
      providersMarketplace: typeof savedFeatures.providersMarketplace === "boolean" ? savedFeatures.providersMarketplace : true,
    };
  } catch (error) {
    console.error("[agentOperations] Public practice availability read failed", { code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "Practice availability could not be checked.");
  }
});

const setAdminSystemSettings = onCall({ region: "us-central1", enforceAppCheck: true }, async (request) => {
  const { uid } = await requireAdminScope(request, "platform.operations.control");
  const settings = normalizeSystemSettings(request.data?.settings);
  try {
    const ref = admin.firestore().doc(SYSTEM_SETTINGS_REF);
    await ref.set({
      settings,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: uid,
    }, { merge: true });
    return { settings, saved: true };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[agentOperations] Admin system settings write failed", { uid, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "Settings were not saved. Your edits are still on this page; try again.");
  }
});

module.exports = {
  IMPLEMENTED_AGENT_IDS,
  getAgentAvailability,
  getAdminAgentControls,
  setAdminAgentControl,
  getAdminOperationalSnapshot,
  getAdminApplicationQueueCounts,
  getAdminSystemSettings,
  getPublicPracticeAvailability,
  setAdminSystemSettings,
  normalizeSystemSettings,
  isProductFeatureEnabled,
  buildRiskSummary,
};
