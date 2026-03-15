// src/lib/useSmartBack.js
// Phase 2D: Consistent back behavior — history-aware navigation

import { useNavigate } from "react-router-dom";

/**
 * Returns a handler that navigates back when possible, else to fallback route.
 * @param {string} fallbackRoute - Route when history.length <= 1
 * @returns {() => void}
 */
export function useSmartBack(fallbackRoute = "/home") {
  const navigate = useNavigate();
  return () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackRoute);
    }
  };
}
