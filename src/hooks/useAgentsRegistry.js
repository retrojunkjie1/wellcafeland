// src/hooks/useAgentsRegistry.js

import { useEffect, useState } from "react";
import { useAgentsRegistryStore } from "../stores/agentsRegistryStore";
import { db } from "../firebase";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";

/**
 * Hook for accessing and managing the agents registry
 * Provides real-time updates from Firestore when available
 */
export function useAgentsRegistry() {
  const store = useAgentsRegistryStore();
  const [error, setError] = useState(null);

  // Load registry on mount
  useEffect(() => {
    store.loadRegistry();
  }, [store]);

  // Subscribe to Firestore agent_events for real-time updates (if Firebase available)
  useEffect(() => {
    if (!db) return;

    const agents = store.getAllAgents();
    const agentIds = agents.map((a) => a.id);

    // Subscribe to recent agent events
    const q = query(
      collection(db, "agent_events"),
      where("agentId", "in", agentIds),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const event = change.doc.data();
            // Update agent stats based on events
            if (event.success !== undefined) {
              const responseTime = event.responseTime || 0;
              store.recordRun(event.agentId, responseTime, event.success);
            }
          }
        });
      },
      (err) => {
        console.error("Agent events subscription error:", err);
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [store]);

  return {
    agents: store.getAllAgents(),
    getAgent: store.getAgent,
    updateAgent: store.updateAgent,
    toggleAgent: store.toggleAgent,
    updateAgentConfig: store.updateAgentConfig,
    resetAgent: store.resetAgent,
    getHealthSummary: store.getHealthSummary,
    error,
  };
}

