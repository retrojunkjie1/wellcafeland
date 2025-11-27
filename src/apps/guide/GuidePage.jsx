// src/apps/guide/GuidePage.jsx
// Full-screen ChatGPT-style Wellness Guide page

import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, Loader2, MessageCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAIStore } from "../ai/useAIStore";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { guideEngine } from "../../services/multimodalClient";
import { guestStorage } from "@/utils/guestStorage";

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
    setError("Network error. Please try again.");
    addAssistant(
      "I couldn't reach the wider network, but I'm still right here with you. Try again in a moment."
    );
  } finally {
    setThinking(false);
  }
};

const GuidePage = () => {
  const navigate = useNavigate();
  const identity = useSessionIdentity();
  const {
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
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send when console opens with a new user message
  useEffect(() => {
    if (isThinking) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "user" && lastMsg.id !== lastSentIdRef.current) {
      lastSentIdRef.current = lastMsg.id;
      sendToAI(lastMsg.content, setThinking, addAssistantMessage, setError);
      
      // Save to guest storage if in guest mode
      if (identity.mode === "guest") {
        guestStorage.addGuideMessage({
          role: "user",
          content: lastMsg.content,
        });
      }
    }
  }, [isThinking, messages, addAssistantMessage, setThinking, setError, identity.mode]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    addUserMessage(text);
    setInput("");
    await sendToAI(text, setThinking, addAssistantMessage, setError);
    
    // Save to guest storage if in guest mode
    if (identity.mode === "guest") {
      guestStorage.addGuideMessage({
        role: "user",
        content: text,
      });
    }
  };

  const handleSuggestion = async (prompt) => {
    addUserMessage(prompt);
    await sendToAI(prompt, setThinking, addAssistantMessage, setError);
    
    if (identity.mode === "guest") {
      guestStorage.addGuideMessage({
        role: "user",
        content: prompt,
      });
    }
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSend();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/10 p-2">
            <MessageCircle className="h-5 w-5 text-wcGold" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Your Wellness Guide</h1>
            <p className="text-xs text-white/60">Living AI · Present With You</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-full border border-white/10 p-2 text-white/70 hover:text-white hover:border-white/40"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages
            .filter((m) => m.role !== "system")
            .map((message) =>
              message.role === "assistant" ? (
                <div key={message.id} className="chat-bubble-assistant">
                  {message.content}
                </div>
              ) : (
                <div key={message.id} className="chat-bubble-user">
                  {message.content}
                </div>
              )
            )}
          {isThinking && (
            <div className="chat-bubble-assistant flex items-center gap-2 text-xs text-white/60">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-wcGold" />
              Listening…
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-200">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-white/5 bg-slate-950/95 px-6 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSuggestion(prompt)}
                disabled={isThinking}
                className="menu-chip disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell me what's real for you right now…"
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-wcGold/50 focus:outline-none focus:ring-1 focus:ring-wcGold/30"
              disabled={isThinking}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-wcGold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isThinking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Guest Mode Notice */}
          {identity.mode === "guest" && (
            <div className="rounded-xl border border-wcGold/30 bg-wcGold/5 px-4 py-2 text-xs text-white/70">
              <span>You're in guest mode. </span>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-medium text-wcGold underline hover:text-amber-300"
              >
                Create an account
              </button>
              <span> to save your conversations.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidePage;

