// src/hooks/useChatMemory.js
// Phase 52: Wire chat to local-first memory (persists across refresh)

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useOSStore } from "@/stores/useOSStore";
import {
  loadThread,
  saveThread,
  appendMessage,
  clearThread,
} from "@/services/chatMemoryStore";

function toStoreMsg(m) {
  const text = m.text || (typeof m.content === "string" ? m.content : "") || "";
  return {
    id: m.id,
    role: m.role || "user",
    content: text,
    text: text,
    timestamp: m.ts || Date.now(),
  };
}

function fromStoreMsg(m) {
  return {
    id: m.id,
    role: m.role,
    text: typeof m.content === "string" ? m.content : m.text || "",
    ts: m.timestamp || Date.now(),
  };
}

export function useChatMemory(threadId = "default") {
  const { user } = useAuth();
  const uid = user?.uid || "anon";
  const { messages, currentChatId, setMessages, addMessage, createChat } =
    useOSStore();
  const threadRef = useRef(threadId);
  const prevLenRef = useRef(0);

  // Load thread on mount
  useEffect(() => {
    const tid = currentChatId || threadId;
    const items = loadThread({ uid, threadId: tid });
    if (items && items.length > 0) {
      const storeMsgs = items.map(toStoreMsg);
      setMessages(storeMsgs);
    }
    threadRef.current = tid;
  }, [uid, threadId, currentChatId]);

  // Save when messages change (debounced via length check)
  useEffect(() => {
    const tid = currentChatId || threadId;
    if (messages.length === 0 || messages.length === prevLenRef.current) return;
    prevLenRef.current = messages.length;
    const items = messages.map(fromStoreMsg);
    saveThread({ uid, threadId: tid, items });
  }, [messages, uid, threadId, currentChatId]);

  const clear = () => {
    clearThread({ uid, threadId: currentChatId || threadId });
  };

  return { clear };
}
