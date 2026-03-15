// src/utils/connectivity.js
// Network connectivity detection and event handling

/**
 * Check if browser reports online status
 */
export function isOnline() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine !== false;
}

/**
 * Get network status details (when available)
 */
export function getNetworkStatus() {
  if (typeof navigator === "undefined") {
    return { online: true, effectiveType: null, rtt: null, downlink: null };
  }
  
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  return {
    online: navigator.onLine !== false,
    effectiveType: connection?.effectiveType || null,
    rtt: connection?.rtt || null,
    downlink: connection?.downlink || null,
  };
}

/**
 * Subscribe to online events
 */
export function onOnline(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  return () => window.removeEventListener("online", callback);
}

/**
 * Subscribe to offline events
 */
export function onOffline(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("offline", callback);
  return () => window.removeEventListener("offline", callback);
}

