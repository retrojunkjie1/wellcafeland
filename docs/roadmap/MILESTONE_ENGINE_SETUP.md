# Milestone Engine Setup Guide

## File Structure

```
functions/
├── src/
│   ├── index.js                          # Main exports
│   └── milestones/
│       ├── onClientUpdate.js             # Cloud Function trigger
│       ├── computeDaysSober.js          # Helper function
│       └── milestoneConfig.js            # Configuration
└── package.json

src/
└── components/
    └── SoberCounter.jsx                  # React component
```

## Installation Steps

### 1. Install Dependencies

```bash
cd functions
npm install firebase-functions@latest firebase-admin@latest
```

### 2. Deploy Cloud Function

```bash
firebase deploy --only functions:onClientUpdate
```

### 3. Add SoberCounter to App Layout

In `src/layouts/OSLayout.jsx` or `src/App.jsx`:

```jsx
import SoberCounter from "../components/SoberCounter";

// Add inside your main layout component:
<SoberCounter />
```

### 4. Initialize Client Documents

For existing clients, ensure they have a `soberStart` field:

```javascript
// Example: Set sober start date for a client
await db.collection("clients").doc(clientId).set({
  soberStart: Timestamp.fromDate(new Date("2024-01-01")),
  daysSober: 0,
  relapseCount: 0,
}, { merge: true });
```

## How It Works

1. **Automatic Tracking**: When a client document is updated, `onClientUpdate` triggers
2. **Days Calculation**: Computes days from `soberStart` to now
3. **Milestone Detection**: Checks if client reached any milestone (30, 60, 90, 180, 365 days)
4. **Milestone Creation**: Creates milestone document if not already exists
5. **Admin Notification**: Writes to `adminEvents` collection
6. **Relapse Detection**: If `lastUseAt` is updated to a recent date, records relapse and resets `soberStart`

## Testing

### Test Milestone Achievement

1. Create a test client document:
```javascript
await db.collection("clients").doc("test-client").set({
  soberStart: Timestamp.fromDate(new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)), // 35 days ago
  daysSober: 0,
});
```

2. Update the document to trigger the function:
```javascript
await db.collection("clients").doc("test-client").update({
  lastUpdated: Timestamp.now(),
});
```

3. Check for milestone document:
```javascript
const milestone = await db
  .collection("clients")
  .doc("test-client")
  .collection("milestones")
  .doc("30")
  .get();
```

### Test Relapse Detection

1. Update `lastUseAt` to a recent date:
```javascript
await db.collection("clients").doc("test-client").update({
  lastUseAt: Timestamp.now(),
});
```

2. Check for relapse document:
```javascript
const relapses = await db
  .collection("clients")
  .doc("test-client")
  .collection("relapses")
  .get();
```

## Firestore Security Rules

Add these rules to `firestore.rules`:

```javascript
// Clients collection
match /clients/{clientId} {
  // Client can read their own data
  allow read: if request.auth.uid == clientId;
  // Client can update their own data (limited fields)
  allow update: if request.auth.uid == clientId &&
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['lastUseAt', 'soberStart']);
  
  // Milestones subcollection
  match /milestones/{milestoneId} {
    allow read: if request.auth.uid == clientId;
    allow write: if false; // Only Cloud Function can write
  }
  
  // Relapses subcollection
  match /relapses/{relapseId} {
    allow read: if request.auth.uid == clientId;
    allow write: if false; // Only Cloud Function can write
  }
}

// Admin events
match /adminEvents/{eventId} {
  allow read: if hasAnyRole(['admin', 'superadmin']);
  allow write: if false; // Only Cloud Function can write
}
```

## Notes

- The Cloud Function uses batch writes for efficiency
- Milestones are only created once (checked before creation)
- Relapse detection only triggers if `lastUseAt` is updated to a more recent date
- SoberCounter component automatically subscribes to client document updates
- All error handling is non-breaking (warnings, not throws)

