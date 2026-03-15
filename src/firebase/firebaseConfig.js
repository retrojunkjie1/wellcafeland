// src/firebase/firebaseConfig.js
// DEPRECATED: This file re-exports from the centralized config
// Use src/config/firebaseConfig.js instead
// Kept for backward compatibility

import { firebaseConfig as centralizedConfig } from "../config/firebaseConfig";

// Re-export from centralized config
export const firebaseConfig = centralizedConfig;

export const hasFirebaseConfig = () => Boolean(firebaseConfig.apiKey);
