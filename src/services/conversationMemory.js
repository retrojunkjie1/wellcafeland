import { auth } from "@/firebase";
import { getAnonymousUserId } from "@/lib/userId";

const PREFIX = "wc-ai-conversation-memory-v1";
const MAX_TURNS = 8;
const MAX_TEXT = 1800;

function storageKey() {
  const scope = auth?.currentUser?.uid || getAnonymousUserId();
  return `${PREFIX}:${scope}`;
}

function readTurns() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey()) || "[]");
    return Array.isArray(value) ? value.filter((turn) =>
      turn && typeof turn.user === "string" && typeof turn.assistant === "string"
    ).slice(-MAX_TURNS) : [];
  } catch {
    return [];
  }
}

export function getConversationMemoryContext(enabled) {
  if (!enabled || typeof window === "undefined") return "";
  const turns = readTurns();
  if (!turns.length) return "";
  return turns.map((turn, index) =>
    `Earlier exchange ${index + 1}:\nPerson: ${turn.user}\nGuide: ${turn.assistant}`
  ).join("\n\n").slice(-9000);
}

export function rememberConversationTurn({ user, assistant, enabled }) {
  if (!enabled || typeof window === "undefined") return;
  const userText = typeof user === "string" ? user.trim().slice(0, MAX_TEXT) : "";
  const assistantText = typeof assistant === "string" ? assistant.trim().slice(0, MAX_TEXT) : "";
  if (!userText || !assistantText) return;
  const turns = [...readTurns(), { user: userText, assistant: assistantText, savedAt: Date.now() }].slice(-MAX_TURNS);
  try {
    localStorage.setItem(storageKey(), JSON.stringify(turns));
  } catch {
    // A full or unavailable browser store must not interrupt a chat response.
  }
}

export function clearConversationMemory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey());
    localStorage.removeItem("wc-voice-sessions");
  } catch {
    // Clearing local personalization is best-effort when browser storage is unavailable.
  }
}
