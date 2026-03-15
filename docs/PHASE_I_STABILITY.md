# Phase I Stability Restore

**Objective:** Restore production correctness for chat, breathing/orb, and voice guide.  
**Rules:** Minimal diff, no redesign, no new deps unless required, preserve glass aesthetic.

---

## Current Environment

| Item | Value |
|------|-------|
| **Local** | `localhost:5173` (Vite dev) |
| **Production** | `https://wellnesscafe.net` |
| **Firebase project** | `wellnesscafelanding` |
| **Functions region** | `us-central1` |

---

## Detected Endpoints

| Purpose | Endpoint | Client | Backend |
|---------|----------|--------|---------|
| **Chat (primary)** | `/aiSession` | `aiClient.callAI()` | `aiBrain.handleSession` |
| **Multimodal chat** | `/multimodalChat` | `guideEngine`, `sendChatMultimodal` | `multimodal.chat` |
| **TTS** | `/multimodalTts` | `multimodalClient.synthesizeSpeech()` | `multimodal.tts` |
| **STT** | `/multimodalStt` | `multimodalClient.transcribeAudio()` | `multimodal.stt` |

**Base URL resolution:**
- `VITE_FIREBASE_FUNCTIONS_URL` if set
- Dev: `http://localhost:5001/wellnesscafelanding/us-central1`
- Prod: `https://us-central1-wellnesscafelanding.cloudfunctions.net`

---

## Chat Connectivity

- **ChatPanel** uses `aiClient.callAI("aiSession", { messages })` → **aiSession**
- **aiSession** requires `FIREWORKS_API_KEY` (Fireworks AI)
- **multimodalChat** requires `OPENAI_API_KEY` (used by GuidePage, AssistantConsole, VoiceCheckIn, etc.)

---

## Breathing / Orb

- **Tool registry:** `toolsRegistry.js` includes `breathing` with `category: "body-breath"`
- **ToolDetailPage:** Maps `breathing` → `sessionType: "breathing"` → `BreathingSessionView`
- **Orb:** `AssistantOrb` in `OSLayout` — mounts unconditionally
- **OSPageChrome:** Hides for immersive tool sessions (`/tools/:id`)

---

## Voice Guide

- **Implementation:** `voiceGuide.js` — Web Speech API (`speechSynthesis`)
- **TTS/STT:** Optional backend `/multimodalTts`, `/multimodalStt` for AI-generated audio
- **Breathing:** Uses `speakText()` from voiceGuide (client-side only)
- **iOS:** Requires `unlockAudio()` via user gesture

---

## Console / Network Errors

- To be captured when `wc_debug=1` in localStorage (see Instrumentation section)

---

## Fixes Applied

| Item | Change |
|------|--------|
| **Debug toggle** | `src/lib/debug.js` — `wc_debug=1` in localStorage logs projectId, functionsBaseUrl, chat/TTS/STT endpoints, toolId+sessionType. No secrets, tokens, or PII. |
| **Chat error copy** | `aiClient.js` — network/abort errors return "Still here with you. Tap send to continue."; other errors return "Connection hiccup. I'm still here." (no raw stack traces). |
| **guideEngine logging** | `multimodalClient.js` — replaced verbose console.log with `logDebug` when wc_debug enabled. |
| **Voice failure states** | `BreathingSessionView.jsx` — when voice enabled but unavailable or lastError, show "Voice unavailable on this device. Tap to retry." or "Voice had a hiccup. Tap the button to retry." |

---

## Verification Results

- [ ] Chat sends and receives at least 1 message in production
- [ ] Breathing tool visible in tools list and opens; orb renders stable
- [ ] Voice guide can start TTS/STT or shows graceful error
- [ ] No horizontal overflow; bottom nav never covers content
- [x] Build passes: `npm run build`
- [ ] Lint passes (run `npm run lint` if configured)
