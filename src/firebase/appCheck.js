// src/firebase/appCheck.js
// App Check initializes in production, or locally when a developer opts into a registered debug token.

import { getToken, initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

let appCheckInstance = null;

export function initAppCheck(app) {
  const isLocalhost = typeof window !== "undefined" && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("10.")
  );

  const isProduction = import.meta.env.PROD === true && import.meta.env.MODE === "production";
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.VITE_RECAPTCHA_KEY;

  const debugTokenSetting = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
  const localDebugEnabled = isLocalhost && !!debugTokenSetting;

  // Local traffic stays on emulators by default. A developer can opt into
  // requests to deployed Functions with a Firebase-registered debug token.
  if (localDebugEnabled && typeof window !== "undefined") {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = debugTokenSetting === "true" ? true : debugTokenSetting;
  }

  if ((isProduction && !isLocalhost || localDebugEnabled) && siteKey) {
    try {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      if (import.meta.env.DEV) {
        console.log(localDebugEnabled ? "[AppCheck] Local debug verification enabled" : "[AppCheck] Initialized for production");
      }
    } catch (appCheckError) {
      console.warn("[AppCheck] Initialization failed (non-blocking):", appCheckError.message);
    }
  } else {
    if (import.meta.env.DEV) {
      console.log(localDebugEnabled && !siteKey
        ? "[AppCheck] Local debug was requested but the reCAPTCHA site key is missing"
        : "[AppCheck] Skipped - dev/localhost environment or missing site key");
    }
  }
}

export async function getAppCheckToken() {
  if (!appCheckInstance) return null;
  const result = await getToken(appCheckInstance, false);
  return result?.token || null;
}
