// src/components/interaction/InputBar.jsx
// Enhanced input bar with text, voice, and future video modes

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Mic, Loader2, Square } from "lucide-react";
import { useInteractionCanvasStore } from "@/stores/useInteractionCanvasStore";
import { useAIStore } from "@/apps/ai/useAIStore";
import { callAiSession } from "@/services/aiSessionClient";
import { transcribeAudio } from "@/services/multimodalClient";

const QUICK_PROMPTS = [
  "I feel overwhelmed",
  "Design a 5-minute practice",
  "Talk me off the ledge",
  "Help me ground myself",
];

const InputBar = () => {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const textareaRef = useRef(null);
  const recorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
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
      const reply = data?.reply || data?.assistantText || data?.summary || data?.message || data?.text;
      if (data?.ok === false || typeof reply !== "string" || !reply.trim()) {
        const providerUnavailable = data?.error?.code === "AI_PROVIDER_NOT_CONFIGURED" || data?.code === "AI_PROVIDER_NOT_CONFIGURED";
        addMessage("error", providerUnavailable
          ? "The AI service isn't configured right now. Please try again later or use the practical support directory."
          : (data?.error?.message || data?.message || "The AI guide couldn't complete that request. Please try again or use the practical support directory."), { code: data?.error?.code || data?.code });
        return;
      }
      addMessage("assistant", reply);
      addAssistantMessage(reply);
    } catch (err) {
      console.error("AI request failed:", err);
      const errorMsg = err.code === "AUTH_REQUIRED"
        ? "Your session needs to reconnect. Please sign in again, then retry."
        : err.code === "RATE_LIMITED"
          ? `The AI guide is busy right now. Please wait about ${err.retryAfterSeconds || 60} seconds, then retry.`
        : (typeof navigator !== "undefined" && navigator.onLine === false
          ? "You're offline, so the AI guide couldn't receive that message. Reconnect and retry, or open practical support."
          : "The AI guide couldn't be reached. Please retry or open practical support.");
      addMessage("error", errorMsg, { code: err.code || "AI_SESSION_FAILED", status: err.status || 0 });
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

  useEffect(() => () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const handleVoiceToggle = async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      return;
    }

    setVoiceStatus("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setVoiceStatus("Voice input isn't supported in this browser. You can type your message instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data?.size) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        recorderRef.current = null;
        stopRecording();
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        audioChunksRef.current = [];
        if (!blob.size) {
          setVoiceStatus("No speech was captured. Try again or type your message.");
          return;
        }
        setVoiceStatus("Transcribing your voice…");
        const result = await transcribeAudio(blob, blob.type);
        if (result.ok && result.text?.trim()) {
          setInput((current) => `${current}${current ? " " : ""}${result.text.trim()}`);
          setVoiceStatus("Voice transcription ready. Review it, then press Send.");
        } else {
          setVoiceStatus(result.error || "I couldn't transcribe that audio. Please try again or type your message.");
        }
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        recorderRef.current = null;
        stopRecording();
        setVoiceStatus("Voice recording stopped unexpectedly. You can type your message instead.");
      };
      recorder.start();
      startRecording();
      setVoiceStatus("Listening. Press the microphone again when you're ready to stop.");
    } catch {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      stopRecording();
      setVoiceStatus("Microphone access wasn't available. Check browser permissions or type your message.");
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
        {voiceStatus && <p className="mb-3 text-sm text-white/70" role="status">{voiceStatus}</p>}
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
              aria-label={isRecording ? "Stop voice recording" : "Start voice input"}
              title={isRecording ? "Stop voice recording" : "Start voice input"}
              className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                isRecording
                  ? "bg-red-500/20 text-red-400 border border-red-400/40"
                  : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
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
