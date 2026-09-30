// src/apps/guide/GuidePage.jsx
// Full-screen ChatGPT-style Wellness Guide page

import React, { useState, useEffect, useRef } from "react";
import { ArrowUp, BookOpen, Loader2, MessageCircle, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAIStore } from "../ai/useAIStore";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { guideEngine } from "../../services/multimodalClient";
import { guestStorage } from "@/utils/guestStorage";
import { useOSStore } from "@/stores/useOSStore";
import { getConversationMemoryContext, rememberConversationTurn } from "@/services/conversationMemory";
import { matchRecoveryStoryRequest } from "@/data/recoveryStories";

const PROMPTS = [
  "I feel overwhelmed",
  "Design a 5-minute practice",
  "Talk me off the ledge",
];

const GuidePage = () => {
  const navigate = useNavigate();
  const identity = useSessionIdentity();
  const memoryEnabled = useOSStore((state) => state.settings?.personalizationMemoryEnabled === true);
  const [storyRequest, setStoryRequest] = useState(null);
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
  const [failedPrompt, setFailedPrompt] = useState("");
  const sendingRef = useRef(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages]);

  const submitMessage = async (value, { appendUser = true } = {}) => {
    const text = value.trim();
    if (!text || sendingRef.current || isThinking) return;

    const requestedStory = matchRecoveryStoryRequest(text);
    if (requestedStory) {
      setError(null);
      setFailedPrompt("");
      setStoryRequest(requestedStory);
      if (appendUser) {
        addUserMessage(text);
        if (identity.mode === "guest") guestStorage.addGuideMessage({ role: "user", content: text });
      }
      addAssistantMessage("Yes. We can look at a public account together, then turn only an idea you choose into your own next step. Public stories do not show a complete treatment plan, so we will keep inspiration separate from care advice.");
      return;
    }
    setStoryRequest(null);

    sendingRef.current = true;
    setThinking(true);
    setError(null);
    setFailedPrompt("");

    const priorConversation = messages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));
    const lastMessage = priorConversation[priorConversation.length - 1];
    const requestMessages = appendUser || lastMessage?.role !== "user" || lastMessage.content !== text
      ? [...priorConversation, { role: "user", content: text }]
      : priorConversation;

    if (appendUser) {
      addUserMessage(text);
      if (identity.mode === "guest") {
        guestStorage.addGuideMessage({ role: "user", content: text });
      }
    }

    try {
      const memoryContext = await getConversationMemoryContext(memoryEnabled && identity.mode === "account");
      const result = await guideEngine(text, { mode: "default", messages: requestMessages, memoryContext });
      if (!result.ok || !result.content?.trim()) {
        setError(result.error || "I couldn’t get a response just now. You can try again or open support.");
        setFailedPrompt(text);
        return;
      }

      addAssistantMessage(result.content);
      await rememberConversationTurn({
        user: text,
        assistant: result.content,
        enabled: memoryEnabled && identity.mode === "account",
      });
      setError(null);
    } catch (err) {
      console.error("Living Guide request failed:", err);
      setError("I couldn’t connect just now. Check your connection and try again.");
      setFailedPrompt(text);
    } finally {
      sendingRef.current = false;
      setThinking(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await submitMessage(text);
  };

  const handleSuggestion = (prompt) => submitMessage(prompt);

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
            <h1 className="text-sm font-semibold text-white">Living Guide</h1>
            <p className="text-xs text-white/60">Present with you</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/recovery/stories" aria-label="Explore recovery stories" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-amber-200/20 px-3 text-xs font-medium text-amber-100/90 transition hover:border-amber-200/45 hover:bg-amber-100/[0.06] sm:px-4 sm:text-sm">
            <BookOpen aria-hidden="true" className="h-4 w-4" /><span>Stories</span>
          </Link>
          <button
            type="button"
            aria-label="Close guide"
            onClick={() => navigate("/")}
            className="rounded-full border border-white/10 p-2.5 text-white/70 hover:text-white hover:border-white/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
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
          {storyRequest && (
            <div className="max-w-xl rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4">
              <p className="text-sm leading-relaxed text-amber-50">This story is sourced and separated from WellnessCafe’s own reflections. You choose whether to explore it.</p>
              <Link to={storyRequest.personId ? `/recovery/stories?person=${encodeURIComponent(storyRequest.personId)}` : "/recovery/stories"} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-wcGold px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
                Open recovery story <BookOpen aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          )}
          {isThinking && (
            <div className="chat-bubble-assistant flex items-center gap-2 text-xs text-white/60">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-wcGold" />
              Listening…
            </div>
          )}
          {error && (
            <div role="alert" className="rounded-2xl border border-amber-300/35 bg-amber-300/10 p-4 text-sm text-amber-100">
              <p>{error}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {failedPrompt && (
                  <button type="button" onClick={() => submitMessage(failedPrompt, { appendUser: false })} disabled={isThinking} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50">
                    Try again
                  </button>
                )}
                <button type="button" onClick={() => navigate("/assistance")} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10">
                  Open support
                </button>
              </div>
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
              aria-label="Message the Living Guide"
              className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-wcGold/50 focus:outline-none focus:ring-1 focus:ring-wcGold/30"
              disabled={isThinking}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              aria-label="Send message"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-wcGold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isThinking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuidePage;
