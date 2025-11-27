// src/api/dataClient.js

/**
 * Data Client
 * Centralized data fetching API for scalability
 * Prepares for future remote API and server-side inference
 */

import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { getCache, setCache, hasValidCache } from "../stores/cacheStore";
import { safeLimit, safeMapping, parallelQueries } from "../utils/queryOptimizer";

/**
 * Get client emotional timeline
 * @param {string} clientId - Client user ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} Timeline events
 */
export async function getClientEmotionalTimeline(clientId, options = {}) {
  if (!db || !clientId) {
    return [];
  }

  const {
    limit: requestedLimit = 50,
    daysBack = 30,
    useCache = true,
  } = options;

  const cacheKey = `timeline_${clientId}_${requestedLimit}_${daysBack}`;
  
  if (useCache && hasValidCache(cacheKey)) {
    return getCache(cacheKey);
  }

  try {
    const limitValue = safeLimit(requestedLimit, 100);
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysBack);

    // Parallel queries for performance
    const [toolUsageSnapshot, agentEventsSnapshot, telemetrySnapshot] = await parallelQueries([
      getDocs(
        query(
          collection(db, "tool_usage"),
          where("userId", "==", clientId),
          where("createdAt", ">=", thresholdDate),
          orderBy("createdAt", "desc"),
          limit(limitValue)
        )
      ).catch(() => ({ docs: [] })),
      getDocs(
        query(
          collection(db, "agent_events"),
          where("userId", "==", clientId),
          where("timestamp", ">=", thresholdDate),
          orderBy("timestamp", "desc"),
          limit(limitValue)
        )
      ).catch(() => ({ docs: [] })),
      getDocs(
        query(
          collection(db, "telemetry_events"),
          where("userId", "==", clientId),
          where("createdAt", ">=", thresholdDate),
          orderBy("createdAt", "desc"),
          limit(limitValue)
        )
      ).catch(() => ({ docs: [] })),
    ]);

    const timeline = [
      ...safeMapping(toolUsageSnapshot.docs, (data) => ({
        id: `tool_${data.id}`,
        type: "tool_usage",
        timestamp: data.createdAt?.toDate?.() || new Date(data.createdAt),
        ...data,
      })),
      ...safeMapping(agentEventsSnapshot.docs, (data) => ({
        id: `agent_${data.id}`,
        type: "risk_event",
        timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
        ...data,
      })),
      ...safeMapping(telemetrySnapshot.docs, (data) => ({
        id: `telemetry_${data.id}`,
        type: data.type || "telemetry",
        timestamp: data.createdAt?.toDate?.() || new Date(data.createdAt),
        ...data,
      })),
    ];

    // Sort by timestamp
    timeline.sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
      return bTime - aTime;
    });

    const limited = timeline.slice(0, limitValue);

    // Cache for 1 minute
    if (useCache) {
      setCache(cacheKey, limited, 60 * 1000);
    }

    return limited;
  } catch (err) {
    console.warn("Get client timeline failed (non-critical):", err.message);
    return [];
  }
}

/**
 * Get provider assignments
 * @param {string} providerId - Provider user ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} Assignments
 */
