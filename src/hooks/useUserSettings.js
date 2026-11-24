// src/hooks/useUserSettings.js
import { useEffect, useState } from "react";
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
  const candidateUserId = identity?.userId || identity?.uid || null;
  const userId = identity?.mode === "account" && !identity?.isLoading ? candidateUserId : null;

  const settings = useOSStore((state) => state.settings);
  const hydrateSettings = useOSStore((state) => state.hydrateSettings);
  const [hydratedUserId, setHydratedUserId] = useState(null);

  // 1) Load account preferences before enabling remote writes. Guest settings
  // remain local and must never create Firestore documents under guest IDs.
  useEffect(() => {
    let isMounted = true;
    setHydratedUserId(null);
    if (!userId) return undefined;

    (async () => {
      try {
        const remote = await getUserSettings(userId);
        if (!isMounted) return;
        if (remote && typeof remote === "object") hydrateSettings(remote);
        setHydratedUserId(userId);
      } catch {
        // Keep the account's settings local until Firestore can be read. In
        // particular, never overwrite remote preferences after a failed read.
        if (isMounted) console.warn("[useUserSettings] Account preferences could not be loaded.");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [userId, hydrateSettings]);

  // 2) After this account's read completes, best-effort sync its preferences.
  useEffect(() => {
    if (!userId || hydratedUserId !== userId || !settings) return;
    updateUserSettings(userId, settings);
  }, [userId, hydratedUserId, settings]);
}

