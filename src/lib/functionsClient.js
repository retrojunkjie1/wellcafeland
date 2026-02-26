// src/lib/functionsClient.js
// Centralized Cloud Functions caller with automatic auth token attachment

import { getAuth } from "firebase/auth";
import { httpsCallable, getFunctions } from "firebase/functions";
import app from "@/firebase";
import { logTelemetry } from "@/telemetry/telemetry";

const FUNCTIONS_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
const FUNCTIONS_REGION = "us-central1";

// Initialize functions instance
let functionsInstance = null;

function getFunctionsInstance() {
  if (!functionsInstance) {
    functionsInstance = getFunctions(app, FUNCTIONS_REGION);
  }
  return functionsInstance;
}

/**
 * Call a Cloud Function (callable) with automatic auth token attachment
 * @param {string} functionName - Name of the Cloud Function
 * @param {any} data - Data to pass to the function
 * @param {object} options - Additional options
 * @returns {Promise<any>} Function response data
 */
export async function callFunction(functionName, data = null, options = {}) {
  const { logToTelemetry = true, throwOnError = true } = options;
  
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    const error = new Error("User must be authenticated to call Cloud Functions");
    console.error(`[FunctionsClient] ${functionName}:`, error.message);
    
    if (logToTelemetry) {
      logTelemetry("function_call", {
        level: "error",
        functionName,
        error: error.message,
        authenticated: false,
      });
    }
    
    if (throwOnError) {
      throw error;
    }
    return { error: error.message };
  }
  
  try {
    // Force refresh token to ensure latest claims
    const idToken = await user.getIdToken(true);
    
    if (logToTelemetry) {
      logTelemetry("function_call", {
        level: "info",
        functionName,
        authenticated: true,
        hasToken: !!idToken,
      });
    }
    
    const functions = getFunctionsInstance();
    const callable = httpsCallable(functions, functionName);
    
    const startTime = Date.now();
    const result = await callable(data);
    const duration = Date.now() - startTime;
    
    if (logToTelemetry) {
      logTelemetry("function_call", {
        level: "info",
        functionName,
        success: true,
        duration,
      });
    }
    
    return result.data;
  } catch (error) {
    const errorMessage = error?.message || String(error);
    const errorCode = error?.code || "unknown";
    
    console.error(`[FunctionsClient] ${functionName} failed:`, {
      message: errorMessage,
      code: errorCode,
      details: error,
    });
    
    if (logToTelemetry) {
      logTelemetry("function_call", {
        level: "error",
        functionName,
        error: errorMessage,
        errorCode,
        authenticated: !!user,
      });
    }
    
    if (throwOnError) {
      throw error;
    }
    
    return { 
      error: errorMessage,
      code: errorCode,
    };
  }
}

/**
 * Check if Cloud Functions are available
 */
export function isFunctionsAvailable() {
  return !!FUNCTIONS_URL || !!import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
}

/**
 * Get the functions base URL
 */
export function getFunctionsURL() {
  return FUNCTIONS_URL || import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || null;
}

