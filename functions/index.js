// functions/index.js

/**
 * Firebase Functions Entry Point (v1 - Legacy)
 * Note: Milestone engine is in functions/src/index.js (v2)
 */

const functions = require("firebase-functions");
const aiBrain = require("./aiBrain");
const { withCors } = require("./corsHelper");
const { ingestResources } = require("./src/ingestResources");

// Legacy onRequest functions with CORS support
exports.aiSession = functions.https.onRequest(withCors(aiBrain.handleSession));
exports.aiMedia = functions.https.onRequest(withCors(aiBrain.handleMedia));

// ---------------------------
// LIVE RESOURCE SEARCH (FindTreatment.gov)
// ---------------------------
const { searchFindTreatment } = require("./src/findTreatmentClient");
const { searchResourceIndex } = require("./src/resourceIndex");

// Rate limiting (simple in-memory store, consider Redis for production scale)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const key = `rate_limit_${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || now - record.start > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(key, { start: now, count: 1 });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  rateLimitStore.set(key, record);
  return true;
}

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now - record.start > RATE_LIMIT_WINDOW * 2) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW * 2);

exports.searchLiveResources = functions.https.onRequest(withCors(async (req, res) => {
  try {
    // Rate limiting
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || 
                     req.connection?.remoteAddress || 
                     "unknown";
    
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        ok: false,
        error: "Rate limit exceeded. Please try again later.",
      });
    }

    // Check if live search is enabled
    const liveSearchEnabled = process.env.LIVE_SEARCH_ENABLED !== "false";
    if (!liveSearchEnabled) {
      // Fallback to Firestore index only
      const { query, location, category, state, city } = req.body || {};
      const indexResults = await searchResourceIndex({
        query,
        state: state || location,
        city,
        limit: 50,
      });

      return res.json({
        ok: true,
        results: indexResults.map(r => ({
          ...r,
          verification: {
            status: r.verificationStatus || "unverified",
            source: r.source || "findtreatment.gov",
          },
        })),
        source: "firestore_index",
        liveSearchEnabled: false,
      });
    }

    const { query, location, category, state, city, lat, lng, radius } = req.body || {};

    // Build FindTreatment.gov params
    const ftParams = {
      pageSize: 50,
      maxPages: 3, // Limit to 150 results max
    };

    // Location-based search
    if (lat && lng) {
      ftParams.sAddr = `${lat},${lng}`;
      if (radius) {
        ftParams.limitType = 2; // Distance
        ftParams.limitValue = Math.min(50000, parseInt(radius) || 25000); // Max 50km
      }
    } else if (state) {
      ftParams.limitType = 0; // State
      ftParams.limitValue = state.toUpperCase().substring(0, 2);
    } else if (city && state) {
      ftParams.limitType = 1; // County (approximate by city)
      ftParams.limitValue = `${city},${state}`;
    }

    // Service type - only for treatment-related categories
    // For food/housing/grants: return verified Firestore only (no external API yet)
    if (category === "food" || category === "housing" || category === "grants" || category === "funding") {
      // For non-treatment categories: return verified Firestore only
      // Log to admin logs (not user-facing)
      console.log("[searchLiveResources] Non-treatment category - returning verified Firestore only:", {
        category,
        note: "External search coming online for this category",
      });
      
      const indexResults = await searchResourceIndex({
        query,
        state: state || location,
        city,
        limit: 50,
      });
      
      // Filter to verified only for food/housing/grants (no external results yet)
      const verifiedOnly = indexResults
        .filter(r => r.verificationStatus === "verified")
        .map(r => ({
          ...r,
          verification: {
            status: r.verificationStatus,
            source: r.source || "firestore",
          },
        }));

      return res.json({
        ok: true,
        results: verifiedOnly,
        source: "firestore_verified_only",
        counts: {
          verified: verifiedOnly.length,
          live: 0,
        },
      });
    }

    // Treatment-related categories: use FindTreatment.gov
    if (category === "treatment" || category === "detox") {
      ftParams.sType = "sa"; // Substance abuse
    } else if (category === "mental-health") {
      ftParams.sType = "mh"; // Mental health
    } else {
      ftParams.sType = "both";
    }

    // Text search
    if (query) {
      ftParams.name = query;
    }

    // Query FindTreatment.gov
    let ftResults = [];
    try {
      ftResults = await searchFindTreatment(ftParams);
    } catch (ftError) {
      console.error("[searchLiveResources] FindTreatment.gov API error:", ftError.message);
      
      // Fallback to Firestore index
      const indexResults = await searchResourceIndex({
        query,
        state: state || location,
        city,
        limit: 50,
      });

      return res.json({
        ok: true,
        results: indexResults.map(r => ({
          ...r,
          verification: {
            status: r.verificationStatus || "unverified",
            source: r.source || "findtreatment.gov",
          },
        })),
        source: "firestore_index_fallback",
        error: "Live API unavailable, using cached results",
      });
    }

    // Also search Firestore index for verified results
    const indexResults = await searchResourceIndex({
      query,
      state: state || location,
      city,
      limit: 50,
    });

    // Merge: verified first, then live results
    const verifiedResults = indexResults
      .filter(r => r.verificationStatus === "verified")
      .map(r => ({
        ...r,
        verification: {
          status: r.verificationStatus,
          source: r.source || "firestore",
        },
      }));

    const unverifiedResults = ftResults.map(r => ({
      ...r,
      verification: {
        status: "unverified",
        source: "findtreatment.gov",
      },
    }));

    return res.json({
      ok: true,
      results: [...verifiedResults, ...unverifiedResults],
      source: "findtreatment.gov",
      counts: {
        verified: verifiedResults.length,
        live: unverifiedResults.length,
      },
    });

  } catch (error) {
    console.error("[searchLiveResources] Error:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
      message: error.message,
    });
  }
}));

