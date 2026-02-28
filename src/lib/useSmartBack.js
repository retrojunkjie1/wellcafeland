// src/lib/useSmartBack.js
// Phase 52: Simple back navigation — history.back or navigate("/")

import { useNavigate } from "react-router-dom";

export const useSmartBack = () => {
  const navigate = useNavigate();
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;

  const goBack = () => {
    if (canGoBack) {
      window.history.back();
    } else {
      navigate("/");
    }
  };

  return { goBack, canGoBack };
};
