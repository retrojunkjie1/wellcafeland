// src/core/system/behavioralDriftEngine.js
// Phase 28 — Behavioral Drift Engine (BDE)
// Pure, side-effect-free behavioral pattern analysis
// NO React imports, NO external calls, NO side effects

/**
 * Compute behavioral drift from message history.
 * @param {Array} messages - Array of message objects
 * @returns {{
 *   slope: "up" | "down" | "flat",
 *   direction: "improving" | "declining" | "stable",
 *   volatility: number,
 *   emotionalDrift: "stable" | "rising" | "falling" | "unstable",
 *   spikes: number,
 *   engagementPattern: "high" | "medium" | "low" | "avoidant" | "seeking",
 *   avoidance: number,
 *   dominantDomains: string[],
 *   recurrenceScore: number
 * }}
 */
export function computeMessageDrift(messages) {
  try {
    const safeMessages = Array.isArray(messages) ? messages : [];
    if (safeMessages.length === 0) {
      return {
        slope: "flat",
        direction: "stable",
        volatility: 0,
        emotionalDrift: "stable",
        spikes: 0,
        engagementPattern: "medium",
        avoidance: 0,
        dominantDomains: [],
        recurrenceScore: 0,
      };
    }

    // Extract user messages only
    const userMessages = safeMessages.filter((m) => m.role === "user");

    if (userMessages.length < 2) {
      return {
        slope: "flat",
        direction: "stable",
        volatility: 0,
        emotionalDrift: "stable",
        spikes: 0,
        engagementPattern: "medium",
        avoidance: 0,
        dominantDomains: [],
        recurrenceScore: 0,
      };
    }

    // 1) Slope = average sentence length trend
    const sentenceLengths = userMessages.map((m) => {
      const text = typeof m.content === "string" ? m.content : "";
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      return sentences.length > 0 ? text.length / sentences.length : 0;
    });

    let slope = "flat";
    if (sentenceLengths.length >= 2) {
      const firstHalf = sentenceLengths.slice(0, Math.floor(sentenceLengths.length / 2));
      const secondHalf = sentenceLengths.slice(Math.floor(sentenceLengths.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const delta = secondAvg - firstAvg;
      if (delta > 5) {
        slope = "up";
      } else if (delta < -5) {
        slope = "down";
      }
    }

    // 2) Direction = based on change in emotional intensity
    const intensities = userMessages
      .map((m) => (m.emotion && typeof m.emotion.intensity === "number" ? m.emotion.intensity : 0))
      .filter((v) => !Number.isNaN(v));

    let direction = "stable";
    if (intensities.length >= 2) {
      const firstHalf = intensities.slice(0, Math.floor(intensities.length / 2));
      const secondHalf = intensities.slice(Math.floor(intensities.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const delta = secondAvg - firstAvg;
      if (delta > 0.1) {
        direction = "declining"; // Higher intensity = more distress
      } else if (delta < -0.1) {
        direction = "improving"; // Lower intensity = less distress
      }
    }

    // 3) Volatility = variance of emotion intensity
    let volatility = 0;
    if (intensities.length >= 2) {
      const mean = intensities.reduce((a, b) => a + b, 0) / intensities.length;
      const variance = intensities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intensities.length;
      volatility = Math.min(1, Math.max(0, Math.sqrt(variance)));
    }

    // 4) Emotional drift = compare recent emotion labels
    const labels = userMessages
      .map((m) => (m.emotion && typeof m.emotion.label === "string" ? m.emotion.label.toLowerCase() : ""))
      .filter((l) => l.length > 0);

    let emotionalDrift = "stable";
    if (labels.length >= 3) {
      const recent = labels.slice(-3);
      const earlier = labels.slice(0, -3);
      const negativeLabels = ["ashamed", "anxious", "overwhelmed", "angry", "sad", "hopeless"];
      const recentNegative = recent.filter((l) => negativeLabels.some((n) => l.includes(n))).length;
      const earlierNegative = earlier.filter((l) => negativeLabels.some((n) => l.includes(n))).length;
      if (recentNegative > earlierNegative + 1) {
        emotionalDrift = "rising";
      } else if (recentNegative < earlierNegative - 1) {
        emotionalDrift = "falling";
      } else if (volatility > 0.3) {
        emotionalDrift = "unstable";
      }
    }

    // 5) Spikes = count of sharp intensity jumps
    let spikes = 0;
    for (let i = 1; i < intensities.length; i++) {
      const jump = Math.abs(intensities[i] - intensities[i - 1]);
      if (jump > 0.4) {
        spikes++;
      }
    }

    // 6) Engagement pattern = based on gaps between messages + message length
    let engagementPattern = "medium";
    if (userMessages.length >= 2) {
      const timestamps = userMessages
        .map((m) => (typeof m.timestamp === "number" ? m.timestamp : Date.now()))
        .sort((a, b) => a - b);
      const gaps = [];
      for (let i = 1; i < timestamps.length; i++) {
        gaps.push(timestamps[i] - timestamps[i - 1]);
      }
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const avgLength = userMessages.reduce((sum, m) => {
        const text = typeof m.content === "string" ? m.content : "";
        return sum + text.length;
      }, 0) / userMessages.length;

      if (avgGap < 60000 && avgLength > 50) {
        // < 1 min gap, > 50 chars
        engagementPattern = "high";
      } else if (avgGap > 300000 && avgLength < 20) {
        // > 5 min gap, < 20 chars
        engagementPattern = "avoidant";
      } else if (avgGap < 120000 && avgLength > 30) {
        // < 2 min gap, > 30 chars
        engagementPattern = "seeking";
      } else if (avgGap > 600000) {
        // > 10 min gap
        engagementPattern = "low";
      }
    }

    // 7) Avoidance = % of humor/casual modes vs emotional_heavy modes
    const humanModes = userMessages
      .map((m) => (typeof m.humanMode === "string" ? m.humanMode : ""))
      .filter((m) => m.length > 0);
    const lightModes = humanModes.filter((m) => ["humor", "casual", "entertainment", "politics"].includes(m)).length;
    const heavyModes = humanModes.filter((m) => ["emotional_heavy", "recovery_core", "risk_sensitive"].includes(m)).length;
    const totalModes = humanModes.length;
    const avoidance = totalModes > 0 ? Math.min(1, Math.max(0, lightModes / totalModes)) : 0;

    // 8) Dominant domains = recurring trigger domains
    const allTriggers = userMessages.flatMap((m) => {
      if (Array.isArray(m.triggers)) {
        return m.triggers;
      }
      return [];
    });
    const triggerCounts = {};
    allTriggers.forEach((t) => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
    const dominantDomains = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain]) => domain);

    // 9) Recurrence score = frequency of repeated themes
    const themes = userMessages.map((m) => {
      const text = typeof m.content === "string" ? m.content.toLowerCase() : "";
      const label = (m.emotion && typeof m.emotion.label === "string" ? m.emotion.label.toLowerCase() : "") || "";
      return `${label}_${text.substring(0, 20)}`;
    });
    const themeCounts = {};
    themes.forEach((t) => {
      themeCounts[t] = (themeCounts[t] || 0) + 1;
    });
    const repeatedThemes = Object.values(themeCounts).filter((count) => count > 1).length;
    const recurrenceScore = Math.min(1, repeatedThemes / Math.max(1, themes.length));

    return {
      slope,
      direction,
      volatility,
      emotionalDrift,
      spikes,
      engagementPattern,
      avoidance,
      dominantDomains,
      recurrenceScore,
    };
  } catch (err) {
    console.warn("[behavioralDriftEngine] computeMessageDrift failed:", err);
    return {
      slope: "flat",
      direction: "stable",
      volatility: 0,
      emotionalDrift: "stable",
      spikes: 0,
      engagementPattern: "medium",
      avoidance: 0,
      dominantDomains: [],
      recurrenceScore: 0,
    };
  }
}

export default {
  computeMessageDrift,
};

