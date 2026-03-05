# Network Error Analysis

## 1. Exact File + Function

**File:** `src/services/multimodalClient.js`  
**Function:** `guideEngine` (line 16)  
**Error Location:** Line 245 (catch block)

```237:248:src/services/multimodalClient.js
  } catch (err) {
    console.error("[guideEngine] Request failed:", err);
    const isNetworkError = err.message?.includes("Failed to fetch") || 
                          err.message?.includes("NetworkError") ||
                          err.name === "AbortError";
    return {
      ok: false,
      error: isNetworkError
        ? "Network connection failed. Please check your internet connection and try again."
        : "Connection lost. I'm still here with you. Try again when you're ready.",
    };
  }
```

**Also appears in:**
- `sendChatMultimodal` (line 329)
- `speakText` (line 390)
- `transcribeAudio` (line 466)
- `AssistantConsole.jsx` (line 38) - wraps `guideEngine`

---

## 2. Request Details

**Endpoint Construction:**
```57:58:src/services/multimodalClient.js
    const functionUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || "https://us-central1-wellnesscafelanding.cloudfunctions.net";
    const endpoint = `${functionUrl}/multimodalChat`;
```

**Request Configuration:**
```165:172:src/services/multimodalClient.js
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000),
    });
```

**Environment Variables:**
- `VITE_FIREBASE_FUNCTIONS_URL` - Optional override
- Default: `"https://us-central1-wellnesscafelanding.cloudfunctions.net"`

**Request Body:**
```117:125:src/services/multimodalClient.js
    const requestBody = {
      messages: messageHistory,
      mode: adjustedMode,
      // Add preference hints for backend
      preferences: preferences ? {
        tone: preferences.preferredTone,
        pace: preferences.sessionPace,
      } : undefined,
    };
```

---

## 3. Debug Logging Patch

Adding debug logging to capture:
- Resolved endpoint URL
- HTTP status code
- Response body (trimmed to 300 chars)
- Error details

---

## 4. Proposed Fix

**Most Likely Issues:**
1. **CORS** - Firebase Functions may not allow cross-origin requests from wellnesscafe.net
2. **Wrong URL** - Production URL may differ from development
3. **Missing Env Var** - `VITE_FIREBASE_FUNCTIONS_URL` not set in production
4. **Timeout** - 30s timeout may be too short for slow connections

**Fix Strategy:**
- Add comprehensive debug logging
- Check CORS headers in response
- Verify endpoint URL resolution
- Add fallback error handling

