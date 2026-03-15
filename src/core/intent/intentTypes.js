/**
 * Intent allowlist and normalization for Prompt-Native Spine.
 * Server and client must use the same allowlist.
 */

export const INTENT_ALLOWLIST = [
  "chat.message",
  "directory.search",
  "resource.preview",
  "tool.suggest",
  "tool.run",
  "page.navigate",
];

export function isIntentAllowed(type) {
  if (!type || typeof type !== "string") return false;
  return INTENT_ALLOWLIST.includes(type.trim());
}

export function normalizeIntent(inputIntent) {
  if (!inputIntent || typeof inputIntent !== "object") {
    return { type: "chat.message", payload: {} };
  }
  const type = (inputIntent.type || "chat.message").trim();
  const safeType = isIntentAllowed(type) ? type : "chat.message";
  const payload = inputIntent.payload && typeof inputIntent.payload === "object"
    ? inputIntent.payload
    : {};
  return { type: safeType, payload };
}
