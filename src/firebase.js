// ...existing code...
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Read config from environment variables (see .env.example)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || ''
};

// Initialize only when an API key is present to avoid runtime errors in tests/CI
let app = null;
try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Firebase initialization skipped:', e?.message || e);
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Connect to local emulators when REACT_APP_USE_FIREBASE_EMULATOR === 'true'
if (process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true' && app) {
  const firestoreHost = process.env.REACT_APP_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
  const firestorePort = Number(process.env.REACT_APP_FIRESTORE_EMULATOR_PORT || '8085'); // matches firebase.json change
  connectFirestoreEmulator(db, firestoreHost, firestorePort);

  const authHost = process.env.REACT_APP_AUTH_EMULATOR_URL || 'http://127.0.0.1:9099';
  // connectAuthEmulator expects full URL with http://
  connectAuthEmulator(auth, authHost, { disableWarnings: true });

  // eslint-disable-next-line no-console
  console.info(`Connected to emulators: Firestore ${firestoreHost}:${firestorePort}, Auth ${authHost}`);
}

/*
...existing firestore data model comment...
*/