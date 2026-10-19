// src/firebase/appCheck.js
// App Check initializes on hosted origins when configured, or locally when a
// developer opts into a registered debug token.

import { getToken, initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

let appCheckInstance = null;

export function initAppCheck(app) {
  const isLocalhost = typeof window !== "undefined" && (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("10.")
  );

  const isHostedOrigin = typeof window !== "undefined" && !isLocalhost;
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.VITE_RECAPTCHA_KEY;

  const debugTokenSetting = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
  const localDebugEnabled = isLocalhost && !!debugTokenSetting;

  // Local traffic stays on emulators by default. A developer can opt into
  // requests to deployed Functions with a Firebase-registered debug token.
  if (localDebugEnabled && typeof window !== "undefined") {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = debugTokenSetting === "true" ? true : debugTokenSetting;
  }

  if ((isHostedOrigin || localDebugEnabled) && siteKey) {
    try {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      if (import.meta.env.DEV) console.info(localDebugEnabled ? "[AppCheck] Local debug verification enabled" : "[AppCheck] Initialized for hosted site");
    } catch (appCheckError) {
      console.error("[AppCheck] Initialization failed; protected requests may be rejected:", appCheckError.message);
    }
  } else {
    if (isHostedOrigin && !siteKey) console.error("[AppCheck] Hosted App Check was not initialized because the reCAPTCHA site key is missing");
    else if (import.meta.env.DEV) console.info(localDebugEnabled && !siteKey
      ? "[AppCheck] Local debug was requested but the reCAPTCHA site key is missing"
      : "[AppCheck] Skipped on localhost without an App Check debug token");
  }
}

export async function getAppCheckToken() {
  if (!appCheckInstance) return null;
  const result = await getToken(appCheckInstance, false);
  return result?.token || null;
}