export async function getProviderAssignments(providerId, options = {}) {
  if (!db || !providerId) {
    return [];
  }

  const { useCache = true } = options;
  const cacheKey = `assignments_${providerId}`;
  
  if (useCache && hasValidCache(cacheKey)) {
    return getCache(cacheKey);
  }

  try {
    const q = query(
      collection(db, "client_assignments"),
      where("providerId", "==", providerId),
      where("active", "==", true),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const assignments = safeMapping(snapshot.docs);

    // Cache for 2 minutes
    if (useCache) {
      setCache(cacheKey, assignments, 2 * 60 * 1000);
    }

    return assignments;
  } catch (err) {
    console.warn("Get provider assignments failed (non-critical):", err.message);
    return [];
  }
}

/**
 * Get recent events for a client
 * @param {string} clientId - Client user ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} Recent events
 */
export async function getRecentEventsForClient(clientId, options = {}) {
  if (!db || !clientId) {
    return [];
  }

  const {
    limit: requestedLimit = 10,
    eventType = null,
    useCache = true,
  } = options;

  const cacheKey = `recent_events_${clientId}_${requestedLimit}_${eventType || "all"}`;
  
  if (useCache && hasValidCache(cacheKey)) {
    return getCache(cacheKey);
  }

  try {
    const limitValue = safeLimit(requestedLimit, 50);
    
    let q = query(
      collection(db, "agent_events"),
      where("userId", "==", clientId),
      orderBy("timestamp", "desc"),
      limit(limitValue)
    );

    if (eventType) {
      q = query(q, where("eventType", "==", eventType));
    }

    const snapshot = await getDocs(q);
    const events = safeMapping(snapshot.docs);

    // Cache for 30 seconds
    if (useCache) {
      setCache(cacheKey, events, 30 * 1000);
    }

    return events;
  } catch (err) {
    console.warn("Get recent events failed (non-critical):", err.message);
    return [];
  }
}

/**
 * Get admin metrics
 * @param {object} options - Query options
 * @returns {Promise<object>} System metrics
 */
export async function getAdminMetrics(options = {}) {
  if (!db) {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalSessions: 0,
      agentExecutions: 0,
      systemHealth: "unknown",
      errorRate: 0,
      avgResponseTime: 0,
    };
  }

  const { useCache = true } = options;
  const cacheKey = "admin_metrics";
  
  if (useCache && hasValidCache(cacheKey)) {
    return getCache(cacheKey);
  }

  try {
    // Parallel queries for performance
    const [usersSnapshot, sessionsSnapshot, agentEventsSnapshot] = await parallelQueries([
      getDocs(collection(db, "users")).catch(() => ({ docs: [] })),
      getDocs(collection(db, "sessions")).catch(() => ({ docs: [] })),
      getDocs(
        query(
          collection(db, "agent_events"),
          orderBy("timestamp", "desc"),
          limit(1000)
        )
      ).catch(() => ({ docs: [] })),
    ]);

    const totalUsers = usersSnapshot.docs.length;
    const activeUsers = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      const lastActive = data.lastActive?.toMillis?.() || data.lastActive || 0;
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return lastActive > dayAgo;
    }).length;

    const totalSessions = sessionsSnapshot.docs.length;
    const agentExecutions = agentEventsSnapshot.docs.length;

    // Calculate error rate and avg response time
    const executions = safeMapping(agentEventsSnapshot.docs);
    const failed = executions.filter((e) => !e.success).length;
    const errorRate = executions.length > 0 ? (failed / executions.length) * 100 : 0;
    const responseTimes = executions
      .filter((e) => e.responseTime)
      .map((e) => e.responseTime);
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

    // Determine system health
    let systemHealth = "healthy";
    if (errorRate > 10) systemHealth = "degraded";
    if (errorRate > 25) systemHealth = "down";

    const metrics = {
      totalUsers,
      activeUsers,
      totalSessions,
      agentExecutions,
      systemHealth,
      uptime: 0,
      errorRate: Math.round(errorRate * 10) / 10,
      avgResponseTime,
    };

    // Cache for 30 seconds
    if (useCache) {
      setCache(cacheKey, metrics, 30 * 1000);
    }

    return metrics;
  } catch (err) {
    console.warn("Get admin metrics failed (non-critical):", err.message);
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalSessions: 0,
      agentExecutions: 0,
      systemHealth: "unknown",
      errorRate: 0,
      avgResponseTime: 0,
    };
  }
}

/**
 * Subscribe to real-time client timeline
 * @param {string} clientId - Client user ID
 * @param {Function} callback - Callback function
 * @param {object} options - Query options
 * @returns {Function} Unsubscribe function
 */
export function subscribeClientTimeline(clientId, callback, options = {}) {
  if (!db || !clientId) {
    return () => {};
  }

  const { limit: requestedLimit = 50 } = options;
  const limitValue = safeLimit(requestedLimit, 100);

  const unsubscribers = [];

  // Subscribe to tool_usage
  const toolUsageUnsub = onSnapshot(
    query(
      collection(db, "tool_usage"),
      where("userId", "==", clientId),
      orderBy("createdAt", "desc"),
      limit(limitValue)
    ),
    (snapshot) => {
      const events = safeMapping(snapshot.docs, (data) => ({
        id: `tool_${data.id}`,
        type: "tool_usage",
        timestamp: data.createdAt?.toDate?.() || new Date(data.createdAt),
        ...data,
      }));
      callback(events);
    },
    (err) => {
      console.warn("Timeline subscription error (non-critical):", err.message);
    }
  );
  unsubscribers.push(toolUsageUnsub);

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

