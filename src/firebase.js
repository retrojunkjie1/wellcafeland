// src/firebase.js
// Firebase initialization and exports
// Centralized config from src/config/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config/firebaseConfig";

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

// Initialize App Check (safe, production-only)
import { initAppCheck } from "./firebase/appCheck";
initAppCheck(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export app for advanced usage
export default app;
