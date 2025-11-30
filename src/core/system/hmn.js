// src/core/system/hmn.js
// Human Mode Navigator (HMN)
// Lightweight classifier for conversational mode / intent.
//
// This is NOT clinical. It is about "how" the user is talking:
// - humor, casual, curiosity
// - politics, entertainment, news
// - body questions (e.g. fart, poop, sweat, etc.)
// - life advice, random questions
// - recovery-core / emotionally heavy / risk-sensitive

/**
 * Normalize text to safe lowercase string.
 * @param {string} text
 * @returns {string}
 */
function normalize(text) {
  if (!text || typeof text !== "string") return "";
  return text.toLowerCase().trim();
}

/**
 * Check if text contains any of the phrases.
 * @param {string} text
 * @param {string[]} phrases
 * @returns {boolean}
 */
function hasAny(text, phrases) {
  const lower = normalize(text);
  if (!lower) return false;
  return phrases.some((p) => lower.includes(p));
}

/**
 * Humor detector.
 * Covers jokes, memes, silly questions (like fart questions),
 * and general playful tone.
 * @param {string} text
 * @returns {boolean}
 */
export function detectHumor(text) {
  const lower = normalize(text);
  if (!lower) return false;

  const humorMarkers = [
    "lol",
    "lmao",
    "lmfao",
    "rofl",
    "😂",
    "🤣",
    "haha",
    "hehe",
    "that's funny",
    "joke",
    "just kidding",
    "jk",
    "meme",
    "goofy",
    "silly",
  ];

  const bodySilly = [
    "fart",
    "my fart",
    "why does my fart",
    "gas smells",
    "my poop",
    "my shit",
    "why does my shit",
    "why does my butt",
  ];

  if (hasAny(lower, humorMarkers)) return true;
  if (hasAny(lower, bodySilly)) return true;

  // Question structure + non-serious content (rough heuristic)
  const isQuestion = lower.endsWith("?") || lower.startsWith("why does") || lower.startsWith("what if");
  const hasBodyWord =
    lower.includes("fart") ||
    lower.includes("poop") ||
    lower.includes("pee") ||
    lower.includes("urine") ||
    lower.includes("armpit") ||
    lower.includes("breath smell");

  if (isQuestion && hasBodyWord && !hasAny(lower, ["pain", "bleeding", "hospital"])) {
    return true;
  }

  return false;
}

/**
 * Casual / small-talk detector.
 * @param {string} text
 * @returns {boolean}
 */
export function detectCasual(text) {
  const lower = normalize(text);
  if (!lower) return false;

  const casualMarkers = [
    "what's up",
    "whats up",
    "how's it going",
    "hows it going",
    "how are you",
    "just checking in",
    "bored",
    "i'm bored",
    "im bored",
    "random question",
    "just curious",
    "curious about",
  ];

  return hasAny(lower, casualMarkers);
}

/**
 * Curiosity / life-advice detector.
 * @param {string} text
 * @returns {boolean}
 */
export function detectCuriosity(text) {
  const lower = normalize(text);
  if (!lower) return false;

  const curiosityMarkers = [
    "why do people",
    "why does my",
    "how do i",
    "should i",
    "is it okay if",
    "what should i do",
    "how can i",
    "what happens if",
  ];

  return hasAny(lower, curiosityMarkers);
}

/**
 * Entertainment / pop culture detector.
 * @param {string} text
 * @returns {boolean}
 */
export function detectEntertainment(text) {
  const lower = normalize(text);
  if (!lower) return false;

  const entertainmentMarkers = [
    "movie",
    "film",
    "series",
    "netflix",
    "hulu",
    "hbo",
    "prime video",
    "disney+",
    "song",
    "album",
    "playlist",
    "music",
    "rapper",
    "singer",
    "celebrity",
    "famous",
    "actor",
    "actress",
    "tv show",
  ];

  return hasAny(lower, entertainmentMarkers);
}

/**
 * Politics / current affairs detector.
 * @param {string} text
 * @returns {boolean}
 */
export function detectPoliticsOrNews(text) {
  const lower = normalize(text);
  if (!lower) return false;

  const politicsMarkers = [
    "election",
    "president",
    "presidential",
    "senate",
    "congress",
    "parliament",
    "democrat",
    "republican",
    "left wing",
    "right wing",
    "liberal",
    "conservative",
    "policy",
    "government",
    "politics",
  ];

  const newsMarkers = [
    "breaking news",
    "headline",
    "in the news",
    "new law",
    "just happened",
    "did you hear about",
  ];

  if (hasAny(lower, politicsMarkers)) return true;
  if (hasAny(lower, newsMarkers)) return true;

  return false;
}

/**
 * Body-question detector (health-ish but casual).
 * @param {string} text
 * @returns {boolean}
 */
