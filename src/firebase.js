// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase config is valid
const hasValidConfig = firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId;

let app = null;
let db = null;
let auth = null;

// Initialize Firebase only if config is valid
if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.warn("Firebase initialization failed:", error.message);
    console.warn("Firebase features will be disabled. Add Firebase config to .env to enable.");
  }
} else {
  console.warn("Firebase config missing. Add VITE_FIREBASE_* variables to .env to enable Firebase features.");
}

// Export services (may be null if Firebase not initialized)
export { db, auth };
export default app;
