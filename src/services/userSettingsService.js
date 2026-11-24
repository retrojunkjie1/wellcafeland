// src/services/userSettingsService.js
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

const COLLECTION = "user_settings";

/**
 * Fetch user settings document from Firestore.
 * Returns null only when no account preference document exists. Read errors
 * propagate so callers do not mistake an unavailable document for a new one.
 */
const isPermissionsError = (err) =>
  err?.message?.includes("Missing or insufficient permissions");

export async function getUserSettings(userId) {
  if (!userId) return null;
  const ref = doc(db, COLLECTION, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const { updatedAt: _updatedAt, ...preferences } = snap.data() || {};
  return preferences;
}

/**
 * Merge-persist user settings to Firestore.
 * Best-effort only, errors are logged but never thrown.
 */
export async function updateUserSettings(userId, partialSettings) {
  if (!userId || !partialSettings || typeof partialSettings !== "object") return false;
  try {
    const ref = doc(db, COLLECTION, userId);
    await setDoc(
      ref,
      {
        ...partialSettings,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    if (isPermissionsError(err)) return false;
    console.warn("[userSettingsService] updateUserSettings failed:", err);
    return false;
  }
}

