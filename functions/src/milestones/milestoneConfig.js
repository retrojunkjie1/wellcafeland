// functions/src/milestones/milestoneConfig.js

/**
 * Milestone Configuration
 * Defines milestone days and corresponding coin assets
 */
const MILESTONES = [
  { days: 30, tier: "bronze", coinAssetPath: "assets/milestones/coin-30.svg" },
  { days: 60, tier: "silver", coinAssetPath: "assets/milestones/coin-60.svg" },
  { days: 90, tier: "gold", coinAssetPath: "assets/milestones/coin-90.svg" },
  { days: 180, tier: "platinum", coinAssetPath: "assets/milestones/coin-180.svg" },
  { days: 365, tier: "diamond", coinAssetPath: "assets/milestones/coin-365.svg" },
];

/**
 * Get milestone configuration for a given day count
 * @param {number} days - Number of days sober
 * @returns {object|null} Milestone config or null if no milestone reached
 */
function getMilestoneForDays(days) {
  return MILESTONES.find((m) => m.days === days) || null;
}

/**
 * Get all milestones that should be awarded (if days >= milestone)
 * @param {number} days - Number of days sober
 * @returns {Array} Array of milestone configs that should be awarded
 */
function getEarnedMilestones(days) {
  return MILESTONES.filter((m) => days >= m.days);
}

/**
 * Get encouraging relapse message
 * @returns {string} Supportive message about relapse
 */
function getRelapseMessage() {
  const messages = [
    "Recovery is a journey, not a destination. Every day you choose to start again is progress.",
    "Relapse is part of many recovery stories. What matters is that you're here, choosing to continue.",
    "You haven't failed. You've learned. Today is a new opportunity to build on your strength.",
    "Every moment of sobriety you've experienced is still valid. You're building resilience.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

module.exports = {
  MILESTONES,
  getMilestoneForDays,
  getEarnedMilestones,
  getRelapseMessage,
};