export function detectBodyQuestion(text) {
  const lower = normalize(text);
  if (!lower) return false;

  const bodyMarkers = [
    "fart",
    "gas",
    "poop",
    "stool",
    "bowel",
    "shit",
    "pee",
    "urine",
    "sweat",
    "armpit",
    "breath smell",
    "smell bad",
    "body odor",
  ];

  const questionMarkers = ["why does", "how come", "is it normal", "should i worry"];

  if (hasAny(lower, bodyMarkers) && hasAny(lower, questionMarkers)) {
    return true;
  }

  return false;
}

/**
 * Life-advice / personal life themes.
 * @param {string} text
 * @returns {boolean}
 */
export function detectLifeAdvice(text) {
  const lower = normalize(text);
  if (!lower) return false;

  const lifeMarkers = [
    "relationship",
    "my partner",
    "my wife",
    "my husband",
    "my girlfriend",
    "my boyfriend",
    "my kids",
    "my child",
    "my family",
    "my job",
    "my boss",
    "my work",
    "career",
    "life decision",
    "should i move",
    "should i stay",
  ];

  return hasAny(lower, lifeMarkers);
}

/**
 * Emotional heavy / recovery-core themes.
 * This is different from clinical risk; it's about emotional weight.
 * @param {string} text
 * @returns {boolean}
 */
export function detectEmotionalHeavy(text) {
  const lower = normalize(text);
  if (!lower) return false;

  const heavyMarkers = [
    "i can't do this",
    "cant do this",
    "i'm done",
    "im done",
    "so tired of this",
    "i hate myself",
    "i'm broken",
    "im broken",
    "i feel empty",
    "nothing matters",
    "no one cares",
    "i feel alone",
    "i'm alone",
    "im alone",
  ];

  return hasAny(lower, heavyMarkers);
}

/**
 * Recovery-core language (substance, relapse, urges).
 * @param {string} text
 * @returns {boolean}
 */
export function detectRecoveryCore(text) {
  const lower = normalize(text);
  if (!lower) return false;

  const recoveryMarkers = [
    "relapse",
    "use again",
    "use tonight",
    "get high",
    "get drunk",
    "drink again",
    "craving",
    "cravings",
    "urge to use",
    "using again",
    "slip up",
    "sober",
    "stay sober",
  ];

  return hasAny(lower, recoveryMarkers);
}

/**
 * Get human conversational mode for a given text.
 * context can optionally include { emotion, risk } but is not required.
 *
 * Returns one of:
 * "risk_sensitive"
 * "recovery_core"
 * "emotional_heavy"
 * "humor"
 * "body_question"
 * "entertainment"
 * "politics"
 * "life_advice"
 * "casual"
 * "curiosity"
 * "neutral"
 *
 * @param {string} text
 * @param {Object} [context]
 * @param {Object} [context.emotion]
 * @param {Object} [context.risk]
 * @returns {string}
 */
export function getHumanMode(text, context = {}) {
  const lower = normalize(text);
  const emotion = context.emotion || null;
  const risk = context.risk || null;

  // Priority 1: Explicit high risk → risk_sensitive
  if (risk && risk.riskLevel === "high") {
    return "risk_sensitive";
  }

  // Priority 2: Strong recovery language.
  if (detectRecoveryCore(lower)) {
    return "recovery_core";
  }

  // Priority 3: Emotion-heavy phrasing or high-intensity emotion.
  const highIntensity = typeof emotion?.intensity === "number" && emotion.intensity >= 0.8;
  if (detectEmotionalHeavy(lower) || highIntensity) {
    return "emotional_heavy";
  }

  // Priority 4: Humor (includes silly body questions, memes, etc.).
  if (detectHumor(lower)) {
    return "humor";
  }

  // Priority 5: Body questions (non-urgent).
  if (detectBodyQuestion(lower)) {
    return "body_question";
  }

  // Priority 6: Entertainment / pop culture.
  if (detectEntertainment(lower)) {
    return "entertainment";
  }

  // Priority 7: Politics / news.
  if (detectPoliticsOrNews(lower)) {
    return "politics";
  }

  // Priority 8: Life advice.
  if (detectLifeAdvice(lower)) {
    return "life_advice";
  }

  // Priority 9: Curiosity / random questions.
  if (detectCuriosity(lower)) {
    return "curiosity";
  }

  // Priority 10: Small talk / casual.
  if (detectCasual(lower)) {
    return "casual";
  }

  return "neutral";
}

export default {
  detectHumor,
  detectCasual,
  detectCuriosity,
  detectEntertainment,
  detectPoliticsOrNews,
  detectBodyQuestion,
  detectLifeAdvice,
  detectEmotionalHeavy,
  detectRecoveryCore,
  getHumanMode,
};

