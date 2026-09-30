import { writeBatch, doc } from "firebase/firestore";
import { auth, db } from "@/firebase";

const MAX_GUEST_CHECK_INS = 30;
const MOODS = new Set(["excellent", "good", "okay", "difficult", "challenging"]);
const YES_NO_UNSURE = new Set(["yes", "no", "unsure", "skip"]);

function safeText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function safeRating(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 10 ? number : null;
}

function safeDays(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number <= 100000 ? number : null;
}

function safeTimestamp(entry) {
  const parsed = entry?.timestamp?.toDate
    ? entry.timestamp.toDate()
    : new Date(entry?.timestamp || `${entry?.date || ""}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Give local rows stable document IDs before sending, so retrying cannot duplicate them. */
export function prepareGuestCheckInsForImport(entries, createId = () => globalThis.crypto?.randomUUID?.() || `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`) {
  if (!Array.isArray(entries) || entries.length > MAX_GUEST_CHECK_INS) {
    throw new Error(`Choose up to ${MAX_GUEST_CHECK_INS} saved check-ins to import.`);
  }
  return entries.map((entry) => ({
    ...entry,
    migrationId: typeof entry?.migrationId === "string" && /^[a-zA-Z0-9_-]{8,80}$/.test(entry.migrationId)
      ? entry.migrationId
      : createId(),
  }));
}

function toAccountRecord(entry, uid) {
  const timestamp = safeTimestamp(entry);
  if (!timestamp) throw new Error("A saved check-in has an unreadable date. Keep the device copy and contact support before clearing it.");
  const mood = typeof entry.mood === "string" && MOODS.has(entry.mood) ? entry.mood : null;
  const cravingStatus = typeof entry.cravingStatus === "string" && YES_NO_UNSURE.has(entry.cravingStatus) ? entry.cravingStatus : null;
  const triggerStatus = typeof entry.triggerStatus === "string" && YES_NO_UNSURE.has(entry.triggerStatus) ? entry.triggerStatus : null;
  const supportNeeded = safeText(entry.supportNeeded, 100);
  const plannedActivities = Array.isArray(entry.plannedActivities)
    ? entry.plannedActivities.filter((value) => typeof value === "string").slice(0, 20).map((value) => safeText(value, 160))
    : [];

  return {
    userId: uid,
    date: timestamp.toISOString().slice(0, 10),
    timestamp,
    mood,
    daysSinceLastUse: safeDays(entry.daysSinceLastUse),
    cravingStatus,
    cravingDetails: safeText(entry.cravingDetails, 500),
    cravingIntensity: safeRating(entry.cravingIntensity),
    triggerStatus,
    triggerDetails: safeText(entry.triggerDetails, 1000),
    triggerIntensity: safeRating(entry.triggerIntensity),
    plannedActivities,
    skillsPracticed: safeText(entry.skillsPracticed, 2000),
    supportNeeded,
    gratitude: safeText(entry.gratitude, 2000),
    journal: safeText(entry.journal, 5000),
    energy: safeRating(entry.energy),
    stress: safeRating(entry.stress),
    sleep: safeRating(entry.sleep),
    completed: true,
    importedFromDevice: true,
  };
}

/** Copy explicitly selected guest entries into the currently signed-in owner's account. */
export async function importGuestCheckIns(entries) {
  const user = auth.currentUser;
  if (!db || !user || user.isAnonymous) throw new Error("Sign in to copy check-ins into your account.");
  if (!Array.isArray(entries) || entries.length > MAX_GUEST_CHECK_INS) {
    throw new Error(`Choose up to ${MAX_GUEST_CHECK_INS} saved check-ins to import.`);
  }
  if (entries.some((entry) => !/^[a-zA-Z0-9_-]{8,80}$/.test(entry?.migrationId || ""))) {
    throw new Error("Prepare the device check-ins for import before continuing.");
  }
  if (!entries.length) return { imported: 0 };

  const batch = writeBatch(db);
  for (const entry of entries) {
    const destination = doc(db, "checkins", `guest_${user.uid}_${entry.migrationId}`);
    batch.set(destination, toAccountRecord(entry, user.uid));
  }
  await batch.commit();
  return { imported: entries.length };
}
