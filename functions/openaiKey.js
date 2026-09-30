const PLACEHOLDER_PATTERNS = [
  "sk-placeholder",
  "your-api-key-here",
  "your-openai-api-key",
  "your-openai-key",
  "your_api_key_here",
  "xxx",
];

function isPlaceholderKey(value) {
  if (!value || typeof value !== "string") return true;
  const key = value.trim();
  if (key.length < 10) return true;
  const normalized = key.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((pattern) => normalized.includes(pattern));
}

/** Production functions bind OPENAI_API_KEY from Secret Manager; emulators read functions/.env. */
function getResolvedOpenAIKey(env = process.env) {
  const key = (env.OPENAI_API_KEY || "").trim();
  if (!isPlaceholderKey(key)) return { key, source: "OPENAI_API_KEY" };
  return { key: null, source: "none" };
}

module.exports = { getResolvedOpenAIKey, isPlaceholderKey };
