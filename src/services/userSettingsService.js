// src/services/userSettingsService.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

const COLLECTION = "user_settings";

/**
 * Fetch user settings document from Firestore.
 * Returns null if not found or on error.
 */
const isPermissionsError = (err) =>
  err?.message?.includes("Missing or insufficient permissions");

export async function getUserSettings(userId) {
  if (!userId) return null;
  try {
    const ref = doc(db, COLLECTION, userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() || null;
  } catch (err) {
    if (isPermissionsError(err)) {
      return null;
    }
    console.warn("[userSettingsService] getUserSettings failed:", err);
    return null;
  }
}

/**
 * Merge-persist user settings to Firestore.
 * Best-effort only, errors are logged but never thrown.
 */
export async function updateUserSettings(userId, partialSettings) {
  if (!userId || !partialSettings || typeof partialSettings !== "object") return;
  try {
    const ref = doc(db, COLLECTION, userId);
    await setDoc(
      ref,
      {
        ...partialSettings,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    if (isPermissionsError(err)) return;
    console.warn("[userSettingsService] updateUserSettings failed:", err);
  }
}

