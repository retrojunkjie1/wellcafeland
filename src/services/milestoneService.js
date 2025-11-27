// src/services/milestoneService.js
// Milestone and streak tracking service
// Works for anonymous + logged-in users

import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { getAnonymousUserId } from "@/lib/userId";
import { getStreakStats } from "./sessionHistory";
import { logError, logInfo } from "./logService";

const MILESTONE_STORAGE_KEY = "wc-milestones-v1";
const STREAK_STORAGE_KEY = "wc-streak-v1";

/**
 * Get current user ID
 */
function getCurrentUserId() {
  try {
    return auth?.currentUser?.uid || getAnonymousUserId();
  } catch {
    return getAnonymousUserId();
  }
}

/**
 * Milestone definitions
 */
const MILESTONE_DEFINITIONS = [
  { id: "streak_7", type: "streak", label: "7 Day Streak", targetValue: 7, iconKey: "coin_7" },
  { id: "streak_14", type: "streak", label: "14 Day Streak", targetValue: 14, iconKey: "coin_14" },
  { id: "streak_30", type: "streak", label: "30 Day Streak", targetValue: 30, iconKey: "coin_30" },
  { id: "streak_60", type: "streak", label: "60 Day Streak", targetValue: 60, iconKey: "coin_60" },
  { id: "streak_90", type: "streak", label: "90 Day Streak", targetValue: 90, iconKey: "coin_90" },
  { id: "sessions_10", type: "session_count", label: "10 Sessions", targetValue: 10, iconKey: "coin_sessions" },
  { id: "sessions_50", type: "session_count", label: "50 Sessions", targetValue: 50, iconKey: "coin_sessions" },
  { id: "tools_5", type: "tool_completion", label: "5 Tools Completed", targetValue: 5, iconKey: "coin_tools" },
  { id: "tools_20", type: "tool_completion", label: "20 Tools Completed", targetValue: 20, iconKey: "coin_tools" },
];

/**
 * Record a session event (called from telemetry)
 * This is called when a session starts/ends or a tool is completed
 */
export async function recordSessionEvent(_event) {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    // Update streak
    const today = new Date().toISOString().split("T")[0];
    await updateStreakOnActivity(today);

    // Check for milestone unlocks
    await checkAndUnlockMilestones(userId);
  } catch (err) {
    logError("milestoneService", err, { function: "recordSessionEvent" });
  }
}

/**
 * Record a tool completion event
 */
export async function recordToolCompletion(toolId, _metadata = {}) {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    // Update streak
    const today = new Date().toISOString().split("T")[0];
    await updateStreakOnActivity(today);

    // Check for milestone unlocks (tool completion milestones)
    await checkAndUnlockMilestones(userId);
  } catch (err) {
    logError("milestoneService", err, { function: "recordToolCompletion" });
  }
}

/**
 * Update streak on activity
 */
export async function updateStreakOnActivity(dateString) {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    // Get current streak from sessionHistory
    const streakStats = getStreakStats();
    const currentStreak = streakStats.currentStreak || 0;
    const longestStreak = streakStats.longestStreak || 0;
    const lastActiveDate = streakStats.lastSessionAt || dateString;

    const streakData = {
      currentStreakDays: currentStreak,
      longestStreakDays: Math.max(longestStreak, currentStreak),
      lastActiveDate,
      updatedAt: new Date().toISOString(),
    };

    // Try Firestore first
    if (db) {
      try {
        const streakRef = doc(db, "users", userId, "streaks", "current");
        await setDoc(streakRef, streakData, { merge: true });
        return;
      } catch (err) {
        logError("milestoneService", err, { function: "updateStreakOnActivity", step: "firestore" });
      }
    }

    // Fallback to localStorage
    try {
      const key = `${STREAK_STORAGE_KEY}-${userId}`;
      localStorage.setItem(key, JSON.stringify(streakData));
    } catch (err) {
      logError("milestoneService", err, { function: "updateStreakOnActivity", step: "localStorage" });
    }
  } catch (err) {
    logError("milestoneService", err, { function: "updateStreakOnActivity" });
  }
}

/**
 * Check and unlock milestones
 */
