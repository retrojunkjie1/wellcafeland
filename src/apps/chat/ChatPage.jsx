// src/apps/chat/ChatPage.jsx
// Clean chat mode - full screen, no distractions

import React, { useEffect } from "react";
import ChatPanel from "@/components/os/ChatPanel";
import { useOSStore, MODES } from "@/stores/useOSStore";
import { useChatMemory } from "@/hooks/useChatMemory";

const ChatPage = () => {
  const { setMode, createChat, currentChatId, messages } = useOSStore();
  useChatMemory(currentChatId || "default");

  useEffect(() => {
    setMode(MODES.CHAT);
    if (!currentChatId && messages.length === 0) {
      createChat("New Chat");
    }
  }, [setMode, createChat, currentChatId, messages.length]);

  return (
    <div className="flex h-screen flex-col bg-slate-950 animate-fade-in">
      <ChatPanel />
    </div>
  );
};

export default ChatPage;
