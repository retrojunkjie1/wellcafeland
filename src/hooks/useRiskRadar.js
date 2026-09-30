import { useCallback, useEffect, useState } from "react";
import { getAdminOperationalSnapshot, invalidateAdminOperationalSnapshot } from "../services/adminObservability";

const EMPTY_RADAR = {
  warningCount: 0,
  criticalCount: 0,
  totalEvents: 0,
  topEventTypes: [],
  dailyCounts: [],
  sampled: false,
};

export function useRiskRadar() {
  const [data, setData] = useState(EMPTY_RADAR);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);

  const load = useCallback(async () => {
    try {
      const snapshot = await getAdminOperationalSnapshot();
      setData(snapshot?.riskRadar || EMPTY_RADAR);
      setEnabled(snapshot?.riskRadarEnabled !== false);
      setError(null);
    } catch (err) {
      setData(EMPTY_RADAR);
      setEnabled(true);
      setError(err?.message || "Risk signal summaries are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load, revision]);

  return {
    ...data,
    enabled,
    loading,
    error,
    refresh: () => {
      invalidateAdminOperationalSnapshot();
      setLoading(true);
      setRevision((value) => value + 1);
    },
  };
}
