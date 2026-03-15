// src/apps/chat/ChatPage.jsx
// Clean chat mode - full screen, no distractions

import React, { useEffect } from "react";
import ChatPanel from "@/components/os/ChatPanel";
import { useOSStore, MODES } from "@/stores/useOSStore";
import RouteGuard from "@/components/system/RouteGuard";

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
    <RouteGuard ready={true}>
      <div className="flex flex-1 flex-col min-h-0 animate-fade-in">
        <ChatPanel />
      </div>
    </RouteGuard>
  );
};

export default ChatPage;
