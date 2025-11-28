/**
 * 🔥 WELLNESSCAFE FIRESTORE SCHEMA
 * This file provides IntelliSense hints for all collections:
 * - Users
 * - Urge Surfing
 * - Trigger Tracker
 * - Recovery Centers
 * - Daily Intentions
 * - Affirmations
 * - Mood Logs
 * - Breathing Tool Sessions
 */

export const FirestoreSchema = {
  users: {
    displayName: "string",
    email: "string",
    createdAt: "timestamp",
    updatedAt: "timestamp",
    preferences: {
      theme: "string",
      notifications: "boolean",
      affirmations: "array"
    }
  },

  urgeSurfing: {
    userId: "string",
    moodBefore: "string",
    moodAfter: "string",
    urgeLevelBefore: "number",
    urgeLevelAfter: "number",
    triggers: "array",
    notes: "string",
    timestamp: "timestamp",
    recommendations: "string"
  },

  triggerTracker: {
    userId: "string",
    trigger: "string",
    intensity: "number",
    location: "string",
    mood: "string",
    notes: "string",
    timestamp: "timestamp",
    aiInsight: "string"
  },

  recoveryCenters: {
    name: "string",
    type: "string",
    category: "string",
    address: {
      street: "string",
      city: "string",
      state: "string",
      zip: "string",
      coordinates: {
        lat: "number",
        lng: "number"
      }
    },
    contact: {
      phone: "string",
      email: "string"
    },
    website: "string",
    services: "array",
    rating: "number"
  },

  dailyIntentions: {
    userId: "string",
    intention: "string",
    focus: "string",
    timestamp: "timestamp",
    gratitude: "string"
  },

  affirmations: {
    userId: "string",
    mood: "string",
    category: "string",
    generatedText: "string",
    timestamp: "timestamp",
    favorites: "boolean"
  },

  moodLogs: {
    userId: "string",
    mood: "string",
    intensity: "number",
    timestamp: "timestamp",
    notes: "string"
  },

  breathingSessions: {
    userId: "string",
    inhaleSeconds: "number",
    exhaleSeconds: "number",
    rounds: "number",
    moodBefore: "string",
    moodAfter: "string",
    timestamp: "timestamp",
    aiRecommendation: "string"
  }
};