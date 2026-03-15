// src/components/os/MessageBubble.jsx
// Animated message bubbles with human pacing and guide avatar

import React, { useState } from "react";
import VoiceResponse from "./VoiceResponse";
import VideoGuidance from "./VideoGuidance";
import { AlertCircle, Loader2 } from "lucide-react";
import ThinkingTimer from "@/components/system/ThinkingTimer";
import ReasoningDisclosure from "@/components/system/ReasoningDisclosure";
import MarkdownLite from "@/components/system/MarkdownLite";
import ChatActionsRow from "./ChatActionsRow";
import MicroVideoCard from "../presence/MicroVideoCard";

function AssistantBubbleContent({ message, onAction, showSignals = false, onCopy, onSave, onSpeak, onExpand, onRetry, onOpenRealHelp, onOpenToolRoute, onContinueOffline, expandedMessageIds }) {
  const isAssistant = message?.role === "assistant";
  const isPending = Boolean(message?.status === "pending" || message?.meta?.pending);
  const content = typeof message.content === "string" ? message.content : message.content?.content || message.text || "";
  const displayContent = isPending ? "" : content;
  const isControlledExpand = typeof onExpand === "function" && expandedMessageIds != null;
  const [localDetailsOpen, setLocalDetailsOpen] = useState(false);
  const detailsOpen = isControlledExpand ? Boolean(expandedMessageIds[message?.id]) : localDetailsOpen;
  const showListen = isAssistant && !isPending && content && String(message.text || content).trim() !== "Thinking…";

  const handleExpandClick = () => {
    if (isControlledExpand) onExpand(message);
    else setLocalDetailsOpen((v) => !v);
  };

  const isMultimodal = message.type === "assistant_audio" || message.type === "assistant_video" || message.type === "voice_session";

  // Phase 54M: Only one "Thought for Xs" line — show when thoughtMs >= 250 and assistant and not pending; omit ThinkingTimer when we have thoughtMs to avoid duplicate
  const showThoughtMs = !isPending && message?.role === "assistant" && message.meta?.thoughtMs != null && Number(message.meta.thoughtMs) >= 250;
  const showThinkingTimer = !isPending && (message.meta?.startMs != null || message.meta?.doneMs != null) && !showThoughtMs;

  return (
    <>
      {showThinkingTimer && (
        <div className="mb-1">
          <ThinkingTimer startMs={message.meta?.startMs} doneMs={message.meta?.doneMs} />
        </div>
      )}
      {showThoughtMs && (() => {
        const sec = Math.max(0.25, Number(message.meta.thoughtMs) / 1000);
        return (
          <div className="mb-1 text-[11px] text-white/45">
            Thought for {sec.toFixed(sec < 10 ? 1 : 0)}s
          </div>
        );
      })()}
      <div className="inline-block w-full sm:max-w-[90%] rounded-lg bg-white/5 px-3 sm:px-4 py-2 sm:py-3 text-[15px] sm:text-[16px] leading-relaxed text-white/90 break-words">
        {isPending ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-white/50" />
          </div>
        ) : (
          <MarkdownLite text={displayContent} />
        )}
        {(message.type === "assistant_audio" || message.audioUrl) && (
          <div className="mt-3">
            <VoiceResponse audioUrl={message.audioUrl} text={content} />
          </div>
        )}
        {(message.type === "assistant_video" || message.videoUrl) && (
          <div className="mt-3">
            <VideoGuidance videoUrl={message.videoUrl} />
          </div>
        )}
        <MicroVideoCard video={message?.meta?.video} />
        {message?.meta?.toolRoute && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => onOpenToolRoute?.(message.meta.toolRoute)}
              className="rounded-xl px-3 py-2 text-xs bg-white/10 hover:bg-white/15 border border-white/10 text-white transition"
            >
              Open tool
            </button>
          </div>
        )}
        {showSignals && (message.type === "voice_session" || message.type === "voice_journal" || message.emotionalState) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {message.crisis && (
              <div className="flex items-center gap-1 text-red-400">
                <AlertCircle className="h-3 w-3" />
                <span>Crisis detected</span>
              </div>
            )}
            {message.emotionalState && (
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${
                  message.crisis ? "bg-red-400" :
                  message.emotionalState === "anxious" && message.intensity >= 4 ? "bg-orange-400" :
                  message.emotionalState === "craving" ? "bg-blue-400" :
                  message.emotionalState === "grounded" ? "bg-green-400" :
                  "bg-white/30"
                }`} />
                <span className="text-white/70 capitalize">
                  {message.emotionalState} {message.intensity ? `(${message.intensity}/5)` : ""}
                </span>
              </div>
            )}
            {message.tags?.length > 0 && (
              <div className="flex gap-1 ml-auto">
                {message.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-xs">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
        {message.type === "voice_session" && message.transcript && (
          <div className="mt-3 p-2 rounded bg-white/5 border border-white/10">
            <div className="text-xs text-white/50 mb-1">Your words:</div>
            <div className="text-sm text-white/80">{message.transcript}</div>
          </div>
        )}
        {message.type === "voice_journal" && (
          <div className="mt-3 space-y-2">
            {message.summary && (
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <div className="text-xs text-white/50 mb-1">Summary:</div>
                <div className="text-sm text-white/80">{message.summary}</div>
              </div>
            )}
            {message.emotionalState && (
              <div className="flex items-center gap-2 text-xs">
                <div className={`h-2 w-2 rounded-full ${
                  message.emotionalState === "anxious" && message.intensity >= 4 ? "bg-orange-400" :
                  message.emotionalState === "craving" ? "bg-blue-400" :
                  message.emotionalState === "grounded" ? "bg-green-400" : "bg-white/30"
                }`} />
                <span className="text-white/70 capitalize">
                  {message.emotionalState} {message.intensity ? `(${message.intensity}/5)` : ""}
                </span>
              </div>
            )}
          </div>
        )}
        {showListen && !isMultimodal && content && !message.audioUrl && (
          <div className="mt-2">
            <VoiceResponse text={content} />
          </div>
        )}
        {!isPending && message.actions?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.actions.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onAction?.(a.action, message)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition border border-white/20"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
        {!isPending && (
          <ChatActionsRow
            message={message}
            onRetry={onRetry}
            onOpenTools={onOpenTools != null ? () => onOpenTools?.() : undefined}
            onOpenRealHelp={onOpenRealHelp}
            onContinueOffline={onContinueOffline}
            onCopy={onCopy}
            onSave={onSave}
            onSpeak={onSpeak}
            onExpand={onExpand}
          />
        )}
        {!isPending && detailsOpen && (
          <pre className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] text-white/60 overflow-x-auto">
            {JSON.stringify({ id: message.id, type: message.type, timestamp: message.timestamp, role: message.role }, null, 2)}
          </pre>
        )}
        {!isPending && message.meta?.approach && (
          <details className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden">
            <summary className="cursor-pointer px-3 py-2 text-xs text-white/50 hover:text-white/70 list-none">
              How I'm approaching this
            </summary>
            <div className="mt-0 px-3 pb-3 pt-1 text-xs text-white/70 border-t border-white/10">
              <MarkdownLite text={message.meta.approach} />
            </div>
          </details>
        )}
        {!isPending && message.meta?.plan && (
          <details className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden">
            <summary className="cursor-pointer px-3 py-2 text-xs text-white/50 hover:text-white/70 list-none">
              How I'm responding
            </summary>
            <div className="mt-0 px-3 pb-3 pt-1 text-xs text-white/70 border-t border-white/10">
              {message.meta.plan}
            </div>
          </details>
        )}
        {!isPending && message.reasoning && (
          <ReasoningDisclosure reasoning={message.reasoning} defaultOpen={false} />
        )}
      </div>
    </>
  );
}

const MessageBubble = React.memo(({ message, onAction, showSignals: showSignalsProp, onCopy, onSave, onSpeak, onExpand, onRetry, onOpenTools, onOpenRealHelp, onOpenToolRoute, onContinueOffline, expandedMessageIds }) => {
  // Handle tool result messages
  if (message.type === "tool_result" || (typeof message.content === "object" && message.content?.type === "tool_result")) {
    const toolData = typeof message.content === "object" ? message.content : message;
    return (
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-xs font-medium text-white">SG</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="inline-block max-w-[85%] rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <div className="space-y-2">
              <h4 className="text-base font-medium text-white">{toolData.toolName || toolData.title || "Tool Completed"}</h4>
              <p className="text-sm text-white/70">{toolData.content || toolData.summary || "Tool completed"}</p>
              {toolData.durationSeconds && (
                <p className="text-xs text-white/50">
                  {Math.floor(toolData.durationSeconds / 60)} minutes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (message.role === "system") {
    const content = typeof message.content === "string" ? message.content : message.content?.content || "";
    return (
      <div className="mx-auto max-w-2xl text-center animate-fade-in">
        <div className="text-base text-white/60 leading-relaxed"><MarkdownLite text={content} /></div>
      </div>
    );
  }

  if (message.role === "assistant") {
    const showSignals = showSignalsProp ?? false;
    return (
      <div className="flex items-start gap-2 sm:gap-4">
        <div className="flex-shrink-0">
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-[10px] sm:text-xs font-medium text-white">SG</span>
          </div>
        </div>
        <div className="flex-1 min-w-0 max-w-[46rem]">
          <AssistantBubbleContent
            message={message}
            onAction={onAction}
            showSignals={showSignals}
            onCopy={onCopy}
            onSave={onSave}
            onSpeak={onSpeak}
            onExpand={onExpand}
            onRetry={onRetry}
            onOpenTools={onOpenTools != null ? () => onOpenTools?.() : undefined}
            onOpenRealHelp={onOpenRealHelp}
            onOpenToolRoute={onOpenToolRoute}
            onContinueOffline={onContinueOffline}
            expandedMessageIds={expandedMessageIds}
          />
        </div>
      </div>
    );
  }

  // User message — stronger contrast, premium typography
  const userContent = typeof message.content === "string" ? message.content : message.content?.content || "";
  return (
    <div className="flex items-start justify-end">
      <div className="flex-1 flex justify-end min-w-0">
        <div className="inline-block w-full sm:max-w-[90%] rounded-lg bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-[15px] sm:text-[16px] leading-relaxed text-white/95 break-words whitespace-pre-wrap border border-white/5">
          {userContent}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;

