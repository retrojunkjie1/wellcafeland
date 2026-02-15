/**
 * Single source of truth for online/offline state.
 * Subscribes to navigator.onLine and online/offline events.
 * @returns {{ isOnline: boolean, lastChangeAt: number }}
 */
import { useState, useEffect } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [lastChangeAt, setLastChangeAt] = useState(Date.now());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      setLastChangeAt(Date.now());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastChangeAt(Date.now());
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, lastChangeAt };
}
