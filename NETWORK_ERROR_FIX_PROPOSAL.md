# Network Error Fix Proposal

## 1. Exact File + Function

**File:** `src/services/multimodalClient.js`  
**Function:** `guideEngine` (line 16)  
**Error Location:** Line 245 (catch block)

The error message "Network connection failed. Please check your internet connection and try again." is generated in the catch block when:
- `err.message?.includes("Failed to fetch")` OR
- `err.message?.includes("NetworkError")` OR  
- `err.name === "AbortError"`

---

## 2. Request Details

**Endpoint URL:**
```javascript
const functionUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 
                    "https://us-central1-wellnesscafelanding.cloudfunctions.net";
const endpoint = `${functionUrl}/multimodalChat`;
```

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
  messages: messageHistory,
  mode: adjustedMode,
  preferences: { tone, pace } // optional
}
```

**Timeout:** 30 seconds (`AbortSignal.timeout(30000)`)

**Environment Variables:**
- `VITE_FIREBASE_FUNCTIONS_URL` - Optional override (defaults to production URL)

---

## 3. Debug Logging Added

**Before Request:**
- Logs resolved endpoint URL
- Logs environment variable status

**On Response:**
- Logs HTTP status code and status text
- Logs all response headers
- Logs response body (trimmed to 300 chars)

**On Error:**
- Logs full error object with message, name, stack
- Logs endpoint URL that failed
- Logs resolved function URL
- Logs environment variable value
- Detects CORS issues specifically

---

## 4. Proposed Fix

### **Most Likely Issue: CORS**

Firebase Functions may not allow cross-origin requests from `wellnesscafe.net`.

**Symptoms:**
- "Failed to fetch" error
- No response headers visible
- Error occurs before request reaches server

**Fix Options:**

#### **Option A: Configure CORS in Firebase Functions**
```javascript
// In your Firebase Function (multimodalChat)
exports.multimodalChat = functions.https.onRequest((req, res) => {
  res.set('Access-Control-Allow-Origin', 'https://wellnesscafe.net');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // ... rest of function
});
```

#### **Option B: Use Proxy/Vite Dev Server**
Already configured in `vite.config.js` for `/aiSession`, but not for `/multimodalChat`.

**Add to vite.config.js:**
```javascript
proxy: {
  '/multimodalChat': {
    target: process.env.VITE_FIREBASE_FUNCTIONS_URL || 
            'https://us-central1-wellnesscafelanding.cloudfunctions.net',
    changeOrigin: true,
  },
}
```

Then update endpoint to use relative path in production:
```javascript
const endpoint = import.meta.env.DEV 
  ? '/multimodalChat'
  : `${functionUrl}/multimodalChat`;
```

#### **Option C: Wrong Production URL**

If `wellnesscafe.net` is hosted differently, the Firebase Functions URL may need to be:
- `https://wellnesscafe.net/api/multimodalChat` (if proxied)
- Or a different Firebase project URL

**Check:**
- Verify `VITE_FIREBASE_FUNCTIONS_URL` is set in production
- Verify Firebase project ID matches
- Check Firebase Hosting rewrites configuration

---

## 5. Next Steps

1. **Check Browser Console** - The debug logs will show:
   - Exact endpoint URL being called
   - HTTP status code (if any)
   - Response headers (CORS headers will be visible)
   - Error details

2. **Verify CORS Headers** - Look for:
   - `Access-Control-Allow-Origin` header
   - `Access-Control-Allow-Methods` header
   - If missing → CORS issue

3. **Check Network Tab** - Verify:
   - Request is actually sent
   - Response status code
   - Response headers
   - Request/response timing

4. **Test Endpoint Directly** - Use curl or Postman:
```bash
curl -X POST https://us-central1-wellnesscafelanding.cloudfunctions.net/multimodalChat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}],"mode":"default"}'
```

---

## Debug Output Example

When error occurs, console will show:
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

This will immediately reveal:
- ✅ Exact URL being called
- ✅ Whether env var is set
- ✅ CORS vs other network issue
- ✅ Origin mismatch

---

**Status:** Debug logging added ✅  
**Next:** Check browser console on next error to identify root cause

