// src/components/os/MessageBubble.jsx
// Animated message bubbles with human pacing and guide avatar

import React from "react";
import VoiceResponse from "./VoiceResponse";
import VideoGuidance from "./VideoGuidance";
import { AlertCircle } from "lucide-react";
import { formatMessageWithHeadings } from "../../utils/formatMessage";

const MessageBubble = React.memo(({ message }) => {
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
        <div className="text-base text-white/60 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMessageWithHeadings(content) }} />
      </div>
    );
  }

  if (message.role === "assistant") {
    const content = typeof message.content === "string" ? message.content : message.content?.content || message.text || "";
    
    // Phase 14: Handle voice session and multimodal messages
    const isMultimodal = message.type === "assistant_audio" || message.type === "assistant_video" || message.type === "voice_session";
    
    return (
      <div className="flex items-start gap-2 sm:gap-4">
        {/* Guide Avatar - Simple ChatGPT style */}
        <div className="flex-shrink-0">
          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-[10px] sm:text-xs font-medium text-white">SG</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="inline-block w-full sm:max-w-[90%] rounded-lg bg-white/5 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base leading-relaxed text-white/90 break-words">
            <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: formatMessageWithHeadings(content) }} />
            
            {/* Phase 14: Audio response */}
            {(message.type === "assistant_audio" || message.type === "voice_session" || message.audioUrl) && (
              <div className="mt-3">
                <VoiceResponse audioUrl={message.audioUrl} text={content} />
              </div>
            )}
            
            {/* Phase 14: Video guidance */}
            {(message.type === "assistant_video" || message.videoUrl) && (
              <div className="mt-3">
                <VideoGuidance videoUrl={message.videoUrl} />
              </div>
            )}
            
            {/* Phase 14: Emotional state badge */}
            {(message.type === "voice_session" || message.type === "voice_journal" || message.emotionalState) && (
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
                {message.tags && message.tags.length > 0 && (
                  <div className="flex gap-1 ml-auto">
                    {message.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Phase 14: Transcript for voice sessions */}
            {message.type === "voice_session" && message.transcript && (
              <div className="mt-3 p-2 rounded bg-white/5 border border-white/10">
                <div className="text-xs text-white/50 mb-1">Your words:</div>
                <div className="text-sm text-white/80">{message.transcript}</div>
              </div>
            )}

            {/* Phase 14: Voice journal display */}
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
                      message.emotionalState === "grounded" ? "bg-green-400" :
                      "bg-white/30"
                    }`} />
                    <span className="text-white/70 capitalize">
                      {message.emotionalState} {message.intensity ? `(${message.intensity}/5)` : ""}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Only show VoiceResponse for text-only messages (if not multimodal) */}
            {!isMultimodal && message.role === "assistant" && content && !message.audioUrl && (
              <div className="mt-2">
                <VoiceResponse text={content} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User message - Simple ChatGPT style
  const userContent = typeof message.content === "string" ? message.content : message.content?.content || "";
  return (
    <div className="flex items-start justify-end">
      <div className="flex-1 flex justify-end min-w-0">
        <div className="inline-block w-full sm:max-w-[90%] rounded-lg bg-white/10 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white break-words whitespace-pre-wrap">
          {userContent}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;

