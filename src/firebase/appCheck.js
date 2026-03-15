// src/firebase/appCheck.js
// App Check initialization - safe, production-only

import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

export function initAppCheck(app) {
  const isLocalhost = typeof window !== "undefined" && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("10.")
  );

  const isProduction = import.meta.env.PROD === true && import.meta.env.MODE === "production";
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.VITE_RECAPTCHA_KEY;

  // Only initialize in production, not localhost
  if (isProduction && !isLocalhost && siteKey) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      if (import.meta.env.DEV) {
        console.log("[AppCheck] Initialized for production");
      }
    } catch (appCheckError) {
      console.warn("[AppCheck] Initialization failed (non-blocking):", appCheckError.message);
    }
  } else {
    if (import.meta.env.DEV) {
      console.log("[AppCheck] Skipped - dev/localhost environment or missing site key");
    }
  }
}

