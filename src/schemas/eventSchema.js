// Event Database Schema Design for WellnessCafe
// Firestore Collection: 'events'

// Document Structure:
const eventSchema = {
  // Basic Event Information
  id: "unique_event_id",
  title: "Mindfulness Meditation Workshop",
  description: "Join us for an immersive mindfulness meditation experience...",
  shortDescription: "A transformative mindfulness workshop for all levels",
  category: "Workshop", // Workshop, Retreat, Support Group, Webinar, Community Event

  // Event Details
  startDate: "2025-11-15T14:00:00Z", // ISO string
  endDate: "2025-11-15T16:00:00Z", // ISO string
  timezone: "America/Los_Angeles",
  duration: 120, // minutes

  // Location & Format
  location: {
    type: "venue", // venue, virtual, hybrid
    venueName: "Wellness Center Downtown",
    address: "123 Wellness Street, Suite 200",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    virtualLink: "https://zoom.us/j/123456789", // for virtual/hybrid events
    meetingId: "123-456-789",
    passcode: "wellness2025",
  },

  // Event Organizer
  organizer: {
    id: "provider_id_or_org_id",
    name: "WellnessCafe Community",
    type: "organization", // organization, provider, community
    contactEmail: "events@wellnesscafe.ai",
    contactPhone: "+1 (555) 123-4567",
  },

  // Capacity & Registration
  capacity: {
    maxAttendees: 25,
    currentAttendees: 12,
    waitlistEnabled: true,
    waitlistCount: 3,
  },

  registration: {
    required: true,
    deadline: "2025-11-14T23:59:00Z", // ISO string
    price: {
      amount: 25, // 0 for free events
      currency: "USD",
      earlyBirdPrice: 20, // optional
      earlyBirdDeadline: "2025-11-01T23:59:00Z",
    },
    refundPolicy: "Full refund up to 48 hours before event",
    cancellationPolicy: "Cancellations accepted up to 24 hours before",
  },

  // Event Content & Materials
  agenda: [
    {
      time: "14:00",
      title: "Welcome & Centering",
      description: "Opening meditation and introductions",
      duration: 15,
    },
    {
      time: "14:15",
      title: "Mindfulness Techniques",
      description: "Core mindfulness practices and exercises",
      duration: 60,
    },
    {
      time: "15:15",
      title: "Group Discussion",
      description: "Sharing experiences and Q&A",
      duration: 30,
    },
    {
      time: "15:45",
      title: "Closing Meditation",
      description: "Final meditation and closing remarks",
      duration: 15,
    },
  ],

  prerequisites: [
    "No prior meditation experience required",
    "Comfortable seating for meditation",
    "Journal for personal reflections",
  ],

  materials: [
    "Meditation cushion provided",
    "Handouts with techniques",
    "Guided meditation recordings",
  ],

  // Target Audience
  targetAudience: {
    ageRange: {
      min: 18,
      max: null, // null means no upper limit
    },
    experienceLevel: "All Levels", // Beginner, Intermediate, Advanced, All Levels
    wellnessFocus: ["Stress Management", "Mindfulness", "Mental Health"],
    specialGroups: [
      "LGBTQ+ friendly",
      "Accessibility accommodations available",
    ],
  },

  // Images & Media
  images: {
    mainImage:
      "https://firebasestorage.googleapis.com/.../meditation-workshop-main.jpg",
    gallery: [
      "https://firebasestorage.googleapis.com/.../image1.jpg",
      "https://firebasestorage.googleapis.com/.../image2.jpg",
    ],
  },

  // Tags & Search
  tags: [
    "mindfulness",
    "meditation",
    "stress-relief",
    "mental-health",
    "wellness-workshop",
    "beginner-friendly",
  ],

  // Status & Visibility
  status: "published", // draft, published, cancelled, completed
  featured: true,
  promoted: false,

  // Analytics & Engagement
  engagement: {
    views: 245,
    shares: 12,
    saves: 34,
    rating: 4.8,
    reviewCount: 18,
  },

  // Metadata
  createdAt: "2025-10-15T10:30:00Z",
  updatedAt: "2025-10-30T14:20:00Z",
  createdBy: "admin_user_id",
  publishedAt: "2025-10-20T09:00:00Z",
};

// Sample Firestore Security Rules:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events collection
    match /events/{eventId} {
      // Allow read for all authenticated users
      allow read: if request.auth != null;

      // Allow write for organizers and admins
      allow write: if request.auth != null &&
        (request.auth.token.email in get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.emails ||
         resource.data.createdBy == request.auth.uid);

      // Allow create for verified organizers
      allow create: if request.auth != null;
    }

    // Registrations subcollection
    match /events/{eventId}/registrations/{registrationId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }

    // Reviews subcollection
    match /events/{eventId}/reviews/{reviewId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
*/

// Search & Filter Indexes needed:
// - Composite index: category + startDate
// - Composite index: location.city + startDate
// - Composite index: tags (array)
// - Composite index: status + startDate
// - Composite index: featured + startDate
// - Composite index: registration.price.amount

export default eventSchema;
