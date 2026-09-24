// src/components/os/ChatPanel.jsx
// Clean ChatGPT-style chat panel (no stacking)

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Loader2 } from "lucide-react";
import { useOSStore } from "@/stores/useOSStore";
import { useAIStore } from "@/apps/ai/useAIStore";
import { useAdminTelemetry } from "@/hooks/useAdminTelemetry";
import MessageBubble from "./MessageBubble";
import ToolBlock from "./ToolBlock";
import WelcomeScreen from "./WelcomeScreen";
import DirectoryResultBlock from "./DirectoryResultBlock";
import DirectoryResultsPanel from "@/components/directory/DirectoryResultsPanel";
import IntentRenderer from "@/core/intent/IntentRenderer";
import InAppWebView from "@/components/InAppWebView";
import VoiceResponse from "./VoiceResponse";
import VideoGuidance from "./VideoGuidance";
import { searchResources } from "@/services/resourceSearch";
import { getAuthHeaders, getAuthHeadersWithTimeout } from "@/services/aiSessionClient";
import { callAI } from "@/services/aiClient";
import { getConversationMemoryContext, rememberConversationTurn } from "@/services/conversationMemory";
import { makeLivingMeta, detectRoleIntent, safeApproachForRole, pickVariantText } from "@/lib/living";
import { useLivingSession } from "@/hooks/useLivingSession";
import { offlineRespond, advancedSupportContractOffline } from "@/services/offlineGuide";
import { getPref, setPref } from "@/services/sessionPrefs";
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
import { buildIdentitySnapshot } from "@/ai/human/identityModel";
import { buildRelationshipSnapshot } from "@/ai/relationship/relationshipModel";
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
import ThreadCueBar from "./ThreadCueBar";
import ChatComposerBar from "@/components/system/ChatComposerBar";
import ChatDock from "@/components/system/ChatDock";
import VoiceCheckInModal from "@/components/tools/VoiceCheckInModal";
import { useContinuityStore } from "@/engines/continuity/continuityStore";
import { planResponse } from "@/engines/trust/responsePlanner";
import { safeLocalStorage } from "@/lib/storage/safeLocalStorage";
import { getSupportFallbackGuidance } from "@/lib/support/fallback";
import GroundingModal from "@/components/chat/GroundingModal";
import ThinkingOverlay from "@/components/presence/ThinkingOverlay";
import useAutoSpeak from "@/components/presence/useAutoSpeak";
import ComposerPresenceControls from "./ComposerPresenceControls";
import {parseExperienceSignal} from "@/core/experience/experienceSignal";

// Phase 54K: simple hash for variation (no deps)
function wcHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}

const STYLE_HINTS_54K = ["warm_concise", "coach", "clinical_calm", "grounded_spiritual"];

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

function directoryResponseIntro(domain, fallback) {
  const needs = {
    housing: "Here are starting points for shelter, housing, and recovery residences. Current openings and eligibility vary by location, so contact the provider to confirm details.",
    "food.essentials": "Here are food access options, including local referrals and benefit information. Availability and application rules vary by state.",
    programs: "Here are recovery and treatment support options. Meeting schedules and program openings can change; verify details with the local service.",
    government_assistance: "Here are public benefit and practical assistance starting points. Eligibility and applications are handled locally or by your state.",
    assistance: "Here are practical support pathways. Tell me your city or ZIP code and I can help narrow down local services.",
  };
  const intro = needs[domain] || "Here are a few resources that may help. Tell me your city or ZIP code and I can help narrow down local options.";
  return fallback ? `${intro} These are curated starting points; they are not live vacancy or appointment listings.` : intro;
}

