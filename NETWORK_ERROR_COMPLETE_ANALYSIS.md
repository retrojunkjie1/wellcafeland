# Network Error Complete Analysis

## 1. Exact File + Function That Throws/Renders It

### Primary Location (Main Entry Point)

**File:** `src/services/multimodalClient.js`  
**Function:** `guideEngine` (line 16)  
**Error Line:** Line 289 (catch block)

```286:290:src/services/multimodalClient.js
    return {
      ok: false,
      error: isNetworkError
        ? "Network connection failed. Please check your internet connection and try again."
        : "Connection lost. I'm still here with you. Try again when you're ready.",
    };
```

**Also appears in:**
- `sendChatMultimodal` (line 289) - Similar function
- `speakText` (line 373) - TTS function
- `transcribeAudio` (line 434) - STT function
- `callWellnessChat` (line 510) - Deprecated function
- `AssistantConsole.jsx` (line 38) - UI wrapper (calls `guideEngine`)

---

## 2. Request Details

### Endpoint Construction
```57:58:src/services/multimodalClient.js
    const functionUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || "https://us-central1-wellnesscafelanding.cloudfunctions.net";
    const endpoint = `${functionUrl}/multimodalChat`;
```

**URL:** `${VITE_FIREBASE_FUNCTIONS_URL || "https://us-central1-wellnesscafelanding.cloudfunctions.net"}/multimodalChat`

**Method:** `POST`

**Headers:**
```javascript
{
  "Content-Type": "application/json"
}
```

**Body:**
```javascript
{
  messages: messageHistory,  // Array of {role, content}
  mode: adjustedMode,        // "default" | "breathing" | "grounding" | etc.
  preferences: {              // Optional
    tone: string,
    pace: string
  },
  audioInput: base64,         // Optional
  imageInput: base64          // Optional
}
```

**Timeout:** 30 seconds (`AbortSignal.timeout(30000)`)

**Environment Variables:**
- `VITE_FIREBASE_FUNCTIONS_URL` - Optional override
  - Default: `"https://us-central1-wellnesscafelanding.cloudfunctions.net"`
  - Used to construct: `${functionUrl}/multimodalChat`

---

## 3. Debug Logging Added ✅

### Before Request
```60:62:src/services/multimodalClient.js
    // Debug: Log resolved endpoint
    console.log("[guideEngine] Resolved endpoint:", endpoint);
    console.log("[guideEngine] VITE_FIREBASE_FUNCTIONS_URL:", import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || "(not set, using default)");
```

### On Response (Success or Error)
```178:180:src/services/multimodalClient.js
    // Debug: Log response status and headers
    console.log("[guideEngine] Response status:", res.status, res.statusText);
    console.log("[guideEngine] Response headers:", Object.fromEntries(res.headers.entries()));
```

### On Error Response (non-200)
```182:187:src/services/multimodalClient.js
    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      const trimmedError = errorText.length > 300 ? errorText.substring(0, 300) + "..." : errorText;
      console.error("[guideEngine] Error response body (trimmed):", trimmedError);
      console.error("[guideEngine] Full error URL:", endpoint);
      console.error("[guideEngine] Error status:", res.status);
```

### On Success Response
```194:202:src/services/multimodalClient.js
    const data = await res.json().catch((parseErr) => {
      console.error("[guideEngine] Failed to parse JSON response:", parseErr);
      return null;
    });
    
    // Debug: Log response body (trimmed to 300 chars)
    if (data) {
      const dataStr = JSON.stringify(data);
      const trimmedData = dataStr.length > 300 ? dataStr.substring(0, 300) + "..." : dataStr;
      console.log("[guideEngine] Response body (trimmed):", trimmedData);
    }
```

### On Network Exception (catch block)
```260:284:src/services/multimodalClient.js
  } catch (err) {
    // Debug: Comprehensive error logging
    const functionUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || "https://us-central1-wellnesscafelanding.cloudfunctions.net";
    const endpoint = `${functionUrl}/multimodalChat`;
    
    console.error("[guideEngine] Request failed:", {
      error: err,
      message: err.message,
      name: err.name,
      stack: err.stack,
      endpoint: endpoint,
      resolvedUrl: functionUrl,
      envVar: import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || "(not set)",
    });
    
    const isNetworkError = err.message?.includes("Failed to fetch") || 
                          err.message?.includes("NetworkError") ||
                          err.name === "AbortError" ||
                          err.name === "TypeError";
    
    // Additional debug for CORS issues
    if (err.message?.includes("Failed to fetch") || err.message?.includes("CORS")) {
      console.error("[guideEngine] CORS/Network issue detected. Endpoint:", endpoint);
      console.error("[guideEngine] Check if endpoint allows origin:", window.location.origin);
    }
```

