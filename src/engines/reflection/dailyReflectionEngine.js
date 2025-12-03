// src/engines/reflection/dailyReflectionEngine.js
// Daily reflection prompts with deterministic seed
// Phase 41: Daily Reflection Engine

/**
 * Deterministic daily seed based on date (no backend required)
 */
function getDaySeed(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const DAILY_THEMES = [
  "grounding",
  "self-compassion",
  "grief",
  "boundaries",
  "rest",
  "hope",
  "gratitude",
  "presence",
];

/**
 * Get daily reflection based on date
 * @param {Date} date - Date for reflection
 * @returns {Object} Reflection object with theme, title, and prompt
 */
export function getDailyReflection(date = new Date()) {
  const seed = getDaySeed(date);
  const index = (seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % DAILY_THEMES.length);
  const theme = DAILY_THEMES[index];

  switch (theme) {
    case "grounding":
      return {
        theme,
        title: "Return to the Present",
        prompt: "Where in your body do you feel most settled right now, even if it's only a little bit?",
      };
    
    case "self-compassion":
      return {
        theme,
        title: "Softness Toward Yourself",
        prompt: "If your closest friend felt what you feel today, what would you want them to hear?",
      };
    
    case "grief":
      return {
        theme,
        title: "Space for Grief",
        prompt: "What loss are you carrying today? You don't have to fix it—just notice it.",
      };
    
    case "boundaries":
      return {
        theme,
        title: "Protecting Your Peace",
        prompt: "Where have you been saying yes when your body is saying no?",
      };
    
    case "rest":
      return {
        theme,
        title: "Permission to Rest",
        prompt: "What would change if you gave yourself full permission to rest today, even if nothing is 'done'?",
      };
    
    case "hope":
      return {
        theme,
        title: "Small Glimmers",
        prompt: "What is one small thing—even tiny—that feels a little bit lighter today?",
      };
    
    case "gratitude":
      return {
        theme,
        title: "Quiet Gratitude",
        prompt: "What is one thing you're grateful for today, even if it's as simple as a hot shower or a moment of quiet?",
      };
    
    case "presence":
      return {
        theme,
        title: "Being Here Now",
        prompt: "If you could be fully present for just one moment today, what would that moment be?",
      };
    
    default:
      return {
        theme: "check-in",
        title: "Gentle Check-In",
        prompt: "What is one word that describes your inner weather today?",
      };
  }
}

