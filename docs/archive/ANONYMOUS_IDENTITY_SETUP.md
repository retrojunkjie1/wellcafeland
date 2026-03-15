# Anonymous Identity System - Setup Guide

## Overview

The WellnessCafe OS now uses an anonymous identity system that:
- ✅ Works without login or authentication
- ✅ Persists across sessions
- ✅ Enables telemetry, session history, and risk tracking
- ✅ HIPAA/CFR-42 compliant (no PII)
- ✅ Fully works offline

## Architecture

### Client-Side (`src/lib/userId.js`)
- Generates persistent anonymous ID: `anon_<uuid>`
- Stored in localStorage
- Never contains personal information
- Survives page refreshes

### API Integration
- All API calls automatically include `userId` via:
  - `apiClient.js` - Automatically adds userId to all requests
  - `apiHelpers.js` - `apiFetch()` wrapper for direct fetch calls
  - `telemetry.js` - Includes userId in all telemetry events

### Backend (`functions/aiBrain.js`)
- Extracts `userId` from request body
- Stores userId with all sessions, telemetry, and memory
- Updates user document with lastSession

### Firestore Schema

```
users/
  anon_xxxxx/
    lastSession: {...}
    lastSessionAt: timestamp
    updatedAt: timestamp

sessions/
  auto-doc-id:
    userId: "anon_xxxxx"
    title: "..."
    steps: [...]
    createdAt: timestamp
    source: "ai_generate"

telemetry/
  auto-doc-id:
    userId: "anon_xxxxx"
    event: {...}
    ts: timestamp

memory/
  auto-doc-id:
    userId: "anon_xxxxx"
    text: "..."
    ts: timestamp
    type: "chat"
```

## Security Rules (`firestore.rules`)

- Users can only read/write their own data
- Admin access via `x-admin-secret` header (for now)
- Telemetry: create allowed, read only by admin
- Sessions: create allowed, read own or admin
- Memory: create allowed, read own or admin

## Features Enabled

1. **Repeat last session** - Works across devices (when synced)
2. **Risk tracking** - Telemetry tied to userId
3. **Session history** - All sessions stored with userId
4. **Behavior prediction** - Memory collection for AI context
5. **Cross-device continuity** - Same userId = same data

## Admin Access

To view anonymous users in admin dashboard:

1. Add `x-admin-secret` header to requests (set in Firebase Functions config)
2. Or implement Firebase Auth with admin token

## Next Steps

1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Set admin secret in Firebase Functions config
3. Add admin user view to AdminConsolePage (optional)
4. Test anonymous user flow end-to-end

## Testing

1. Open app in incognito mode
2. Check localStorage for `wc-anonymous-user-id`
3. Create a session - verify userId in Firestore
4. Check telemetry - verify userId included
5. Test admin access with secret header

