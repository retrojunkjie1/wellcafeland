import { collection, getDocs, limit, orderBy, query, writeBatch, addDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { getAnonymousUserId } from "@/lib/userId";

const PREFIX = "wc-ai-conversation-memory-v1";
const LEGACY_MIGRATION_PREFIX = "wc-ai-conversation-memory-migrated-v1";
const CONTEXT_TURNS = 16;
const MAX_TEXT = 100000;
const MAX_CONTEXT_CHARS = 12000;

function memoryCollection() {
  const user = auth?.currentUser;
  const userId = user && !user.isAnonymous ? user.uid : null;
  return userId ? collection(db, "users", userId, "conversationMemory") : null;
}

export function hasAccountConversationMemory() {
  return Boolean(auth?.currentUser?.uid && !auth.currentUser.isAnonymous);
}

function migrateLegacyMemory() {
  const userId = auth?.currentUser?.uid;
  if (!userId || auth?.currentUser?.isAnonymous || typeof window === "undefined") return Promise.resolve();
  const migrationKey = `${LEGACY_MIGRATION_PREFIX}:${userId}`;
  if (localStorage.getItem(migrationKey) === "1") return Promise.resolve();

  let turns = [];
  const legacyKey = `${PREFIX}:${userId}`;
  try {
    const stored = JSON.parse(localStorage.getItem(legacyKey) || "[]");
    turns = Array.isArray(stored) ? stored.filter((turn) =>
      turn && typeof turn.user === "string" && typeof turn.assistant === "string"
    ) : [];
  } catch {
    turns = [];
  }

  return (async () => {
    const ref = memoryCollection();
    if (ref && turns.length) {
      for (const turn of turns) {
        await addDoc(ref, {
          user: turn.user.slice(0, MAX_TEXT),
          assistant: turn.assistant.slice(0, MAX_TEXT),
          savedAt: Number(turn.savedAt) || Date.now(),
          migrated: true,
        });
      }
    }
    localStorage.removeItem(legacyKey);
    localStorage.setItem(migrationKey, "1");
  })().catch((error) => {
    console.warn("Conversation memory migration could not complete.", error?.code || "unknown");
  });
}

export async function getConversationMemoryContext(enabled) {
  if (!enabled || typeof window === "undefined" || !hasAccountConversationMemory()) return "";
  try {
    await migrateLegacyMemory();
    const ref = memoryCollection();
    if (!ref) return "";
    const snapshot = await getDocs(query(ref, orderBy("savedAt", "desc"), limit(CONTEXT_TURNS)));
    const turns = snapshot.docs.map((item) => item.data()).reverse();
    return turns.map((turn, index) =>
      `Earlier exchange ${index + 1}:\nPerson: ${turn.user}\nGuide: ${turn.assistant}`
    ).join("\n\n").slice(-MAX_CONTEXT_CHARS);
  } catch (error) {
    console.warn("Conversation memory could not be loaded.", error?.code || "unknown");
    return "";
  }
}

export async function listConversationMemory() {
  if (!hasAccountConversationMemory()) return { ok: false, entries: [], reason: "account-required" };
  try {
    const ref = memoryCollection();
    if (!ref) return { ok: false, entries: [], reason: "account-required" };
    const snapshot = await getDocs(query(ref, orderBy("savedAt", "desc"), limit(50)));
    return {
      ok: true,
      entries: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
    };
  } catch (error) {
    console.warn("Conversation memory could not be reviewed.", error?.code || "unknown");
    return { ok: false, entries: [], reason: "unavailable" };
  }
}

export async function rememberConversationTurn({ user, assistant, enabled }) {
  if (!enabled || typeof window === "undefined" || !hasAccountConversationMemory()) return false;
  const userText = typeof user === "string" ? user.trim().slice(0, MAX_TEXT) : "";
  const assistantText = typeof assistant === "string" ? assistant.trim().slice(0, MAX_TEXT) : "";
  if (!userText || !assistantText) return false;
  try {
    await migrateLegacyMemory();
    const ref = memoryCollection();
    if (!ref) return false;
    await addDoc(ref, { user: userText, assistant: assistantText, savedAt: Date.now() });
    return true;
  } catch (error) {
    console.warn("Conversation memory could not be saved.", error?.code || "unknown");
    return false;
  }
}

export async function clearConversationMemory() {
  const userId = hasAccountConversationMemory() ? auth.currentUser.uid : null;
  if (userId) {
    try {
      const ref = memoryCollection();
      const snapshot = await getDocs(ref);
      for (let offset = 0; offset < snapshot.docs.length; offset += 450) {
        const batch = writeBatch(db);
        snapshot.docs.slice(offset, offset + 450).forEach((item) => batch.delete(item.ref));
        await batch.commit();
      }
    } catch (error) {
      console.warn("Conversation memory could not be cleared from the account.", error?.code || "unknown");
      return false;
    }
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(`${PREFIX}:${userId || getAnonymousUserId()}`);
      if (userId) localStorage.removeItem(`${LEGACY_MIGRATION_PREFIX}:${userId}`);
    } catch {
      // Local cleanup is best-effort when browser storage is unavailable.
    }
  }
  return true;
}
