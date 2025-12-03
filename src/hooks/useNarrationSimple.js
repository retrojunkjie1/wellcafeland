// src/hooks/useNarrationSimple.js
// Simple narration hook
// Phase 39: Intelligent Audio Narration Engine

import { useCallback, useEffect, useState } from "react";
import { isNarrationSupported, speakText, stopNarration } from "@/engines/audio/narrationEngine";

export function useNarrationSimple() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const start = useCallback((text, options) => {
    if (!text) return;
    speakText(text, options);
    setIsSpeaking(true);
  }, []);

  const stop = useCallback(() => {
    stopNarration();
    setIsSpeaking(false);
  }, []);

  // Stop narration when component unmounts
  useEffect(() => () => stop(), [stop]);

  return {
    isSupported: isNarrationSupported(),
    isSpeaking,
    start,
    stop,
  };
}

