// src/services/chatMemoryStore.js
// Phase 52: Local-first chat memory, Firestore-upgradable

const MAX_MESSAGES = 60;
const MAX_TEXT_LEN = 8000;
const STORAGE_PREFIX = "wc:chat:v1:";

function getStorageKey(uid, threadId) {
  const u = (uid || "anon").replace(/[^a-zA-Z0-9_-]/g, "_");
  const t = (threadId || "default").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${STORAGE_PREFIX}${u}:${t}`;
}

function truncateText(text) {
  if (!text || typeof text !== "string") return "";
  return text.length > MAX_TEXT_LEN ? text.slice(0, MAX_TEXT_LEN) : text;
}

function safeMessage(msg) {
  if (!msg || typeof msg !== "object") return null;
  const role = ["user", "assistant", "system"].includes(msg.role) ? msg.role : "user";
  const text = truncateText(msg.text || msg.content || "");
  return {
    id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    role,
    text,
    ts: msg.ts ?? Date.now(),
  };
}

export function loadThread({ uid, threadId }) {
  try {
    const key = getStorageKey(uid, threadId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    return items.slice(-MAX_MESSAGES).map((m) => safeMessage(m)).filter(Boolean);
  } catch {
    return [];
  }
}

export function saveThread({ uid, threadId, items }) {
  try {
    const key = getStorageKey(uid, threadId);
    const safe = (Array.isArray(items) ? items : []).slice(-MAX_MESSAGES).map((m) => safeMessage(m)).filter(Boolean);
    localStorage.setItem(key, JSON.stringify({ updatedAt: Date.now(), items: safe }));
  } catch {
    // ignore
  }
}

export function appendMessage({ uid, threadId, message }) {
  const items = loadThread({ uid, threadId });
  const m = safeMessage(message);
  if (!m) return items;
  const next = [...items, m].slice(-MAX_MESSAGES);
  saveThread({ uid, threadId, items: next });
  return next;
}

export function clearThread({ uid, threadId }) {
  try {
    const key = getStorageKey(uid, threadId);
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
