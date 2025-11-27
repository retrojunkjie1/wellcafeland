// src/apps/chat/ChatPage.jsx
// Clean chat mode - full screen, no distractions

import React, { useEffect } from "react";
import ChatPanel from "@/components/os/ChatPanel";
import { useOSStore, MODES } from "@/stores/useOSStore";

const ChatPage = () => {
  const { setMode, createChat, currentChatId, messages } = useOSStore();

  useEffect(() => {
    setMode(MODES.CHAT);
    // Only create new chat if we don't have one and no messages exist
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
