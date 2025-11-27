// src/services/providerTimeline.js
// Service for building client emotional timelines from telemetry

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit as fsLimit,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getSessionHistory } from "./sessionHistory";
import { getTelemetrySnapshot } from "./telemetry";

/**
 * Get emotional timeline for a client
 * @param {string} clientId - Client's user ID or anonymous ID
 * @param {Object} options - { days?: number, limit?: number }
 * @returns {Promise<{ok: boolean, events?: Array, error?: string}>}
 */
export async function getClientTimeline(clientId, options = {}) {
  if (!clientId) {
    return { ok: false, error: "Client ID required", events: [] };
  }

  const { days = 30, limit: eventLimit = 100 } = options;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const events = [];

  // Try to get telemetry from Firestore
  if (db) {
    try {
      // Query telemetry collection (if it exists)
      const telemetryRef = collection(db, "telemetry");
      const q = query(
        telemetryRef,
        where("userId", "==", clientId),
        where("ts", ">=", cutoffDate.toISOString()),
        orderBy("ts", "desc"),
        limit(eventLimit)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const eventType = data.type || data.event?.kind || "unknown";
        
        // Map telemetry events to timeline format
        if (eventType === "chat" || eventType === "action") {
          events.push({
            id: docSnap.id,
            timestamp: data.ts || data.timestamp || new Date().toISOString(),
            type: "chat",
            label: data.event?.actionId || "Chat interaction",
            emotionScore: extractEmotionScore(data),
            riskScore: extractRiskScore(data),
            notes: data.event?.meta?.summary || null,
          });
        } else if (eventType === "tool_usage" || eventType === "tool") {
          events.push({
            id: docSnap.id,
            timestamp: data.ts || data.timestamp || new Date().toISOString(),
            type: "tool",
            label: `Used ${data.event?.toolId || "tool"}`,
            toolId: data.event?.toolId || null,
            emotionScore: extractEmotionScore(data),
            riskScore: extractRiskScore(data),
            notes: data.event?.meta?.summary || null,
          });
        } else if (eventType === "directory" || eventType === "search") {
          events.push({
            id: docSnap.id,
            timestamp: data.ts || data.timestamp || new Date().toISOString(),
            type: "directory",
            label: `Searched ${data.event?.domain || "directory"}`,
            domain: data.event?.domain || null,
            emotionScore: extractEmotionScore(data),
            riskScore: extractRiskScore(data),
            notes: data.event?.query || null,
          });
        }
      });
    } catch (err) {
      console.warn("Failed to query telemetry from Firestore:", err);
    }
  }

  // Get session history (from localStorage)
  try {
    const sessionHistory = getSessionHistory();
    sessionHistory.forEach((session) => {
      if (session.savedAt || session.createdAt) {
        const sessionDate = new Date(session.savedAt || session.createdAt);
        if (sessionDate >= cutoffDate) {
          events.push({
            id: `session-${session.id}`,
            timestamp: session.savedAt || session.createdAt,
            type: "session",
            label: session.title || session.category || "Wellness session",
            emotionScore: null, // Could be extracted from session data
            riskScore: null,
            notes: session.category || null,
          });
        }
      }
    });
  } catch (err) {
    console.warn("Failed to get session history:", err);
  }

  // Sort all events by timestamp (newest first)
  events.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  // Limit to requested number
  const limitedEvents = events.slice(0, eventLimit);

  return { ok: true, events: limitedEvents };
}

/**
 * Extract emotion score from telemetry data
 * @private
 */
function extractEmotionScore(data) {
  // Look for emotion score in various places
  if (data.emotionScore !== undefined) return data.emotionScore;
  if (data.event?.meta?.emotionScore !== undefined) return data.event.meta.emotionScore;
  if (data.meta?.emotionScore !== undefined) return data.meta.emotionScore;
  
  // Try to infer from risk level
  if (data.riskLevel) {
    const riskMap = { low: 0.3, medium: 0, high: -0.5, critical: -0.8 };
    return riskMap[data.riskLevel.toLowerCase()] || null;
  }
  
  return null;
}

/**
 * Extract risk score from telemetry data
 * @private
 */
function extractRiskScore(data) {
  // Look for risk score in various places
  if (data.riskScore !== undefined) return data.riskScore;
  if (data.event?.meta?.riskScore !== undefined) return data.event.meta.riskScore;
  if (data.meta?.riskScore !== undefined) return data.meta.riskScore;
  
  // Try to infer from risk level
  if (data.riskLevel) {
    const riskMap = { low: 20, medium: 50, high: 75, critical: 90 };
    return riskMap[data.riskLevel.toLowerCase()] || null;
  }
  
  // Try to infer from severity
  if (data.severity) {
    const severityMap = { low: 20, warning: 50, critical: 90 };
    return severityMap[data.severity.toLowerCase()] || null;
  }
  
  return null;
}

/**
 * Get timeline summary statistics
 * @param {string} clientId - Client's user ID
 * @param {Object} options - { days?: number }
 * @returns {Promise<{ok: boolean, summary?: Object, error?: string}>}
 */
