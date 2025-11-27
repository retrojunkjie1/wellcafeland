// src/services/nudgeService.js
// Gentle nudge service for reflection prompts
// Non-spammy, time-aware suggestions

import { getMilestoneSummary } from "./milestoneService";
import { listFavorites } from "./favoritesService";
import { getStreakStats } from "./sessionHistory";
import { getCurrentProfile } from "./profileService";
import { logInfo } from "./logService";

/**
 * Get nudges for the current user
 * Returns at most 1-3 gentle suggestions
 */
export async function getNudgesForUser() {
  try {
    const nudges = [];

    // Get user context
    const [milestoneSummary, favorites, streakStats, profile] = await Promise.all([
      getMilestoneSummary(),
      listFavorites(),
      Promise.resolve(getStreakStats()),
      getCurrentProfile(),
    ]);

    const currentStreak = milestoneSummary.streak?.current || streakStats.currentStreak || 0;
    const lastSessionAt = milestoneSummary.streak?.lastActiveDate || streakStats.lastSessionAt;
    const daysSinceLastSession = lastSessionAt 
      ? Math.floor((Date.now() - new Date(lastSessionAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Nudge 1: Long time since last check-in
    if (daysSinceLastSession >= 3 && daysSinceLastSession < 30) {
      nudges.push({
        id: "checkin_reminder",
        text: `It's been ${daysSinceLastSession} day${daysSinceLastSession > 1 ? "s" : ""} since your last check-in. Want to talk?`,
        actionLabel: "Start a conversation",
        actionType: "open_chat_with_prompt",
        actionPayload: { prompt: "I'd like to check in about how I'm feeling right now." },
        priority: daysSinceLastSession >= 7 ? "high" : "medium",
      });
    }

    // Nudge 2: Streak milestone approaching
    if (currentStreak > 0 && currentStreak < 90) {
      const nextMilestone = [7, 14, 30, 60, 90].find(m => m > currentStreak);
      if (nextMilestone && nextMilestone - currentStreak <= 2) {
        nudges.push({
          id: "streak_milestone",
          text: `You're ${nextMilestone - currentStreak} day${nextMilestone - currentStreak > 1 ? "s" : ""} away from a ${nextMilestone}-day streak. Keep going.`,
          actionLabel: "Continue streak",
          actionType: "open_tool",
          actionPayload: { toolId: "breathing", duration: 3 },
          priority: "low",
        });
      }
    }

    // Nudge 3: Suggest pinning frequently used tools
    if (favorites.length < 3) {
      // Check if user has used tools but not pinned them
      // This would require tool usage tracking - for now, just suggest
      nudges.push({
        id: "pin_tool",
        text: "You can pin any practice you want to return to easily.",
        actionLabel: "Browse tools",
        actionType: "open_directory",
        actionPayload: { path: "/tools" },
        priority: "low",
      });
    }

    // Nudge 4: Focus area reminder
    if (profile.focusAreas && profile.focusAreas.length > 0) {
      const focusArea = profile.focusAreas[0];
      nudges.push({
        id: "focus_area",
        text: `Want to explore more about ${focusArea}?`,
        actionLabel: "Learn more",
        actionType: "open_chat_with_prompt",
        actionPayload: { prompt: `Tell me more about ${focusArea}` },
        priority: "low",
      });
    }

    // Nudge 5: Streak broken but not too long
    if (currentStreak === 0 && daysSinceLastSession > 1 && daysSinceLastSession <= 7) {
      nudges.push({
        id: "streak_restart",
        text: "Your progress starts the moment you show up. Today can be Day 1.",
        actionLabel: "Start today",
        actionType: "open_tool",
        actionPayload: { toolId: "grounding" },
        priority: "medium",
      });
    }

    // Sort by priority (high > medium > low) and limit to 3
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    nudges.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    
    return nudges.slice(0, 3);
  } catch (err) {
    console.error("Failed to get nudges:", err);
    return [];
  }
}

export default {
  getNudgesForUser,
};

