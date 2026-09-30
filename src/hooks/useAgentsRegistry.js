import { useEffect, useMemo, useState } from "react";
import { useAgentsRegistryStore } from "../stores/agentsRegistryStore";
import { getAdminOperationalSnapshot } from "../services/adminObservability";

export function useAgentsRegistry() {
  const agentsState = useAgentsRegistryStore((state) => state.agents);
  const agents = useMemo(() => Object.values(agentsState), [agentsState]);
  const loadRegistry = useAgentsRegistryStore((state) => state.loadRegistry);
  const syncOperationalStats = useAgentsRegistryStore((state) => state.syncOperationalStats);
  const getAgent = useAgentsRegistryStore((state) => state.getAgent);
  const updateAgent = useAgentsRegistryStore((state) => state.updateAgent);
  const toggleAgent = useAgentsRegistryStore((state) => state.toggleAgent);
  const updateAgentConfig = useAgentsRegistryStore((state) => state.updateAgentConfig);
  const resetAgent = useAgentsRegistryStore((state) => state.resetAgent);
  const getHealthSummary = useAgentsRegistryStore((state) => state.getHealthSummary);
  const [error, setError] = useState(null);

  useEffect(() => { loadRegistry(); }, [loadRegistry]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const snapshot = await getAdminOperationalSnapshot();
        if (active) {
          syncOperationalStats(snapshot?.agentMetrics || {});
          setError(null);
        }
      } catch (err) {
        if (active) setError(err?.message || "Agent run data is temporarily unavailable.");
      }
    };
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => { active = false; clearInterval(interval); };
  }, [syncOperationalStats]);

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
