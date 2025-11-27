// src/ai/predictive/predictiveDataAggregator.js

/**
 * Predictive Data Aggregator
 * Fetches and aggregates emotional telemetry for a single client
 */

import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { safeLimit } from "../../utils/queryOptimizer";
import { DEFAULT_ANALYSIS_WINDOW_DAYS } from "./predictiveConfig";

/**
 * Get telemetry window for a client
 * @param {string} clientId - Client user ID
 * @param {object} options - Query options
 * @param {number} options.days - Number of days to look back (default: 7)
 * @returns {Promise<object>} Aggregated telemetry window
 */
export async function getClientTelemetryWindow(clientId, options = {}) {
  if (!db || !clientId) {
    return {
      clientId,
      fromDate: null,
      toDate: null,
      toolEvents: [],
      chatEvents: [],
      sessionEvents: [],
      agentEvents: [],
      totalDataPoints: 0,
      hasInsufficientData: true,
    };
  }

  const { days = DEFAULT_ANALYSIS_WINDOW_DAYS } = options;
  
  try {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    
    const fromTimestamp = Timestamp.fromDate(fromDate);
    const toTimestamp = Timestamp.fromDate(toDate);

    // Parallel queries for performance
    const [toolEvents, chatEvents, sessionEvents, agentEvents] = await Promise.all([
      fetchToolEvents(clientId, fromTimestamp, toTimestamp),
      fetchChatEvents(clientId, fromTimestamp, toTimestamp),
      fetchSessionEvents(clientId, fromTimestamp, toTimestamp),
      fetchAgentEvents(clientId, fromTimestamp, toTimestamp),
    ]);

    const totalDataPoints = 
      toolEvents.length + 
      chatEvents.length + 
      sessionEvents.length + 
      agentEvents.length;

    return {
      clientId,
      fromDate,
      toDate,
      toolEvents,
      chatEvents,
      sessionEvents,
      agentEvents,
      totalDataPoints,
      hasInsufficientData: totalDataPoints < 3, // Minimum threshold
    };
  } catch (err) {
    console.warn("Failed to aggregate client telemetry (non-critical):", err.message);
    return {
      clientId,
      fromDate: null,
      toDate: null,
      toolEvents: [],
      chatEvents: [],
      sessionEvents: [],
      agentEvents: [],
      totalDataPoints: 0,
      hasInsufficientData: true,
    };
  }
}

/**
 * Fetch tool usage events
 */
async function fetchToolEvents(clientId, fromTimestamp, toTimestamp) {
  try {
    const q = query(
      collection(db, "tool_usage"),
      where("userId", "==", clientId),
      where("createdAt", ">=", fromTimestamp),
      where("createdAt", "<=", toTimestamp),
      orderBy("createdAt", "desc"),
      limit(safeLimit(200, 500))
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      type: "tool_usage",
      ...doc.data(),
      timestamp: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
    }));
  } catch (err) {
    console.warn("Failed to fetch tool events (non-critical):", err.message);
    return [];
  }
}

/**
 * Fetch chat message events
 */
async function fetchChatEvents(clientId, fromTimestamp, toTimestamp) {
  try {
    const q = query(
      collection(db, "telemetry_events"),
      where("userId", "==", clientId),
      where("type", "==", "chat_message"),
      where("createdAt", ">=", fromTimestamp),
      where("createdAt", "<=", toTimestamp),
      orderBy("createdAt", "desc"),
      limit(safeLimit(200, 500))
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: "chat_message",
        ...data,
        timestamp: data.createdAt?.toDate?.() || new Date(data.createdAt),
        messageText: data.messageText || data.content || "",
        tags: data.tags || [],
        riskScore: data.riskScore || 0,
      };
    });
  } catch (err) {
    console.warn("Failed to fetch chat events (non-critical):", err.message);
    return [];
  }
}

/**
 * Fetch session events
 */
async function fetchSessionEvents(clientId, fromTimestamp, toTimestamp) {
  try {
    // Query session_logs where clientId is in userIds array
    const q = query(
      collection(db, "session_logs"),
      where("createdAt", ">=", fromTimestamp),
      where("createdAt", "<=", toTimestamp),
      orderBy("createdAt", "desc"),
      limit(safeLimit(200, 500))
    );

    const snapshot = await getDocs(q);
    return snapshot.docs
      .filter((doc) => {
        const data = doc.data();
        const userIds = Array.isArray(data.userIds) ? data.userIds : [];
        return userIds.includes(clientId);
      })
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: "session_event",
          ...data,
          timestamp: data.createdAt?.toDate?.() || new Date(data.createdAt),
          summaryText: data.summaryText || data.notes || "",
          groupType: data.groupType || "unknown",
        };
      });
  } catch (err) {
    console.warn("Failed to fetch session events (non-critical):", err.message);
    return [];
  }
}

/**
 * Fetch agent events
 */
async function fetchAgentEvents(clientId, fromTimestamp, toTimestamp) {
  try {
    const q = query(
      collection(db, "agent_events"),
      where("userId", "==", clientId),
      where("timestamp", ">=", fromTimestamp),
      where("timestamp", "<=", toTimestamp),
      orderBy("timestamp", "desc"),
      limit(safeLimit(200, 500))
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: "agent_event",
        ...data,
        timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
        severity: data.severity || "moderate",
        eventType: data.eventType || "unknown",
        tags: data.meta?.evaluation?.tags || [],
      };
    });
  } catch (err) {
    console.warn("Failed to fetch agent events (non-critical):", err.message);
    return [];
  }
}

