# Stability Fixes Status

## ✅ COMPLETED

### A) Chat Fixes (Runtime Errors)
- ✅ `offlineMessageQueueRef` properly declared and initialized
- ✅ `isOffline` state properly declared with useState
- ✅ Connectivity utility created (`src/utils/connectivity.js`)
- ✅ Offline queue utility created (`src/utils/offlineQueue.js`)
- ✅ Build passes without errors

### Current State
- ChatPanel has proper ref declarations
- Network state tracking in place
- Queue infrastructure ready

## 🔄 IN PROGRESS / TODO

### A) Chat Fixes (Remaining)
- [ ] Integrate connectivity.js into ChatPanel
- [ ] Integrate offlineQueue.js for persistent queuing
- [ ] Add connection state machine (ready/sending/queued/retrying/error/offline)
- [ ] Add inFlightRef guard to prevent duplicate sends
- [ ] Add response schema validation
- [ ] Fix "Invalid response from server" error handling
- [ ] Mobile-specific API URL fixes

### B) Voice Guide Fixes
- [ ] Verify voiceGuide.js implementation
- [ ] Ensure iOS gesture requirements met
- [ ] Test breathing tool voice integration
- [ ] Fix chat "Listen" button

### C) Orb Fixes
- [ ] Create orbStore (Zustand)
- [ ] Add state machine (idle/expanded/dragging/hidden/disabled)
- [ ] Prevent re-mounting on route change
- [ ] Add position clamping
- [ ] Add debounce for drag events

### D) AppCheck + CSP
- [ ] Verify appCheck.js handles dev/prod correctly
- [ ] Update firebase.json CSP headers if needed
- [ ] Ensure reCAPTCHA domains allowed
- [ ] Add debug token support for dev

### E) Firestore Permissions
- [ ] Verify overrideEngine.js admin checks
- [ ] Update Firestore rules if needed
- [ ] Add admin claim refresh functionality

### F) Real Help Discovery
- [ ] Verify verifiedDestinations component integration
- [ ] Add infinite scroll
- [ ] Add search filtering
- [ ] Create Cloud Function for resource search
- [ ] Update UI to be discovery-first

### G) God-Eye Admin
- [ ] Wire real telemetry data
- [ ] Add user management actions
- [ ] Add feature flag toggles
- [ ] Add early warnings system
- [ ] Add system health monitoring

## Testing Checklist

- [ ] Chat sends messages without loops
- [ ] Chat queues messages when offline
- [ ] Voice guide speaks on button click
- [ ] Orb remains stable across routes
- [ ] No console errors on load
- [ ] Real Help shows search results
- [ ] Admin shows real data