// ---------------------------
// TEMPLATES (STATIC SAMPLES)
// ---------------------------
async function handleTemplates(req, res) {
  // TEMP: Until you add Firestore storage, we return a static sample list.
  const templates = [
    {
      id: "grounding-10",
      title: "10-minute grounding reset",
      summary: "A quick grounding practice to settle your nervous system.",
      category: "Grounding",
      durationMinutes: 10,
    },
    {
      id: "cravings-fast",
      title: "Cravings wave-surf",
      summary: "Ride the wave instead of fighting it.",
      category: "Cravings / urges",
      durationMinutes: 7,
    },
  ];

  return res.json({ templates });
}

// ---------------------------
// TEMPLATE DETAIL
// ---------------------------
async function handleTemplateDetail(req, res, body) {
  const id = body.templateId;

  // For now return a simple placeholder.
  // Later we will store real sessions in Firestore.
  const session = {
    id,
    title: "Sample Session Detail",
    summary: "A practice to help you return to your body and settle.",
    durationMinutes: 10,
    category: "Grounding",

    opening:
      "Find a comfortable position. Let your shoulders drop. Take one slow breath.",

    body: [
      "Notice your feet on the floor.",
      "Feel your hands resting gently.",
      "Let your jaw unclench.",
      "Stay with one breath in… and one breath out.",
    ],

    closing:
      "When you're ready, take one final slow breath and return to the room.",
  };

  return res.json({ template: session });
}

// ---------------------------
// GENERATE CUSTOM SESSION
// ---------------------------
async function handleGenerateSession(req, res, body) {
  const { category, tone, minutes, notes } = body;

  // Build prompt for AI Brain
  const prompt = `
You are WellnessCafe OS.

Create a ${minutes}-minute support session.

CATEGORY: ${category}
TONE: ${tone}
USER NOTES: ${notes || "none"}

Return JSON only:

{
  "opening": "...",
  "body": ["step 1", "step 2", ...],
  "closing": "..."
}
  `;

  // Send to AI Brain
  const ai = await aiBrain({
    mode: "session_generation",
    prompt,
  });

  if (!ai || !ai.text) {
    return res.status(500).json({
      error: "AI did not return a session",
    });
  }

  // Try to parse AI output as JSON
  let session;
  try {
    session = JSON.parse(ai.text);
  } catch {
    // fallback: wrap raw text
    session = { opening: ai.text };
  }

  return res.json({ session });
}

