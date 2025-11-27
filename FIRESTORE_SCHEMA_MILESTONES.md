# Firestore Schema - Milestone Engine

## Collection: `clients/{clientId}`

Main client document with sobriety tracking fields.

```javascript
{
  // Required fields
  soberStart: Timestamp,        // Start date of current sobriety period
  daysSober: number,            // Computed days sober (auto-updated by Cloud Function)
  
  // Optional fields
  lastUseAt: Timestamp,         // Last use date (for relapse detection)
  relapseCount: number,         // Total number of relapses (incremented on relapse)
  lastRelapseAt: Timestamp,     // Date of most recent relapse
  relapseMessage: string,       // Encouraging message from relapse
  
  // Metadata
  createdAt: Timestamp,
  lastUpdated: Timestamp,
  
  // Other client fields...
  email: string,
  displayName: string,
  role: string,
}
```

## Collection: `clients/{clientId}/milestones/{milestoneDays}`

Milestone documents for each achieved milestone.

```javascript
{
  milestone: number,            // Milestone day (30, 60, 90, 180, 365)
  earnedAt: Timestamp,          // When milestone was earned
  coinAssetPath: string,        // Path to coin SVG asset
  tier: string,                 // "bronze" | "silver" | "gold" | "platinum" | "diamond"
  notifiedAdmin: boolean,        // Whether admin was notified
  daysSoberAtEarned: number,    // Days sober when milestone was earned
}
```

## Collection: `clients/{clientId}/relapses/{relapseId}`

Relapse records with encouraging messages.

```javascript
{
  occurredAt: Timestamp,        // When relapse occurred
  recordedAt: Timestamp,         // When relapse was recorded
  message: string,              // Encouraging message
  previousSoberStart: Timestamp, // Sober start date before relapse
  previousSoberDays: number,    // Days sober before relapse
}
```

## Collection: `adminEvents/{eventId}`

Admin notification events for milestones and relapses.

```javascript
{
  type: string,                 // "milestone_achieved" | "relapse_recorded"
  clientId: string,             // Client user ID
  timestamp: Timestamp,         // When event occurred
  
  // For milestone_achieved
  milestone?: number,           // Milestone day
  tier?: string,                // Milestone tier
  
  // For relapse_recorded
  occurredAt?: Timestamp,        // When relapse occurred
  previousSoberDays?: number,   // Days sober before relapse
  
  read: boolean,                // Whether admin has read the event
}
```

## Example Client Document

```javascript
{
  email: "client@example.com",
  displayName: "John Doe",
  role: "client",
  soberStart: Timestamp.fromDate(new Date("2024-01-01")),
  daysSober: 45,
  lastUseAt: null,
  relapseCount: 0,
  createdAt: Timestamp.fromDate(new Date("2024-01-01")),
  lastUpdated: Timestamp.now(),
}
```

## Example Milestone Document

```javascript
{
  milestone: 30,
  earnedAt: Timestamp.fromDate(new Date("2024-01-31")),
  coinAssetPath: "assets/milestones/coin-30.svg",
  tier: "bronze",
  notifiedAdmin: true,
  daysSoberAtEarned: 30,
}
```

## Example Relapse Document

```javascript
{
  occurredAt: Timestamp.fromDate(new Date("2024-02-15")),
  recordedAt: Timestamp.now(),
  message: "Recovery is a journey, not a destination. Every day you choose to start again is progress.",
  previousSoberStart: Timestamp.fromDate(new Date("2024-01-01")),
  previousSoberDays: 45,
}
```

