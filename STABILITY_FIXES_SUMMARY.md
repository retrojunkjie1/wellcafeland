# Stability Fixes Summary

## Overview
Comprehensive fixes for core runtime systems: chat transport, breathing tool voice guide, orb stability, CSP/AppCheck, and state management.

## Files Changed

### 1. **New: `src/services/aiClient.js`**
   - Robust AI network client with retries, timeout (15s max), offline detection
   - Endpoint mapping (multimodalChat → aiSession)
   - Exponential backoff (max 30s)
   - Typed result: `{ ok, text, error, status, meta }`
   - Health check endpoint

### 2. **Updated: `src/components/os/ChatPanel.jsx`**
   - Migrated from `sendChatMultimodal` to `callAI` from `aiClient.js`
   - Connection state machine enforced (idle → sending → awaiting_response → resolved/error)
   - Message queue for offline messages with auto-flush on reconnect
   - Offline/retry UI banner with "Retry" button
   - Guard against duplicate sends using connection state
   - Online/offline state monitoring
   - Removed unused `sendChatMultimodal` import

### 3. **New: `src/utils/voiceGuide.js`**
   - iOS Safari-compatible voice guide module
   - `unlockAudio()` - Requires user gesture (iOS requirement)
   - `speakText()` - Uses Web Speech API with voice selection
   - `stopSpeaking()` - Clean cancellation
   - `getDiagnostics()` - Returns voice support status
   - Automatic voice loading on mount

### 4. **Updated: `src/components/tools/BreathingSessionView.jsx`**
   - Migrated from `multimodalClient.speakText` to `voiceGuide` module
   - Added `audioUnlocked` state
   - Voice guide toggle now unlocks audio on first enable (user gesture)
   - Collapsible diagnostics panel (hidden by default)
   - Improved iOS Safari compatibility

### 5. **Updated: `src/apps/ai/AssistantOrb.jsx`**
   - Fixed positioning: `position: fixed` explicitly set
   - Removed `maxBottom`/`maxRight` constraints (unnecessary)
   - Added `touchAction: manipulation` for mobile
   - Changed animation from `animate-ping` to `animate-pulse` (more stable)
   - Added `pointer-events-auto` to ensure clicks work
   - Stable z-index: `z-[9999]` (never drifts)

### 6. **Updated: `firebase.json`**
   - CSP headers configured for Firebase App Check / reCAPTCHA
   - Allows `https://www.google.com` and `https://www.gstatic.com` for scripts
   - Allows `https://www.recaptcha.net` for scripts
   - Frame-src includes Google domains for reCAPTCHA
   - Note: CSP headers only apply in Firebase Hosting (not localhost dev)

## Key Fixes

### Chat Loop Prevention
- Connection state machine blocks duplicate sends
- Only one assistant reply per network response
- Error messages deduplicated (no loops)
- Offline messages queued instead of repeated failures

### Voice Guide iOS Compatibility
- Explicit audio unlock on user gesture
- Web Speech API used (no network dependency)
- Graceful fallback if speech unavailable
- Diagnostics panel for troubleshooting

### Orb Stability
- Deterministic positioning (never drifts)
- Safe-area inset support for iOS
- No random animations
- Stable z-index hierarchy

### Network Resilience
- 15s timeout cap (was 30s on desktop)
- Retry with exponential backoff (max 3 retries)
- Offline detection using `navigator.onLine` + fetch test
- Message queue with auto-flush on reconnect

## Testing

### Local Development
```bash
npm run dev
```

**Verify:**
1. Chat sends without loops
2. Breathing tool voice guide works (click "Voice Guide On" first)
3. Orb is stable in bottom-right corner
4. No CSP errors in console (localhost doesn't apply CSP)

### Production Deployment
```bash
npm run build
firebase deploy --only hosting
```

**Verify:**
1. Chat sends successfully
2. No CSP blocking App Check / reCAPTCHA
3. Breathing voice guide unlocks on first tap
4. Orb never disappears or drifts

### Mobile Testing (iOS Safari)
1. Open app on iPhone/iPad
2. Test breathing tool voice guide (must tap "Voice Guide On" to unlock)
3. Verify orb respects safe-area insets
4. Test offline queue (turn on airplane mode, send message, turn off, verify auto-send)

## Environment Variables

Required:
- `VITE_FIREBASE_FUNCTIONS_URL` - Cloud Functions base URL (optional, defaults to production)

No new environment variables required.

## Known Limitations

1. CSP headers only apply in Firebase Hosting (localhost dev bypasses CSP automatically)
2. Voice guide requires user gesture on iOS Safari (by design)
3. Message queue is in-memory only (cleared on page refresh)

## Future Improvements

- Persistent message queue (localStorage)
- WebSocket for real-time chat
- Voice guide diagnostics UI expansion
- Connection quality indicator

