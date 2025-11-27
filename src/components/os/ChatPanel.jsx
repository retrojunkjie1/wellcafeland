// src/components/os/ChatPanel.jsx
// Clean ChatGPT-style chat panel (no stacking)

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Loader2 } from "lucide-react";
import { useOSStore } from "@/stores/useOSStore";
import { useAIStore } from "@/apps/ai/useAIStore";
import MessageBubble from "./MessageBubble";
import ToolBlock from "./ToolBlock";
import WelcomeScreen from "./WelcomeScreen";
import VoiceInput from "./VoiceInput";
import DirectoryResultBlock from "./DirectoryResultBlock";
import VoiceResponse from "./VoiceResponse";
import VideoGuidance from "./VideoGuidance";
import { searchResources } from "@/services/resourceSearch";
import { sendChatMultimodal } from "@/services/multimodalClient";
import { determineGuideResponse } from "@/services/decisionEngine";
import { enrichMessageWithEmotion, analyzeMessageSignals, getRecommendedTool } from "@/core/system/intelligenceEngine";
import { trackRiskEvent } from "@/services/sessionTelemetry";
import { logRiskSnapshot } from "@/services/providerTimeline";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import EmotionalSignalBar from "../analysis/EmotionalSignalBar";
import ProviderMonitorStrip from "../analysis/ProviderMonitorStrip";

const TOOL_NAMES = {
  breathing: "Breathing Exercise",
  grounding: "Grounding (5-4-3-2-1)",
  journaling: "Journaling",
  "urge-surfing": "Urge Surfing",
  "body-scan": "Body Scan",
  "self-surgeon": "Self-Inquiry",
  education: "Education",
};

const QUICK_PROMPTS = [
  "I feel overwhelmed",
  "Help me breathe",
  "Talk me off the ledge",
  "I need grounding",
];

// Detect directory search queries from user input
function detectDirectoryQuery(text) {
  const lowerText = text.toLowerCase();

  // Real Help detection (Phase 12)
  if (
    lowerText.includes("find housing") ||
    lowerText.includes("find sober home") ||
    lowerText.includes("need a sober home") ||
    lowerText.includes("need a place to stay") ||
    lowerText.includes("need housing") ||
    lowerText.includes("find funding") ||
    lowerText.includes("find grants") ||
    lowerText.includes("need funding") ||
    lowerText.includes("can't afford treatment") ||
    lowerText.includes("find programs") ||
    lowerText.includes("help me find support") ||
    lowerText.includes("i need real help") ||
    lowerText.includes("find real help")
  ) {
    // Determine priority
    let priority = "programs";
    if (lowerText.includes("housing") || lowerText.includes("sober home") || lowerText.includes("place to stay")) {
      priority = "housing";
    } else if (lowerText.includes("funding") || lowerText.includes("grant") || lowerText.includes("can't afford")) {
      priority = "funding";
    } else if (lowerText.includes("program") || lowerText.includes("legal") || lowerText.includes("emergency")) {
      priority = "programs";
    } else if (lowerText.includes("group") || lowerText.includes("circle")) {
      priority = "circles";
    }
    
    return { domain: "real_help", query: text, priority };
  }

  // Housing queries
  if (
    lowerText.includes("housing") ||
    lowerText.includes("sober living") ||
    lowerText.includes("halfway house") ||
    lowerText.includes("transitional housing") ||
    lowerText.includes("emergency housing") ||
    lowerText.includes("going to be homeless")
  ) {
    return { domain: "housing", query: text };
  }

  // Grants queries
  if (
    lowerText.includes("grant") ||
    lowerText.includes("funding") ||
    lowerText.includes("scholarship") ||
    lowerText.includes("financial assistance") ||
    lowerText.includes("money for") ||
    lowerText.includes("can't afford") ||
    lowerText.includes("need funding")
  ) {
    return { domain: "grants", query: text };
  }

  // Government assistance queries
  if (
    lowerText.includes("government assistance") ||
    lowerText.includes("food stamps") ||
    lowerText.includes("ebt") ||
    lowerText.includes("benefits") ||
    lowerText.includes("government support") ||
    lowerText.includes("assistance program") ||
    lowerText.includes("can't afford my meds") ||
    lowerText.includes("need help paying")
  ) {
    return { domain: "government_assistance", query: text };
  }

  // Programs queries
  if (
    lowerText.includes("detox") ||
    lowerText.includes("rehab") ||
    lowerText.includes("iop") ||
    lowerText.includes("php") ||
    lowerText.includes("treatment program") ||
    lowerText.includes("support group") ||
    lowerText.includes("recovery program") ||
    lowerText.includes("program") ||
    lowerText.includes("group")
  ) {
    return { domain: "programs", query: text };
  }

  return null;
}

