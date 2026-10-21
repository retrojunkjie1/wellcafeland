import { describe, expect, it } from "vitest";
import { loadChatHistory, saveChatHistory, sanitizeChatMessage } from "./chatHistoryStorage";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

describe("chat history voice privacy", () => {
  it("migrates old sent recordings out of saved chat while preserving the transcript", () => {
    const storage = memoryStorage({
      "wc-os-chats": JSON.stringify([{
        id: "chat-1",
        hasUserMessages: true,
        messages: [
          { id: "user-1", role: "user", type: "voice_message", content: "My transcript", audioUrl: "data:audio/webm;base64,private", audioDurationSeconds: 9 },
          { id: "assistant-1", role: "assistant", content: "A reply" },
        ],
      }]),
    });

    const chats = loadChatHistory(storage);
    const saved = JSON.parse(storage.getItem("wc-os-chats"));

    expect(chats[0].messages[0]).toMatchObject({ role: "user", content: "My transcript" });
    expect(chats[0].messages[0]).not.toHaveProperty("audioUrl");
    expect(chats[0].messages[0]).not.toHaveProperty("audioDurationSeconds");
    expect(chats[0].messages[0]).not.toHaveProperty("type", "voice_message");
    expect(saved[0].messages[0]).not.toHaveProperty("audioUrl");
    expect(saved[0].messages[1]).toMatchObject({ role: "assistant", content: "A reply" });
  });

  it("never saves a user recording again, including on the current message path", () => {
    const storage = memoryStorage();
    const message = sanitizeChatMessage({
      role: "user", type: "voice_message", content: "Reviewed words", audioUrl: "blob:temporary", audioDurationSeconds: 4,
    });
    saveChatHistory([{ id: "chat-2", hasUserMessages: true, messages: [message] }], storage);

    expect(message).toMatchObject({ role: "user", content: "Reviewed words" });
    expect(JSON.parse(storage.getItem("wc-os-chats"))[0].messages[0]).not.toHaveProperty("audioUrl");
  });

  it("does not strip assistant audio messages", () => {
    const assistant = { role: "assistant", type: "assistant_audio", audioUrl: "https://cdn.example/audio.mp3" };
    expect(sanitizeChatMessage(assistant)).toEqual(assistant);
  });
});
