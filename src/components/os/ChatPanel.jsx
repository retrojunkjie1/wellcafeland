// src/components/os/ChatPanel.jsx
// Clean ChatGPT-style chat panel (no stacking)

import React, { useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Loader2 } from "lucide-react";
import { useOSStore } from "@/stores/useOSStore";
import { useAIStore } from "@/apps/ai/useAIStore";
import { useAdminTelemetry } from "@/hooks/useAdminTelemetry";
import MessageBubble from "./MessageBubble";
import ToolBlock from "./ToolBlock";
import WelcomeScreen from "./WelcomeScreen";
import VoiceInput from "./VoiceInput";
import DirectoryResultBlock from "./DirectoryResultBlock";
import IntentRenderer from "@/core/intent/IntentRenderer";
import InAppWebView from "@/components/InAppWebView";
import VoiceResponse from "./VoiceResponse";
import VideoGuidance from "./VideoGuidance";
import { searchResources } from "@/services/resourceSearch";
// Removed: using aiClient instead
import { determineGuideResponse } from "@/services/decisionEngine";
import {
  enrichMessageWithEmotion,
  analyzeMessageSignals,
  getRecommendedTool,
  detectEmotionalDrift,
  detectPatternCluster,
  forecastEmotionalDirection,
  analyzeDriftSnapshot,
  enrichMessageWithIdentity,
  enrichMessageWithRelationship,
  computeCrisisForecast,
  mergeEmotionChannels,
} from "@/core/system/intelligenceEngine";
import { computeEmotionalTrajectory } from "@/core/system/patternEngine";
import { normalizeMessage } from "@/core/system/messageNormalizer";
import { getHumanMode } from "@/core/system/hmn";
import { getToneProfile, shouldSoftRedirect } from "@/core/system/toneEngine";
import { getPhrasingStyle, buildAssistantResponse } from "@/core/system/phrasingEngine";
import { trackRiskEvent } from "@/services/sessionTelemetry";
import { logRiskSnapshot, logIdentitySnapshot } from "@/services/providerTimeline";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import EmotionalSignalBar from "../analysis/EmotionalSignalBar";
import ProviderMonitorStrip from "../analysis/ProviderMonitorStrip";
// Phase 27: Emotional HUD Integration
import EmotionalChip from "../analysis/EmotionalChip";
import TriggerChips from "../analysis/TriggerChip";
import RiskBadge from "../analysis/RiskBadge";
import TrajectoryTag from "../analysis/TrajectoryTag";
import IntelligencePulse from "../hud/IntelligencePulse";
// Phase 31: Face Signal Engine
import { getFaceEmotionSnapshot } from "@/core/system/faceSignal";
import FaceScanPrompt from "./FaceScanPrompt";
import { logDebug } from "@/lib/debug";

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

  // Food queries
  if (
    lowerText.includes("need food") ||
    lowerText.includes("i need food") ||
    lowerText.includes("hungry") ||
    lowerText.includes("food bank") ||
    lowerText.includes("need groceries") ||
    lowerText.includes("can't afford food") ||
    lowerText.includes("food assistance") ||
    lowerText.includes("meal")
  ) {
    return { domain: "food", query: text, priority: "food" };
  }

  // Housing queries
  if (
    lowerText.includes("housing") ||
    lowerText.includes("need housing") ||
    lowerText.includes("i need housing") ||
    lowerText.includes("sober living") ||
    lowerText.includes("halfway house") ||
    lowerText.includes("transitional housing") ||
    lowerText.includes("emergency housing") ||
    lowerText.includes("going to be homeless") ||
    lowerText.includes("homeless")
  ) {
    return { domain: "housing", query: text, priority: "housing" };
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
  const { isOnline } = useOnlineStatus();
  const isOffline = !isOnline;
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingFaceEmotion, setPendingFaceEmotion] = useState(null);
  const [faceScanPromptOpen, setFaceScanPromptOpen] = useState(false);
  const [offlineQueueLength, setOfflineQueueLength] = useState(0);
  const [webViewUrl, setWebViewUrl] = useState(null);
  const [webViewTitle, setWebViewTitle] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const isSendingRef = useRef(false);
  // PHASE H: Chat state preservation
  const lastUnsentMessageRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastUserMessageRef = useRef(null);
  // Connection state machine: idle → sending → awaiting_response → resolved → error
  const connectionStateRef = useRef("idle");
  const lastErrorMessageRef = useRef(null);
  const offlineMessageQueueRef = useRef([]); // Message queue for offline sends
  
  // Hard reset fallback: Reset conversation state only (not auth/identity)
  const resetConversationState = React.useCallback(() => {
    connectionStateRef.current = "idle";
    lastErrorMessageRef.current = null;
    lastUnsentMessageRef.current = null;
    offlineMessageQueueRef.current = [];
    setOfflineQueueLength(0);
    isSendingRef.current = false;
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {}
      abortControllerRef.current = null;
    }
    isSendingRef.current = false;
    setIsSending(false);
    setThinking(false);
    // Clear error messages from conversation (keep user messages)
    const store = useOSStore.getState();
    if (store.messages && Array.isArray(store.messages)) {
      const isErrorMsg = (m) =>
        (m.type === "assistant_text" || m.role === "assistant") &&
        (m.actions?.length > 0 ||
          m.text?.includes("Still here with you") ||
          m.text?.includes("Connection lost") ||
          m.text?.includes("Tap Retry") ||
          m.content?.includes("Still here with you") ||
          m.content?.includes("Connection lost") ||
          m.content?.includes("Tap Retry"));
      const filtered = store.messages.filter((m) => !isErrorMsg(m));
      if (filtered.length !== store.messages.length) {
        store.setMessages(filtered);
      }
    }
  }, []);
  // Defensive: Wrap telemetry hook to prevent crashes if it fails
  let logEvent = () => {}; // Safe default
  try {
    const telemetry = useAdminTelemetry();
    logEvent = telemetry?.logEvent || (() => {});
  } catch (err) {
    console.warn("[ChatPanel] AdminTelemetry hook failed:", err);
    // Continue without telemetry
  }

  const hasStarted = messages.length > 1; // More than just welcome message

  // Get time-based greeting (memoized to avoid impure calls)
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Chat transport: sendToAI - must be stable function, defined before any usage
  const sendToAI = React.useCallback(async function sendToAIFn(text) {
    // Phase 2: Guard against empty sends - prevent chat loop
    if (!text || typeof text !== "string" || !text.trim() || text.trim().length === 0) {
      console.warn("[ChatPanel] sendToAI called with invalid or empty text");
      return;
    }

    // Guard: Prevent duplicate/concurrent sends (never auto-resend on ok:false)
    if (isSendingRef.current || connectionStateRef.current === "sending" || connectionStateRef.current === "awaiting_response") {
      console.warn("[ChatPanel] sendToAI called while already sending, ignoring");
      return;
    }
    isSendingRef.current = true;

    try {
      // Preserve last unsent message
      lastUnsentMessageRef.current = text;
      lastUserMessageRef.current = text;

      // Update connection state
      connectionStateRef.current = "sending";
      setIsSending(true);
      setThinking(true);
      lastErrorMessageRef.current = null;

      // Create AbortController for this request
      abortControllerRef.current = new AbortController();

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

          // Phase 26: Compute tone profile for backend metadata
          let currentHumanMode = "neutral";
          let currentToneProfile = null;
          let currentPhrasingStyle = null;
          try {
            currentHumanMode = getHumanMode(text, {
              emotion: null,
              risk: null,
              triggers: [],
            });
            currentToneProfile = getToneProfile({
              humanMode: currentHumanMode,
              emotion: null,
              risk: null,
            });
            currentPhrasingStyle = getPhrasingStyle(currentToneProfile);
          } catch (err) {
            console.warn("[ChatPanel] Failed to compute tone profile for send:", err);
          }

        // Update state: sending → awaiting_response
        connectionStateRef.current = "awaiting_response";

        // Call backend via robust AI client
        const { callAI } = await import("@/services/aiClient");
        const res = await callAI("aiSession", {
          messages: messageHistory,
          mode,
          metadata: {
            ...(decision ? {
              emotion: decision.emotion,
              spirit: decision.spirit,
              forecast: decision.forecast,
            } : {}),
            humanMode: currentHumanMode,
            toneProfile: currentToneProfile,
            phrasingStyle: currentPhrasingStyle,
          },
        }, abortControllerRef.current);

        // Update state: awaiting_response → resolved/error
        // Only update state if we actually got a response (not aborted/timeout)
        if (res && typeof res === 'object') {
          if (res.ok) {
            connectionStateRef.current = "resolved";
          } else {
            connectionStateRef.current = "error";
          }
        }

        // Log error for telemetry if failed
        if (!res.ok) {
          logEvent({
            chat_disconnect_reason: res.status === 0 ? "network_error" : "server_error",
            device_type: /iPad|iPhone|iPod/.test(navigator.userAgent) ? "ios" : 
                         /Android/.test(navigator.userAgent) ? "android" : "desktop",
            visibility_state: document.hidden ? "hidden" : "visible",
          });
        }

        if (!res.ok) {
          // Cleanup AbortController
          abortControllerRef.current = null;
          connectionStateRef.current = "error";

          // TRUTH-GATE: If network fails but user requested a tool directly, only promise if tool actually opens
          if (directToolRequest) {
            const { validateToolId } = await import("@/utils/toolRouter");
            if (validateToolId(directToolRequest)) {
              // Attempt to open tool first
              const toolMessage = await injectToolIntoChat(directToolRequest, {});
              
              // TRUTH-GATE: Only promise tool opening if it actually opened
              if (toolMessage) {
                addMessage("assistant", {
                  type: "system",
                  content: `I'm having trouble connecting right now, but I can still help. I've opened the ${TOOL_NAMES[directToolRequest] || directToolRequest} tool for you.`,
                });
              } else {
                // Tool failed to open - don't promise it
                addMessage("assistant", {
                  type: "assistant_text",
                  text: "I'm having trouble connecting right now. You can navigate to the Tools section to open tools directly.",
                  content: "I'm having trouble connecting right now. You can navigate to the Tools section to open tools directly.",
                  timestamp: Date.now(),
                });
              }
            } else {
              // Tool not available - show safe fallback
              addMessage("assistant", {
                type: "assistant_text",
                text: "I'm having trouble connecting right now. Please try again in a moment, or navigate to the Tools section directly.",
                content: "I'm having trouble connecting right now. Please try again in a moment, or navigate to the Tools section directly.",
                timestamp: Date.now(),
              });
            }
            connectionStateRef.current = "idle";
            isSendingRef.current = false;
            setIsSending(false);
            setThinking(false);
            return;
          }
          
          // Queue message if offline, otherwise show error
          const isActuallyOffline = typeof navigator !== "undefined" && navigator.onLine === false;
          if (isActuallyOffline) {
            offlineMessageQueueRef.current.push(text);
            setOfflineQueueLength((n) => n + 1);
            addMessage("assistant", {
              type: "assistant_text",
              text: "Connection lost. Your message will be sent when you're back online. Tap Retry to send now.",
              content: "Connection lost. Your message will be sent when you're back online.",
              timestamp: Date.now(),
            });
          } else {
          // Guard: Only show error message once per failure (debounce duplicates)
          const errorMessage = res.error || "Still here with you. Tap send to continue.";
          if (lastErrorMessageRef.current !== errorMessage) {
            lastErrorMessageRef.current = errorMessage;
            addMessage("assistant", {
              type: "assistant_text",
              text: errorMessage,
              content: errorMessage,
              timestamp: Date.now(),
              // Add action buttons for error recovery
              actions: [
                { label: "Retry", action: "retry" },
                { label: "Continue offline", action: "offline" },
                { label: "Open tools", action: "open_tools" },
              ],
            });
          }
          }
          connectionStateRef.current = "idle";
          isSendingRef.current = false;
          setIsSending(false);
          setThinking(false);
          return;
        }

        // Success: Clear error message ref
        lastErrorMessageRef.current = null;

        // Clear last message on success
        lastUnsentMessageRef.current = null;
        abortControllerRef.current = null;
        connectionStateRef.current = "idle";

        // Handle response - always text from aiClient
        // Phase 27: Optionally post-process assistant responses with phrasing
        let processedText = res.text || "";
        try {
          if (currentPhrasingStyle && processedText) {
            processedText = buildAssistantResponse(processedText, currentPhrasingStyle);
          }
        } catch (err) {
          console.warn("[ChatPanel] Failed to apply phrasing to response:", err);
        }

        // Text response with intent and links (Prompt-Native Spine)
        const lastMsgIntent = res.intent && typeof res.intent === "object" ? res.intent : null;
        const lastMsgLinks = Array.isArray(res.links) ? res.links : [];
        const storedMsg = {
          type: "assistant_text",
          text: processedText,
          content: processedText,
          timestamp: Date.now(),
          intent: lastMsgIntent,
          links: lastMsgLinks,
        };
        if (import.meta.env.DEV && typeof window !== "undefined") {
          window.__wcLastAssistantMessage = storedMsg;
          console.debug("[ChatPanel] assistantMessage", {
            textLength: (processedText || "").length,
            intentType: lastMsgIntent?.type || null,
            linksLength: lastMsgLinks.length,
          });
        }
        addMessage("assistant", storedMsg);

        // Tool policy: ONLY intent.type === "tool.run" opens tools. tool.suggest = chips only (IntentRenderer).
        const intentType = lastMsgIntent?.type;
        const intentToolId = lastMsgIntent?.payload?.toolId;
        if (intentType === "tool.run" && intentToolId) {
          const { validateToolId } = await import("@/utils/toolRouter");
          if (validateToolId(intentToolId)) {
            setTimeout(async () => {
              const toolMessage = await injectToolIntoChat(intentToolId, lastMsgIntent?.payload?.args || {});
              if (toolMessage) {
                addMessage("assistant", {
                  type: "system",
                  content: `I've opened the ${TOOL_NAMES[intentToolId] || intentToolId} tool for you. Take your time, I'm here.`,
                });
              }
            }, 500);
          }
        }
        // Legacy: res.tool from backend (only when explicit request; backend gates tool.run)
        if (!intentType && res.tool?.name && directToolRequest) {
          const { validateToolId } = await import("@/utils/toolRouter");
          if (validateToolId(res.tool.name)) {
            setTimeout(async () => {
              const toolMessage = await injectToolIntoChat(res.tool.name, {});
              if (toolMessage) {
                addMessage("assistant", {
                  type: "system",
                  content: `I've opened the ${TOOL_NAMES[res.tool.name] || res.tool.name} tool for you. Take your time, I'm here.`,
                });
              }
            }, 500);
          }
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

        // Skip directory navigation when backend already returned directory.search intent (results in chat)
        const hasDirectoryIntent = lastMsgIntent?.type === "directory.search";
        if (hasDirectoryIntent) {
          // IntentRenderer will show results; do not navigate away
        } else {
        // Check for real help queries (Phase 12) — only when backend did not return directory intent
        const directoryQueries = detectDirectoryQuery(text);
        if (directoryQueries) {
          // Determine priority/category from query
          let priority = directoryQueries.priority || "programs";
          let category = null;
          
          const lowerText = text.toLowerCase();
          
          // Map to Real Help categories
          if (lowerText.includes("food") || lowerText.includes("hungry") || lowerText.includes("meal") || 
              lowerText.includes("food bank") || lowerText.includes("groceries")) {
            priority = "food";
            category = "food";
          } else if (lowerText.includes("housing") || lowerText.includes("place to stay") || 
                     lowerText.includes("sober living") || lowerText.includes("shelter") ||
                     lowerText.includes("homeless")) {
            priority = "housing";
            category = "housing";
          } else if (lowerText.includes("funding") || lowerText.includes("grant") || 
                     lowerText.includes("financial help") || lowerText.includes("money")) {
            priority = "funding";
            category = "grants";
          } else if (lowerText.includes("treatment") || lowerText.includes("detox") || 
                     lowerText.includes("rehab") || lowerText.includes("recovery program")) {
            priority = "programs";
            category = "treatment";
          }
          
          // TRUTH-GATE: Navigate to Real Help with pre-filled search
          // Only show "opening" message if navigation actually happens
          setTimeout(() => {
            try {
              const targetUrl = `/workspace/real-help?priority=${priority}${category ? `&category=${category}` : ""}${directoryQueries.query ? `&query=${encodeURIComponent(directoryQueries.query)}` : ""}`;
              navigate(targetUrl);
              
              // Only add message after navigation succeeds
              addMessage("assistant", {
                type: "system",
                content: "I've opened Real Help for you. Here you can find verified resources.",
              });
            } catch (navErr) {
              // Navigation failed - don't promise it
              console.warn("[ChatPanel] Navigation to Real Help failed:", navErr);
              addMessage("assistant", {
                type: "assistant_text",
                text: "I can help you find resources. You can navigate to the Real Help section from the sidebar.",
                content: "I can help you find resources. You can navigate to the Real Help section from the sidebar.",
                timestamp: Date.now(),
              });
            }
          }, 300);
          return;
        }

        // Check for directory search queries (unreachable if directoryQueries navigated above)
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
        }
      } catch (innerErr) {
        console.error("[ChatPanel] Inner sendToAI error:", innerErr);
        connectionStateRef.current = "error";
        // Cleanup on inner error
        if (abortControllerRef.current) {
          try {
            abortControllerRef.current.abort();
          } catch {}
          abortControllerRef.current = null;
        }
        // TRUTH-GATE: If network fails but user requested a tool directly, only promise if tool actually opens
        if (directToolRequest) {
          const { validateToolId } = await import("@/utils/toolRouter");
          if (validateToolId(directToolRequest)) {
            // Attempt to open tool first
            const toolMessage = await injectToolIntoChat(directToolRequest, {});
            
            // TRUTH-GATE: Only promise tool opening if it actually opened
            if (toolMessage) {
              addMessage("assistant", {
                type: "system",
                content: `I'm having trouble connecting right now, but I can still help. I've opened the ${TOOL_NAMES[directToolRequest] || directToolRequest} tool for you.`,
              });
            } else {
              // Tool failed to open - don't promise it
              addMessage("assistant", {
                type: "assistant_text",
                text: "I'm having trouble connecting right now. You can navigate to the Tools section to open tools directly.",
                content: "I'm having trouble connecting right now. You can navigate to the Tools section to open tools directly.",
                timestamp: Date.now(),
              });
            }
          } else {
            // Tool not available - show safe fallback
            addMessage("assistant", {
              type: "assistant_text",
              text: "I'm having trouble connecting right now. Please try again in a moment, or navigate to the Tools section directly.",
              content: "I'm having trouble connecting right now. Please try again in a moment, or navigate to the Tools section directly.",
              timestamp: Date.now(),
            });
          }
          connectionStateRef.current = "idle";
          isSendingRef.current = false;
          setIsSending(false);
          setThinking(false);
          return;
        }
        throw innerErr; // Re-throw to outer catch
      }
    } catch (err) {
      console.error("[ChatPanel] sendToAI error:", err);
      connectionStateRef.current = "error";
      // Cleanup AbortController on any error
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch {}
        abortControllerRef.current = null;
      }

      // Guard: Only show error message once per failure - prevent loop
      const isActuallyOffline = typeof navigator !== "undefined" && navigator.onLine === false;
      const errorMessage = isActuallyOffline 
        ? "Connection lost. Reconnecting..."
        : "Still here with you. Tap send to continue.";
      
      // Only add message if this is a new error or different message
      if (lastErrorMessageRef.current !== errorMessage) {
        lastErrorMessageRef.current = errorMessage;
        addMessage("assistant", {
          type: "assistant_text",
          text: errorMessage,
          content: errorMessage,
          timestamp: Date.now(),
        });
      }
      
      // Log error for telemetry (non-blocking)
      try {
        logEvent({
          chat_disconnect_reason: "error",
          device_type: /iPad|iPhone|iPod/.test(navigator.userAgent) ? "ios" : 
                       /Android/.test(navigator.userAgent) ? "android" : "desktop",
          visibility_state: document.hidden ? "hidden" : "visible",
        });
      } catch {}
    } finally {
      connectionStateRef.current = "idle";
      isSendingRef.current = false;
      setIsSending(false);
      setThinking(false);
    }
  }, [messages, addMessage, injectToolIntoChat, setThinking, logEvent, openWorkspace, navigate]);

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
    // Guard: Prevent duplicate sends using connection state
    if (!text || isSending || connectionStateRef.current === "sending" || connectionStateRef.current === "awaiting_response") {
      return;
    }

    // Offline: show message in chat, queue for later, no auto-send
    if (isOffline) {
      const offlineUserMessage = normalizeMessage({
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: text,
        role: "user",
        timestamp: Date.now(),
      });
      addMessage("user", offlineUserMessage);
      offlineMessageQueueRef.current.push(text);
      setOfflineQueueLength((n) => n + 1);
      setInput("");
      return;
    }

    // PHASE H: Restore last unsent message if needed (already in input via state)

    // Phase 17: Enrich message with emotion before storing
    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    
    let enrichedMessage = enrichMessageWithEmotion(userMessage);
    
    // Phase 31: Merge face emotion if available
    if (pendingFaceEmotion) {
      enrichedMessage.emotion = mergeEmotionChannels(enrichedMessage.emotion, pendingFaceEmotion);
      setPendingFaceEmotion(null); // Reset after use
    }
    
    // Phase 17: Analyze signals (triggers + risk)
    const signals = analyzeMessageSignals(enrichedMessage);
    enrichedMessage.triggers = signals.triggers;
    enrichedMessage.risk = signals.risk;

    // Phase 28: Identity fracture modeling
    const identityEnriched = enrichMessageWithIdentity(enrichedMessage);
    enrichedMessage.identity = identityEnriched.identity;
    
    // Phase 29: Relationship Stress Mapping
    const withRelationship = enrichMessageWithRelationship(enrichedMessage);
    enrichedMessage.relationship = withRelationship.relationship;
    
    // Phase 25: Human Mode Navigator (HMN)
    const humanMode = getHumanMode(text, {
      emotion: enrichedMessage.emotion,
      risk: signals.risk,
      triggers: signals.triggers,
    });
    enrichedMessage.humanMode = humanMode;
    
    // Phase 27: Store humanMode in UI state
    const setLastHumanMode = useOSStore.getState().setLastHumanMode;
    if (setLastHumanMode) {
      setLastHumanMode(humanMode);
    }
    
    // Phase 26: Adaptive Tone System (ATS)
    const toneProfile = getToneProfile({
      humanMode,
      emotion: enrichedMessage.emotion,
      risk: signals.risk,
    });
    enrichedMessage.toneProfile = toneProfile;
    
    // Phase 27: Adaptive Response Phrasing Engine (ARP)
    const phrasingStyle = getPhrasingStyle(enrichedMessage.toneProfile);
    enrichedMessage.phrasingStyle = phrasingStyle;
    
    // Phase 28: Behavioral Drift Engine (BDE)
    try {
      const recentMessages = useOSStore.getState().messages.slice(-10);
      const drift = analyzeDriftSnapshot(recentMessages);
      if (drift) {
        enrichedMessage.drift = drift;
      }
    } catch (err) {
      console.warn("[ChatPanel] Failed to compute behavioral drift:", err);
    }
    
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

        // Phase 28: Optionally log identity snapshot for provider view
        if (enrichedMessage.identity) {
          logIdentitySnapshot({
            userId: identity.userId,
            identity: enrichedMessage.identity,
          }).catch(() => {
            // Best-effort only
          });
        }
      }
    }
    
    // Phase 19: Update last emotion and risk event in store
    const setLastEmotion = useOSStore.getState().setLastEmotion;
    const setLastRiskEvent = useOSStore.getState().setLastRiskEvent;
    
    if (enrichedMessage.emotion) setLastEmotion(enrichedMessage.emotion);
    if (enrichedMessage.risk?.riskLevel === "high") setLastRiskEvent(enrichedMessage.risk);
    
    // Phase 24: Emotional Graph Engine - compute trajectory
    try {
      const emotion = enrichedMessage.emotion || null;
      const risk = enrichedMessage.risk || null;
      const triggers = Array.isArray(enrichedMessage.triggers) ? enrichedMessage.triggers : [];

      if (emotion && typeof emotion.intensity === "number") {
        // 1) Append emotional snapshot
        const snapshot = {
          id: enrichedMessage.id,
          timestamp: Date.now(),
          label: emotion.label || null,
          intensity: emotion.intensity ?? 0,
          valence: emotion.valence || "neutral",
          triggers,
          riskLevel: risk?.riskLevel || "low",
        };

        const store = useOSStore.getState();
        if (typeof store.appendEmotionalSnapshot === "function") {
          store.appendEmotionalSnapshot(snapshot);
        }

        // 2) Read updated history
        const history = (useOSStore.getState().emotionalHistory || []).slice();

        // 3) Phase 25: Use computeEmotionalTrajectory instead of manual calls
        const { drift, cluster, forecast } = computeEmotionalTrajectory(history, emotion);

        // 4) Attach trajectory to message
        enrichedMessage.trajectory = {
          drift,
          cluster,
          forecast,
        };
      }
    } catch (err) {
      console.warn("[ChatPanel] Failed to update emotional trajectory:", err);
    }

    // Phase 28: Append identity snapshot (best-effort, non-blocking)
    try {
      const { buildIdentitySnapshot } = await import("@/ai/human/identityModel");
      const identitySnapshot = buildIdentitySnapshot(enrichedMessage);
      const store = useOSStore.getState();
      if (typeof store.appendIdentitySnapshot === "function") {
        store.appendIdentitySnapshot(identitySnapshot);
      }
    } catch (err) {
      console.warn("[ChatPanel] Failed to append identity snapshot:", err);
    }
    
    // Phase 29: Store relationship snapshot if available
    try {
      const store = useOSStore.getState();
      if (store.appendRelationshipSnapshot && enrichedMessage.relationship) {
        const { buildRelationshipSnapshot } = await import("@/ai/relationship/relationshipModel");
        const snapshot = buildRelationshipSnapshot(enrichedMessage);
        store.appendRelationshipSnapshot(snapshot);
        store.setLastRelationshipSnapshot(snapshot);
      }
    } catch (err) {
      logDebug("ChatPanel", { warn: "relationship_snapshot_failed", msg: err?.message });
    }
    
    // Phase 30: Crisis Forecast Engine - compute short-horizon crisis level
    try {
      const store = useOSStore.getState();
      const emotionalHistory = (store.emotionalHistory || []).slice();
      const lastRelationshipSnapshot = store.lastRelationshipSnapshot || null;

      const crisisForecast = computeCrisisForecast({
        emotionalHistory,
        lastEmotion: enrichedMessage.emotion || null,
        lastRisk: enrichedMessage.risk || null,
        lastRelationship: lastRelationshipSnapshot,
      });

      enrichedMessage.crisisForecast = crisisForecast;

      const setLastCrisisForecast = store.setLastCrisisForecast;
      if (typeof setLastCrisisForecast === "function") {
        setLastCrisisForecast(crisisForecast);
      }
    } catch (err) {
      console.warn("[ChatPanel] Failed to compute crisis forecast:", err);
    }
    
    // Phase 25: Normalize message before storing
    const messageForStore = normalizeMessage({
      content: enrichedMessage.content,
      emotion: enrichedMessage.emotion,
      triggers: enrichedMessage.triggers,
      risk: enrichedMessage.risk,
      trajectory: enrichedMessage.trajectory,
      identity: enrichedMessage.identity,
      relationship: enrichedMessage.relationship,
      crisisForecast: enrichedMessage.crisisForecast,
      humanMode: enrichedMessage.humanMode,
      toneProfile: enrichedMessage.toneProfile,
      phrasingStyle: enrichedMessage.phrasingStyle,
      drift: enrichedMessage.drift,
      role: "user",
    });
    
    addMessage("user", messageForStore);
    
    // Phase 17: Get tool recommendation (with cooldown + preference gating)
    const recommendation = getRecommendedTool({
      message: enrichedMessage,
      emotion: enrichedMessage.emotion,
      triggers: signals.triggers,
      risk: signals.risk,
    });
    const prefsOn = (typeof localStorage !== "undefined" && localStorage.getItem("wc_tool_suggestions") !== "off");
    const lastAt = parseInt(localStorage?.getItem("wc_last_tool_suggested_at") || "0", 10);
    const cooldownOk = Date.now() - lastAt >= 3 * 60 * 1000;
    if (recommendation && prefsOn && cooldownOk) {
      setTimeout(() => {
        try {
          localStorage?.setItem("wc_last_tool_suggested_at", String(Date.now()));
        } catch {}
        const recommendationMessage = normalizeMessage({
          id: `recommendation-${Date.now()}`,
          role: "assistant",
          type: "recommendation",
          content: recommendation.reason || "Try a short practice?",
          suggestion: recommendation,
          timestamp: Date.now(),
        });
        addMessage("assistant", recommendationMessage);
      }, 1000);
    }
    
    // Phase 26: Optional gentle redirect after light topics
    try {
      const messageCount = useOSStore.getState().messages.length;
      const softRedirect = shouldSoftRedirect({
        humanMode: enrichedMessage.humanMode,
        risk: enrichedMessage.risk,
        messageCount,
      });
      if (softRedirect) {
        setTimeout(() => {
          addMessage("assistant", {
            type: "system",
            content: "By the way, beyond this, how have you really been holding up lately?",
          });
        }, 1500);
      }
    } catch (err) {
      console.warn("[ChatPanel] Soft redirect failed:", err);
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

  // Phase 31: Face scan handler
  const handleFaceScan = async () => {
    try {
      const faceEmotion = await getFaceEmotionSnapshot({ seconds: 5 });
      if (faceEmotion) {
        setPendingFaceEmotion(faceEmotion);
        // Show brief confirmation
        addMessage("assistant", {
          type: "system",
          content: "Face expression captured. Your next message will include this emotional signal.",
        });
      } else {
        // User denied permission or error
        addMessage("assistant", {
          type: "system",
          content: "Face scan was cancelled or unavailable. You can continue typing normally.",
        });
      }
    } catch (err) {
      console.warn("[ChatPanel] Face scan error:", err);
      addMessage("assistant", {
        type: "system",
        content: "Face scan unavailable. You can continue typing normally.",
      });
    }
  };

  const handleMessageAction = React.useCallback((action, msg) => {
    if (action === "retry") {
      const text = lastUserMessageRef.current || (typeof msg?.content === "string" ? msg.content : msg?.content?.content) || "";
      if (text && connectionStateRef.current !== "sending" && connectionStateRef.current !== "awaiting_response") {
        lastErrorMessageRef.current = null;
        const store = useOSStore.getState();
        const msgs = store.messages || [];
        const filtered = msgs.filter((m) => !(m.actions?.length > 0 && m.role === "assistant"));
        if (filtered.length < msgs.length) store.setMessages(filtered);
        sendToAI(text);
      }
    } else if (action === "open_tools") {
      navigate("/tools");
    } else if (action === "offline") {
      const text = lastUserMessageRef.current;
      if (text) {
        offlineMessageQueueRef.current.push(text);
        setOfflineQueueLength((n) => n + 1);
      }
    }
  }, [navigate, sendToAI]);

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Phase 19: Provider Monitor Strip */}
      <ProviderMonitorStrip />
      
      {/* Phase 27: Intelligence Pulse Indicator */}
      <IntelligencePulse />
      
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
            
            // Phase 25: Human Mode Navigator (HMN)
            const humanMode = getHumanMode(action, {
              emotion: enrichedMessage.emotion,
              risk: signals.risk,
              triggers: signals.triggers,
            });
            enrichedMessage.humanMode = humanMode;
            
            // Phase 27: Store humanMode in UI state
            const setLastHumanMode = useOSStore.getState().setLastHumanMode;
            if (setLastHumanMode) {
              setLastHumanMode(humanMode);
            }
            
            // Phase 26: Adaptive Tone System (ATS)
            const toneProfile = getToneProfile({
              humanMode,
              emotion: enrichedMessage.emotion,
              risk: signals.risk,
            });
            enrichedMessage.toneProfile = toneProfile;
            
            // Phase 27: Adaptive Response Phrasing Engine (ARP)
            const phrasingStyle = getPhrasingStyle(enrichedMessage.toneProfile);
            enrichedMessage.phrasingStyle = phrasingStyle;

            // Phase 28: Identity fracture modeling
            const identityEnriched = enrichMessageWithIdentity(enrichedMessage);
            enrichedMessage.identity = identityEnriched.identity;
            
            // Phase 29: Relationship Stress Mapping
            const withRelationship = enrichMessageWithRelationship(enrichedMessage);
            enrichedMessage.relationship = withRelationship.relationship;
            
            // Phase 28: Behavioral Drift Engine (BDE)
            try {
              const recentMessages = useOSStore.getState().messages.slice(-10);
              const drift = analyzeDriftSnapshot(recentMessages);
              if (drift) {
                enrichedMessage.drift = drift;
              }
            } catch (err) {
              console.warn("[ChatPanel] Failed to compute behavioral drift:", err);
            }
            
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
            
            // Phase 24: Emotional Graph Engine - compute trajectory
            try {
              const emotion = enrichedMessage.emotion || null;
              const risk = enrichedMessage.risk || null;
              const triggers = Array.isArray(enrichedMessage.triggers) ? enrichedMessage.triggers : [];

              if (emotion && typeof emotion.intensity === "number") {
                // 1) Append emotional snapshot
                const snapshot = {
                  id: enrichedMessage.id,
                  timestamp: Date.now(),
                  label: emotion.label || null,
                  intensity: emotion.intensity ?? 0,
                  valence: emotion.valence || "neutral",
                  triggers,
                  riskLevel: risk?.riskLevel || "low",
                };

                const store = useOSStore.getState();
                if (typeof store.appendEmotionalSnapshot === "function") {
                  store.appendEmotionalSnapshot(snapshot);
                }

                // 2) Read updated history
                const history = (useOSStore.getState().emotionalHistory || []).slice();

                // 3) Phase 25: Use computeEmotionalTrajectory instead of manual calls
                const { drift, cluster, forecast } = computeEmotionalTrajectory(history, emotion);

                // 4) Attach trajectory to message
                enrichedMessage.trajectory = {
                  drift,
                  cluster,
                  forecast,
                };
              }
            } catch (err) {
              console.warn("[ChatPanel] Failed to update emotional trajectory:", err);
            }

            // Phase 28: Append identity snapshot (best-effort, non-blocking)
            try {
              const { buildIdentitySnapshot } = await import("@/ai/human/identityModel");
              const identitySnapshot = buildIdentitySnapshot(enrichedMessage);
              const store = useOSStore.getState();
              if (typeof store.appendIdentitySnapshot === "function") {
                store.appendIdentitySnapshot(identitySnapshot);
              }
            } catch (err) {
              console.warn("[ChatPanel] Failed to append identity snapshot (welcome):", err);
            }
            
            // Phase 29: Store relationship snapshot if available
            try {
              const store = useOSStore.getState();
              if (store.appendRelationshipSnapshot && enrichedMessage.relationship) {
                const { buildRelationshipSnapshot } = await import("@/ai/relationship/relationshipModel");
                const snapshot = buildRelationshipSnapshot(enrichedMessage);
                store.appendRelationshipSnapshot(snapshot);
                store.setLastRelationshipSnapshot(snapshot);
              }
            } catch (err) {
              logDebug("ChatPanel", { warn: "relationship_snapshot_failed", msg: err?.message });
            }
            
            // Phase 30: Crisis Forecast Engine - compute for quick-start actions too
            try {
              const store = useOSStore.getState();
              const emotionalHistory = (store.emotionalHistory || []).slice();
              const lastRelationshipSnapshot = store.lastRelationshipSnapshot || null;

              const crisisForecast = computeCrisisForecast({
                emotionalHistory,
                lastEmotion: enrichedMessage.emotion || null,
                lastRisk: enrichedMessage.risk || null,
                lastRelationship: lastRelationshipSnapshot,
              });

              enrichedMessage.crisisForecast = crisisForecast;

              const setLastCrisisForecast = store.setLastCrisisForecast;
              if (typeof setLastCrisisForecast === "function") {
                setLastCrisisForecast(crisisForecast);
              }
            } catch (err) {
              console.warn("[ChatPanel] Failed to compute crisis forecast (welcome action):", err);
            }
            
            // Phase 25: Normalize message before storing
            const messageForStore = normalizeMessage({
              content: enrichedMessage.content,
              emotion: enrichedMessage.emotion,
              triggers: enrichedMessage.triggers,
              risk: enrichedMessage.risk,
              trajectory: enrichedMessage.trajectory,
              identity: enrichedMessage.identity,
              relationship: enrichedMessage.relationship,
              crisisForecast: enrichedMessage.crisisForecast,
              humanMode: enrichedMessage.humanMode,
              toneProfile: enrichedMessage.toneProfile,
              phrasingStyle: enrichedMessage.phrasingStyle,
              drift: enrichedMessage.drift,
              role: "user",
            });
            
            addMessage("user", messageForStore);
            
            // Get recommendation (with cooldown + preference gating)
            const recommendation = getRecommendedTool({
              message: enrichedMessage,
              emotion: enrichedMessage.emotion,
              triggers: signals.triggers,
              risk: signals.risk,
            });
            const prefsOn = (typeof localStorage !== "undefined" && localStorage.getItem("wc_tool_suggestions") !== "off");
            const lastAt = parseInt(localStorage?.getItem("wc_last_tool_suggested_at") || "0", 10);
            const cooldownOk = Date.now() - lastAt >= 3 * 60 * 1000;
            if (recommendation && prefsOn && cooldownOk) {
              setTimeout(() => {
                try {
                  localStorage?.setItem("wc_last_tool_suggested_at", String(Date.now()));
                } catch {}
                const recommendationMessage = normalizeMessage({
                  id: `recommendation-${Date.now()}`,
                  role: "assistant",
                  type: "recommendation",
                  content: recommendation.reason || "Try a short practice?",
                  suggestion: recommendation,
                  timestamp: Date.now(),
                });
                addMessage("assistant", recommendationMessage);
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
                        <MessageBubble message={{ ...msg, role: "assistant", content: msg.text || msg.content }} onAction={handleMessageAction} />
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
                        <MessageBubble message={{ ...msg, role: "assistant", content: msg.text || msg.content }} onAction={handleMessageAction} />
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
                          <div className="w-full max-w-full rounded-xl bg-white/5 border border-white/10 p-3 sm:p-4 flex flex-col gap-3">
                            <p className="text-sm text-white/80 flex-1">
                              {msg.content || msg.text || "Try a short practice?"}
                            </p>
                            <div className="flex flex-row flex-wrap gap-2">
                              <button
                                type="button"
                                className="px-3 py-1.5 text-xs rounded-lg bg-wcGold/30 text-wcGold border border-wcGold/50 hover:bg-wcGold/40 transition"
                                onClick={() => handleOpenSuggestedTool(msg.suggestion)}
                              >
                                Open {toolName}
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1.5 text-xs rounded-lg border border-white/20 text-white/70 hover:bg-white/10 transition"
                                onClick={() => {
                                  try { localStorage.setItem("wc_last_tool_suggested_at", String(Date.now())); } catch {}
                                  dismissSuggestion(msg.id);
                                }}
                              >
                                Not now
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1.5 text-xs rounded-lg text-white/50 hover:text-white/70 transition"
                                onClick={() => {
                                  try { localStorage.setItem("wc_tool_suggestions", "off"); } catch {}
                                  dismissSuggestion(msg.id);
                                }}
                              >
                                Don&apos;t suggest again
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                }
                
                // Phase 19: Add EmotionalSignalBar to user messages
                // Phase 27: Add HUD components under user messages
                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="space-y-2">
                      <MessageBubble message={msg} onAction={handleMessageAction} />
                      <EmotionalSignalBar 
                        emotion={msg.emotion} 
                        triggers={msg.triggers}
                        risk={msg.risk}
                        identity={msg.identity}
                      />
                      {/* Phase 27: Emotional HUD - Micro-components */}
                      {(msg.emotion || msg.triggers || msg.risk || msg.trajectory) && (
                        <div className="flex flex-wrap items-center gap-2 px-2 sm:px-4 text-xs">
                          <EmotionalChip emotion={msg.emotion} />
                          <TriggerChips triggers={msg.triggers} />
                          <RiskBadge risk={msg.risk} />
                          <TrajectoryTag trajectory={msg.trajectory} />
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Default: MessageBubble + IntentRenderer when intent present
                return (
                  <div key={msg.id} className="space-y-2">
                    <MessageBubble message={msg} onAction={handleMessageAction} />
                    {msg.intent && (() => {
                      if (msg.intent?.type === "directory.search") {
                        logDebug("ChatPanel", {
                          intentType: msg.intent.type,
                          payloadQuery: msg.intent.payload?.query,
                          payloadDomain: msg.intent.payload?.domain,
                          payloadResourcesLength: msg.intent.payload?.resources?.length ?? 0,
                        });
                      }
                      return (
                      <div className="ml-0 sm:ml-12">
                        <IntentRenderer
                          intent={msg.intent}
                          onOpenLink={({ url, title }) => {
                            setWebViewTitle(title || url);
                            setWebViewUrl(url);
                          }}
                          onRunTool={(toolId, args) => injectToolIntoChat(toolId, args)}
                          onDirectorySearch={({ query, region, domain }) => {
                            const params = new URLSearchParams();
                            if (query) params.set("query", query);
                            if (region) params.set("region", region);
                            if (domain) params.set("domain", domain);
                            const priority = domain === "food.essentials" ? "programs" : domain === "grants" ? "funding" : domain === "housing" ? "housing" : domain === "programs" ? "programs" : "programs";
                            params.set("priority", priority);
                            navigate(`/workspace/real-help?${params.toString()}`);
                          }}
                        />
                      </div>
                      );
                    })()}
                  </div>
                );
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

      {/* Offline/Reconnecting Status - no layout change */}
      {(isOffline || offlineQueueLength > 0) && (
        <div className="border-t border-amber-400/30 bg-amber-400/10 px-4 sm:px-6 py-2 flex items-center justify-between">
          <span className="text-xs text-amber-200">
            {isOffline 
              ? "Offline"
              : offlineQueueLength > 0 
                ? "Back online. Tap send to continue."
                : ""}
          </span>
          {offlineQueueLength > 0 && !isOffline && (
            <button
              type="button"
              onClick={() => {
                const queued = offlineMessageQueueRef.current.shift();
                if (queued && connectionStateRef.current === "idle" && !isSendingRef.current) {
                  setOfflineQueueLength((n) => Math.max(0, n - 1));
                  sendToAI(queued);
                }
              }}
              className="text-xs px-3 py-1 rounded border border-amber-400/30 bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 transition"
            >
              Retry
            </button>
          )}
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
                disabled={isSending || connectionStateRef.current === "sending" || connectionStateRef.current === "awaiting_response"}
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Phase 31: Face scan button */}
              <button
                type="button"
                onClick={() => setFaceScanPromptOpen(true)}
                disabled={isSending || connectionStateRef.current === "sending" || connectionStateRef.current === "awaiting_response"}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Read my expression"
                aria-label="Read my expression"
              >
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <VoiceInput
                onTranscript={(transcribedText) => {
                  setInput(transcribedText);
                  // User can edit before sending, or it will auto-send if onSend is provided
                }}
                onSend={(transcribedText) => {
                  if (transcribedText.trim() && !isSending && connectionStateRef.current !== "sending" && connectionStateRef.current !== "awaiting_response") {
                    addMessage("user", transcribedText);
                    sendToAI(transcribedText);
                  }
                }}
                onComplete={(audioBlob) => {
                  // Phase 14: Open voice session workspace when mic is held
                  handleVoiceInputComplete(audioBlob);
                }}
                disabled={isSending || connectionStateRef.current === "sending" || connectionStateRef.current === "awaiting_response"}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isSending || connectionStateRef.current === "sending" || connectionStateRef.current === "awaiting_response"}
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

      {/* Phase 31: Face Scan Prompt Modal */}
      <FaceScanPrompt
        open={faceScanPromptOpen}
        onClose={() => setFaceScanPromptOpen(false)}
        onStartScan={handleFaceScan}
      />

      {/* In-app link preview (resource.preview intent) */}
      {webViewUrl && (
        <InAppWebView
          url={webViewUrl}
          title={webViewTitle || "Preview"}
          onClose={() => { setWebViewUrl(null); setWebViewTitle(""); }}
          onOpenExternally
        />
      )}
    </div>
  );
};

export default ChatPanel;

