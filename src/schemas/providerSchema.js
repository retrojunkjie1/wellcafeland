// Provider Database Schema Design for WellnessCafe
// Firestore Collection: 'providers'

// Document Structure:
const providerSchema = {
  // Basic Information
  id: "unique_provider_id",
  name: "Dr. Sarah Johnson",
  title: "Licensed Clinical Psychologist",
  bio: "Specializing in trauma-informed care and mindfulness-based therapy...",
  profileImage: "https://firebasestorage.googleapis.com/...",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  website: "https://sarahjohnsontherapy.com",

  // Professional Details
  specialties: [
    "Trauma Therapy",
    "Anxiety Disorders",
    "Mindfulness-Based CBT",
    "EMDR",
    "Couples Counseling",
  ],

  credentials: [
    {
      type: "License",
      title: "Licensed Clinical Psychologist",
      issuer: "California Board of Psychology",
      number: "PSY12345",
      expiryDate: "2026-12-31",
    },
    {
      type: "Certification",
      title: "EMDR Certified Therapist",
      issuer: "EMDR International Association",
      number: "EMDR67890",
      expiryDate: "2025-06-15",
    },
  ],

  // Location & Availability
  location: {
    address: "123 Wellness Way, Suite 200",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    country: "USA",
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  },

  availability: {
    timezone: "America/Los_Angeles",
    workingHours: {
      monday: { start: "09:00", end: "17:00", available: true },
      tuesday: { start: "09:00", end: "17:00", available: true },
      wednesday: { start: "09:00", end: "17:00", available: true },
      thursday: { start: "09:00", end: "17:00", available: true },
      friday: { start: "09:00", end: "17:00", available: true },
      saturday: { start: "10:00", end: "14:00", available: false },
      sunday: { start: "10:00", end: "14:00", available: false },
    },
    appointmentTypes: ["in-person", "virtual", "hybrid"],
  },

  // Services & Pricing
  services: [
    {
      id: "individual-therapy",
      name: "Individual Therapy",
      description: "One-on-one therapy sessions",
      duration: 50, // minutes
      price: 150, // USD
      currency: "USD",
      insuranceAccepted: true,
    },
    {
      id: "couples-counseling",
      name: "Couples Counseling",
      description: "Relationship counseling for couples",
      duration: 75,
      price: 200,
      currency: "USD",
      insuranceAccepted: true,
    },
  ],

  // Additional Information
  languages: ["English", "Spanish"],
  insuranceAccepted: [
    "Aetna",
    "Blue Cross Blue Shield",
    "Cigna",
    "United Healthcare",
  ],

  // Reviews & Ratings
  rating: 4.8,
  reviewCount: 127,
  featured: true,

  // Metadata
  verified: true,
  active: true,
  createdAt: "2025-01-15T10:30:00Z",
  updatedAt: "2025-10-30T14:20:00Z",
  lastActive: "2025-10-30T14:20:00Z",
};

// Search & Filter Indexes needed:
// - Composite index: specialties + location.city
// - Composite index: rating (descending)
// - Composite index: services.price (ascending)
// - Composite index: availability.appointmentTypes
// - Composite index: insuranceAccepted
// - Composite index: languages

// Sample Firestore Security Rules:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Providers collection
    match /providers/{providerId} {
      // Allow read for all authenticated users
      allow read: if request.auth != null;

      // Allow write only for verified providers or admins
      allow write: if request.auth != null &&
        (request.auth.token.email in get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.emails ||
         resource.data.verified == true);

      // Allow create for new providers (will be verified later)
      allow create: if request.auth != null;
    }

    // Reviews subcollection
    match /providers/{providerId}/reviews/{reviewId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
*/

export default providerSchema;
