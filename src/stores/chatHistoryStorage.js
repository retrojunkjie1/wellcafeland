const CHAT_HISTORY_KEY = "wc-os-chats";
const LEGACY_VOICE_SESSION_NOTICE = /^Opening voice session workspace[.…]*$/i;

function stripUserVoiceRecording(message) {
  if (
    (message?.role === "system" || message?.type === "system") &&
    typeof message.content === "string" &&
    LEGACY_VOICE_SESSION_NOTICE.test(message.content.trim())
  ) return null;

  if (!message || typeof message !== "object" || message.role !== "user") return message;
  if (!message.audioUrl && message.type !== "voice_message") return message;

  const { audioUrl: _audioUrl, audioDurationSeconds: _duration, ...transcriptOnly } = message;
  if (transcriptOnly.type === "voice_message") delete transcriptOnly.type;
  return transcriptOnly;
}

export function sanitizeChatHistory(chats) {
  if (!Array.isArray(chats)) return [];
  return chats.map((chat) => {
    if (!chat || !Array.isArray(chat.messages)) return chat;
    const messages = chat.messages.map(stripUserVoiceRecording).filter(Boolean);
    return messages.some((message, index) => message !== chat.messages[index])
      ? { ...chat, messages }
      : chat;
  });
}

export function loadChatHistory(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(CHAT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const filtered = Array.isArray(parsed)
      ? parsed.filter((chat) => chat?.hasUserMessages === true)
      : [];
    const sanitized = sanitizeChatHistory(filtered);
    if (sanitized.some((chat, index) => chat !== filtered[index])) {
      storage?.setItem(CHAT_HISTORY_KEY, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return [];
  }
}

export function saveChatHistory(chats, storage = globalThis.localStorage) {
  try {
    const validChats = sanitizeChatHistory(chats)
      .filter((chat) => chat?.hasUserMessages === true);
    storage?.setItem(CHAT_HISTORY_KEY, JSON.stringify(validChats));
  } catch (error) {
    console.warn("Failed to save chats:", error);
  }
}

export function sanitizeChatMessage(message) {
  return stripUserVoiceRecording(message);
}