// ==============================
// ADMIN CALLABLE FUNCTIONS
// ==============================
const admin = require("firebase-admin");
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Helper: Check admin claim
async function requireAdmin(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
  }
  const userRecord = await admin.auth().getUser(context.auth.uid);
  const claims = userRecord.customClaims || {};
  if (!claims.admin) {
    throw new functions.https.HttpsError("permission-denied", "Admin access required");
  }
}

exports.adminGetOverview = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  const deployDoc = await db.doc("admin/deploy").get();
  return {
    serverTime: new Date().toISOString(),
    projectId: process.env.GCLOUD_PROJECT || "wellnesscafelanding",
    hostingSite: process.env.HOSTING_SITE || null,
    functionsDeployed: ["adminGetOverview", "adminListUsers", "adminSetClaims", "adminUpdateFeatureFlags", "adminUpdateSystemSettings"],
    buildVersion: process.env.APP_VERSION || "dev",
    lastDeployAt: deployDoc.exists() && deployDoc.data().lastDeployAt ? deployDoc.data().lastDeployAt.toDate().toISOString() : null,
  };
});

exports.adminListUsers = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  const listUsersResult = await admin.auth().listUsers(1000);
  const users = listUsersResult.users.map((user) => ({
    uid: user.uid,
    email: user.email,
    disabled: user.disabled,
    creationTime: user.metadata.creationTime,
    lastSignInTime: user.metadata.lastSignInTime,
    admin: user.customClaims?.admin || false,
  }));
  return { users };
});

exports.adminSetClaims = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  const { uid, claimsPatch } = data;
  if (!uid || !claimsPatch) {
    throw new functions.https.HttpsError("invalid-argument", "uid and claimsPatch required");
  }
  const user = await admin.auth().getUser(uid);
  const mergedClaims = { ...(user.customClaims || {}), ...claimsPatch };
  await admin.auth().setCustomUserClaims(uid, mergedClaims);
  return { claims: mergedClaims };
});

exports.adminUpdateFeatureFlags = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  const { patch } = data;
  if (!patch) {
    throw new functions.https.HttpsError("invalid-argument", "patch required");
  }
  const ref = db.doc("admin/featureFlags");
  await ref.set(patch, { merge: true });
  const updated = await ref.get();
  return updated.data();
});

exports.adminUpdateSystemSettings = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  const { patch } = data;
  if (!patch) {
    throw new functions.https.HttpsError("invalid-argument", "patch required");
  }
  const ref = db.doc("admin/systemSettings");
  await ref.set(patch, { merge: true });
  const updated = await ref.get();
  return updated.data();
});

// ==============================
// GOD-EYE V2: SECURE ADMIN FUNCTIONS
// ==============================

// Set user role (admin claim)
exports.setUserRole = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  const { uid, admin: adminClaim } = data;
  if (!uid || typeof adminClaim !== "boolean") {
    throw new functions.https.HttpsError("invalid-argument", "uid and admin (boolean) required");
  }
  const userRecord = await admin.auth().getUser(uid);
  const mergedClaims = { ...(userRecord.customClaims || {}), admin: adminClaim };
  await admin.auth().setCustomUserClaims(uid, mergedClaims);
  
  // Log telemetry
  await db.collection("telemetry_events").add({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    level: "info",
    source: "function",
    type: "policy",
    metadata: {
      action: "setUserRole",
      uid,
      admin: adminClaim,
      executedBy: context.auth.uid,
    },
  });
  
  return { claims: mergedClaims };
});

// Revoke user sessions (set sessionRevokedAt)
exports.revokeUserSessions = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "uid required");
  }
  
  await db.collection("users").doc(uid).set({
    sessionRevokedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  
  // Log telemetry
  await db.collection("telemetry_events").add({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    level: "info",
    source: "function",
    type: "policy",
    metadata: {
      action: "revokeUserSessions",
      uid,
      executedBy: context.auth.uid,
    },
  });
  
  return { success: true };
});