export async function getTimelineSummary(clientId, options = {}) {
  const timelineResult = await getClientTimeline(clientId, options);
  
  if (!timelineResult.ok) {
    return timelineResult;
  }

  const events = timelineResult.events || [];
  
  // Calculate statistics
  const emotionScores = events
    .map(e => e.emotionScore)
    .filter(s => s !== null && s !== undefined);
  
  const riskScores = events
    .map(e => e.riskScore)
    .filter(s => s !== null && s !== undefined);
  
  const avgEmotion = emotionScores.length > 0
    ? emotionScores.reduce((a, b) => a + b, 0) / emotionScores.length
    : null;
  
  const avgRisk = riskScores.length > 0
    ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length
    : null;
  
  const maxRisk = riskScores.length > 0 ? Math.max(...riskScores) : null;
  
  // Count by type
  const byType = {};
  events.forEach(e => {
    byType[e.type] = (byType[e.type] || 0) + 1;
  });

  return {
    ok: true,
    summary: {
      totalEvents: events.length,
      avgEmotionScore: avgEmotion,
      avgRiskScore: avgRisk,
      maxRiskScore: maxRisk,
      eventsByType: byType,
      dateRange: {
        start: events.length > 0 ? events[events.length - 1].timestamp : null,
        end: events.length > 0 ? events[0].timestamp : null,
      },
    },
  };
}

/**
 * Log a risk snapshot for provider timeline
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.riskLevel - Risk level
 * @param {string[]} params.reasons - Risk reasons
 * @param {Object} params.emotion - Emotion analysis result
 * @returns {Promise<void>}
 */
export async function logRiskSnapshot({ userId, riskLevel, reasons, emotion }) {
  try {
    if (!userId || !riskLevel) {
      console.warn("logRiskSnapshot: Missing required fields");
      return;
    }

    const snapshot = {
      userId,
      riskLevel,
      reasons: reasons || [],
      emotion: emotion || null,
      timestamp: Date.now(),
    };

    // Log to console for Phase 17
    console.log("[provider-timeline] Risk snapshot:", snapshot);

    // Optionally write to Firestore if collection exists
    if (db) {
      try {
        await addDoc(collection(db, "risk_snapshots"), {
          ...snapshot,
          createdAt: new Date(snapshot.timestamp),
        });
      } catch (err) {
        // Silently fail if Firestore write fails
        console.warn("Failed to write risk snapshot to Firestore (non-critical):", err.message);
      }
    }
  } catch (err) {
    // Never throw - best effort only
    console.warn("logRiskSnapshot failed (non-critical):", err.message);
  }
}

/**
 * Get recent risk snapshots for provider or client.
 * Best-effort: returns [] on failure.
 */
export async function getRecentRiskSnapshots({ providerId, clientId, limit: limitCount = 20 } = {}) {
  try {
    if (!db) {
      return [];
    }

    const col = collection(db, "risk_snapshots");
    let q = query(col, orderBy("createdAt", "desc"), limit(limitCount));

    if (providerId) {
      q = query(col, where("providerId", "==", providerId), orderBy("createdAt", "desc"), limit(limitCount));
    }

    if (clientId) {
      q = query(col, where("userId", "==", clientId), orderBy("createdAt", "desc"), limit(limitCount));
    }

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (err) {
    console.warn("[providerTimeline] Failed to read snapshots:", err);
    return [];
  }
}

/**
 * Normalize a raw Firestore doc into a risk event object.
 * This must be safe even if fields are missing.
 */
function normalizeRiskEvent(doc) {
  const data = doc.data?.() || doc.data || {};

  // Handle Firestore Timestamp conversion
  let createdAt = Date.now();
  if (data.createdAt) {
    if (data.createdAt.toMillis && typeof data.createdAt.toMillis === "function") {
      createdAt = data.createdAt.toMillis();
    } else if (data.createdAt.seconds) {
      createdAt = data.createdAt.seconds * 1000;
    } else if (typeof data.createdAt === "number") {
      createdAt = data.createdAt;
    } else if (data.createdAt instanceof Date) {
      createdAt = data.createdAt.getTime();
    }
  }

  return {
    id: doc.id || data.id || `${Date.now()}-${Math.random()}`,
    userId: data.userId || null,
    riskLevel: data.riskLevel || "low",
    reasons: Array.isArray(data.reasons) ? data.reasons : [],
    domains: Array.isArray(data.domains) ? data.domains : [],
    emotion: data.emotion || null,
    createdAt,
  };
}

/**
 * List recent risk events for a given user.
 * Safe: Returns [] if Firestore is not configured or collection doesn't exist.
 *
 * @param {string} userId
 * @param {{ limit?: number }} options
 * @returns {Promise<Array>}
 */
export async function listRecentRiskEvents(userId, { limit = 50 } = {}) {
  if (!userId) {
    return [];
  }

  try {
    if (!db) {
      return [];
    }

    const colRef = collection(db, "riskEvents");
    const q = query(
      colRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      fsLimit(limit)
    );

    const snapshot = await getDocs(q);
    const events = snapshot.docs.map((doc) => normalizeRiskEvent(doc));

    return events.sort((a, b) => b.createdAt - a.createdAt);
  } catch (_err) {
    // Best-effort only; never break the app if this fails.
    console.warn("[providerTimeline] listRecentRiskEvents failed, returning []");
    return [];
  }
}

export default {
  getClientTimeline,
  getTimelineSummary,
  logRiskSnapshot,
  getRecentRiskSnapshots,
  listRecentRiskEvents,
};

