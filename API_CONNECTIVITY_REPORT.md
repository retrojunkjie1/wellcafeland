# API Connectivity Report - WellnessCafe OS

**Generated:** $(date)  
**Status:** ✅ All APIs Linked and Configured

---

## 1. Multimodal Chat API (Primary AI Engine)

**Status:** ✅ **CONNECTED**

**Endpoint:**
- Firebase Function: `${VITE_FIREBASE_FUNCTIONS_URL}/multimodalChat`
- Default Fallback: `https://us-central1-wellnesscafelanding.cloudfunctions.net/multimodalChat`

**Implementation:**
- **Service:** `src/services/multimodalClient.js`
- **Function:** `sendChatMultimodal({ messages, metadata, mode })`
- **Called From:** `src/components/os/ChatPanel.jsx` (line 220)

**Request Format:**
```javascript
POST /multimodalChat
{
  messages: [{ role: "user", content: "..." }],
  mode: "chat" | "breathing" | "grounding" | "self_surgeon",
  metadata: { emotion, spirit, forecast }
}
```

**Response Format:**
```javascript
{
  ok: true,
  type: "text" | "audio" | "video",
  text: "...",
  audioUrl: "...", // if type === "audio"
  videoUrl: "...", // if type === "video"
  raw: {...}
}
```

**Error Handling:**
- ✅ Network errors caught and user-friendly messages shown
- ✅ Timeout: 30 seconds
- ✅ Fallback error messages provided

---

## 2. Global Resource Search API

**Status:** ✅ **CONNECTED** (Primary + Fallback)

**Endpoints:**
1. **Primary:** Firebase Function `${VITE_FIREBASE_FUNCTIONS_URL}/globalResourceSearch`
2. **Fallback:** Client-side RapidAPI via `globalWebSearch()`

**Implementation:**
- **Service:** `src/services/resourceSearch.js`
- **Function:** `searchResources({ query, domain, region, category })`
- **Called From:** 
  - `src/components/os/ChatPanel.jsx` (line 401)
  - `src/apps/directory/DirectoryWorkspace.jsx`
  - `src/apps/workspace/RealHelpWorkspace.jsx`

**Request Flow:**
1. Try Firebase Function first (server-side RapidAPI)
2. If fails/timeouts → Fallback to client-side RapidAPI
3. If both fail → Graceful error message

**Request Format:**
```javascript
POST /globalResourceSearch
{
  query: "grants for addiction treatment",
  domain: "grants" | "housing" | "programs" | "",
  region: "CO" | undefined,
  category: "All categories" | undefined
}
```

**Response Format:**
```javascript
{
  ok: true,
  results: [
    {
      id: "...",
      title: "...",
      description: "...",
      url: "...",
      source: "...",
      snippet: "..."
    }
  ],
  query: "...",
  error: null
}
```

**Error Handling:**
- ✅ Request deduplication cache (5s TTL)
- ✅ Rate limit detection and handling
- ✅ Timeout: 10 seconds
- ✅ Graceful degradation with helpful messages

---

## 3. RapidAPI Search (Client-Side Fallback)

**Status:** ✅ **CONNECTED** (Fallback Only)

**Endpoint:**
- `https://real-time-web-search.p.rapidapi.com/search`

**Configuration:**
- **Env Vars Required:**
  - `VITE_RAPIDAPI_KEY` (required)
  - `VITE_RAPIDAPI_HOST` (default: `real-time-web-search.p.rapidapi.com`)
  - `VITE_RAPIDAPI_SEARCH_URL` (default: `https://real-time-web-search.p.rapidapi.com/search`)

**Implementation:**
- **Service:** `src/services/searchService.js`
- **Function:** `globalWebSearch(query, { limit })`
- **Used By:** `resourceSearch.js` as fallback

**Request Format:**
```javascript
GET /search?q={query}&limit=10
Headers: {
  "x-rapidapi-key": VITE_RAPIDAPI_KEY,
  "x-rapidapi-host": VITE_RAPIDAPI_HOST
}
```

**Response Parsing:**
- ✅ Handles multiple response shapes (`data`, `results`, `items`, `webPages.value`)
- ✅ Maps to normalized directory format
- ✅ Timeout: 15 seconds

**Error Handling:**
- ✅ 401/403: Authentication error
- ✅ 429: Rate limit (waits 3s before retry)
- ✅ 500+: Service unavailable
- ✅ Network errors: Connection check message

---

## 4. Text-to-Speech (TTS) API

**Status:** ✅ **CONNECTED**

**Endpoint:**
- Firebase Function: `${VITE_FIREBASE_FUNCTIONS_URL}/multimodalTts`

