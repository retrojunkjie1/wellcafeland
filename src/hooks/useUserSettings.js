// src/hooks/useUserSettings.js
import { useEffect } from "react";
import { useOSStore } from "@/stores/useOSStore";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { getUserSettings, updateUserSettings } from "@/services/userSettingsService";

/**
 * useUserSettings
 * - Hydrates settings from Firestore (if user logged in)
 * - Falls back to localStorage via useOSStore's initialization
 * - Persists changes back to Firestore when settings change
 */
export function useUserSettings() {
  const identity = useSessionIdentity();
  const userId = identity?.userId || identity?.uid || null;

  const settings = useOSStore((state) => state.settings);
  const hydrateSettings = useOSStore((state) => state.hydrateSettings);

  // 1) On userId change → fetch settings from Firestore and hydrate store
  useEffect(() => {
    let isMounted = true;
    if (!userId) return;

    (async () => {
      const remote = await getUserSettings(userId);
      if (!isMounted) return;
      if (remote && typeof remote === "object") {
        hydrateSettings(remote);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [userId, hydrateSettings]);

  // 2) When settings change → best-effort sync to Firestore
  useEffect(() => {
    if (!userId || !settings) return;
    // Best-effort, no await needed here.
    updateUserSettings(userId, settings);
  }, [userId, settings]);
}