async function checkAndUnlockMilestones(userId) {
  try {
    const summary = await getMilestoneSummary();
    
    // Check streak milestones
    const currentStreak = summary.streak?.current || 0;
    MILESTONE_DEFINITIONS
      .filter(m => m.type === "streak" && currentStreak >= m.targetValue)
      .forEach(milestone => {
        unlockMilestone(userId, milestone.id, milestone);
      });

    // Check session count milestones (would need session count tracking)
    // For now, we'll rely on streak milestones
  } catch (err) {
    logError("milestoneService", err, { function: "checkAndUnlockMilestones" });
  }
}

/**
 * Unlock a milestone
 */
async function unlockMilestone(userId, milestoneId, milestoneDef) {
  try {
    const milestoneData = {
      type: milestoneDef.type,
      label: milestoneDef.label,
      description: milestoneDef.description || "",
      value: milestoneDef.targetValue,
      targetValue: milestoneDef.targetValue,
      unlockedAt: new Date().toISOString(),
      iconKey: milestoneDef.iconKey,
      isUnlocked: true,
    };

    // Try Firestore first
    if (db) {
      try {
        const milestoneRef = doc(db, "users", userId, "milestones", milestoneId);
        const existing = await getDoc(milestoneRef);
        
        if (!existing.exists() || !existing.data().isUnlocked) {
          await setDoc(milestoneRef, milestoneData, { merge: true });
          logInfo("milestoneService", "Milestone unlocked", { userId, milestoneId });
        }
        return;
      } catch (err) {
        logError("milestoneService", err, { function: "unlockMilestone", step: "firestore" });
      }
    }

    // Fallback to localStorage
    try {
      const key = `${MILESTONE_STORAGE_KEY}-${userId}`;
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      if (!stored[milestoneId] || !stored[milestoneId].isUnlocked) {
        stored[milestoneId] = milestoneData;
        localStorage.setItem(key, JSON.stringify(stored));
        logInfo("milestoneService", "Milestone unlocked (localStorage)", { userId, milestoneId });
      }
    } catch (err) {
      logError("milestoneService", err, { function: "unlockMilestone", step: "localStorage" });
    }
  } catch (err) {
    logError("milestoneService", err, { function: "unlockMilestone" });
  }
}

/**
 * Get milestone summary
 */
export async function getMilestoneSummary() {
  const userId = getCurrentUserId();
  if (!userId) {
    return {
      streak: { current: 0, longest: 0, lastActiveDate: null },
      coins: [],
    };
  }

  try {
    // Get streak from sessionHistory (works for both anonymous and logged-in)
    const streakStats = getStreakStats();
    
    // Get unlocked milestones
    let coins = [];

    // Try Firestore first
    if (db) {
      try {
        const milestonesRef = collection(db, "users", userId, "milestones");
        const querySnapshot = await getDocs(milestonesRef);
        
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.isUnlocked) {
            coins.push({
              id: docSnap.id,
              label: data.label,
              isUnlocked: true,
              unlockedAt: data.unlockedAt,
              iconKey: data.iconKey,
            });
          }
        });
      } catch (err) {
        logError("milestoneService", err, { function: "getMilestoneSummary", step: "firestore" });
      }
    }

    // Fallback to localStorage
    if (coins.length === 0) {
      try {
        const key = `${MILESTONE_STORAGE_KEY}-${userId}`;
        const stored = JSON.parse(localStorage.getItem(key) || "{}");
        coins = Object.entries(stored)
          .filter(([_, data]) => data.isUnlocked)
          .map(([id, data]) => ({
            id,
            label: data.label,
            isUnlocked: true,
            unlockedAt: data.unlockedAt,
            iconKey: data.iconKey,
          }));
      } catch (err) {
        logError("milestoneService", err, { function: "getMilestoneSummary", step: "localStorage" });
      }
    }

    // Sort by unlockedAt (most recent first)
    coins.sort((a, b) => {
      if (!a.unlockedAt) return 1;
      if (!b.unlockedAt) return -1;
      return new Date(b.unlockedAt) - new Date(a.unlockedAt);
    });

    return {
      streak: {
        current: streakStats.currentStreak || 0,
        longest: streakStats.longestStreak || 0,
        lastActiveDate: streakStats.lastSessionAt || null,
      },
      coins: coins.slice(0, 10), // Return top 10
    };
  } catch (err) {
    logError("milestoneService", err, { function: "getMilestoneSummary" });
    return {
      streak: { current: 0, longest: 0, lastActiveDate: null },
      coins: [],
    };
  }
}

export default {
  recordSessionEvent,
  recordToolCompletion,
  updateStreakOnActivity,
  getMilestoneSummary,
};

