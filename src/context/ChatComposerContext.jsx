// src/context/ChatComposerContext.jsx
// Provides composer state to AppDock when dockComposer is active

import React, { createContext, useContext } from "react";

const ChatComposerContext = createContext(null);

export function ChatComposerProvider({ children, value }) {
  return (
    <ChatComposerContext.Provider value={value}>
      {children}
    </ChatComposerContext.Provider>
  );
}

export function useChatComposer() {
  return useContext(ChatComposerContext);
}