// Disable user (soft disable)
exports.disableUser = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  const { uid, disabled } = data;
  if (!uid || typeof disabled !== "boolean") {
    throw new functions.https.HttpsError("invalid-argument", "uid and disabled (boolean) required");
  }
  
  await admin.auth().updateUser(uid, { disabled });
  
  await db.collection("users").doc(uid).set({
    disabled,
    disabledAt: disabled ? admin.firestore.FieldValue.serverTimestamp() : null,
  }, { merge: true });
  
  // Log telemetry
  await db.collection("telemetry_events").add({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    level: disabled ? "warn" : "info",
    source: "function",
    type: "policy",
    metadata: {
      action: "disableUser",
      uid,
      disabled,
      executedBy: context.auth.uid,
    },
  });
  
  return { success: true };
});

// Reset user state (clear session data)
exports.resetUserState = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError("invalid-argument", "uid required");
  }
  
  const batch = db.batch();
  batch.delete(db.collection("users").doc(uid).collection("currentSession").doc("active"));
  batch.set(db.collection("users").doc(uid), {
    draftState: null,
    resetAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  await batch.commit();
  
  // Log telemetry
  await db.collection("telemetry_events").add({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    level: "info",
    source: "function",
    type: "policy",
    metadata: {
      action: "resetUserState",
      uid,
      executedBy: context.auth.uid,
    },
  });
  
  return { success: true };
});

// ==============================
// GOD-EYE SUPREME: ENHANCED ADMIN ACTIONS
// ==============================

