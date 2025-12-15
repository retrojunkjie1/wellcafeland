// src/navigation/linkState.js
// Phase A1: Helper to automatically pass "from" state in links

/**
 * Returns state object with "from" field set to current location
 * Use this when creating Link components to enable smart back navigation
 */
export function withFrom(location) {
  return {
    state: {
      from: location.pathname,
    },
  };
}

