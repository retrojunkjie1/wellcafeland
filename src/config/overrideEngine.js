// src/config/overrideEngine.js
// Override engine - applies sovereign overrides safely

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { logTelemetry } from "@/telemetry/telemetry";
import { getAuth } from "firebase/auth";

let unsubscribeOverride = null;
let currentOverrideVersion = null;

const ALLOWED_CSS_VARS = [
  "--wc-accent",
  "--wc-radius",
  "--wc-blur",
  "--wc-cardGlow",
  "--wc-typeScale",
];

const ALLOWED_UI_KEYS = [
  "navHeight",
  "maxWidth",
  "density",
  "safeAreaPadding",
  "blur",
];

// Apply CSS variables to document root
function applyCssVars(cssVars) {
  if (!cssVars || typeof cssVars !== "object") return;
  
  const root = document.documentElement;
  Object.entries(cssVars).forEach(([key, value]) => {
    if (ALLOWED_CSS_VARS.includes(key) && typeof value === "string") {
      try {
        root.style.setProperty(key, value);
      } catch (err) {
        console.warn("[OverrideEngine] Failed to set CSS var:", key, err);
      }
    }
  });
}

// Apply UI layout patch (allowlisted keys only)
function applyUiPatch(uiPatch) {
  if (!uiPatch?.layout || typeof uiPatch.layout !== "object") return;
  
  // Apply to CSS custom properties or inline styles as needed
  // This is a minimal implementation - expand based on your layout system
  const root = document.documentElement;
  Object.entries(uiPatch.layout).forEach(([key, value]) => {
    if (ALLOWED_UI_KEYS.includes(key)) {
      const cssVar = `--wc-${key}`;
      try {
        root.style.setProperty(cssVar, typeof value === "number" ? `${value}px` : value);
      } catch (err) {
        console.warn("[OverrideEngine] Failed to apply UI patch:", key, err);
      }
    }
  });
}

// Apply kill switches (route gating)
function applyKillSwitches(killSwitches) {
  if (!killSwitches || typeof killSwitches !== "object") return;
  
  // Store kill switch state in sessionStorage for route guards
  try {
    sessionStorage.setItem("wc_killSwitches", JSON.stringify(killSwitches));
  } catch (err) {
    console.warn("[OverrideEngine] Failed to store kill switches:", err);
  }
}

// Initialize override subscription
export function initOverrideEngine() {
  if (unsubscribeOverride) return; // Already initialized

  // Phase 6: Guard admin-only reads - prevent permission spam
  const auth = getAuth();
  const user = auth?.currentUser;
  
  // Only attempt admin reads if user exists
  if (!user) {
    // Anonymous users should not attempt admin reads
    return;
  }
  
  // Check admin claim asynchronously (non-blocking)
  user.getIdTokenResult()
    .then((tokenResult) => {
      const isAdmin = tokenResult.claims?.admin === true;
      if (!isAdmin) {
        // Non-admin users should not attempt admin reads
        return;
      }
      
      // Only subscribe if admin
      try {
        const overrideRef = doc(db, "overrides", "current");
        
        unsubscribeOverride = onSnapshot(
          overrideRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              // No override, clear any applied overrides
              clearOverrides();
              return;
            }

            const override = snapshot.data();
            
            // Check guardrails
            if (!override.enabled) {
              clearOverrides();
              return;
            }

            // Apply overrides
            if (override.cssVars) {
              applyCssVars(override.cssVars);
            }
            if (override.uiPatch) {
              applyUiPatch(override.uiPatch);
            }
            if (override.killSwitches) {
              applyKillSwitches(override.killSwitches);
            }

            // Log override application
            if (currentOverrideVersion !== override.version) {
              currentOverrideVersion = override.version;
              logTelemetry("override_applied", {
                level: "info",
                version: override.version,
              });
            }
          },
          (err) => {
            // Phase 6: Only log if it's not a permission error (reduce spam)
            if (err.code !== "permission-denied") {
              console.warn("[OverrideEngine] Failed to subscribe to overrides:", err);
            }
            // Silently ignore permission errors for non-admin users
          }
        );
      } catch (err) {
        console.warn("[OverrideEngine] Failed to initialize:", err);
      }
    })
    .catch(() => {
      // If token check fails, don't subscribe - silently fail
    });
}

// Clear all overrides
function clearOverrides() {
  const root = document.documentElement;
  ALLOWED_CSS_VARS.forEach((key) => {
    root.style.removeProperty(key);
  });
  ALLOWED_UI_KEYS.forEach((key) => {
    root.style.removeProperty(`--wc-${key}`);
  });
  try {
    sessionStorage.removeItem("wc_killSwitches");
  } catch {
    // Ignore
  }
}

// Check if a route is killed
export function isRouteKilled(routePath) {
  try {
    const killSwitches = JSON.parse(sessionStorage.getItem("wc_killSwitches") || "{}");
    if (routePath.startsWith("/tools") && killSwitches.tools) return true;
    if (routePath.startsWith("/chat") && killSwitches.chat) return true;
    if (routePath.startsWith("/workspace") && killSwitches.workspace) return true;
    return false;
  } catch {
    return false;
  }
}
