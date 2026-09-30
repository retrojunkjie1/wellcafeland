export const RECOVERY_MARKERS = [7, 14, 30, 60, 90, 180, 365];
export const SUPPORT_CHOICE_OPTIONS = [
  "A check-in with someone I trust",
  "Peer recovery support",
  "Help finding practical resources",
  "Professional support",
  "Quiet time for myself",
];

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/** Summarize only saved, structured check-in fields. Never inspect free-text content. */
export function summarizeMilestoneProgress(entries = []) {
  const reportedDays = entries
    .filter((entry) => entry?.daysSinceLastUse !== null && entry?.daysSinceLastUse !== undefined && entry?.daysSinceLastUse !== "")
    .map((entry) => Number(entry.daysSinceLastUse))
    .filter((days) => Number.isFinite(days) && days >= 0);
  const highestReportedDays = reportedDays.length ? Math.max(...reportedDays) : null;
  const supportChoiceCounts = Object.fromEntries(SUPPORT_CHOICE_OPTIONS.map((choice) => [choice, 0]));
  for (const entry of entries) {
    const choice = typeof entry?.supportNeeded === "string" ? entry.supportNeeded.trim() : "";
    if (Object.hasOwn(supportChoiceCounts, choice)) supportChoiceCounts[choice] += 1;
  }

  return {
    checkInsSaved: entries.length,
    skillCheckIns: entries.filter((entry) => hasText(entry?.skillsPracticed)).length,
    gratitudeCheckIns: entries.filter((entry) => hasText(entry?.gratitude)).length,
    plannedSupportCheckIns: entries.filter((entry) =>
      (Array.isArray(entry?.plannedActivities) && entry.plannedActivities.length > 0) || Boolean(entry?.supportNeeded),
    ).length,
    supportChoiceCounts,
    highestReportedDays,
    reachedRecoveryMarkers: highestReportedDays === null
      ? []
      : RECOVERY_MARKERS.filter((days) => highestReportedDays >= days),
    nextRecoveryMarker: highestReportedDays === null
      ? null
      : RECOVERY_MARKERS.find((days) => highestReportedDays < days) || null,
  };
}

function entryDate(entry) {
  const value = entry?.timestamp || entry?.date;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  }
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
}

function dateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

/** Summarize only the structured choices a client made during the current Monday–Sunday week. */
export function summarizeCheckInWeek(entries = [], now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const start = new Date(today);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const dayBuckets = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date: dateKey(date),
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      count: 0,
      isToday: dateKey(date) === dateKey(today),
    };
  });
  const byDate = new Map(dayBuckets.map((day) => [day.date, day]));
  let skillEntries = 0;
  let gratitudeEntries = 0;
  let plannedSupportEntries = 0;
  let weekCheckInCount = 0;
  let latestSupportEntry = null;

  for (const entry of entries) {
    const timestamp = entryDate(entry);
    if (!timestamp) continue;
    // Compare calendar days, not timestamps against a noon boundary. A check-in
    // saved this afternoon still belongs to today even though it is after noon.
    const date = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 12);
    if (date < start || date > today) continue;
    const bucket = byDate.get(dateKey(date));
    if (!bucket) continue;
    bucket.count += 1;
    weekCheckInCount += 1;
    const supportNeeded = typeof entry?.supportNeeded === "string" ? entry.supportNeeded.trim() : "";
    if (supportNeeded && (!latestSupportEntry || timestamp > latestSupportEntry.timestamp)) latestSupportEntry = { date: timestamp, timestamp, supportNeeded };
    if (hasText(entry?.skillsPracticed)) skillEntries += 1;
    if (hasText(entry?.gratitude)) gratitudeEntries += 1;
    if ((Array.isArray(entry?.plannedActivities) && entry.plannedActivities.length > 0) || Boolean(entry?.supportNeeded)) {
      plannedSupportEntries += 1;
    }
  }

  return {
    weekCheckInCount,
    daysCheckedIn: dayBuckets.filter((day) => day.count > 0).length,
    skillEntries,
    gratitudeEntries,
    plannedSupportEntries,
    latestSupportChoice: latestSupportEntry?.supportNeeded || "",
    latestCheckInDate: latestSupportEntry?.date || null,
    weekDays: dayBuckets,
  };
}
