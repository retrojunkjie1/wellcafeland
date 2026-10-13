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
  const [snapshotAt, setSnapshotAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (force = true) => {
    setLoading(true);
    try {
      const snapshot = await getAdminOperationalSnapshot({ force });
      setMetrics(snapshot?.metrics || EMPTY_METRICS);
      setSnapshotAt(snapshot?.generatedAt || null);
      setError(null);
    } catch (err) {
      setError(err?.message || "System metrics are temporarily unavailable.");
      setMetrics(EMPTY_METRICS);
      setSnapshotAt(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh(false);
    };
    refreshWhenVisible();
    const interval = setInterval(refreshWhenVisible, 60_000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh]);

  return { metrics, loading, error, snapshotAt, refresh: () => refresh(true) };
}
