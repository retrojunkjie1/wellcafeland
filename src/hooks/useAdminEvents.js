// src/hooks/useAdminEvents.js

import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";

/**
 * Hook for live event stream from agent_events collection
 * Provides real-time updates with filtering capabilities
 */
export function useAdminEvents(options = {}) {
  const {
    limit: eventLimit = 100,
    agentId = null,
    eventType = null,
    autoRefresh = true,
  } = options;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(() => !!db); // Start loading if db available
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      // Use setTimeout to avoid setState in effect
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    // Build query
    let q = query(
      collection(db, "agent_events"),
      orderBy("timestamp", "desc"),
      limit(eventLimit)
    );

    // Apply filters
    if (agentId) {
      q = query(q, where("agentId", "==", agentId));
    }
    if (eventType) {
      q = query(q, where("eventType", "==", eventType));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          if (!snapshot || !snapshot.docs) {
            setEvents([]);
            setLoading(false);
            return;
          }
          const eventList = snapshot.docs
            .filter((doc) => doc.exists())
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          setEvents(eventList);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.warn("Admin events callback error (non-critical):", err.message);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.warn("Admin events subscription error (non-critical):", err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [eventLimit, agentId, eventType, autoRefresh]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    loading,
    error,
    clearEvents,
  };
}
