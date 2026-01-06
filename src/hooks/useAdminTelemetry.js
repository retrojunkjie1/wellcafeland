// src/hooks/useAdminTelemetry.js
// PHASE H: Mobile chat resilience - Admin telemetry collection

import { useEffect, useRef } from "react";
import { useAdminClaim } from "@/hooks/useAdminClaim";

// PHASE H: Silent admin telemetry - no UI, no console logs in prod
export function useAdminTelemetry() {
  const { isAdmin, adminReady } = useAdminClaim();
  const eventBufferRef = useRef([]);

  const logEvent = (eventData) => {
    // PHASE H: Only log if admin === true
    if (!adminReady || !isAdmin) return;

    const event = {
      ...eventData,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      deviceType: /iPad|iPhone|iPod/.test(navigator.userAgent) ? "ios" : 
                   /Android/.test(navigator.userAgent) ? "android" : "desktop",
    };

    eventBufferRef.current.push(event);

    // Batch send events to Firestore
    if (eventBufferRef.current.length >= 10) {
      // PHASE H: Silent - no console logs in prod
      if (import.meta.env.DEV) {
        console.debug("[AdminTelemetry] Batch:", eventBufferRef.current);
      }
      // Send to Firestore /admin/telemetry/events collection
      (async () => {
        try {
          const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
          const { db } = await import("@/firebase");
          const batch = eventBufferRef.current.map((e) => ({
            ...e,
            timestamp: serverTimestamp(),
          }));
          await Promise.all(batch.map((e) => addDoc(collection(db, "admin", "telemetry"), e)));
          eventBufferRef.current = [];
        } catch (err) {
          // Silently fail - telemetry only
          if (import.meta.env.DEV) {
            console.warn("[AdminTelemetry] Failed to write:", err);
          }
        }
      })();
    }
  };

  useEffect(() => {
    return () => {
      // Flush remaining events on unmount
      if (eventBufferRef.current.length > 0 && isAdmin) {
        if (import.meta.env.DEV) {
          console.debug("[AdminTelemetry] Flush:", eventBufferRef.current);
        }
        eventBufferRef.current = [];
      }
    };
  }, [isAdmin]);

  return { logEvent };
}

