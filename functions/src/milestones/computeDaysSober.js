// functions/src/milestones/computeDaysSober.js

/**
 * Compute days sober from a soberStart timestamp
 * @param {FirebaseFirestore.Timestamp|Date|number|null} soberStart - Start date of sobriety
 * @returns {number|null} Number of days sober, or null if no start date
 */
function computeDaysSober(soberStart) {
  if (!soberStart) {
    return null;
  }

  try {
    // Handle Firestore Timestamp
    let startDate;
    if (soberStart.toDate && typeof soberStart.toDate === "function") {
      startDate = soberStart.toDate();
    } else if (soberStart instanceof Date) {
      startDate = soberStart;
    } else if (typeof soberStart === "number") {
      startDate = new Date(soberStart);
    } else {
      return null;
    }

    // Calculate days difference
    const now = new Date();
    const diffTime = now - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Return 0 if negative (future date) or null if invalid
    return diffDays >= 0 ? diffDays : 0;
  } catch (err) {
    console.warn("Failed to compute days sober:", err.message);
    return null;
  }
}

module.exports = { computeDaysSober };

