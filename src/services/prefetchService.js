// src/services/prefetchService.js

/**
 * Prefetch Service
 * Implements predictive prefetching for improved performance
 */

import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { getCache, setCache, hasValidCache } from "../stores/cacheStore";
import { safeLimit } from "../utils/queryOptimizer";

/**
 * Prefetch assigned clients for a provider
 * @param {string} providerId - Provider user ID
 */
export async function prefetchAssignedClients(providerId) {
  if (!db || !providerId) return;

  const cacheKey = `assigned_clients_${providerId}`;
  
  // Check cache first
  if (hasValidCache(cacheKey)) {
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
    const clients = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Cache for 2 minutes
    setCache(cacheKey, clients, 2 * 60 * 1000);
    
    return clients;
  } catch (err) {
    console.warn("Prefetch assigned clients failed (non-critical):", err.message);
    return [];
  }
}

/**
 * Prefetch emotional events for a client
 * @param {string} clientId - Client user ID
 * @param {number} eventLimit - Number of events to prefetch (default: 10)
 */
export async function prefetchClientEmotionalEvents(clientId, eventLimit = 10) {
  if (!db || !clientId) return;

  const cacheKey = `client_events_${clientId}`;
  
  // Check cache first
  if (hasValidCache(cacheKey)) {
    return getCache(cacheKey);
  }

  try {
    const limitValue = safeLimit(eventLimit, 20);
    
    // Prefetch from multiple collections in parallel
    const [toolUsageSnapshot, agentEventsSnapshot, telemetrySnapshot] = await Promise.all([
      getDocs(
        query(
          collection(db, "tool_usage"),
          where("userId", "==", clientId),
          orderBy("createdAt", "desc"),
          limit(limitValue)
        )
      ).catch(() => ({ docs: [] })),
      getDocs(
        query(
          collection(db, "agent_events"),
          where("userId", "==", clientId),
          orderBy("timestamp", "desc"),
          limit(limitValue)
        )
      ).catch(() => ({ docs: [] })),
      getDocs(
        query(
          collection(db, "telemetry_events"),
          where("userId", "==", clientId),
          orderBy("createdAt", "desc"),
          limit(limitValue)
        )
      ).catch(() => ({ docs: [] })),
    ]);

    const events = [
      ...toolUsageSnapshot.docs.map((doc) => ({
        id: `tool_${doc.id}`,
        type: "tool_usage",
        ...doc.data(),
      })),
      ...agentEventsSnapshot.docs.map((doc) => ({
        id: `agent_${doc.id}`,
        type: "risk_event",
        ...doc.data(),
      })),
      ...telemetrySnapshot.docs.map((doc) => ({
        id: `telemetry_${doc.id}`,
        type: "telemetry",
        ...doc.data(),
      })),
    ];

    // Sort by timestamp and limit
    events.sort((a, b) => {
      const aTime = a.timestamp?.toDate?.()?.getTime() || a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.timestamp?.toDate?.()?.getTime() || b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    });

    const limited = events.slice(0, eventLimit);

    // Cache for 1 minute
    setCache(cacheKey, limited, 60 * 1000);
    
    return limited;
  } catch (err) {
    console.warn("Prefetch client events failed (non-critical):", err.message);
    return [];
  }
}

/**
 * Prefetch tool usage for a client
 * @param {string} clientId - Client user ID
 * @param {number} limit - Number of records to prefetch (default: 10)
 */
export async function prefetchClientToolUsage(clientId, limit = 10) {
  if (!db || !clientId) return;

  const cacheKey = `client_tool_usage_${clientId}`;
  
  if (hasValidCache(cacheKey)) {
    return getCache(cacheKey);
  }

  try {
    const q = query(
      collection(db, "tool_usage"),
      where("userId", "==", clientId),
      orderBy("createdAt", "desc"),
      limit(safeLimit(limit, 20))
    );

    const snapshot = await getDocs(q);
    const usage = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Cache for 2 minutes
    setCache(cacheKey, usage, 2 * 60 * 1000);
    
    return usage;
  } catch (err) {
    console.warn("Prefetch tool usage failed (non-critical):", err.message);
    return [];
  }
}

/**
 * Prefetch all data for a provider dashboard
 * @param {string} providerId - Provider user ID
 */
export async function prefetchProviderDashboard(providerId) {
  if (!db || !providerId) return;

  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePrefetch = (fn) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(fn, { timeout: 2000 });
    } else {
      setTimeout(fn, 100);
    }
  };

  schedulePrefetch(async () => {
    try {
      // Prefetch assigned clients
      const clients = await prefetchAssignedClients(providerId);
      
      if (clients && clients.length > 0) {
        // Prefetch events for each client (limit to first 5 for performance)
        const clientIds = clients.slice(0, 5).map((c) => c.clientId);
        
        await Promise.all(
          clientIds.map((clientId) =>
            Promise.all([
              prefetchClientEmotionalEvents(clientId, 10),
              prefetchClientToolUsage(clientId, 10),
            ])
          )
        );
      }
    } catch (err) {
      console.warn("Provider dashboard prefetch failed (non-critical):", err.message);
    }
  });
}

