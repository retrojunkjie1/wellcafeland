import { auth, db } from "@/firebase";
import { collection, doc, getDoc, getDocs, increment, limit, orderBy, query, runTransaction, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { getAnonymousUserId } from "@/lib/userId";

const STORAGE_KEY = "wc-private-practice-progress-v1";
const RECENT_DAYS = 7;

function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function recentStartDayKey() {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - (RECENT_DAYS - 1));
  return localDayKey(start);
}

function localStorageKey() {
  const user = auth?.currentUser;
  const uid = user && !user.isAnonymous ? user.uid : getAnonymousUserId();
  return `${STORAGE_KEY}:${uid || "guest"}`;
}

function readProgressAtKey(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "{}");
    const totalCompleted = Number(parsed.totalCompleted);
    return {
      totalCompleted: Number.isFinite(totalCompleted) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(totalCompleted))) : 0,
      days: parsed.days && typeof parsed.days === "object" ? parsed.days : {},
    };
  } catch {
    return { totalCompleted: 0, days: {} };
  }
}

function readLocalProgress() {
  return readProgressAtKey(localStorageKey());
}

function guestStorageKeys() {
  const keys = [`${STORAGE_KEY}:${getAnonymousUserId()}`];
  const currentUser = auth?.currentUser;
  // Read the previous guest key format for people who used Firebase anonymous auth.
  if (currentUser?.isAnonymous) keys.push(`${STORAGE_KEY}:${currentUser.uid}`);
  return [...new Set(keys)];
}

function combineProgress(progressItems) {
  return progressItems.reduce((combined, progress) => {
    if (Number.isFinite(progress.totalCompleted)) combined.totalCompleted += progress.totalCompleted;
    Object.entries(progress.days).forEach(([dayKey, count]) => {
      const numericCount = Number(count);
      if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey) && Number.isFinite(numericCount) && numericCount > 0) {
        combined.days[dayKey] = (Number(combined.days[dayKey]) || 0) + Math.floor(numericCount);
      }
    });
    return combined;
  }, { totalCompleted: 0, days: {} });
}

function readGuestProgressSources() {
  return guestStorageKeys().map((key) => ({ key, value: readProgressAtKey(key) }));
}

function summarizeLocalProgress(progress) {
  const startDay = recentStartDayKey();
  const activeDaysLast7 = Object.keys(progress.days).filter((dayKey) => dayKey >= startDay && Number(progress.days[dayKey]) > 0).length;
  return { totalCompleted: progress.totalCompleted, activeDaysLast7 };
}

/** Store a private progress count only. Practice IDs, choices, notes, and reflections are never written here. */
export async function recordPrivatePracticeCompletion() {
  const dayKey = localDayKey();
  const currentUser = auth?.currentUser;

  if (db && currentUser && !currentUser.isAnonymous) {
    const summaryRef = doc(db, "users", currentUser.uid, "private_progress", "practice_summary");
    const dayRef = doc(db, "users", currentUser.uid, "private_progress", "practice_summary", "days", dayKey);
    const batch = writeBatch(db);
    batch.set(summaryRef, {
      totalCompleted: increment(1),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    batch.set(dayRef, {
      dayKey,
      completedCount: increment(1),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await batch.commit();
    return true;
  }

  const progress = readLocalProgress();
  progress.totalCompleted += 1;
  progress.days[dayKey] = (Number(progress.days[dayKey]) || 0) + 1;
  const oldestRetainedDay = new Date();
  oldestRetainedDay.setDate(oldestRetainedDay.getDate() - 364);
  const oldestKey = localDayKey(oldestRetainedDay);
  Object.keys(progress.days).forEach((key) => {
    if (key < oldestKey) delete progress.days[key];
  });
  try {
    localStorage.setItem(localStorageKey(), JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

/** Return aggregate practice counts saved locally before sign-in. */
export function getGuestPrivatePracticeProgress() {
  return summarizeLocalProgress(combineProgress(readGuestProgressSources().map(({ value }) => value)));
}

/**
 * Explicitly merge this browser's aggregate guest counts into the signed-in
 * account. Each source key has a Firestore receipt, so a retry cannot double
 * count a handoff. No practice IDs, choices, notes, or reflections are moved.
 */
export async function transferGuestPracticeProgressToAccount() {
  const currentUser = auth?.currentUser;
  if (!db || !currentUser || currentUser.isAnonymous) {
    throw new Error("Sign in to add this device's practice count to your account.");
  }

  const sources = readGuestProgressSources();
  for (const { key, value } of sources) {
    const oldestRetainedDay = new Date();
    oldestRetainedDay.setDate(oldestRetainedDay.getDate() - 364);
    const oldestKey = localDayKey(oldestRetainedDay);
    const dayEntries = Object.entries(value.days)
      .map(([dayKey, count]) => [dayKey, Number.isFinite(Number(count)) ? Math.floor(Number(count)) : 0])
      .filter(([dayKey, count]) => /^\d{4}-\d{2}-\d{2}$/.test(dayKey)
        && dayKey >= oldestKey
        && count > 0)
      .slice(0, 365);
    if (value.totalCompleted <= 0 && dayEntries.length === 0) continue;

    const sourceId = key.split(":").at(-1);
    const userRoot = `users/${currentUser.uid}/private_progress/practice_summary`;
    const receiptRef = doc(db, `${userRoot}/imports/${sourceId}`);
    const summaryRef = doc(db, userRoot);
    const dayRefs = dayEntries.map(([dayKey]) => doc(db, `${userRoot}/days/${dayKey}`));
    await runTransaction(db, async (transaction) => {
      const receipt = await transaction.get(receiptRef);
      if (receipt.exists()) return;

      transaction.set(summaryRef, {
        totalCompleted: increment(value.totalCompleted),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      dayRefs.forEach((ref, index) => {
        const count = dayEntries[index][1];
        transaction.set(ref, {
          dayKey: dayEntries[index][0],
          completedCount: increment(count),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      });
      transaction.set(receiptRef, {
        importedAt: serverTimestamp(),
        totalCompleted: value.totalCompleted,
        daysImported: dayEntries.length,
      });
    });
    try {
      localStorage.removeItem(key);
    } catch {
      // The Firestore receipt still makes a later retry idempotent.
    }
  }
  return getPrivatePracticeProgress();
}

/** Return only the client's own aggregate totals; never expose tool-by-tool usage. */
export async function getPrivatePracticeProgress() {
  const currentUser = auth?.currentUser;
  if (!db || !currentUser || currentUser.isAnonymous) {
    return summarizeLocalProgress(combineProgress(readGuestProgressSources().map(({ value }) => value)));
  }

  const summaryRef = doc(db, "users", currentUser.uid, "private_progress", "practice_summary");
  const recentDaysRef = collection(db, "users", currentUser.uid, "private_progress", "practice_summary", "days");
  const recentDaysQuery = query(
    recentDaysRef,
    where("dayKey", ">=", recentStartDayKey()),
    orderBy("dayKey", "desc"),
    limit(RECENT_DAYS),
  );
  const [summarySnapshot, daysSnapshot] = await Promise.all([getDoc(summaryRef), getDocs(recentDaysQuery)]);
  const totalCompleted = Math.max(0, Number(summarySnapshot.data()?.totalCompleted) || 0);
  const activeDaysLast7 = daysSnapshot.docs.filter((day) => Number(day.data()?.completedCount) > 0).length;
  return { totalCompleted, activeDaysLast7 };
}
