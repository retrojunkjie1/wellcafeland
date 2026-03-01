// src/apps/chat/ChatPage.jsx
// Clean chat mode - full screen, no distractions

import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ChatPanel from "@/components/os/ChatPanel";
import { useOSStore, MODES } from "@/stores/useOSStore";
import { useChatMemory } from "@/hooks/useChatMemory";

const ChatPage = () => {
  const { setMode, createChat, currentChatId, messages } = useOSStore();
  const { search } = useLocation();
  useChatMemory(currentChatId || "default");

  const initialDraft = useMemo(() => {
    const params = new URLSearchParams(search);
    const prefill = params.get("prefill");
    if (!prefill || typeof prefill !== "string") return null;
    try {
      return decodeURIComponent(prefill);
    } catch {
      return null;
    }
  }, [search]);

  useEffect(() => {
    setMode(MODES.CHAT);
    if (!currentChatId && messages.length === 0) {
      createChat("New Chat");
    }
  }, [setMode, createChat, currentChatId, messages.length]);

  return (
    <div className="flex h-screen flex-col bg-slate-950 animate-fade-in">
      <ChatPanel initialDraft={initialDraft} />
    </div>
  );
};

export default ChatPage;
