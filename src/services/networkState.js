// src/services/networkState.js
// Network state detector for mobile connection handling

let fetchFailures = [];
const FAILURE_WINDOW = 30000; // 30 seconds
const DEGRADED_THRESHOLD = 3; // 3 failures in window = degraded
let networkState = navigator.onLine ? "online" : "offline";

// Track fetch failures
export function recordFetchFailure() {
  const now = Date.now();
  fetchFailures = fetchFailures.filter((t) => now - t < FAILURE_WINDOW);
  fetchFailures.push(now);
  
  // Update state
  if (!navigator.onLine) {
    networkState = "offline";
  } else if (fetchFailures.length >= DEGRADED_THRESHOLD) {
    networkState = "degraded";
  } else {
    networkState = "online";
  }
  
  return networkState;
}

// Record fetch success
export function recordFetchSuccess() {
  fetchFailures = [];
  networkState = navigator.onLine ? "online" : "offline";
  return networkState;
}

// Get current network state
export function getNetworkState() {
  if (!navigator.onLine) {
    networkState = "offline";
  } else if (fetchFailures.length >= DEGRADED_THRESHOLD) {
    networkState = "degraded";
  } else {
    networkState = "online";
  }
  return networkState;
}

// Listen for online/offline
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    fetchFailures = [];
    networkState = "online";
  });
  
  window.addEventListener("offline", () => {
    networkState = "offline";
  });
}

