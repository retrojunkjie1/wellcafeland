import { useCallback, useEffect, useState } from "react";
import { getAdminOperationalSnapshot } from "../services/adminObservability";

const EMPTY_METRICS = {
  totalUsers: null,
  activeUsers: null,
  totalSessions: null,
  totalCheckins: null,
  checkinsLast7Days: null,
  agentExecutions: null,
  systemHealth: "not_measured",
  errorRate: null,
  avgResponseTime: null,
};

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (force = true) => {
    setLoading(true);
    try {
      const snapshot = await getAdminOperationalSnapshot({ force });
      setMetrics(snapshot?.metrics || EMPTY_METRICS);
      setError(null);
    } catch (err) {
      setError(err?.message || "System metrics are temporarily unavailable.");
      setMetrics(EMPTY_METRICS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(false);
    const interval = setInterval(() => refresh(false), 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { metrics, loading, error, refresh: () => refresh(true) };
}
