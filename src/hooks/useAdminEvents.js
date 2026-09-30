import { useEffect, useMemo, useState } from "react";
import { getAdminOperationalSnapshot, invalidateAdminOperationalSnapshot } from "../services/adminObservability";

export function useAdminEvents(options = {}) {
  const { limit: eventLimit = 100, agentId = null, eventType = null } = options;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const snapshot = await getAdminOperationalSnapshot();
        if (!active) return;
        setEvents(snapshot?.events || []);
        setError(null);
      } catch (err) {
        if (!active) return;
        setEvents([]);
        setError(err?.message || "The event stream is temporarily unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => { active = false; clearInterval(interval); };
  }, [revision]);

  const filteredEvents = useMemo(() => events
    .filter((event) => !agentId || event.agentId === agentId)
    .filter((event) => !eventType || event.eventType === eventType)
    .slice(0, eventLimit), [events, eventLimit, agentId, eventType]);

  return {
    events: filteredEvents,
    loading,
    error,
    refresh: () => { invalidateAdminOperationalSnapshot(); setLoading(true); setRevision((value) => value + 1); },
  };
}
