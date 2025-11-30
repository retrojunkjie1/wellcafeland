// src/core/system/humanModeNavigator.js
// Phase 25.2 — Human Mode Navigator (HMN)
// Full-spectrum topic & tone classification for natural human conversation.
// NO side-effects, NO React imports, NO external calls.

/**
 * Classify the human mode/topic of a text input.
 * @param {string} text
 * @returns {{ mode: string }}
 */
export function classifyHumanMode(text) {
  if (!text || typeof text !== "string") return { mode: "default" };

  const t = text.toLowerCase();

  const contains = (arr) => arr.some((w) => t.includes(w));

  // 1) HIGH RISK (override everything)
  const crisisWords = ["kill myself", "suicide", "end it", "can't take it"];
  if (contains(crisisWords)) return { mode: "high_risk" };

  // 2) HUMOR / PLAY
  const humorWords = ["lol", "lmao", "haha", "🤣", "😂", "joke", "fart", "poop", "bruh", "wtf"];
  if (contains(humorWords)) return { mode: "humor" };

  // 3) CURRENT AFFAIRS
  const newsWords = ["election", "president", "breaking news", "war", "inflation", "economy", "congress"];
  if (contains(newsWords)) return { mode: "current_affairs" };

  // 4) POLITICS
  const politicsWords = ["republican", "democrat", "liberal", "conservative", "policy", "voting"];
  if (contains(politicsWords)) return { mode: "politics" };

  // 5) ENTERTAINMENT
  const entertainmentWords = ["movie", "netflix", "actor", "rapper", "celebrity", "oscars", "album"];
  if (contains(entertainmentWords)) return { mode: "entertainment" };

  // 6) CASUAL LIFESTYLE / BODY QUESTIONS
  const lifestyleWords = ["why does my", "how do i", "is it normal", "explain", "my skin", "my hair", "my fart"];
  if (contains(lifestyleWords)) return { mode: "casual" };

  // 7) RELATIONSHIP & SOCIAL LIFE
  const relationshipWords = ["my friend", "my partner", "my wife", "my husband", "my girlfriend", "my boyfriend"];
  if (contains(relationshipWords)) return { mode: "relationships" };

  // 8) TECH / WORK / MONEY
  const techWords = ["app", "coding", "laptop", "startup", "money", "job", "business", "side hustle"];
  if (contains(techWords)) return { mode: "tech_life" };

  // 9) WELLNESS / RECOVERY
  const wellnessWords = ["craving", "urge", "overwhelmed", "anxious", "guilt", "shame", "therapy"];
  if (contains(wellnessWords)) return { mode: "wellness" };

  return { mode: "default" };
}

/**
 * Get behavior configuration for a human mode.
 * @param {string} mode
 * @returns {{ type: string, tone: string, redirect: string, opener: string, closer: string | null }}
 */
export function handleHumanMode(mode) {
  switch (mode) {
    case "humor":
      return {
        type: "fun",
        tone: "light",
        redirect: "gentle",
        opener: random([
          "🤣 You're hilarious.",
          "😂 That cracked me up.",
          "🤣 I was NOT expecting that!",
        ]),
        closer: "By the way… how are *you* doing today?",
      };

    case "current_affairs":
      return {
        type: "info",
        tone: "balanced",
        redirect: "soft",
        opener: random([
          "Here's what's happening:",
          "Let's break it down simply:",
          "Okay, in plain English:",
        ]),
        closer: "And beyond the news… how's your mind holding up?",
      };

    case "politics":
      return {
        type: "discussion",
        tone: "neutral",
        redirect: "soft",
        opener: "Here's a grounded, fact-based view:",
        closer: "Politics aside… how are *you* personally?",
      };

    case "entertainment":
      return {
        type: "fun",
        tone: "casual",
        redirect: "soft",
        opener: "Ohhh yes, let's talk about it!",
        closer: "And hey… how's your spirit today?",
      };

    case "casual":
      return {
        type: "info",
        tone: "friendly",
        redirect: "soft",
        opener: "Okay, here's the deal:",
        closer: "Also… how are *you* though?",
      };

    case "relationships":
      return {
        type: "support",
        tone: "warm",
        redirect: "medium",
        opener: "Let's unpack this gently:",
        closer: "And how are *you* feeling underneath that?",
      };

    case "tech_life":
      return {
        type: "info",
        tone: "helpful",
        redirect: "soft",
        opener: "Here's what you need to know:",
        closer: "And outside of work… how is your heart?",
      };

    case "wellness":
      return {
        type: "therapeutic",
        tone: "calm",
        redirect: "none",
        opener: "I'm right here with you.",
        closer: null,
      };

    case "high_risk":
      return {
        type: "safety",
        tone: "grounded",
        redirect: "immediate",
        opener: "I'm really glad you reached out.",
        closer: null,
      };

    default:
      return {
        type: "default",
        tone: "neutral",
        redirect: "optional",
        opener: "",
        closer: "",
      };
  }
}

/**
 * Helper to randomly select from an array.
 * @param {Array} arr
 * @returns {*}
 */
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default {
  classifyHumanMode,
  handleHumanMode,
};