// Helper: Convert base64 to Blob
const ChatPanel = () => {
  const navigate = useNavigate();
  const { messages, addMessage, injectToolIntoChat, openWorkspace } = useOSStore();
  const { setThinking, isThinking } = useAIStore();
  const identity = useSessionIdentity();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const hasStarted = messages.length > 1; // More than just welcome message

  // Get time-based greeting (memoized to avoid impure calls)
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

      const sendToAI = async (text) => {
        setIsSending(true);
        setThinking(true);

        try {
          // Phase 14: Crisis detection before processing
          const { detectRiskPhrases } = await import("@/services/emotionSensor");
          const isCrisis = detectRiskPhrases(text);
          
          if (isCrisis) {
            addMessage("assistant", {
              type: "system",
              content: `<div class="bg-red-900/30 border border-red-700/50 text-red-300 p-4 rounded-lg">
                <p class="font-medium mb-2">If you are in immediate danger, call <a href="tel:988" class="underline">988</a> or local emergency services immediately.</p>
                <p>I'm really glad you reached out. I'm here to listen, and we can talk through what you're feeling right now. You're not alone.</p>
              </div>`,
            });
            setIsSending(false);
            setThinking(false);
            return;
          }

          // Offline fallback: Detect tool requests before API call
          const lowerText = text.toLowerCase();
          let directToolRequest = null;
          
          // Check for direct tool requests (more comprehensive detection)
          if (lowerText.includes("grounding") || lowerText.includes("ground") || lowerText.includes("54321") || lowerText.includes("5-4-3-2-1") || lowerText.includes("need grounding") || lowerText.includes("want grounding")) {
            directToolRequest = "grounding";
          } else if (lowerText.includes("breathing") || lowerText.includes("breathe") || lowerText.includes("breath") || lowerText.includes("need to breathe") || lowerText.includes("help me breathe")) {
            directToolRequest = "breathing";
          } else if (lowerText.includes("urge surfing") || lowerText.includes("urge-surfing") || lowerText.includes("surf the urge") || lowerText.includes("ride the wave")) {
            directToolRequest = "urge-surfing";
          } else if (lowerText.includes("journal") || lowerText.includes("write") || lowerText.includes("reflect") || lowerText.includes("need to journal")) {
            directToolRequest = "journaling";
          } else if (lowerText.includes("self-inquiry") || lowerText.includes("self surgeon") || lowerText.includes("self-surgeon") || lowerText.includes("self inquiry")) {
            directToolRequest = "self-surgeon";
          }

          // Build message history for context
          const messageHistory = messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: typeof m.content === "string" ? m.content : m.text || m.content || "",
            }));

          // Add current user message
          messageHistory.push({
            role: "user",
            content: text,
          });

          // Run decision engine to analyze emotional/spiritual state (optional, non-blocking)
          let decision = null;
          try {
            decision = await determineGuideResponse(text);
          } catch (err) {
            console.warn("Decision engine failed, continuing without it:", err);
          }

          // Determine mode based on decision engine recommendations
          let mode = "chat";
          if (decision?.forecast?.recommendedIntervention === "breathing") {
            mode = "breathing";
          } else if (decision?.forecast?.recommendedIntervention === "grounding") {
            mode = "grounding";
          } else if (decision?.forecast?.recommendedIntervention === "urge-surfing") {
            mode = "self_surgeon";
          }

          // Call backend via sendChatMultimodal
          const res = await sendChatMultimodal({
            messages: messageHistory,
            mode,
            metadata: decision ? {
              emotion: decision.emotion,
              spirit: decision.spirit,
              forecast: decision.forecast,
            } : {},
          });

          if (!res.ok) {
            // If network fails but user requested a tool directly, open it anyway
            if (directToolRequest) {
              addMessage("assistant", {
                type: "system",
                content: `I'm having trouble connecting right now, but I can still help. Let me open the ${TOOL_NAMES[directToolRequest] || directToolRequest} tool for you.`,
              });
              setTimeout(() => {
                injectToolIntoChat(directToolRequest, {});
              }, 500);
              setIsSending(false);
              setThinking(false);
              return;
            }
            
            // Otherwise show error message
            addMessage("assistant", {
              type: "assistant_text",
              text: res.text || res.error || "I'm having trouble connecting right now. Please try again in a moment.",
              content: res.text || res.error || "I'm having trouble connecting right now. Please try again in a moment.",
              timestamp: Date.now(),
            });
            setIsSending(false);
            setThinking(false);
            return;
          }

          // Handle response based on type
          if (res.type === "audio" && res.audioUrl) {
            addMessage("assistant", {
              type: "assistant_audio",
              text: res.text || "",
              content: res.text || "",
              audioUrl: res.audioUrl,
              timestamp: Date.now(),
            });
          } else if (res.type === "video" && res.videoUrl) {
            addMessage("assistant", {
              type: "assistant_video",
              text: res.text || "",
              content: res.text || "",
              videoUrl: res.videoUrl,
              timestamp: Date.now(),
            });
          } else {
            // Text response
            addMessage("assistant", {
              type: "assistant_text",
              text: res.text || "",
              content: res.text || "",
              timestamp: Date.now(),
            });
          }

      // Use decision engine's recommended intervention for tool injection
      let toolToInject = null;
      const intervention = decision?.forecast?.recommendedIntervention;
      
      if (intervention === "breathing") {
        toolToInject = "breathing";
      } else if (intervention === "grounding") {
        toolToInject = "grounding";
      } else if (intervention === "urge-surfing") {
        toolToInject = "urge-surfing";
      } else {
        // Fallback to keyword detection if no intervention recommended
        const toolKeywords = {
          breathing: ["breathe", "breathing", "breath"],
          grounding: ["ground", "grounding", "54321", "5-4-3-2-1"],
          journaling: ["journal", "write", "reflect"],
        };
        
        const responseText = res.text || "";
        for (const [tool, keywords] of Object.entries(toolKeywords)) {
          if (keywords.some((kw) => responseText.toLowerCase().includes(kw))) {
            toolToInject = tool;
            break;
          }
        }
      }

      // Only inject tool if decision engine recommends it or AI suggests it verbally
      if (toolToInject) {
        setTimeout(() => {
          // Add system message that tool is being opened
          addMessage("assistant", {
            type: "system",
            content: `I've opened the ${TOOL_NAMES[toolToInject] || toolToInject} tool for you. Take your time, I'm here.`,
          });
          injectToolIntoChat(toolToInject, {});
        }, 500);
      }

      // Phase 14: Voice intent detection (reuse lowerText from above)
      if (
        lowerText.includes("i want to talk it out") ||
        lowerText.includes("can i speak instead") ||
        lowerText.includes("i want voice support") ||
        lowerText.includes("i want to talk") ||
        lowerText.includes("let me speak")
      ) {
        setTimeout(() => {
          addMessage("assistant", {
            type: "system",
            content: "Opening voice session workspace...",
          });
          openWorkspace("voice-session", "Voice Session", {});
        }, 500);
        return;
      }

      // Phase 14: Video request detection
      if (
        lowerText.includes("show me") ||
        lowerText.includes("demonstrate") ||
        lowerText.includes("visual") ||
        lowerText.includes("exercise") ||
        lowerText.includes("yoga") ||
        lowerText.includes("stretch")
      ) {
        // Will be handled by guideEngine response
      }

      // Phase 13: Social routing shortcuts
      if (lowerText.includes("join a group") || lowerText.includes("find a group") || lowerText.includes("recovery group")) {
        setTimeout(() => {
          addMessage("assistant", {
            type: "system",
            content: "Opening Circles for you...",
          });
          navigate("/circles");
        }, 500);
        return;
      }

      if (lowerText.includes("talk to someone") || lowerText.includes("find someone to talk to")) {
        setTimeout(() => {
          addMessage("assistant", {
            type: "system",
            content: "Opening Connections...",
          });
          navigate("/connections/friends");
        }, 500);
        return;
      }

      if (lowerText.includes("find an accountability partner") || lowerText.includes("accountability partner")) {
        setTimeout(() => {
          addMessage("assistant", {
            type: "system",
            content: "Opening Trusted Partners...",
          });
          navigate("/connections/trusted");
        }, 500);
        return;
      }

      if (lowerText.includes("community") || lowerText.includes("social feed") || lowerText.includes("see what others are sharing")) {
        setTimeout(() => {
          addMessage("assistant", {
            type: "system",
            content: "Opening Social Feed...",
          });
          navigate("/social/feed");
        }, 500);
        return;
      }

      // Check for real help queries (Phase 12)
      const directoryQueries = detectDirectoryQuery(text);
      if (directoryQueries && directoryQueries.domain === "real_help") {
        // Open Real Help workspace
        setTimeout(() => {
          addMessage("assistant", {
            type: "system",
            content: "Opening Real Help tools for your situation...",
          });
          navigate(`/workspace/real-help?priority=${directoryQueries.priority || "programs"}&query=${encodeURIComponent(directoryQueries.query || "")}`);
        }, 500);
        return;
      }

      // Check for directory search queries
      if (directoryQueries) {
        setTimeout(async () => {
          try {
            // Use searchResources (Firebase Function + fallback)
            const searchResponse = await searchResources({
              query: directoryQueries.query,
              domain: directoryQueries.domain,
            });
            
            if (searchResponse.ok && searchResponse.results && searchResponse.results.length > 0) {
              // Add assistant message first
              addMessage("assistant", "I found a few resources that might help. Here are some options:");
              
              // Add directory results block
              const directoryMessage = {
                id: `directory-${Date.now()}`,
                role: "directory",
                type: "directory_results",
                domain: directoryQueries.domain,
                query: directoryQueries.query,
                results: searchResponse.results,
                timestamp: Date.now(),
              };
              addMessage("directory", JSON.stringify(directoryMessage));
              
              // Offer to open full directory
              addMessage("assistant", {
                type: "system",
                content: `Would you like to open the full ${directoryQueries.domain} directory to see more results?`,
              });
            } else {
              // If no results, suggest opening the directory workspace
              const errorMsg = searchResponse.error || "No results found";
              addMessage("assistant", `I couldn't find specific results for "${directoryQueries.query}". ${errorMsg.includes("too many") ? "The search service is busy. " : ""}Would you like me to open the full directory so you can search more broadly?`);
            }
          } catch (err) {
            console.error("Directory search failed:", err);
            addMessage("assistant", "I had trouble searching the directory. Please try opening it directly from the sidebar.");
          }
        }, 500);
      }
    } catch (err) {
      console.error("AI request failed:", err);
      const errorMsg =
        "I couldn't reach the wider network, but I'm still right here with you. Try again in a moment.";
      addMessage("assistant", {
        type: "assistant_text",
        text: errorMsg,
        content: errorMsg,
        timestamp: Date.now(),
      });
    } finally {
      setIsSending(false);
      setThinking(false);
    }
  };

  const handleVoiceInputComplete = (audioBlob) => {
    // Phase 14: Open voice session workspace when mic is held
    if (audioBlob) {
      openWorkspace({
        type: "voice-session",
        title: "Voice Session",
        data: { audioBlob },
      });
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    // Phase 17: Enrich message with emotion before storing
    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    
    const enrichedMessage = enrichMessageWithEmotion(userMessage);
    
    // Phase 17: Analyze signals (triggers + risk)
    const signals = analyzeMessageSignals(enrichedMessage);
    enrichedMessage.triggers = signals.triggers;
    enrichedMessage.risk = signals.risk;
    
    // Phase 17: Track high-risk events
    if (signals.risk.riskLevel === "high") {
      trackRiskEvent({
        riskLevel: signals.risk.riskLevel,
        reasons: signals.risk.reasons,
        domains: signals.risk.domains,
        messageId: enrichedMessage.id,
        timestamp: enrichedMessage.timestamp,
      }).catch(() => {
        // Silently fail - telemetry only
      });
      
      // Phase 17: Log risk snapshot for provider timeline (if userId available)
      if (identity?.userId) {
        logRiskSnapshot({
          userId: identity.userId,
          riskLevel: signals.risk.riskLevel,
          reasons: signals.risk.reasons,
          emotion: enrichedMessage.emotion,
        }).catch(() => {
          // Silently fail - best effort only
        });
      }
    }
    
    // Phase 19: Update last emotion and risk event in store
    const setLastEmotion = useOSStore.getState().setLastEmotion;
    const setLastRiskEvent = useOSStore.getState().setLastRiskEvent;
    
    if (enrichedMessage.emotion) setLastEmotion(enrichedMessage.emotion);
    if (enrichedMessage.risk?.riskLevel === "high") setLastRiskEvent(enrichedMessage.risk);
    
    // Add enriched message to store (pass full object to preserve emotion/triggers/risk)
    addMessage("user", {
      content: enrichedMessage.content,
      emotion: enrichedMessage.emotion,
      triggers: enrichedMessage.triggers,
      risk: enrichedMessage.risk,
    });
    
    // Phase 17: Get tool recommendation
    const recommendation = getRecommendedTool({
      message: enrichedMessage,
      emotion: enrichedMessage.emotion,
      triggers: signals.triggers,
      risk: signals.risk,
    });
    
    // Phase 21: Show recommendation if available (after a short delay)
    if (recommendation) {
      setTimeout(() => {
        addMessage("assistant", {
          id: `recommendation-${Date.now()}`,
          role: "assistant",
          type: "recommendation",
          content: recommendation.reason || "Based on what you just shared, we can try a short practice together.",
          suggestion: recommendation,
          timestamp: Date.now(),
        });
      }, 1000);
    }
    
    setInput("");
    await sendToAI(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Phase 19: Provider Monitor Strip */}
      <ProviderMonitorStrip />
      
      {/* Welcome Screen (before conversation starts) */}
      {!hasStarted && (
        <WelcomeScreen
          onAction={async (action) => {
            // Phase 17: Enrich welcome screen actions with emotion/risk too
            const userMessage = {
              id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              role: "user",
              content: action,
              timestamp: Date.now(),
            };
            
            const enrichedMessage = enrichMessageWithEmotion(userMessage);
            const signals = analyzeMessageSignals(enrichedMessage);
            enrichedMessage.triggers = signals.triggers;
            enrichedMessage.risk = signals.risk;
            
            // Track high-risk if needed
            if (signals.risk.riskLevel === "high") {
              trackRiskEvent({
                riskLevel: signals.risk.riskLevel,
                reasons: signals.risk.reasons,
                domains: signals.risk.domains,
                messageId: enrichedMessage.id,
                timestamp: enrichedMessage.timestamp,
              }).catch(() => {});
              
              if (identity?.userId) {
                logRiskSnapshot({
                  userId: identity.userId,
                  riskLevel: signals.risk.riskLevel,
                  reasons: signals.risk.reasons,
                  emotion: enrichedMessage.emotion,
                }).catch(() => {});
              }
            }
            
            // Phase 19: Update last emotion and risk event in store
            const setLastEmotion = useOSStore.getState().setLastEmotion;
            const setLastRiskEvent = useOSStore.getState().setLastRiskEvent;
            
            if (enrichedMessage.emotion) setLastEmotion(enrichedMessage.emotion);
            if (enrichedMessage.risk?.riskLevel === "high") setLastRiskEvent(enrichedMessage.risk);
            
            addMessage("user", {
              content: enrichedMessage.content,
              emotion: enrichedMessage.emotion,
              triggers: enrichedMessage.triggers,
              risk: enrichedMessage.risk,
            });
            
            // Get recommendation
            const recommendation = getRecommendedTool({
              message: enrichedMessage,
              emotion: enrichedMessage.emotion,
              triggers: signals.triggers,
              risk: signals.risk,
            });
            
            if (recommendation) {
              setTimeout(() => {
                addMessage("assistant", {
                  id: `recommendation-${Date.now()}`,
                  role: "assistant",
                  type: "recommendation",
                  content: recommendation.reason || "Based on what you just shared, we can try a short practice together.",
                  suggestion: recommendation,
                  timestamp: Date.now(),
                });
              }, 1000);
            }
            
            await sendToAI(action);
          }}
        />
      )}

      {/* Messages Area */}
      {hasStarted && (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 pb-[90px] sm:pb-8">
            {/* Greeting Header (only show once when conversation starts) */}
            {messages.filter((m) => m.role === "user").length === 1 && (
              <div className="mb-8 text-center animate-fade-in">
                <h2 className="text-2xl font-light text-white mb-2">
                  {greeting}
                </h2>
                <p className="text-base text-white/60">Living Guide</p>
              </div>
            )}
            <div className="space-y-6">
              {messages.map((msg) => {
                if (msg.role === "tool") {
                  return <ToolBlock key={msg.id} tool={msg} />;
                }
                if (msg.role === "directory") {
                  return <DirectoryResultBlock key={msg.id} message={msg.content} />;
                }
                
                // Handle multimodal assistant messages
                if (msg.role === "assistant" && msg.type) {
                  if (msg.type === "assistant_audio") {
                    return (
                      <div key={msg.id} className="space-y-2 animate-fade-in">
                        <MessageBubble message={{ ...msg, role: "assistant", content: msg.text || msg.content }} />
                        {msg.audioUrl && (
                          <div className="ml-0 sm:ml-12 w-full sm:w-auto">
                            <VoiceResponse text={msg.text || msg.content} audioUrl={msg.audioUrl} />
                          </div>
                        )}
                      </div>
                    );
                  }
                  if (msg.type === "assistant_video") {
                    return (
                      <div key={msg.id} className="space-y-2 animate-fade-in">
                        <MessageBubble message={{ ...msg, role: "assistant", content: msg.text || msg.content }} />
                        {msg.videoUrl && (
                          <div className="ml-0 sm:ml-12 w-full max-w-full sm:max-w-2xl">
                            <VideoGuidance
                              videoUrl={msg.videoUrl}
                              title="Guided Practice"
                              mode={msg.mode}
                            />
                          </div>
                        )}
                      </div>
                    );
                  }
                  // Phase 21: Handle recommendation messages with improved UI
                  if (msg.type === "recommendation" && msg.suggestion) {
                    const toolName = TOOL_NAMES[msg.suggestion.toolId] || msg.suggestion.toolId;
                    const handleOpenSuggestedTool = (suggestion) => {
                      if (suggestion?.toolId) {
                        injectToolIntoChat(suggestion.toolId, {});
                      }
                    };
                    const dismissSuggestion = (messageId) => {
                      // Remove the recommendation message from the store
                      const currentMessages = useOSStore.getState().messages;
                      const filteredMessages = currentMessages.filter(m => m.id !== messageId);
                      useOSStore.setState({ messages: filteredMessages });
                      
                      // Also update the current chat
                      const currentChatId = useOSStore.getState().currentChatId;
                      const chats = useOSStore.getState().chats;
                      const updatedChats = chats.map(chat => {
                        if (chat.id === currentChatId) {
                          return {
                            ...chat,
                            messages: filteredMessages,
                            updatedAt: Date.now(),
                          };
                        }
                        return chat;
                      });
                      useOSStore.setState({ chats: updatedChats });
                    };
                    
                    return (
                      <div key={msg.id} className="flex items-start gap-2 sm:gap-4 animate-fade-in">
                        <div className="flex-shrink-0">
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center">
                            <span className="text-[10px] sm:text-xs font-medium text-white">SG</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="w-full max-w-full rounded-xl bg-amber-500/10 border border-amber-400/40 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            <p className="text-sm text-amber-50 flex-1">
                              {msg.content || msg.text || "Based on what you just shared, we can try a short practice together."}
                            </p>
                            <div className="flex flex-row flex-wrap gap-2 justify-start sm:justify-end">
                              <button
                                type="button"
                                className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition min-h-[40px] sm:min-h-0"
                                onClick={() => handleOpenSuggestedTool(msg.suggestion)}
                              >
                                Open {toolName}
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-amber-300/60 text-amber-100 hover:bg-amber-300/10 transition min-h-[40px] sm:min-h-0"
                                onClick={() => dismissSuggestion(msg.id)}
                              >
                                Not now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                }
                
                // Phase 19: Add EmotionalSignalBar to user messages
                if (msg.role === "user") {
                  return (
                    <div key={msg.id}>
                      <MessageBubble message={msg} />
                      <EmotionalSignalBar 
                        emotion={msg.emotion} 
                        triggers={msg.triggers}
                        risk={msg.risk}
                      />
                    </div>
                  );
                }
                
                return <MessageBubble key={msg.id} message={msg} />;
              })}
              {isThinking && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <div className="flex-1">
                    <div className="inline-block max-w-[85%] rounded-2xl bg-white/5 p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-wcGold" />
                        <span className="text-base text-white/60">Listening…</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Input Bar - ChatGPT style */}
      <div className="border-t border-white/10 bg-slate-950 sticky bottom-0 z-10 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                rows={1}
                className="w-full resize-none rounded-2xl border border-white/20 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none transition-colors"
                disabled={isSending}
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <VoiceInput
                onTranscript={(transcribedText) => {
                  setInput(transcribedText);
                  // User can edit before sending, or it will auto-send if onSend is provided
                }}
                onSend={(transcribedText) => {
                  if (transcribedText.trim() && !isSending) {
                    addMessage("user", transcribedText);
                    sendToAI(transcribedText);
                  }
                }}
                onComplete={(audioBlob) => {
                  // Phase 14: Open voice session workspace when mic is held
                  handleVoiceInputComplete(audioBlob);
                }}
                disabled={isSending}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;