**Implementation:**
- **Service:** `src/services/multimodalClient.js`
- **Function:** `speakText(text, { voice })`
- **Used By:** Voice response components

**Request Format:**
```javascript
POST /multimodalTts
{
  text: "Hello, how can I help you?",
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"
}
```

**Response Format:**
```javascript
{
  ok: true,
  audio: "base64_encoded_audio",
  mimeType: "audio/mp3"
}
```

**Error Handling:**
- ✅ Timeout: 15 seconds
- ✅ Base64 to Blob conversion with error handling
- ✅ Network error detection

---

## 5. Speech-to-Text (STT) API

**Status:** ✅ **CONNECTED**

**Endpoint:**
- Firebase Function: `${VITE_FIREBASE_FUNCTIONS_URL}/multimodalStt`

**Implementation:**
- **Service:** `src/services/multimodalClient.js`
- **Function:** `transcribeAudio(audio, mimeType)`
- **Used By:** Voice input components

**Request Format:**
```javascript
POST /multimodalStt
{
  audio: "base64_encoded_audio",
  mimeType: "audio/webm" | "audio/mp3" | "audio/wav"
}
```

**Response Format:**
```javascript
{
  ok: true,
  text: "transcribed text"
}
```

**Error Handling:**
- ✅ Blob to base64 conversion
- ✅ Timeout: 30 seconds
- ✅ Network error detection

---

## 6. Environment Variables Summary

**Required for Production:**
```bash
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-wellnesscafelanding.cloudfunctions.net
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
VITE_RAPIDAPI_HOST=real-time-web-search.p.rapidapi.com
VITE_RAPIDAPI_SEARCH_URL=https://real-time-web-search.p.rapidapi.com/search
```

**Optional:**
```bash
VITE_ENABLE_VOICE=true
VITE_ENABLE_VIDEO=true
VITE_ENABLE_DIRECTORY=true
VITE_ENABLE_PROVIDER_MODE=true
```

**Fallback Behavior:**
- ✅ All Firebase Functions have hardcoded production URLs as fallback
- ✅ RapidAPI warnings logged if keys missing (graceful degradation)

---

## 7. API Call Flow Diagrams

### Chat Flow:
```
User Input → ChatPanel.jsx
  ↓
enrichMessageWithEmotion() [Phase 17]
  ↓
analyzeMessageSignals() [Phase 17]
  ↓
sendChatMultimodal() → Firebase Function /multimodalChat
  ↓
Response → ChatPanel.jsx → Display
```

### Directory Search Flow:
```
User Query → ChatPanel.jsx / DirectoryWorkspace.jsx
  ↓
searchResources() → Try Firebase Function /globalResourceSearch
  ↓
  ├─ Success → Return Results
  └─ Failure → globalWebSearch() (RapidAPI fallback)
      ↓
      └─ Return Results or Error
```

---

## 8. Health Check Service

**Status:** ✅ **AVAILABLE**

**Service:** `src/services/healthService.js`

**Functions:**
- `checkFirestore()` - Firestore connectivity
- `checkFunctions()` - Firebase Functions connectivity
- `checkRapidAPI()` - RapidAPI connectivity
- `checkOpenAI()` - OpenAI via Functions
- `runAllHealthChecks()` - All checks at once

**Usage:** Admin/Provider dashboard can call these to monitor system health.

---

## 9. Verification Checklist

- ✅ **Multimodal Chat:** Connected via `sendChatMultimodal()` in ChatPanel
- ✅ **Resource Search:** Connected via `searchResources()` with Firebase Function + RapidAPI fallback
- ✅ **RapidAPI:** Configured with env vars and proper error handling
- ✅ **TTS/STT:** Connected via `speakText()` and `transcribeAudio()`
- ✅ **Error Handling:** All APIs have try/catch, timeouts, and user-friendly error messages
- ✅ **Fallback Mechanisms:** Resource search has client-side RapidAPI fallback
- ✅ **Environment Variables:** All APIs use env vars with production fallbacks
- ✅ **Health Checks:** Health service available for monitoring

---

## 10. Known Limitations

1. **RapidAPI Rate Limits:** Client-side fallback may hit rate limits if used heavily
2. **Firebase Functions Timeout:** 30s timeout for chat, 10s for search
3. **No Retry Logic:** Failed requests don't auto-retry (user must retry manually)

---

## Conclusion

**All APIs are properly linked and configured.** The system uses:
- Firebase Functions as primary backend (with production URL fallbacks)
- RapidAPI as search fallback (with proper error handling)
- Comprehensive error handling and user-friendly messages
- Health check service for monitoring

**No action required** - APIs are ready for production use.

