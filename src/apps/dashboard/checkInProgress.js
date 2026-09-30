const RECOVERY_MARKERS = [7, 14, 30, 60, 90, 180, 365];

function readDate(entry) {
  const value = entry?.displayDate || entry?.timestamp || entry?.date;
  if (value?.toDate) return value.toDate();
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Build an on-device reflection from fields the client chose to save.
 * Free-text is never parsed, and no interpretation is sent to an AI service.
 */
export function summarizeCheckIns(entries = [], now = new Date()) {
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  const datedEntries = entries
    .map((entry) => ({ entry, date: readDate(entry) }))
    .filter(({ date }) => date)
    .sort((a, b) => a.date - b.date);
  const thisWeek = datedEntries.filter(({ date }) => date >= weekStart && date <= todayEnd);

  const countWith = (field) => thisWeek.filter(({ entry }) => {
    const value = entry[field];
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  }).length;

  const countYes = (field) => thisWeek.filter(({ entry }) => entry[field] === "yes").length;
  const averageRating = (field) => {
    const ratings = thisWeek
      .map(({ entry }) => entry[field])
      .filter((value) => value !== null && value !== undefined && value !== "")
      .map(Number)
      .filter((value) => Number.isInteger(value) && value >= 0 && value <= 10);
    return ratings.length
      ? { count: ratings.length, average: Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10 }
      : null;
  };

  const supportChoiceCounts = thisWeek.reduce((counts, { entry }) => {
    const choice = typeof entry.supportNeeded === "string" ? entry.supportNeeded.trim() : "";
    if (choice) counts.set(choice, (counts.get(choice) || 0) + 1);
    return counts;
  }, new Map());
  const supportChoices = [...supportChoiceCounts]
    .map(([choice, count]) => ({ choice, count }))
    .sort((a, b) => b.count - a.count);

  const moods = thisWeek
    .map(({ entry }) => entry.mood)
    .filter((mood) => typeof mood === "string" && mood.trim());
  const positiveMoodCount = moods.filter((mood) => ["good", "excellent"].includes(mood.toLowerCase())).length;
  const moodChoiceCounts = new Map();
  moods.forEach((mood) => {
    const normalized = mood.trim().toLocaleLowerCase();
    const existing = moodChoiceCounts.get(normalized);
    moodChoiceCounts.set(normalized, { mood: existing?.mood || mood.trim(), count: (existing?.count || 0) + 1 });
  });
  const moodChoices = [...moodChoiceCounts.values()].sort((a, b) => b.count - a.count);

  const reportedDayEntries = datedEntries.filter(({ entry }) => {
    if (entry.daysSinceLastUse === null || entry.daysSinceLastUse === undefined || entry.daysSinceLastUse === "") return false;
    const days = Number(entry.daysSinceLastUse);
    return Number.isFinite(days) && days >= 0;
  });
  const highestDayEntry = reportedDayEntries.reduce((highestEntry, candidate) => (
    !highestEntry || Number(candidate.entry.daysSinceLastUse) > Number(highestEntry.entry.daysSinceLastUse)
      ? candidate
      : highestEntry
  ), null);
  const highestReportedDay = highestDayEntry ? Number(highestDayEntry.entry.daysSinceLastUse) : 0;
  const marker = RECOVERY_MARKERS.filter((days) => highestReportedDay >= days).at(-1) || null;

  return {
    weekCheckInCount: thisWeek.length,
    skillEntries: countWith("skillsPracticed"),
    gratitudeEntries: countWith("gratitude"),
    plannedSupportEntries: thisWeek.filter(({ entry }) => (Array.isArray(entry.plannedActivities) && entry.plannedActivities.length > 0) || Boolean(entry.supportNeeded)).length,
    moodCount: moods.length,
    positiveMoodCount,
    moodChoices,
    cravingYesCount: countYes("cravingStatus"),
    cravingRating: averageRating("cravingIntensity"),
    triggerYesCount: countYes("triggerStatus"),
    triggerRating: averageRating("triggerIntensity"),
    supportChoices,
    recoveryMarker: marker ? {
      days: marker,
      recordedDays: highestReportedDay,
      date: highestDayEntry?.date || null,
    } : null,
  };
}
