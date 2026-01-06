import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { WcOsProvider } from "./core/WcOsProvider";
import { initTheme } from "@/theme/themeStore";
import { validateEnv, EnvErrorScreen } from "./config/envGuard.jsx";
import { initTelemetry } from "@/telemetry/telemetry";
import { auth, db } from "@/firebase";
import { initOverrideEngine } from "@/config/overrideEngine";

// Boot sequence: UI shell mounts FIRST, services initialize LAST
// Any failure after UI mounts must NOT crash the app

// Step 1: Initialize theme (must not throw)
try {
  initTheme();
} catch (err) {
  console.warn("[Startup] Theme initialization failed (non-blocking):", err);
}

// Step 2: Mount UI shell FIRST
const root = createRoot(document.getElementById("root"));

// Step 3: Render app shell (must always render)
root.render(
  <StrictMode>
    <ErrorBoundary showDetails={true}>
      <WcOsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </WcOsProvider>
    </ErrorBoundary>
  </StrictMode>
);

// Step 4: Initialize services AFTER UI is mounted (non-blocking)
// Services must not block or crash the app

// Validate environment (non-blocking in dev)
const envValidation = validateEnv();
if (envValidation.blocking && !envValidation.valid && import.meta.env.PROD) {
  console.error("[Startup] Environment validation failed in production");
}

// Log Firebase configuration (dev only)
if (import.meta.env.DEV) {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "wellnesscafelanding";
  const functionsURL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || "not configured";
  console.log("[Startup] Firebase Configuration:", {
    projectId,
    functionsURL,
    env: import.meta.env.MODE,
  });
}

// Check required env vars (non-blocking)
if (!import.meta.env.VITE_FIREBASE_FUNCTIONS_URL) {
  console.warn("[Startup] VITE_FIREBASE_FUNCTIONS_URL not set - Cloud Functions may not be available");
}

// Initialize telemetry (must not throw)
try {
  initTelemetry({ auth, db });
} catch (err) {
  console.warn("[Startup] Telemetry initialization failed (non-blocking):", err);
}

// Initialize override engine (must not throw)
try {
  initOverrideEngine();
} catch (err) {
  console.warn("[Startup] Override engine initialization failed (non-blocking):", err);
}

