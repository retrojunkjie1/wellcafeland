// src/apps/ai/AssistantConsole.jsx

import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, Loader2, MessageCircle, X } from "lucide-react";
import { useAIStore } from "./useAIStore";
import { guideEngine } from "../../services/multimodalClient";
import { formatMessageWithHeadings } from "../../utils/formatMessage";

const PROMPTS = [
  "I feel overwhelmed",
  "Design a 5-minute practice",
  "Talk me off the ledge",
];

const sendToAI = async (text, setThinking, addAssistant, setError) => {
  try {
    setThinking(true);
    setError(null);
    
    const result = await guideEngine(text, {
      mode: "default",
    });

    if (!result.ok) {
      const errorMsg = result.error || "I reached for our higher counsel but the line was faint. Try again in a few breaths.";
      setError("The guide is quiet for a moment. Try again shortly.");
      addAssistant(errorMsg);
      return;
    }

    const reply = result.content || "I'm here. Let's take this one breath at a time.";
    addAssistant(reply);
  } catch (err) {
    console.error("AI request failed:", err);
    
    // More specific error handling
    if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
      setError("Network connection failed. Please check your internet connection.");
      addAssistant(
        "I couldn't reach the wider network, but I'm still right here with you. Please check your connection and try again."
      );
    } else if (err.message?.includes("timeout") || err.name === "TimeoutError") {
      setError("The request took too long. Please try again.");
      addAssistant(
        "The connection timed out. I'm still here with you. Try again when you're ready."
      );
    } else {
      setError("Network error. Please try again.");
      addAssistant(
        "I couldn't reach the wider network, but I'm still right here with you. Try again in a moment."
      );
    }
  } finally {
    setThinking(false);
  }
};

const AssistantConsole = () => {
  const {
    isConsoleOpen,
    toggleConsole,
    closeConsole,
    messages,
    addUserMessage,
    addAssistantMessage,
    isThinking,
    setThinking,
    error,
    setError,
  } = useAIStore();

  const [input, setInput] = useState("");
  const lastSentIdRef = useRef(null);

  useEffect(() => {
    if (!isConsoleOpen || isThinking) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "user" && lastMsg.id !== lastSentIdRef.current) {
      lastSentIdRef.current = lastMsg.id;
      sendToAI(lastMsg.content, setThinking, addAssistantMessage, setError);
    }
  }, [isConsoleOpen, isThinking, messages, addAssistantMessage, setThinking, setError]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    addUserMessage(text);
    setInput("");
    await sendToAI(text, setThinking, addAssistantMessage, setError);
  };

  const handleSuggestion = async (prompt) => {
    addUserMessage(prompt);
    await sendToAI(prompt, setThinking, addAssistantMessage, setError);
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSend();
    }
  };


  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-4 lg:px-0">
      <div
        className={`glass-panel transition-all ${
          isConsoleOpen ? "min-h-[500px] flex flex-col" : "cursor-pointer"
        }`}
        onClick={!isConsoleOpen ? toggleConsole : undefined}
      >
        {/* Minimal header - only when closed */}
        {!isConsoleOpen && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-wcGold" />
              <span className="text-sm text-white/80">Wellness Guide</span>
            </div>
            <span className="text-sm text-white/50">Click to chat</span>
          </div>
        )}

        {isConsoleOpen && (
          <>
            {/* Minimal header when open */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-wcGold" />
                <span className="text-base font-medium text-white">Wellness Guide</span>
              </div>
              <button
                type="button"
                onClick={closeConsole}
                className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/5 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat messages - ChatGPT style */}
            <div className="flex-1 overflow-y-auto min-h-[400px] max-h-[60vh]">
              <div className="px-6 py-6 space-y-6">
                {messages.map((message) => {
                  if (message.role === "system") {
                    return (
                      <div key={message.id} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-wcGold/20 flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-wcGold" />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="text-base text-white/90 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessageWithHeadings(message.content) }} />
                        </div>
                      </div>
                    );
                  }
                  
                  if (message.role === "assistant") {
                    return (
                      <div key={message.id} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-wcGold/20 flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-wcGold" />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="text-base text-white/90 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessageWithHeadings(message.content) }} />
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={message.id} className="flex items-start gap-4 justify-end">
                      <div className="flex-1 max-w-[85%] pt-1">
                        <div className="rounded-2xl bg-wcGold/20 px-4 py-2.5">
                          <div className="text-base text-white leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessageWithHeadings(message.content) }} />
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-xs text-white/70">You</span>
                      </div>
                    </div>
                  );
                })}
                
                {isThinking && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-wcGold/20 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-wcGold" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 text-base text-white/60">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input area - ChatGPT style */}
            <div className="border-t border-white/5 px-6 py-4 space-y-3">
              {/* Quick prompts - only show when no messages or first message */}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2">
                  {PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSuggestion(prompt)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    id="wellness-guide-input"
                    rows={1}
                    className="w-full min-h-[52px] max-h-[200px] resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-base text-white placeholder:text-white/40 focus:border-wcGold/50 focus:outline-none focus:ring-2 focus:ring-wcGold/20 transition"
                    placeholder="Message Wellness Guide..."
                    value={input}
                    onChange={(event) => {
                      setInput(event.target.value);
                      // Auto-resize textarea
                      event.target.style.height = 'auto';
                      event.target.style.height = `${Math.min(event.target.scrollHeight, 200)}px`;
                    }}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  className="flex-shrink-0 rounded-2xl bg-wcGold px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-wcGold"
                >
                  {isThinking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {error && (
                <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssistantConsole;

