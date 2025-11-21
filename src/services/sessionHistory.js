// src/services/sessionHistory.js

const LAST_SESSION_KEY = "wc-last-session-v1";
const HISTORY_KEY = "wc-session-history-v1";

function safeGetStorage() {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeSession(session) {
  if (!session || typeof session !== "object") return null;

  const now = new Date().toISOString();
  const base = {
    id: session.id || session.slug || session.title || "session",
    title: session.title || "Wellness session",
    category:
      session.category ||
      session.intentLabel ||
      (session.supportType
        ? session.supportType.replace(/_/g, " ")
        : "General support"),
    durationMinutes:
      session.durationMinutes ||
      session.estimatedMinutes ||
      session.totalMinutes ||
      session.minutes ||
      10,
    supportType: session.supportType || null,
    tone: session.tone || null,
    createdAt: session.createdAt || now,
    savedAt: now,
  };

  return { ...session, ...base };
}

// 👉 save / update last session + history
export function saveLastSession(session) {
  const storage = safeGetStorage();
  if (!storage) return;

  const normalized = normalizeSession(session);
  if (!normalized) return;

  try {
    // last session
    storage.setItem(LAST_SESSION_KEY, JSON.stringify(normalized));

    // history (one entry per day)
    const prevRaw = storage.getItem(HISTORY_KEY);
    const prev = prevRaw ? JSON.parse(prevRaw) : [];

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const filtered = prev.filter(
      (item) =>
        typeof item.savedAt !== "string" ||
        !item.savedAt.startsWith(today)
    );

    const next = [...filtered, normalized];

    storage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // fail silently
  }
}

export function getLastSession() {
  const storage = safeGetStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(LAST_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearLastSession() {
  const storage = safeGetStorage();
  if (!storage) return;

  try {
    storage.removeItem(LAST_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function getSessionHistory() {
  const storage = safeGetStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    // newest last, we'll reverse when needed
    return items;
  } catch {
    return [];
  }
}

// 👉 compute streak + longest streak from history
export function getStreakStats() {
  const history = getSessionHistory();
  if (!history.length) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastSessionAt: null,
    };
  }

  const dates = new Set();

  history.forEach((item) => {
    const iso =
      typeof item.savedAt === "string"
        ? item.savedAt
        : item.createdAt || item.date;
    if (!iso) return;
    const day = iso.slice(0, 10); // YYYY-MM-DD
    dates.add(day);
  });

  if (!dates.size) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastSessionAt: null,
    };
  }

  const sorted = Array.from(dates)
    .sort() // ascending
    .map((d) => new Date(d + "T00:00:00Z"));

  const today = new Date();
  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // longest streak
  let longest = 1;
  let cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diffDays =
      (sorted[i].getTime() - sorted[i - 1].getTime()) / 86400000;
    if (diffDays === 1) {
      cur += 1;
      if (cur > longest) longest = cur;
    } else {
      cur = 1;
    }
  }

  // current streak (up to today)
  let currentStreak = 0;
  const set = new Set(dates); // back to strings
  const dayStrings = Array.from(set).sort();

  // find the most recent session day
  const lastDayStr = dayStrings[dayStrings.length - 1];
  const lastDay = new Date(lastDayStr + "T00:00:00Z");

  const diffToToday =
    (todayDay.getTime() - lastDay.getTime()) / 86400000;

  if (diffToToday > 1) {
    // last session was before yesterday → streak broken
    currentStreak = 0;
  } else {
    // walk backwards from today / yesterday counting consecutive days
    let offset = diffToToday === 0 ? 0 : 1;
    while (true) {
      const d = new Date(
        todayDay.getTime() - offset * 86400000
      );
      const key = d.toISOString().slice(0, 10);
      if (set.has(key)) {
        currentStreak += 1;
        offset += 1;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak: longest,
    lastSessionAt: lastDayStr,
  };
}

/**
 * Check if a last session exists (without loading it).
 */
export function hasLastSession() {
  try {
    const raw = window.localStorage.getItem(LAST_SESSION_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return !!data && typeof data === "object";
  } catch {
    return false;
  }
}