// Detect directory search queries from user input
function detectDirectoryQuery(text) {
  const lowerText = text.toLowerCase();

  // Route specific basic-needs and recovery requests before broad support intent.
  const has = (...terms) => terms.some((term) => lowerText.includes(term));
  if (has("aa meeting", "alcoholics anonymous", "find aa", "a.a.") || /\baa\b/.test(lowerText)) return { domain: "programs", query: text, priority: "programs" };
  if (has("na meeting", "narcotics anonymous", "find na", "n.a.") || /\bna\b/.test(lowerText)) return { domain: "programs", query: text, priority: "programs" };
  if (has("sober home", "sober homes", "soberhome", "sober living", "recovery residence", "recovery housing", "halfway house")) return { domain: "housing", query: text, priority: "housing" };
  if (has("shelter", "homeless", "eviction", "place to stay", "emergency housing", "unsafe at home")) return { domain: "housing", query: text, priority: "housing" };
  if (has("food", "hungry", "groceries", "food bank", "food pantry", "snap", "food stamps", "meal")) return { domain: "food.essentials", query: text, priority: "food" };
  if (has("detox", "rehab", "treatment", "iop", "php", "recovery program", "substance use")) return { domain: "programs", query: text, priority: "programs" };
  if (has("rent", "utility bill", "utilities", "medicaid", "benefits", "ebt", "government assistance", "financial assistance", "can't afford")) return { domain: "government_assistance", query: text, priority: "funding" };
  if (has("211", "domestic violence", "human trafficking", "legal aid", "childcare", "transportation", "bus pass")) return { domain: "assistance", query: text, priority: "programs" };

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
    
    const domain = priority === "housing" ? "housing" : priority === "funding" ? "grants" : priority === "food" ? "food.essentials" : "programs";
    return { domain, query: text, priority };
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

// Phase 54M/54N: Router intent — stable labels: ALWAYS_ON_SUPPORT, DIRECTORY, RESTRICTED, UNKNOWN. Only RESTRICTED can show sign-in.
const ALWAYS_ON_SUPPORT_PHRASES = [
  "therapy", "counselor", "counseling", "talk to someone", "need help", "overwhelmed",
  "traumatized", "anxious", "anxiety", "depressed", "depression", "grief", "grieving",
  "cravings", "someone to talk", "emotional support", "mental health",
];
const RESTRICTED_PHRASES = [
  "book", "schedule", "appointment", "pay", "message", "connect me to a therapist",
  "connect me to a practitioner", "want to book", "make an appointment",
];

function classifyRouteIntent(text, isDirectory) {
  if (isDirectory) return "DIRECTORY";
  const lower = (text || "").toLowerCase().trim();
  if (RESTRICTED_PHRASES.some((p) => lower.includes(p))) return "RESTRICTED";
  if (ALWAYS_ON_SUPPORT_PHRASES.some((p) => lower.includes(p))) return "ALWAYS_ON_SUPPORT";
  return "UNKNOWN";
}

// Phase 54M: Replacement for "Please sign in to continue" — title, body, and action labels
const SIGNIN_ALTERNATIVE_TITLE = "I can help right now.";
const SIGNIN_ALTERNATIVE_BODY =
  "Share your city or state if you'd like (optional). What kind of therapy or support are you looking for—e.g. trauma, addiction, anxiety, or grief? I can guide you.";

// Helper: Convert base64 to Blob
const ChatPanel = () => {
  const navigate = useNavigate();
  const { messages, addMessage, updateLastAssistantMessage, injectToolIntoChat, openWorkspace, settings } = useOSStore();
  const allowEmotionAnalysis = settings?.allowEmotionFromChat === true;
  const allowTrajectoryTracking = settings?.trajectoryTrackingEnabled === true;
  const allowFaceSignals = settings?.allowFaceSignals === true;
  const { setThinking, isThinking } = useAIStore();
  const identity = useSessionIdentity();
  const living = useLivingSession();
  const roleSetThisTurnRef = useRef(false);
  const { ingestUserDraft, pushAction, initThread } = useContinuityStore();
  const { isOnline } = useOnlineStatus();
  const isOffline = !isOnline;
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingFaceEmotion, setPendingFaceEmotion] = useState(null);

  useEffect(() => {
    if (!allowFaceSignals || !allowEmotionAnalysis) setPendingFaceEmotion(null);
  }, [allowFaceSignals, allowEmotionAnalysis]);
  const [faceScanPromptOpen, setFaceScanPromptOpen] = useState(false);
  const [voiceCheckInModalOpen, setVoiceCheckInModalOpen] = useState(false);
  const [pending, setPending] = useState(null);
  const pendingPlanRef = useRef(null);
  const pendingStartMsRef = useRef(null);
  const [offlineQueueLength, setOfflineQueueLength] = useState(0);
  const [expandedMessageIds, setExpandedMessageIds] = useState({});
  const [speakError, setSpeakError] = useState(null);
  const [groundingModalOpen, setGroundingModalOpen] = useState(false);
  const [overlayTick, setOverlayTick] = useState(0);
  const composerRef = useRef(null);
  const [composerH, setComposerH] = useState(0);
  const COMPOSER_MARGIN = 16;
  const [webViewUrl, setWebViewUrl] = useState(null);
  const [webViewTitle, setWebViewTitle] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const isSendingRef = useRef(false);
  // PHASE H: Chat state preservation
  const lastUnsentMessageRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastUserMessageRef = useRef(null);
  // Phase 54N: Last turn snapshot for Retry (re-run sendToAI with new turnId/variationSeed)
  const lastTurnRef = useRef(null);
  // Phase 55A: Identity pills only when value changes (reduce noise)
  const lastIdentityRef = useRef(null);
  // Connection state machine: idle → sending → awaiting_response → resolved → error
  const connectionStateRef = useRef("idle");
  const lastErrorMessageRef = useRef(null);
  const lastHashesRef = useRef([]); // Phase 54K: last 6 text hashes + ts for anti-repeat
  const offlineMessageQueueRef = useRef([]); // Message queue for offline sends
  const ingestDebounceRef = useRef(null);
  useEffect(() => { initThread(); }, [initThread]);

  const { autoSpeakEnabled, setAutoSpeakEnabled } = useAutoSpeak({ messages, pending });

  const speakLastAssistant = React.useCallback(() => {
    if (pending) return;
    const last = [...(messages || [])].reverse().find((m) => m.role === "assistant" && m.content);
    if (!last) return;
    try {
      window.speechSynthesis?.cancel?.();
      const u = new SpeechSynthesisUtterance(String(last.content));
      u.rate = 1;
      u.pitch = 1;
      window.speechSynthesis?.speak?.(u);
    } catch (e) {}
  }, [messages, pending]);

  useEffect(() => {
    if (!pending) return;
    const t = setInterval(() => setOverlayTick((v) => v + 1), 100);
    return () => clearInterval(t);
  }, [pending]);

  const thoughtMsForOverlay = pending?.startedAt != null ? Math.max(0, Date.now() - pending.startedAt) : 0;

  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const h = Math.ceil(entries?.[0]?.contentRect?.height || 0);
      if (h) setComposerH(h);
    });
    ro.observe(el);
    const initial = Math.ceil(el.getBoundingClientRect().height || 0);
    if (initial) setComposerH(initial);
    return () => ro.disconnect();
  }, []);
  
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
            decision = await determineGuideResponse(text, { allowEmotionAnalysis, trackEmotionalHistory: allowTrajectoryTracking });
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
            currentHumanMode = allowEmotionAnalysis ? getHumanMode(text, {
              emotion: null,
              risk: null,
              triggers: [],
            }) : "neutral";
            currentToneProfile = getToneProfile({
              humanMode: currentHumanMode,
              emotion: null,
              risk: null,
            });
            currentPhrasingStyle = getPhrasingStyle(currentToneProfile);
          } catch (err) {
            console.warn("[ChatPanel] Failed to compute tone profile for send:", err);
          }

          // Soft router: directory intent — try tool first, fall back to AI if empty/fail (Phase 54G)
          let directoryFallback = false;
          const directoryQueries = detectDirectoryQuery(text);
          if (directoryQueries) {
            try {
              const searchResponse = await searchResources({
                query: directoryQueries.query,
                domain: directoryQueries.domain,
              });
              if (searchResponse?.ok && searchResponse?.results?.length > 0) {
                addMessage("assistant", {
                  role: "assistant",
                  type: "assistant_text",
                  text: directoryResponseIntro(directoryQueries.domain, searchResponse.fallback),
                  content: directoryResponseIntro(directoryQueries.domain, searchResponse.fallback),
                  timestamp: Date.now(),
                  meta: {
                    kind: "directoryResults",
                    domain: directoryQueries.domain,
                    query: directoryQueries.query,
                    results: searchResponse.results,
                    fallback: searchResponse.fallback === true,
                  },
                });
                connectionStateRef.current = "idle";
                setIsSending(false);
                setThinking(false);
                return;
              }
              if (searchResponse?.ok && (!searchResponse.results || searchResponse.results.length === 0)) {
                // No transient message; AI response will be the final message for this turn
              }
            } catch (_) {}
            directoryFallback = true;
          }

          // Phase 54M/54N: Route intent (ALWAYS_ON_SUPPORT, DIRECTORY, RESTRICTED, UNKNOWN). Only RESTRICTED can show sign-in.
          const routeIntent = classifyRouteIntent(text, !!directoryQueries);
          lastTurnRef.current = { text, routeIntent };

          // Trust layer: plan (for reasoning envelope on success); then single pending indicator (Phase 54J)
          const startMs = Date.now();
          pendingStartMsRef.current = startMs;
          let plan;
          try {
            plan = await planResponse({ userText: text });
          } catch (e) {
            plan = { reply: { id: "pending", text: "", mode: "chat" }, reasoning: { role: "default", depth: "standard", safety: { risk: "low", crisis: false, disclaimers: [] }, checks: ["scope limits"], summary: ["Identify ask", "Offer next action"], confidence: 3, latencyMs: 0 } };
          }
          pendingPlanRef.current = plan;
          const pendingId = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : "wc_" + Date.now() + "_" + Math.random().toString(36).slice(2);
          setPending({ id: pendingId, startedAt: startMs, label: "Thinking", intent: directoryFallback ? "directory" : "chat", text });

          // Phase 54I: Role intent — persist (approach shown on final message when showApproach)
          const roleHit = detectRoleIntent(text);
          if (roleHit?.confidence >= 0.8) {
            living.setRole(roleHit.role);
            roleSetThisTurnRef.current = true;
          }

        // Guest safe mode: try token with short wait (anonymous sign-in); if none, show helpful message (no dead-end)
        const authHeaders = await getAuthHeadersWithTimeout(2000);
        if (!authHeaders.Authorization) {
          connectionStateRef.current = "idle";
          setPending(null);
          // Phase 54M/54N: RESTRICTED is the only intent that shows sign-in CTA; ALWAYS_ON_SUPPORT/DIRECTORY get guidance
          if (routeIntent === "RESTRICTED") {
            const signInMessageText = `${SIGNIN_ALTERNATIVE_TITLE}\n\n${SIGNIN_ALTERNATIVE_BODY}`;
            addMessage("assistant", normalizeMessage({
              role: "assistant",
              type: "assistant_text",
              text: signInMessageText,
              content: signInMessageText,
              timestamp: Date.now(),
              meta: { pending: false, startMs: pendingStartMsRef.current, doneMs: Date.now() },
              actions: [
                { label: "Continue with guidance", action: "continue_guidance" },
                { label: "Open Directory", action: "open_directory" },
                { label: "Sign in", action: "sign_in" },
              ],
            }));
          } else {
            const isDirectoryOrBasicNeeds = directoryQueries != null || directoryFallback;
            const crisisHint = /hurt myself|suicid|kill myself|end it|988|emergency/i.test((text || "").trim());
            const offlineContent =
              routeIntent === "ALWAYS_ON_SUPPORT" || routeIntent === "DIRECTORY"
                ? advancedSupportContractOffline(text)
                : isDirectoryOrBasicNeeds
                  ? offlineRespond(text, { intent: "directory", crisis: crisisHint })
                  : (() => {
                      const n = Number(typeof sessionStorage !== "undefined" ? sessionStorage.getItem("wc_offline_n") || "0" : "0");
                      if (typeof sessionStorage !== "undefined") sessionStorage.setItem("wc_offline_n", String(n + 1));
                      return pickVariantText({ intent: "offline_support", key: (text || "").toLowerCase().trim(), n });
                    })();
            addMessage("assistant", normalizeMessage({
              role: "assistant",
              type: "assistant_text",
              text: offlineContent,
              content: offlineContent,
              timestamp: Date.now(),
              meta: { pending: false, startMs: pendingStartMsRef.current, doneMs: Date.now() },
              actions: [
                { label: "Retry", action: "retry" },
                { label: "Open Real Help", action: "open_tools" },
                { label: "Continue offline", action: "offline" },
              ],
            }));
          }
          setIsSending(false);
          setThinking(false);
          return;
        }

        // Update state: sending → awaiting_response
        connectionStateRef.current = "awaiting_response";

        // Call backend via robust AI client (Phase 54I + 54K: living meta, variation, anti-repeat)
        const livingMeta = makeLivingMeta({ text, sessionId: living.sessionId, role: living.role, turnId: living.nextTurnId() });
        const turnId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const textHash = wcHash((text || "").trim().toLowerCase());
        const variationSeed = (Date.now() + parseInt(textHash.slice(0, 6), 16)) % 1000000;
        const detectedIntent = directoryQueries ? "directory" : null;
        const intent =
          routeIntent === "ALWAYS_ON_SUPPORT"
            ? "always_on_support"
            : routeIntent === "DIRECTORY"
              ? (directoryFallback ? "directory_fallback" : "directory")
              : detectedIntent || "general";
        const styleHints54K = [STYLE_HINTS_54K[variationSeed % STYLE_HINTS_54K.length]];

        lastHashesRef.current = [...lastHashesRef.current, { hash: textHash, ts: Date.now() }].slice(-6);
        const now = Date.now();
        const sixtySec = 60 * 1000;
        const recentSame = lastHashesRef.current.filter((e) => e.hash === textHash && now - e.ts < sixtySec);
        const repeatCount = recentSame.length;
        const nudgeMeta = repeatCount >= 2 ? { nudge: "user_repeated_prompt", repeatCount } : {};

        let repeatCountDir = 0;
        if (directoryFallback && typeof sessionStorage !== "undefined") {
          const lastKey = sessionStorage.getItem("wc_last_key");
          const lastTs = parseInt(sessionStorage.getItem("wc_last_key_ts") || "0", 10);
          const fiveMin = 5 * 60 * 1000;
          if (String(livingMeta.variationKey) === lastKey && (Date.now() - lastTs) < fiveMin) {
            repeatCountDir = parseInt(sessionStorage.getItem("wc_last_key_count") || "0", 10) + 1;
            sessionStorage.setItem("wc_last_key_count", String(repeatCountDir));
          } else {
            sessionStorage.setItem("wc_last_key", String(livingMeta.variationKey));
            sessionStorage.setItem("wc_last_key_ts", String(Date.now()));
            sessionStorage.setItem("wc_last_key_count", "0");
          }
        }
        const showApproach = roleSetThisTurnRef.current || /how (are|you're) (thinking|approaching)/i.test(text) || /analy(z|s)e deeply/i.test(text);
        const res = await callAI("aiSession", {
          messages: messageHistory,
          mode,
          memoryContext: getConversationMemoryContext(settings?.personalizationMemoryEnabled === true),
          metadata: {
            ...(decision ? {
              emotion: decision.emotion,
              spirit: decision.spirit,
              forecast: decision.forecast,
            } : {}),
            humanMode: currentHumanMode,
            toneProfile: currentToneProfile,
            phrasingStyle: currentPhrasingStyle,
            seed: livingMeta.seed,
            turnId,
            variationSeed,
            intent,
            styleHints: styleHints54K,
            avoidRepeat: true,
            lastUserTextHash: textHash,
            ...nudgeMeta,
            thoughtMs: livingMeta.thoughtMs,
            role: livingMeta.role,
            variationKey: livingMeta.variationKey,
            ...(routeIntent === "ALWAYS_ON_SUPPORT"
              ? {
                  responseContract: "ADVANCED_SUPPORT_V1",
                  contractSections: ["reflect", "clarify", "steps", "options", "safety"],
                  maxClarify: 2,
                }
              : {}),
            ...(directoryFallback ? {
              directoryFallback: true,
              fallbackHint: "Tool directory search failed or returned no results; provide best-effort general guidance (food/housing/treatment) and ask for city/state to refine. Be warm and actionable.",
              repeatCount: repeatCountDir,
            } : {}),
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
          setPending(null);
          abortControllerRef.current = null;
          connectionStateRef.current = "error";

          // TRUTH-GATE: If network fails but user requested a tool directly, only promise if tool actually opens
          if (directToolRequest) {
            const { validateToolId } = await import("@/utils/toolRouter");
            if (validateToolId(directToolRequest)) {
              const toolMessage = await injectToolIntoChat(directToolRequest, {});
              if (toolMessage) {
                addMessage("assistant", normalizeMessage({ role: "assistant", type: "system", content: `I'm having trouble connecting right now, but I can still help. I've opened the ${TOOL_NAMES[directToolRequest] || directToolRequest} tool for you.`, meta: { pending: false, startMs: pendingStartMsRef.current, doneMs: Date.now() } }));
              } else {
                addMessage("assistant", normalizeMessage({ role: "assistant", type: "assistant_text", text: "I'm having trouble connecting right now. You can navigate to the Tools section to open tools directly.", content: "I'm having trouble connecting right now. You can navigate to the Tools section to open tools directly.", timestamp: Date.now(), meta: { pending: false, startMs: pendingStartMsRef.current, doneMs: Date.now() } }));
              }
            } else {
              addMessage("assistant", normalizeMessage({ role: "assistant", type: "assistant_text", text: "I'm having trouble connecting right now. Please try again in a moment, or navigate to the Tools section directly.", content: "I'm having trouble connecting right now. Please try again in a moment, or navigate to the Tools section directly.", timestamp: Date.now(), meta: { pending: false, startMs: pendingStartMsRef.current, doneMs: Date.now() } }));
            }
            connectionStateRef.current = "idle";
            isSendingRef.current = false;
            setIsSending(false);
            setThinking(false);
            return;
          }

          const isActuallyOffline = typeof navigator !== "undefined" && navigator.onLine === false;
          if (isActuallyOffline) {
            offlineMessageQueueRef.current.push(text);
            setOfflineQueueLength((n) => n + 1);
            addMessage("assistant", normalizeMessage({ role: "assistant", type: "assistant_text", text: "Connection lost. Your message will be sent when you're back online. Tap Retry to send now.", content: "Connection lost. Your message will be sent when you're back online.", timestamp: Date.now(), meta: { pending: false, startMs: pendingStartMsRef.current, doneMs: Date.now() } }));
          } else {
            // Phase 54J/54M/54N: ALWAYS_ON_SUPPORT and DIRECTORY never show "Please sign in"; only RESTRICTED can prompt sign-in. On fail use ADVANCED_SUPPORT_V1 contract.
            const isBasicNeeds = directoryFallback || (directoryQueries != null) || routeIntent === "ALWAYS_ON_SUPPORT" || routeIntent === "DIRECTORY";
            const is401SignIn = res.status === 401 && (res.error || "").includes("Please sign in");
            const useOfflineMessage = isBasicNeeds;
            const useSignInAlternative = is401SignIn && !useOfflineMessage;
            const displayText = useOfflineMessage
              ? advancedSupportContractOffline(text)
              : useSignInAlternative
                ? `${SIGNIN_ALTERNATIVE_TITLE}\n\n${SIGNIN_ALTERNATIVE_BODY}`
                : (res.error || "Still here with you. Tap send to continue.");
            const displayActions = useSignInAlternative
              ? [
                  { label: "Continue with guidance", action: "continue_guidance" },
                  { label: "Open Directory", action: "open_directory" },
                  { label: "Sign in", action: "sign_in" },
                ]
              : [
                  { label: "Retry", action: "retry" },
                  { label: "Continue offline", action: "offline" },
                  { label: "Open tools", action: "open_tools" },
                ];
            if (!useOfflineMessage && !useSignInAlternative && lastErrorMessageRef.current === displayText) {
              // Skip duplicate error bubble
            } else {
              if (!useOfflineMessage && !useSignInAlternative) lastErrorMessageRef.current = displayText;
              addMessage("assistant", normalizeMessage({
                role: "assistant",
                type: "assistant_text",
                text: displayText,
                content: displayText,
                timestamp: Date.now(),
                meta: { pending: false, startMs: pendingStartMsRef.current, doneMs: Date.now() },
                actions: displayActions,
              }));
            }
          }
          connectionStateRef.current = "idle";
          isSendingRef.current = false;
          setIsSending(false);
          setThinking(false);
          return;
        }

        // Success: Clear error message ref and pending indicator (Phase 54J)
        lastErrorMessageRef.current = null;
        setPending(null);

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

        // Phase 55A.2: Experience signals — strip [[EXPERIENCE]] block, merge into meta
        const {cleanText: experienceCleanText, signal: experienceSignal} = parseExperienceSignal(processedText);
        const displayText = experienceSignal != null ? experienceCleanText : processedText;
        const nextMetaFromSignal = {};
        if (experienceSignal?.suggestGrounding) nextMetaFromSignal.suggestGrounding = true;
        if (experienceSignal?.video) nextMetaFromSignal.video = experienceSignal.video;
        if (experienceSignal?.toolRoute) nextMetaFromSignal.toolRoute = experienceSignal.toolRoute;

        // Text response with intent and links (Prompt-Native Spine)
        const lastMsgIntent = res.intent && typeof res.intent === "object" ? res.intent : null;
        const lastMsgLinks = Array.isArray(res.links) ? res.links : [];
        const doneMs = Date.now();
        const envelope = pendingPlanRef.current;
        // Phase 55A: truthful thinking — MessageBubble shows "Thought for Xs" only when thoughtMs>=250
        const thoughtMsRes = res.meta?.thoughtMs ?? livingMeta.thoughtMs ?? (pendingStartMsRef.current != null ? doneMs - pendingStartMsRef.current : null);
        const patch = {
          role: "assistant",
          type: "assistant_text",
          text: displayText,
          content: displayText,
          timestamp: doneMs,
          intent: lastMsgIntent,
          links: lastMsgLinks,
          reasoning: envelope?.reasoning,
          meta: {
            pending: false,
            startMs: pendingStartMsRef.current,
            doneMs,
            thoughtMs: thoughtMsRes,
            ...nextMetaFromSignal,
            ...(showApproach ? { approach: safeApproachForRole(living.role || "coach") } : {}),
          },
        };
        roleSetThisTurnRef.current = false;
        if (import.meta.env.DEV && typeof window !== "undefined") {
          window.__wcLastAssistantMessage = patch;
          console.debug("[ChatPanel] assistantMessage", {
            textLength: (displayText || "").length,
            intentType: lastMsgIntent?.type || null,
            linksLength: lastMsgLinks.length,
          });
        }
        addMessage("assistant", normalizeMessage(patch));
        rememberConversationTurn({
          user: text,
          assistant: displayText,
          enabled: settings?.personalizationMemoryEnabled === true,
        });

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

        // Directory intent already handled earlier (soft router: try tool then AI fallback). IntentRenderer still shows directory.search from backend when present.
        const hasDirectoryIntent = lastMsgIntent?.type === "directory.search";
        if (hasDirectoryIntent) {
          // IntentRenderer will show results; nothing more to do
        }
      } catch (innerErr) {
        console.error("[ChatPanel] Inner sendToAI error:", innerErr);
        setPending(null);
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
      setPending(null);
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
      setPending(null);
      connectionStateRef.current = "idle";
      isSendingRef.current = false;
      setIsSending(false);
      setThinking(false);
    }
  }, [messages, addMessage, injectToolIntoChat, setThinking, logEvent, openWorkspace, navigate, settings]);

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
      pushAction({ type: "message", label: "Sent a message", href: "/chat", ts: Date.now() });
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
    
    let enrichedMessage = allowEmotionAnalysis ? enrichMessageWithEmotion(userMessage) : userMessage;
    
    // Phase 31: Merge face emotion if available
    if (pendingFaceEmotion && allowFaceSignals && allowEmotionAnalysis) {
      enrichedMessage.emotion = mergeEmotionChannels(enrichedMessage.emotion, pendingFaceEmotion);
      setPendingFaceEmotion(null); // Reset after use
    }
    
    // Phase 17: Analyze signals (triggers + risk)
    const signals = analyzeMessageSignals(enrichedMessage, { includeTriggers: allowEmotionAnalysis });
    enrichedMessage.triggers = signals.triggers;
    enrichedMessage.risk = signals.risk;

    // Phase 28: Identity fracture modeling
    if (allowEmotionAnalysis) {
      const identityEnriched = enrichMessageWithIdentity(enrichedMessage);
      enrichedMessage.identity = identityEnriched.identity;
    }
    
    // Phase 29: Relationship Stress Mapping
    if (allowEmotionAnalysis) {
      const withRelationship = enrichMessageWithRelationship(enrichedMessage);
      enrichedMessage.relationship = withRelationship.relationship;
    }
    
    // Phase 25: Human Mode Navigator (HMN)
    const humanMode = allowEmotionAnalysis ? getHumanMode(text, {
      emotion: enrichedMessage.emotion,
      risk: signals.risk,
      triggers: signals.triggers,
    }) : "neutral";
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
      const drift = allowTrajectoryTracking ? analyzeDriftSnapshot(recentMessages) : null;
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
    else if (!allowEmotionAnalysis) setLastEmotion(null);
    if (enrichedMessage.risk?.riskLevel === "high") setLastRiskEvent(enrichedMessage.risk);
    
    // Phase 24: Emotional Graph Engine - compute trajectory
    try {
      const emotion = enrichedMessage.emotion || null;
      const risk = enrichedMessage.risk || null;
      const triggers = Array.isArray(enrichedMessage.triggers) ? enrichedMessage.triggers : [];

      if (allowTrajectoryTracking && emotion && typeof emotion.intensity === "number") {
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
      if (allowEmotionAnalysis) {
        const identitySnapshot = buildIdentitySnapshot(enrichedMessage);
        const store = useOSStore.getState();
        if (typeof store.appendIdentitySnapshot === "function") {
          store.appendIdentitySnapshot(identitySnapshot);
        }
      }
    } catch (err) {
      console.warn("[ChatPanel] Failed to append identity snapshot:", err);
    }
    
    // Phase 29: Store relationship snapshot if available
    try {
      const store = useOSStore.getState();
      if (allowEmotionAnalysis && store.appendRelationshipSnapshot && enrichedMessage.relationship) {
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

      const crisisForecast = allowTrajectoryTracking ? computeCrisisForecast({
        emotionalHistory,
        lastEmotion: enrichedMessage.emotion || null,
        lastRisk: enrichedMessage.risk || null,
        lastRelationship: lastRelationshipSnapshot,
      }) : null;

      enrichedMessage.crisisForecast = crisisForecast;

      const setLastCrisisForecast = store.setLastCrisisForecast;
      if (allowTrajectoryTracking && typeof setLastCrisisForecast === "function") {
        setLastCrisisForecast(crisisForecast);
      } else if (!allowTrajectoryTracking && typeof setLastCrisisForecast === "function") {
        setLastCrisisForecast(null);
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
    const suppressGrounding = getPref("grounding_suggest_disabled", false) || (typeof localStorage !== "undefined" && localStorage.getItem("wc_suppress_grounding_suggest") === "1");
    if (recommendation && prefsOn && cooldownOk) {
      if (recommendation.toolId === "grounding" && suppressGrounding) {
        // Skip adding grounding CTA when user disabled it
      } else {
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
    
    pushAction({ type: "message", label: "Sent a message", href: "/chat", ts: Date.now() });
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
    if (!allowFaceSignals || !allowEmotionAnalysis) return;
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

  const retryLastTurn = React.useCallback(() => {
    const text = lastTurnRef.current?.text ?? lastUserMessageRef.current;
    if (text && connectionStateRef.current !== "sending" && connectionStateRef.current !== "awaiting_response") {
      lastErrorMessageRef.current = null;
      const store = useOSStore.getState();
      const msgs = store.messages || [];
      const filtered = msgs.filter((m) => !(m.actions?.length > 0 && m.role === "assistant"));
      if (filtered.length < msgs.length) store.setMessages(filtered);
      sendToAI(text);
    }
  }, [sendToAI]);

  const handleMessageAction = React.useCallback((action, msg) => {
    if (action === "retry") {
      retryLastTurn();
    } else if (action === "open_tools" || action === "open_directory") {
      navigate("/assistance");
    } else if (action === "sign_in") {
      navigate("/login");
    } else if (action === "continue_guidance" || action === "offline") {
      const text = lastUserMessageRef.current;
      if (text) {
        const routeIntent = lastTurnRef.current?.routeIntent;
        const reply = routeIntent === "ALWAYS_ON_SUPPORT" ? advancedSupportContractOffline(text) : offlineRespond(text, { intent: "directory" });
        addMessage("assistant", normalizeMessage({
          role: "assistant",
          type: "assistant_text",
          text: reply,
          content: reply,
          timestamp: Date.now(),
          meta: { pending: false },
        }));
        offlineMessageQueueRef.current.push(text);
        setOfflineQueueLength((n) => n + 1);
      }
    }
  }, [navigate, retryLastTurn, addMessage]);

  const handleCopyMessage = React.useCallback((messageOrContent) => {
    const content = typeof messageOrContent === "string" ? messageOrContent : (messageOrContent?.content ?? messageOrContent?.text ?? "");
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText && content) {
      navigator.clipboard.writeText(typeof content === "string" ? content : "");
    }
  }, []);

  const handleSaveMessage = React.useCallback((message) => {
    const text = typeof message?.content === "string" ? message.content : message?.text || "";
    if (!text) return;
    const timestamp = Date.now();
    const payload = { id: message?.id || `saved-${timestamp}`, role: message?.role ?? "assistant", text, timestamp };
    const saveToLocal = () => {
      try {
        const list = JSON.parse(localStorage.getItem("wc_saved_messages") || "[]");
        list.push(payload);
        localStorage.setItem("wc_saved_messages", JSON.stringify(list));
      } catch {}
    };
    if (identity?.userId && identity.mode === "account") {
      import("firebase/firestore").then(({ collection, addDoc }) => {
        import("@/firebase").then(({ db }) => {
          addDoc(collection(db, "users", identity.userId, "savedMessages"), payload).catch(saveToLocal);
        }).catch(saveToLocal);
      }).catch(saveToLocal);
    } else {
      saveToLocal();
    }
  }, [identity?.userId, identity?.mode]);

  const handleSpeakMessage = React.useCallback((message) => {
    const text = typeof message?.content === "string" ? message.content : message?.text || "";
    if (!text) return;
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSpeakError("Speech isn't available on this device.");
      if (typeof window !== "undefined") setTimeout(() => setSpeakError(null), 3000);
      return;
    }
    setSpeakError(null);
    try {
      window.speechSynthesis.cancel();
    } catch {}
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  }, []);

  const handleExpandMessage = React.useCallback((message) => {
    const id = message?.id;
    if (id == null) return;
    setExpandedMessageIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleOpenTools = React.useCallback(() => {
    navigate("/tools");
  }, [navigate]);

  const handleOpenRealHelp = React.useCallback(async () => {
    try {
      navigate("/assistance");
    } catch (e) {
      const guidance = getSupportFallbackGuidance();
      addMessage("assistant", normalizeMessage({
        role: "assistant",
        type: "assistant_text",
        text: guidance,
        content: guidance,
        timestamp: Date.now(),
        meta: { kind: "support_fallback" },
      }));
    }
  }, [navigate, addMessage]);

  const handleContinueOffline = React.useCallback((msg) => {
    const text = lastUserMessageRef.current || (typeof msg?.content === "string" ? msg.content : msg?.text) || "";
    if (!text) return;
    const routeIntent = lastTurnRef.current?.routeIntent;
    const reply = routeIntent === "ALWAYS_ON_SUPPORT" ? advancedSupportContractOffline(text) : offlineRespond(text, { intent: "directory" });
    addMessage("assistant", normalizeMessage({
      role: "assistant",
      type: "assistant_text",
      text: reply,
      content: reply,
      timestamp: Date.now(),
      meta: { pending: false },
    }));
    offlineMessageQueueRef.current.push(text);
    setOfflineQueueLength((n) => n + 1);
  }, [addMessage]);

  const chatActionHandlers = {
    onRetry: retryLastTurn,
    onOpenTools: handleOpenTools,
    onOpenRealHelp: handleOpenRealHelp,
    onOpenToolRoute: (route) => route && navigate(route),
    onContinueOffline: handleContinueOffline,
    onCopy: handleCopyMessage,
    onSave: handleSaveMessage,
    onSpeak: typeof window !== "undefined" && window.speechSynthesis ? handleSpeakMessage : undefined,
    onExpand: handleExpandMessage,
    expandedMessageIds,
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Phase 19: Provider Monitor Strip */}
      <ProviderMonitorStrip />
      
      {/* Phase 27: Intelligence Pulse Indicator */}
      <IntelligencePulse />
      
      {/* Phase 54B: Thread continuity cue */}
      <ThreadCueBar onContinue={() => textareaRef.current?.focus()} />

      {/* Phase 54N: Speak fallback message when TTS unavailable */}
      {speakError && (
        <div className="px-4 py-2 text-center text-sm text-amber-400/90 bg-amber-500/10 border-b border-amber-500/20">
          {speakError}
        </div>
      )}
      
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
            
            const enrichedMessage = allowEmotionAnalysis ? enrichMessageWithEmotion(userMessage) : userMessage;
            const signals = analyzeMessageSignals(enrichedMessage, { includeTriggers: allowEmotionAnalysis });
            enrichedMessage.triggers = signals.triggers;
            enrichedMessage.risk = signals.risk;
            
            // Phase 25: Human Mode Navigator (HMN)
            const humanMode = allowEmotionAnalysis ? getHumanMode(action, {
              emotion: enrichedMessage.emotion,
              risk: signals.risk,
              triggers: signals.triggers,
            }) : "neutral";
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
            if (allowEmotionAnalysis) {
              const identityEnriched = enrichMessageWithIdentity(enrichedMessage);
              enrichedMessage.identity = identityEnriched.identity;
            }
            
            // Phase 29: Relationship Stress Mapping
            if (allowEmotionAnalysis) {
              const withRelationship = enrichMessageWithRelationship(enrichedMessage);
              enrichedMessage.relationship = withRelationship.relationship;
            }
            
            // Phase 28: Behavioral Drift Engine (BDE)
            try {
              const recentMessages = useOSStore.getState().messages.slice(-10);
              const drift = allowTrajectoryTracking ? analyzeDriftSnapshot(recentMessages) : null;
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
            else if (!allowEmotionAnalysis) setLastEmotion(null);
            if (enrichedMessage.risk?.riskLevel === "high") setLastRiskEvent(enrichedMessage.risk);
            
            // Phase 24: Emotional Graph Engine - compute trajectory
            try {
              const emotion = enrichedMessage.emotion || null;
              const risk = enrichedMessage.risk || null;
              const triggers = Array.isArray(enrichedMessage.triggers) ? enrichedMessage.triggers : [];

              if (allowTrajectoryTracking && emotion && typeof emotion.intensity === "number") {
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
              if (allowEmotionAnalysis) {
                const identitySnapshot = buildIdentitySnapshot(enrichedMessage);
                const store = useOSStore.getState();
                if (typeof store.appendIdentitySnapshot === "function") {
                  store.appendIdentitySnapshot(identitySnapshot);
                }
              }
            } catch (err) {
              console.warn("[ChatPanel] Failed to append identity snapshot (welcome):", err);
            }
            
            // Phase 29: Store relationship snapshot if available
            try {
              const store = useOSStore.getState();
              if (allowEmotionAnalysis && store.appendRelationshipSnapshot && enrichedMessage.relationship) {
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

              const crisisForecast = allowTrajectoryTracking ? computeCrisisForecast({
                emotionalHistory,
                lastEmotion: enrichedMessage.emotion || null,
                lastRisk: enrichedMessage.risk || null,
                lastRelationship: lastRelationshipSnapshot,
              }) : null;

              enrichedMessage.crisisForecast = crisisForecast;

              const setLastCrisisForecast = store.setLastCrisisForecast;
              if (allowTrajectoryTracking && typeof setLastCrisisForecast === "function") {
                setLastCrisisForecast(crisisForecast);
              } else if (!allowTrajectoryTracking && typeof setLastCrisisForecast === "function") {
                setLastCrisisForecast(null);
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
            const suppressGroundingWelcome = getPref("grounding_suggest_disabled", false) || (typeof localStorage !== "undefined" && localStorage.getItem("wc_suppress_grounding_suggest") === "1");
            if (recommendation && prefsOn && cooldownOk) {
              if (recommendation.toolId === "grounding" && suppressGroundingWelcome) {
                // Skip grounding CTA when disabled
              } else {
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
            }
            
            await sendToAI(action);
          }}
        />
      )}

      {/* Messages Area — Phase 55A: bottom padding so content is not hidden behind composer */}
      {hasStarted && (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6" style={{ paddingBottom: composerH + COMPOSER_MARGIN }}>
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
              {messages
                .filter((m) => !(m?.meta?.kind === "thinking_placeholder" || (typeof m?.content === "string" && m.content.trim() === "Thinking…")))
                .map((msg) => {
                if (msg.role === "tool") {
                  return <ToolBlock key={msg.id} tool={msg} />;
                }
                if (msg.role === "directory") {
                  return <DirectoryResultBlock key={msg.id} message={msg.content} />;
                }
                if (msg.role === "assistant" && msg.meta?.kind === "directoryResults") {
                  return (
                    <div key={msg.id} className="flex items-start gap-2 sm:gap-4 animate-fade-in">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="text-[10px] sm:text-xs font-medium text-white">SG</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 max-w-[46rem]">
                        {msg.text ? (
                          <p className="text-sm text-white/80 mb-3">{msg.text}</p>
                        ) : null}
                        <DirectoryResultsPanel
                          domain={msg.meta.domain}
                          query={msg.meta.query}
                          results={msg.meta.results}
                          onOpenDirectory={() => navigate("/assistance")}
                          onAskLocation={() => addMessage("assistant", { type: "system", content: "What's your city or state? Reply with your city or state for better results." })}
                          onSaveItem={() => {}}
                        />
                      </div>
                    </div>
                  );
                }
                if (msg.role === "assistant" && msg.meta?.kind === "directoryEmpty") {
                  return (
                    <div key={msg.id} className="flex items-start gap-2 sm:gap-4 animate-fade-in">
                      <div className="flex-shrink-0">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="text-[10px] sm:text-xs font-medium text-white">SG</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 max-w-[46rem]">
                        <DirectoryResultsPanel
                          domain={msg.meta.domain}
                          query={msg.meta.query}
                          results={[]}
                          onOpenDirectory={() => navigate("/assistance")}
                          onAskLocation={() => addMessage("assistant", { type: "system", content: "What's your city or state? Reply with your city or state for better results." })}
                          onSaveItem={() => {}}
                        />
                      </div>
                    </div>
                  );
                }
                // Handle multimodal assistant messages
                if (msg.role === "assistant" && msg.type) {
                  if (msg.type === "assistant_audio") {
                    return (
                      <div key={msg.id} className="space-y-2 animate-fade-in">
                        <MessageBubble message={{ ...msg, role: "assistant", content: msg.text || msg.content }} onAction={handleMessageAction} {...chatActionHandlers} />
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
                        <MessageBubble message={{ ...msg, role: "assistant", content: msg.text || msg.content }} onAction={handleMessageAction} {...chatActionHandlers} />
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
                  // Phase 21 + 54L + 55A: Recommendation (grounding) CTA — hide if disabled, wire Open / Not now / Don't suggest again
                  const groundingSuppressKey = "wc_grounding_suppress";
                  const suppressGroundingSuggest = getPref("grounding_suggest_disabled", false) || safeLocalStorage.get("wc_suppress_grounding_suggest") === "1" || safeLocalStorage.get(groundingSuppressKey) === "1";
                  if (msg.type === "recommendation" && msg.suggestion) {
                    if (msg.suggestion.toolId === "grounding" && suppressGroundingSuggest) return null;
                    const toolId = msg.suggestion.toolId;
                    const toolName = TOOL_NAMES[toolId] || toolId;
                    const handleOpenSuggestedTool = (suggestion) => {
                      if (suggestion?.toolId === "grounding") {
                        setGroundingModalOpen(true);
                      } else if (suggestion?.toolId) {
                        injectToolIntoChat(suggestion.toolId, {});
                      }
                    };
                    const dismissSuggestion = (messageId) => {
                      const currentMessages = useOSStore.getState().messages;
                      const filteredMessages = currentMessages.filter(m => m.id !== messageId);
                      useOSStore.setState({ messages: filteredMessages });
                      const currentChatId = useOSStore.getState().currentChatId;
                      const chats = useOSStore.getState().chats;
                      const updatedChats = chats.map(chat => {
                        if (chat.id === currentChatId) {
                          return { ...chat, messages: filteredMessages, updatedAt: Date.now() };
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
                                  setPref("grounding_suggest_disabled", true);
                                  try { localStorage.setItem("wc_suppress_grounding_suggest", "1"); } catch {}
                                  safeLocalStorage.set(groundingSuppressKey, "1");
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
                  const prevId = lastIdentityRef.current;
                  const idChanged = !prevId || (msg.identity && (prevId.tensionScore !== msg.identity?.tensionScore || prevId.summaryTag !== msg.identity?.summaryTag));
                  if (msg.identity && idChanged) lastIdentityRef.current = { tensionScore: msg.identity?.tensionScore, summaryTag: msg.identity?.summaryTag };
                  return (
                    <div key={msg.id} className="space-y-2">
                      <MessageBubble message={msg} onAction={handleMessageAction} {...chatActionHandlers} />
                      <EmotionalSignalBar
                        emotion={msg.emotion}
                        triggers={msg.triggers}
                        risk={msg.risk}
                        identity={idChanged ? msg.identity : null}
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
                    <MessageBubble message={msg} onAction={handleMessageAction} {...chatActionHandlers} />
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
                            navigate(`/assistance?${params.toString()}`);
                          }}
                        />
                      </div>
                      );
                    })()}
                  </div>
                );
              })}
              {pending != null && (
                <div className="flex items-start gap-3 animate-fade-in">
                  <div className="flex-1">
                    <div className="inline-block max-w-[85%] rounded-2xl bg-white/5 p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-wcGold" />
                        <span className="text-base text-white/60">{pending.label ?? "Thinking"}</span>
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

      {/* Phase 54D: ChatDock wraps composer — portal into shell when dock exists */}
      {(() => {
        const composerEl = (
          <div ref={composerRef}>
            <ChatDock>
              <div className="flex items-end gap-2 w-full">
                <ComposerPresenceControls
                  pending={!!pending}
                  onSpeakLast={speakLastAssistant}
                  autoSpeakEnabled={autoSpeakEnabled}
                  onToggleAutoSpeak={(v) => setAutoSpeakEnabled(!!v)}
                />
                <ChatComposerBar
                  value={input}
                  onChange={(v) => {
                    setInput(v);
                    clearTimeout(ingestDebounceRef.current);
                    ingestDebounceRef.current = setTimeout(() => ingestUserDraft(v), 300);
                  }}
                  onSend={handleSend}
                  onMic={() => setVoiceCheckInModalOpen(true)}
                  onFaceScan={allowFaceSignals && allowEmotionAnalysis ? () => setFaceScanPromptOpen(true) : undefined}
                  disabled={isSending || connectionStateRef.current === "sending" || connectionStateRef.current === "awaiting_response"}
                  isSending={isSending}
                  inputRef={textareaRef}
                  placeholder="Ask anything"
                />
              </div>
            </ChatDock>
          </div>
        );
        const dock = typeof document !== "undefined" ? document.getElementById("wc-composer-dock") : null;
        if (dock) {
          return createPortal(composerEl, dock);
        }
        return composerEl;
      })()}

      {/* Phase 31: Face Scan Prompt Modal */}

      {/* Voice Check-In Modal — in-app, never new tab */}
      <VoiceCheckInModal
        open={voiceCheckInModalOpen}
        onClose={() => setVoiceCheckInModalOpen(false)}
      />
      <FaceScanPrompt
        open={faceScanPromptOpen}
        onClose={() => setFaceScanPromptOpen(false)}
        onStartScan={handleFaceScan}
      />

      <GroundingModal open={groundingModalOpen} onClose={() => setGroundingModalOpen(false)} />

      <ThinkingOverlay show={!!pending && thoughtMsForOverlay >= 250} seconds={(thoughtMsForOverlay || 0) / 1000} />

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
