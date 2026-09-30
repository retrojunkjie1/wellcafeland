import { collection, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { summarizeCheckInWeek, SUPPORT_CHOICE_OPTIONS } from "@/apps/milestones/milestoneProgress";

function toDate(value, fallback) {
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  const source = value || fallback;
  const parsed = typeof source === "string" && /^\d{4}-\d{2}-\d{2}$/.test(source)
    ? (() => {
      const [year, month, day] = source.split("-").map(Number);
      return new Date(year, month - 1, day, 12);
    })()
    : new Date(source);
  return Number.isNaN(parsed.getTime()) ? new Date(fallback) : parsed;
}

/** Load only the signed-in user's own recovery check-ins. */
export async function listMyCheckInHistory(maxEntries = 30) {
  const user = auth.currentUser;
  if (!db || !user || user.isAnonymous) return [];

  const snapshot = await getDocs(query(
    collection(db, "checkins"),
    where("userId", "==", user.uid),
    orderBy("timestamp", "desc"),
    limit(Math.min(Math.max(Number(maxEntries) || 30, 1), 500)),
  ));

  return snapshot.docs
    .map((document) => {
      const data = document.data();
      return { id: document.id, ...data, displayDate: toDate(data.timestamp, data.date) };
    })
    .sort((a, b) => b.displayDate.getTime() - a.displayDate.getTime());
}

/** Load one account-scoped page for history screens that let clients browse older entries. */
export async function listMyCheckInHistoryPage({ pageSize = 30, cursor = null } = {}) {
  const user = auth.currentUser;
  if (!db || !user || user.isAnonymous) return { items: [], nextCursor: null, hasMore: false };

  const safePageSize = Math.min(Math.max(Math.floor(Number(pageSize) || 30), 1), 100);
  const constraints = [
    where("userId", "==", user.uid),
    orderBy("timestamp", "desc"),
  ];
  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(safePageSize + 1));

  const snapshot = await getDocs(query(collection(db, "checkins"), ...constraints));
  const docs = snapshot.docs.slice(0, safePageSize);
  const items = docs.map((document) => {
    const data = document.data();
    return { id: document.id, ...data, displayDate: toDate(data.timestamp, data.date) };
  });

  return {
    items,
    nextCursor: docs.length ? docs[docs.length - 1] : null,
    hasMore: snapshot.docs.length > safePageSize,
  };
}

/**
 * Summarize every saved check-in for the signed-in client without retaining
 * journal/reflection fields in UI state. The account filter is applied to each
 * page, and only structured progress fields are inspected for the summary.
 */
export async function getMyCheckInMilestoneSummary() {
  const user = auth.currentUser;
  const summary = {
    checkInsSaved: 0,
    skillCheckIns: 0,
    gratitudeCheckIns: 0,
    plannedSupportCheckIns: 0,
    supportChoiceCounts: Object.fromEntries(SUPPORT_CHOICE_OPTIONS.map((choice) => [choice, 0])),
    highestReportedDays: null,
  };
  if (!db || !user || user.isAnonymous) return summary;

  let cursor = null;
  let hasMore = true;
  while (hasMore) {
    const constraints = [
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
    ];
    if (cursor) constraints.push(startAfter(cursor));
    constraints.push(limit(101));

    const snapshot = await getDocs(query(collection(db, "checkins"), ...constraints));
    const page = snapshot.docs.slice(0, 100);
    for (const document of page) {
      const data = document.data();
      summary.checkInsSaved += 1;
      if (typeof data.skillsPracticed === "string" && data.skillsPracticed.trim()) summary.skillCheckIns += 1;
      if (typeof data.gratitude === "string" && data.gratitude.trim()) summary.gratitudeCheckIns += 1;
      if ((Array.isArray(data.plannedActivities) && data.plannedActivities.length > 0) || Boolean(data.supportNeeded)) {
        summary.plannedSupportCheckIns += 1;
      }
      if (Object.hasOwn(summary.supportChoiceCounts, data.supportNeeded)) {
        summary.supportChoiceCounts[data.supportNeeded] += 1;
      }
      if (data.daysSinceLastUse !== null && data.daysSinceLastUse !== undefined && data.daysSinceLastUse !== "") {
        const days = Number(data.daysSinceLastUse);
        if (Number.isFinite(days) && days >= 0) {
          summary.highestReportedDays = summary.highestReportedDays === null
            ? days
            : Math.max(summary.highestReportedDays, days);
        }
      }
    }

    hasMore = snapshot.docs.length > 100;
    if (hasMore) cursor = page[page.length - 1];
  }

  return summary;
}

/** Return a bounded current-week summary without retaining journal or reflection text. */
export async function getMyCheckInWeekSummary(now = new Date()) {
  const user = auth.currentUser;
  if (!db || !user || user.isAnonymous) return summarizeCheckInWeek([], now);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);

  const snapshot = await getDocs(query(
    collection(db, "checkins"),
    where("userId", "==", user.uid),
    where("timestamp", ">=", weekStart),
    orderBy("timestamp", "desc"),
    limit(100),
  ));

  // Project only to the fields needed for counts before reducing to the UI summary.
  const entries = snapshot.docs.map((document) => {
    const data = document.data();
    return {
      timestamp: data.timestamp,
      skillsPracticed: data.skillsPracticed,
      gratitude: data.gratitude,
      plannedActivities: data.plannedActivities,
      supportNeeded: data.supportNeeded,
    };
  });
  return summarizeCheckInWeek(entries, now);
}
