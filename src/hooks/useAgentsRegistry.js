// src/hooks/useAgentsRegistry.js

import { useEffect, useMemo, useState } from "react";
import { useAgentsRegistryStore } from "../stores/agentsRegistryStore";
import { db } from "../firebase";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";

/**
 * Hook for accessing and managing the agents registry
 * Provides real-time updates from Firestore when available
 */
export function useAgentsRegistry() {
  const agentsState = useAgentsRegistryStore((state) => state.agents);
  const agents = useMemo(() => Object.values(agentsState), [agentsState]);
  const agentIds = useMemo(() => agents.map((agent) => agent.id).join(","), [agents]);
  const loadRegistry = useAgentsRegistryStore((state) => state.loadRegistry);
  const recordRun = useAgentsRegistryStore((state) => state.recordRun);
  const getAgent = useAgentsRegistryStore((state) => state.getAgent);
  const updateAgent = useAgentsRegistryStore((state) => state.updateAgent);
  const toggleAgent = useAgentsRegistryStore((state) => state.toggleAgent);
  const updateAgentConfig = useAgentsRegistryStore((state) => state.updateAgentConfig);
  const resetAgent = useAgentsRegistryStore((state) => state.resetAgent);
  const getHealthSummary = useAgentsRegistryStore((state) => state.getHealthSummary);
  const [error, setError] = useState(null);

  // Load registry on mount
  useEffect(() => {
    loadRegistry();
  }, [loadRegistry]);

  // Subscribe to Firestore agent_events for real-time updates (if Firebase available)
  useEffect(() => {
    if (!db) return;

    if (!agentIds) return;
    let initialSnapshot = true;

    // Subscribe to recent agent events
    const q = query(
      collection(db, "agent_events"),
      where("agentId", "in", agentIds.split(",")),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (initialSnapshot) {
          // The first snapshot is historical context, not new work from this session.
          initialSnapshot = false;
          return;
        }
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const event = change.doc.data();
            // Update agent stats based on events
            if (event.success !== undefined) {
              const responseTime = event.responseTime || 0;
              recordRun(event.agentId, responseTime, event.success);
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
  }, [agentIds, recordRun]);

  return {
    agents,
    getAgent,
    updateAgent,
    toggleAgent,
    updateAgentConfig,
    resetAgent,
    getHealthSummary,
    error,
  };
}
