# Network Error - Final Report

## 1. Exact File + Function That Throws/Renders It

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
- `sendChatMultimodal` (line 373) - Similar function
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
```199:203:src/services/multimodalClient.js
    // Debug: Log response body (trimmed to 300 chars)
    if (data) {
      const dataStr = JSON.stringify(data);
      const trimmedData = dataStr.length > 300 ? dataStr.substring(0, 300) + "..." : dataStr;
      console.log("[guideEngine] Response body (trimmed):", trimmedData);
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

### ✅ CORS is Already Configured in Backend

**Backend Configuration (functions/src/multimodal.js):**
```12:17:functions/src/multimodal.js
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5182",
  "https://wellnesscafe.net",
  "https://www.wellnesscafe.net",
];
```

```54:59:functions/src/multimodal.js
exports.chat = onRequest(
  {
    region: "us-central1",
    cors: ALLOWED_ORIGINS,
    secrets: ["OPENAI_API_KEY"],
  },
```

**CORS is properly configured** - The Firebase Function includes `https://wellnesscafe.net` in allowed origins.

### ✅ Endpoint URL Fixed

**Issue Found:** The endpoint was incorrectly using `/Chat` instead of `/multimodalChat`.

**Fixed:** Changed line 58 from:
```javascript
const endpoint = `${functionUrl}/Chat`;  // ❌ Wrong
```

To:
```javascript
const endpoint = `${functionUrl}/multimodalChat`;  // ✅ Correct
```

This matches the backend export:
```29:29:functions/src/index.js
exports.multimodalChat = chat;
```

### Remaining Potential Issues

1. **Environment Variable Not Set in Production**
   - Check if `VITE_FIREBASE_FUNCTIONS_URL` is set in production build
   - If not, it will use the default (which is correct)

2. **Firebase Function Not Deployed**
   - Verify `multimodalChat` function is deployed to Firebase
   - Check: `firebase functions:list`

3. **Network/Firewall Issues**
   - Browser extensions blocking requests
   - Corporate firewall blocking Firebase Functions
   - DNS resolution issues

---

## Summary

✅ **Debug logging added** - All request/response details now logged  
✅ **Error location identified** - `guideEngine` function in `multimodalClient.js`  
✅ **Request details documented** - URL, method, headers, env vars  
✅ **Endpoint URL fixed** - Changed from `/Chat` to `/multimodalChat`  
✅ **CORS verified** - Backend already configured correctly

**Next Steps:**
1. Deploy the frontend fix (endpoint URL correction)
2. Verify Firebase Function is deployed: `firebase functions:list`
3. Check browser console on next error - debug logs will show exact issue
4. If still failing, check Network tab for actual HTTP status and response headers

**The debug logs will now show:**
- Exact endpoint being called: `https://us-central1-wellnesscafelanding.cloudfunctions.net/multimodalChat`
- HTTP status code (if request reaches server)
- Response headers (CORS headers will be visible)
- Full error details

This will immediately reveal whether it's:
- ❌ Wrong URL (now fixed)
- ❌ CORS issue (backend already configured)
- ❌ Function not deployed
- ❌ Network/firewall issue
- ❌ Server error (500, 503, etc.)