**Debug Output Will Show:**
- ✅ Resolved endpoint URL
- ✅ Environment variable status
- ✅ HTTP status code
- ✅ Response headers (including CORS headers)
- ✅ Response body (trimmed to 300 chars)
- ✅ Full error details (message, name, stack)
- ✅ Origin mismatch detection

---

## 4. Proposed Exact Fix

### Most Likely Issue: **CORS (Cross-Origin Resource Sharing)**

**Symptoms:**
- "Failed to fetch" error in browser console
- Request fails before reaching server
- No response headers visible
- Error occurs immediately on fetch

**Root Cause:**
Firebase Functions endpoint `https://us-central1-wellnesscafelanding.cloudfunctions.net/multimodalChat` likely does not include `Access-Control-Allow-Origin` header for `wellnesscafe.net` origin.

### Fix Option 1: Configure CORS in Firebase Function (Recommended)

**In your Firebase Function code (`multimodalChat`):**

```javascript
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

exports.multimodalChat = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    // Set CORS headers explicitly
    res.set('Access-Control-Allow-Origin', '*'); // Or specific: 'https://wellnesscafe.net'
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    // ... rest of your function logic
  });
});
```

**Or use Firebase Functions CORS middleware:**
```javascript
const cors = require('cors')({ 
  origin: ['https://wellnesscafe.net', 'http://localhost:5173'] 
});
```

### Fix Option 2: Use Vite Proxy (Development Only)

**Add to `vite.config.js`:**

```javascript
proxy: {
  '/multimodalChat': {
    target: process.env.VITE_FIREBASE_FUNCTIONS_URL || 
            'https://us-central1-wellnesscafelanding.cloudfunctions.net',
    changeOrigin: true,
    rewrite: (path) => '/multimodalChat',
  },
}
```

**Then update endpoint in production:**
```javascript
const endpoint = import.meta.env.DEV 
  ? '/multimodalChat'  // Use proxy in dev
  : `${functionUrl}/multimodalChat`;  // Direct in prod
```

**Note:** This only works in development. Production still needs CORS fix.

### Fix Option 3: Verify Environment Variable

**Check if `VITE_FIREBASE_FUNCTIONS_URL` is set in production:**

```bash
# In your deployment environment
echo $VITE_FIREBASE_FUNCTIONS_URL

# Should be set to:
# https://us-central1-wellnesscafelanding.cloudfunctions.net
```

**If not set, add to `.env.production`:**
```
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-wellnesscafelanding.cloudfunctions.net
```

### Fix Option 4: Check Firebase Hosting Rewrites

**If using Firebase Hosting, verify `firebase.json`:**

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "/multimodalChat",
        "function": "multimodalChat"
      }
    ]
  }
}
```

This allows calling `/multimodalChat` directly (same origin, no CORS needed).

---

## 5. Diagnostic Steps

### Step 1: Check Browser Console
When error occurs, you'll now see:
```
[guideEngine] Resolved endpoint: https://us-central1-wellnesscafelanding.cloudfunctions.net/multimodalChat
[guideEngine] VITE_FIREBASE_FUNCTIONS_URL: (not set, using default)
[guideEngine] Request failed: {
  error: TypeError: Failed to fetch,
  message: "Failed to fetch",
  name: "TypeError",
  endpoint: "https://us-central1-wellnesscafelanding.cloudfunctions.net/multimodalChat",
  resolvedUrl: "https://us-central1-wellnesscafelanding.cloudfunctions.net",
  envVar: "(not set)"
}
[guideEngine] CORS/Network issue detected. Endpoint: https://...
[guideEngine] Check if endpoint allows origin: https://wellnesscafe.net
```

### Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Trigger the error
3. Look for the `multimodalChat` request
4. Check:
   - **Status:** Should show error (red)
   - **Response Headers:** Look for `Access-Control-Allow-Origin`
   - **Request Headers:** Check `Origin` header matches your domain

### Step 3: Test Endpoint Directly
```bash
curl -X POST https://us-central1-wellnesscafelanding.cloudfunctions.net/multimodalChat \
  -H "Content-Type: application/json" \
  -H "Origin: https://wellnesscafe.net" \
  -d '{"messages":[{"role":"user","content":"test"}],"mode":"default"}' \
  -v
```

Look for `Access-Control-Allow-Origin` in response headers.

---

## Summary

✅ **Debug logging added** - All request/response details now logged  
✅ **Error location identified** - `guideEngine` function in `multimodalClient.js`  
✅ **Request details documented** - URL, method, headers, env vars  
✅ **Fix proposed** - CORS configuration in Firebase Function (most likely)

**Next Action:** Check browser console on next error to confirm CORS issue, then apply Fix Option 1.

