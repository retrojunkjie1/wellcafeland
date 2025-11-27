// src/services/spiritualAnalysis.js
// Spiritual state analysis aligned with Odinala + Eastern Medicine foundation

/**
 * Analyze spiritual state from user text
 * Returns spiritual need type and indicators
 */
export function analyzeSpiritualState(text) {
  if (!text || typeof text !== "string") {
    return {
      spiritualNeed: null,
      indicators: [],
    };
  }

  const lowerText = text.toLowerCase();
  const indicators = [];

  // Grounding needs - scattered, disconnected from body/earth
  const groundingKeywords = [
    "scattered", "dizzy", "lost", "unbalanced", "uncentered", "floating",
    "ungrounded", "disconnected from body", "not in my body", "spaced out",
    "can't feel my feet", "not present", "disconnected from earth",
    "unstable", "wobbly", "shaky foundation"
  ];
  const groundingCount = groundingKeywords.filter(kw => lowerText.includes(kw)).length;
  if (groundingCount > 0) {
    indicators.push(...groundingKeywords.filter(kw => lowerText.includes(kw)));
  }

  // Cleansing needs - heavy, blocked energy, spiritual weight
  const cleansingKeywords = [
    "heavy", "blocked", "energy off", "stuck energy", "spiritual weight",
    "dark energy", "negative energy", "need to cleanse", "spiritual block",
    "energy blocked", "can't flow", "stagnant", "dense", "thick energy",
    "spiritual heaviness", "need clearing", "blocked chakras"
  ];
  const cleansingCount = cleansingKeywords.filter(kw => lowerText.includes(kw)).length;
  if (cleansingCount > 0) {
    indicators.push(...cleansingKeywords.filter(kw => lowerText.includes(kw)));
  }

  // Alignment needs - confusion about self, purpose, path
  const alignmentKeywords = [
    "confused", "not myself", "lost my way", "don't know my path",
    "spiritual confusion", "not aligned", "out of alignment", "misaligned",
    "wrong path", "don't know who i am", "lost my purpose", "spiritual crisis",
    "identity crisis", "don't know my purpose", "spiritually lost"
  ];
  const alignmentCount = alignmentKeywords.filter(kw => lowerText.includes(kw)).length;
  if (alignmentCount > 0) {
    indicators.push(...alignmentKeywords.filter(kw => lowerText.includes(kw)));
  }

  // Identity distress - deeper existential questioning
  const identityKeywords = [
    "who am i", "i don't know me", "i don't recognize myself", "not me",
    "lost myself", "don't know who i am", "identity", "existential",
    "who am i really", "what am i", "i'm not me", "someone else",
    "don't know my identity", "lost my identity", "identity crisis"
  ];
  const identityCount = identityKeywords.filter(kw => lowerText.includes(kw)).length;
  if (identityCount > 0) {
    indicators.push(...identityKeywords.filter(kw => lowerText.includes(kw)));
  }

  // Protection needs - feeling vulnerable, attacked, unsafe spiritually
  const protectionKeywords = [
    "spiritually vulnerable", "spiritual attack", "negative spirits",
    "need protection", "spiritually unsafe", "spiritual boundary",
    "energy vampire", "drained spiritually", "spiritual violation"
  ];
  const protectionCount = protectionKeywords.filter(kw => lowerText.includes(kw)).length;
  if (protectionCount > 0) {
    indicators.push(...protectionKeywords.filter(kw => lowerText.includes(kw)));
  }

  // Determine primary spiritual need
  let spiritualNeed = null;
  const counts = {
    grounding: groundingCount,
    cleansing: cleansingCount,
    alignment: alignmentCount,
    identity: identityCount,
    protection: protectionCount,
  };

  const maxCount = Math.max(...Object.values(counts));
  if (maxCount > 0) {
    if (counts.identity >= maxCount) {
      spiritualNeed = "identity";
    } else if (counts.grounding >= maxCount) {
      spiritualNeed = "grounding";
    } else if (counts.cleansing >= maxCount) {
      spiritualNeed = "cleansing";
    } else if (counts.alignment >= maxCount) {
      spiritualNeed = "alignment";
    } else if (counts.protection >= maxCount) {
      spiritualNeed = "protection";
    }
  }

  return {
    spiritualNeed,
    indicators: [...new Set(indicators)], // Remove duplicates
  };
}

export default {
  analyzeSpiritualState,
};

