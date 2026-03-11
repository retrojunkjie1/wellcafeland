// src/experience/audio/useSpokenGuidance.js
// Phase 56 Day 3: play short spoken guidance clips. Fail silently if asset missing.

import {useCallback, useRef, useState} from "react";
import {useAudio} from "./AudioProvider.jsx";

const GUIDANCE_PREFIX = "guidance_";

function toEngineId(id) {
  return id.startsWith(GUIDANCE_PREFIX) ? id : `${GUIDANCE_PREFIX}${id}`;
}

export function useSpokenGuidance() {
  const audio = useAudio();
  const [currentGuidanceId, setCurrentGuidanceId] = useState(null);
  const [isGuiding, setIsGuiding] = useState(false);
  const currentEngineIdRef = useRef(null);

  const playGuidance = useCallback(
    (id) => {
      if (!id) return;
      try {
        if (currentEngineIdRef.current) {
          audio?.stop?.(currentEngineIdRef.current);
        }
        if (audio?.duck) audio.duck(true);
        const engineId = toEngineId(id);
        audio?.play?.(engineId);
        currentEngineIdRef.current = engineId;
        setCurrentGuidanceId(id);
        setIsGuiding(true);
      } catch (e) {}
    },
    [audio]
  );

  const stopGuidance = useCallback(() => {
    try {
      if (currentEngineIdRef.current) {
        audio?.stop?.(currentEngineIdRef.current);
        currentEngineIdRef.current = null;
      }
      if (audio?.duck) audio.duck(false);
      setCurrentGuidanceId(null);
      setIsGuiding(false);
    } catch (e) {}
  }, [audio]);

  return {
    playGuidance,
    stopGuidance,
    isGuiding,
    currentGuidanceId,
  };
}