// Enhanced adminExecuteAction with all action types
async function executeAdminAction(action, context) {
  const actionType = action.actionType || action.type;
  
  switch (actionType) {
    case "SET_FEATURE_FLAG": {
      const settingsRef = db.doc("system_settings/global");
      const settingsDoc = await settingsRef.get();
      const current = settingsDoc.exists ? settingsDoc.data() : {};
      const rollback = current.features?.flags || {};
      
      await settingsRef.set({
        features: {
          ...(current.features || {}),
          flags: { ...rollback, ...action.payload },
        },
      }, { merge: true });
      
      return { rollbackPayload: { features: { flags: rollback } } };
    }
    
    case "SET_THEME_TOKEN": {
      const settingsRef = db.doc("system_settings/global");
      const settingsDoc = await settingsRef.get();
      const current = settingsDoc.exists ? settingsDoc.data() : {};
      const rollback = current.theme?.tokens || {};
      
      await settingsRef.set({
        theme: {
          ...(current.theme || {}),
          tokens: { ...rollback, ...action.payload },
        },
      }, { merge: true });
      
      return { rollbackPayload: { theme: { tokens: rollback } } };
    }

    case "SET_SYSTEM_SETTINGS": {
      const settingsRef = db.doc("system_settings/global");
      const settingsDoc = await settingsRef.get();
      const current = settingsDoc.exists ? settingsDoc.data() : {};
      
      await settingsRef.set({ ...current, ...action.payload }, { merge: true });
      
      return { rollbackPayload: current };
    }

    case "SET_BANNER": {
      const settingsRef = db.doc("system_settings/global");
      await settingsRef.set({
        banners: action.payload,
      }, { merge: true });
      
      return { rollbackPayload: {} };
    }

    case "publishOverride": {
      const overrideRef = db.doc("overrides/current");
      const currentDoc = await overrideRef.get();
      const current = currentDoc.exists ? currentDoc.data() : {};
      
      // Save to history
      await db.collection("overrides/history").add({
        ...current,
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      const newVersion = (current.version || 0) + 1;
      await overrideRef.set({
        ...action.payload,
        version: newVersion,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: context.auth.uid,
        updatedByEmail: context.auth.token.email || null,
      });
      
      return { rollbackPayload: current };
    }

    case "rollbackOverride": {
      const overrideRef = db.doc("overrides/current");
      const currentDoc = await overrideRef.get();
      const current = currentDoc.exists ? currentDoc.data() : {};
      
      // Save current to history
      await db.collection("overrides/history").add({
        ...current,
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // Apply rollback
      await overrideRef.set({
        ...action.payload,
        version: (action.payload.version || 0) + 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: context.auth.uid,
        updatedByEmail: context.auth.token.email || null,
      });
      
      return { rollbackPayload: current };
    }

    case "setMaintenanceMode": {
      const settingsRef = db.doc("system_settings/global");
      const settingsDoc = await settingsRef.get();
      const current = settingsDoc.exists ? settingsDoc.data() : {};
      
      await settingsRef.set({
        guardrails: {
          ...(current.guardrails || {}),
          maintenanceMode: action.payload.enabled,
        },
      }, { merge: true });
      
      return { rollbackPayload: { guardrails: current.guardrails } };
    }

    case "revokeUserSessions": {
      await db.collection("users").doc(action.target).set({
        sessionRevokedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      
      return { rollbackPayload: {} };
    }

    case "setUserDisabled": {
      await admin.auth().updateUser(action.target, { disabled: action.payload.disabled });
      await db.collection("users").doc(action.target).set({
        disabled: action.payload.disabled,
        disabledAt: action.payload.disabled ? admin.firestore.FieldValue.serverTimestamp() : null,
      }, { merge: true });
      
      return { rollbackPayload: {} };
    }

    case "setAdminClaim": {
      const userRecord = await admin.auth().getUser(action.target);
      const mergedClaims = { ...(userRecord.customClaims || {}), ...action.payload };
      await admin.auth().setCustomUserClaims(action.target, mergedClaims);
      
      return { rollbackPayload: { ...userRecord.customClaims } };
    }

    case "resetUserRuntime": {
      const batch = db.batch();
      batch.delete(db.collection("users").doc(action.target).collection("currentSession").doc("active"));
      batch.set(db.collection("users").doc(action.target), {
        draftState: null,
        resetAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      await batch.commit();
      
      return { rollbackPayload: {} };
    }

    default:
      throw new functions.https.HttpsError("invalid-argument", `Unknown action type: ${actionType}`);
  }
}

// Update adminExecuteAction to use enhanced executor
exports.adminExecuteAction = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  const { actionId } = data;
  if (!actionId) {
    throw new functions.https.HttpsError("invalid-argument", "actionId required");
  }
  
  const actionRef = db.collection("admin_actions").doc(actionId);
  const actionDoc = await actionRef.get();
  
  if (!actionDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Action not found");
  }
  
  const action = actionDoc.data();
  if (action.status !== "proposed" && action.status !== "pending") {
    throw new functions.https.HttpsError("failed-precondition", "Action must be proposed/pending");
  }

  // Check guardrails
  const settingsDoc = await db.doc("system_settings/global").get();
  const guardrails = settingsDoc.exists ? (settingsDoc.data().guardrails || {}) : {};
  
  const dangerousActions = ["publishOverride", "rollbackOverride", "setMaintenanceMode"];
  const actionType = action.actionType || action.type;
  if (dangerousActions.includes(actionType) && !guardrails.allowDangerousActions) {
    throw new functions.https.HttpsError("permission-denied", "Dangerous actions require allowDangerousActions=true");
  }
  
  try {
    // Execute using enhanced executor
    const result = await executeAdminAction(action, context);
    
    await actionRef.update({
      status: "executed",
      executedAt: admin.firestore.FieldValue.serverTimestamp(),
      executedByUid: context.auth.uid,
      ...(result?.rollbackPayload ? { rollbackPayload: result.rollbackPayload } : {}),
    });
    
    // Log telemetry
    await db.collection("telemetry_events").add({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      level: "info",
      source: "function",
      type: "policy",
      metadata: {
        action: "adminExecuteAction",
        actionId,
        actionType: action.actionType || action.type,
        executedBy: context.auth.uid,
      },
    });
    
    return { success: true };
  } catch (err) {
    await actionRef.update({
      status: "failed",
      executedAt: admin.firestore.FieldValue.serverTimestamp(),
      error: err.message,
    });
    throw new functions.https.HttpsError("internal", err.message);
  }
});

// ==============================
// GOD-EYE V2: RISK FORECASTING
// ==============================

// Scheduled function to compute risk scores every 15 minutes
exports.computeRiskForecasts = functions.pubsub.schedule("every 15 minutes").onRun(async (context) => {
  const db = admin.firestore();
  const now = Date.now();
  const fifteenMinAgo = admin.firestore.Timestamp.fromMillis(now - 15 * 60 * 1000);

  try {
    // Get all users with recent telemetry
    const telemetryRef = db.collection("telemetry_events");
    const recentEvents = await telemetryRef
      .where("createdAt", ">=", fifteenMinAgo)
      .get();

    // Group events by uid
    const eventsByUid = {};
    recentEvents.docs.forEach((doc) => {
      const data = doc.data();
      const uid = data.uid;
      if (uid) {
        if (!eventsByUid[uid]) {
          eventsByUid[uid] = [];
        }
        eventsByUid[uid].push(data);
      }
    });

    // Compute risk score for each user
    const batch = db.batch();
    
    for (const [uid, events] of Object.entries(eventsByUid)) {
      let riskScore = 0;
      const reasons = [];
      const predictedIssues = [];

      // Heuristics:
      // - Repeated offline/online flapping
      const onlineOfflineFlaps = events.filter(e => e.type === "network" && (e.metadata?.action === "online" || e.metadata?.action === "offline")).length;
      if (onlineOfflineFlaps > 3) {
        riskScore += 20;
        reasons.push("Repeated connection instability");
      }

      // - Repeated error boundaries
      const errorCount = events.filter(e => e.level === "error" && e.type === "crash").length;
      if (errorCount > 2) {
        riskScore += 30;
        reasons.push("Multiple application errors");
        predictedIssues.push({ type: "crash_risk", probability: 0.6, windowMinutes: 30 });
      }

      // - Rapid emotion swings (if present)
      // This would require emotion data in telemetry - placeholder
      
      // - Abandonment during tool session
      const toolAbandonments = events.filter(e => e.type === "tool" && e.metadata?.action === "tool_open").length - 
                              events.filter(e => e.type === "tool" && e.metadata?.action === "tool_close").length;
      if (toolAbandonments > 2) {
        riskScore += 15;
        reasons.push("Multiple incomplete tool sessions");
      }

      // - Repeated failed requests
      const failedRequests = events.filter(e => e.type === "network" && e.level === "error").length;
      if (failedRequests > 5) {
        riskScore += 25;
        reasons.push("Multiple network failures");
        predictedIssues.push({ type: "disconnect_risk", probability: 0.7, windowMinutes: 15 });
      }

      // Clamp risk score 0-100
      riskScore = Math.min(100, Math.max(0, riskScore));

      // Save risk forecast
      const riskRef = db.collection("risk_forecast").doc(uid);
      batch.set(riskRef, {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        uid,
        email: events[0]?.email || null,
        riskScore,
        reasons: reasons.slice(0, 5), // Limit reasons
        predictedIssues,
      }, { merge: true });

      // Also save per-user summary
      const userRiskRef = db.collection("users").doc(uid).collection("private").doc("risk");
      batch.set(userRiskRef, {
        riskScore,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    await batch.commit();
    console.log(`[computeRiskForecasts] Processed ${Object.keys(eventsByUid).length} users`);
    return null;
  } catch (err) {
    console.error("[computeRiskForecasts] Error:", err);
    return null;
  }
});

// ==============================
// GOD-EYE SUPREME: ANOMALY DETECTION
// ==============================

exports.runAnomalyDetection = functions.pubsub.schedule("every 5 minutes").onRun(async (context) => {
  const db = admin.firestore();
  const now = Date.now();
  const fiveMinAgo = admin.firestore.Timestamp.fromMillis(now - 5 * 60 * 1000);
  const oneHourAgo = admin.firestore.Timestamp.fromMillis(now - 60 * 60 * 1000);

  try {
    // Get baseline (last hour)
    const telemetryRef = db.collection("telemetry_events");
    const baselineSnapshot = await telemetryRef
      .where("createdAt", ">=", oneHourAgo)
      .where("createdAt", "<", fiveMinAgo)
      .get();
    
    const recentSnapshot = await telemetryRef
      .where("createdAt", ">=", fiveMinAgo)
      .get();

    // Count errors
    const baselineErrors = baselineSnapshot.docs.filter(d => d.data().level === "error").length;
    const recentErrors = recentSnapshot.docs.filter(d => d.data().level === "error").length;
    
    // Count offline events
    const baselineOffline = baselineSnapshot.docs.filter(d => 
      d.data().type === "network" && d.data().metadata?.action === "offline"
    ).length;
    const recentOffline = recentSnapshot.docs.filter(d => 
      d.data().type === "network" && d.data().metadata?.action === "offline"
    ).length;

    // Detect spikes
    const errorSpike = recentErrors > baselineErrors * 2 && recentErrors > 5;
    const offlineSpike = recentOffline > baselineOffline * 3 && recentOffline > 10;

    if (errorSpike || offlineSpike) {
      const incidentsRef = db.collection("incidents/current");
      const existing = await incidentsRef.where("status", "==", "open").limit(1).get();
      
      if (existing.empty) {
        await incidentsRef.add({
          openedAt: admin.firestore.FieldValue.serverTimestamp(),
          severity: errorSpike ? "high" : "medium",
          type: errorSpike ? "error_spike" : "network_spike",
          title: errorSpike ? "Error rate spike detected" : "Network instability detected",
          status: "open",
          summary: errorSpike 
            ? `Error count increased from ${baselineErrors} to ${recentErrors} in last 5 minutes`
            : `Offline events increased from ${baselineOffline} to ${recentOffline} in last 5 minutes`,
          metrics: {
            baselineErrors,
            recentErrors,
            baselineOffline,
            recentOffline,
          },
          lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Update existing incident
        await existing.docs[0].ref.update({
          metrics: {
            baselineErrors,
            recentErrors,
            baselineOffline,
            recentOffline,
          },
          lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    return null;
  } catch (err) {
    console.error("[runAnomalyDetection] Error:", err);
    return null;
  }
});

// ---------------------------
// SCHEDULED INGESTION (Cloud Scheduler)
// ---------------------------
exports.scheduledIngestResources = functions.pubsub
  .schedule("0 2 * * *") // Daily at 2 AM UTC
  .timeZone("UTC")
  .onRun(async (context) => {
    try {
      const result = await ingestResources({
        states: process.env.INGEST_STATES?.split(",") || undefined,
        maxPagesPerState: parseInt(process.env.INGEST_MAX_PAGES_PER_STATE || "5"),
      });
      console.log("[scheduledIngestResources] Completed:", result);
      return result;
    } catch (error) {
      console.error("[scheduledIngestResources] Error:", error);
      throw error;
    }
  });

// ---------------------------
// MANUAL INGESTION TRIGGER (Admin-only callable)
// ---------------------------
exports.manualIngestResources = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  
  const { states, maxPagesPerState } = data || {};
  
  try {
    const result = await ingestResources({
      states: states || undefined,
      maxPagesPerState: maxPagesPerState || 5,
    });
    return { ok: true, ...result };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ---------------------------
// SEED VERIFIED PROVIDERS (Admin-only callable, dev/staging only)
// ---------------------------
const { seedVerifiedProviders } = require("./src/seedVerifiedProviders");

exports.seedVerifiedProviders = functions.https.onCall(async (data, context) => {
  await requireAdmin(context);
  
  try {
    const result = await seedVerifiedProviders(data, context);
    return { ok: true, ...result };
  } catch (error) {
    if (error.code === "failed-precondition" || error.code === "permission-denied") {
      throw error; // Re-throw auth errors
    }
    throw new functions.https.HttpsError("internal", error.message);
  }
});

