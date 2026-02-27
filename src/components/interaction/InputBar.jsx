// src/components/interaction/InputBar.jsx
// Enhanced input bar with text, voice, and future video modes

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Mic, Loader2 } from "lucide-react";
import { useInteractionCanvasStore } from "@/stores/useInteractionCanvasStore";
import { useAIStore } from "@/apps/ai/useAIStore";
import { callAiSession } from "@/services/aiSessionClient";

const QUICK_PROMPTS = [
  "I feel overwhelmed",
  "Design a 5-minute practice",
  "Talk me off the ledge",
  "Help me ground myself",
];

const InputBar = () => {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef(null);
  const {
    addMessage,
    isRecording,
    startRecording,
    stopRecording,
    setInputFocused,
    hasStartedConversation,
  } = useInteractionCanvasStore();
  const { addAssistantMessage, setThinking } = useAIStore();

  const sendToAI = async (text) => {
    setIsSending(true);
    setThinking(true);

    try {
      const data = await callAiSession({
        prompt: text,
        mode: "session",
      });
      const reply =
        data.reply ||
        data.summary ||
        data.message ||
        "I'm here. Let's take this one breath at a time.";
      addMessage("assistant", reply);
      addAssistantMessage(reply);
    } catch (err) {
      console.error("AI request failed:", err);
      const errorMsg =
        err.code === "AUTH_REQUIRED"
          ? "Please sign in to continue."
          : "I couldn't reach the wider network, but I'm still right here with you. Try again in a moment.";
      addMessage("assistant", errorMsg);
      addAssistantMessage(errorMsg);
    } finally {
      setIsSending(false);
      setThinking(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    addMessage("user", text);
    setInput("");
    await sendToAI(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
      // TODO: Process audio and convert to text
      // For now, just stop recording
    } else {
      startRecording();
    }
  };

  const handleSuggestion = async (prompt) => {
    addMessage("user", prompt);
    await sendToAI(prompt);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="border-t border-white/5 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        {/* Quick Prompts (only show before conversation starts) */}
        {!hasStartedConversation && (
          <div className="mb-4 flex flex-wrap gap-2 animate-fade-in">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSuggestion(prompt)}
                disabled={isSending}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Tell me what's real for you right now…"
              rows={1}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/40 focus:border-wcGold/50 focus:outline-none focus:ring-1 focus:ring-wcGold/30 transition-all"
              disabled={isSending || isRecording}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVoiceToggle}
              disabled={isSending}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                isRecording
                  ? "bg-red-500/20 text-red-400 border border-red-400/40"
                  : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isSending || isRecording}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-wcGold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputBar;

