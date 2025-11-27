// src/components/interaction/MessageBubble.jsx
// Animated message bubbles for user and assistant

import React from "react";
import { Loader2 } from "lucide-react";

const MessageBubble = ({ message, isThinking = false }) => {
  if (message.role === "system") {
    return (
      <div className="mx-auto max-w-2xl text-center animate-fade-in">
        <p className="text-base text-white/60 leading-relaxed">
          {message.content}
        </p>
      </div>
    );
  }

  if (message.role === "assistant" || isThinking) {
    return (
      <div className="flex items-start gap-3 animate-slide-up">
        <div className="flex-1">
          <div className="inline-block max-w-[85%] rounded-2xl bg-white/5 p-4 text-sm leading-relaxed text-white/90">
            {isThinking ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-wcGold" />
                <span className="text-white/60">Listening…</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User message
  return (
    <div className="flex items-start justify-end gap-3 animate-slide-up">
      <div className="flex-1 flex justify-end">
        <div className="inline-block max-w-[75%] rounded-2xl bg-wcGold/20 px-4 py-2.5 text-sm text-white text-right">
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

