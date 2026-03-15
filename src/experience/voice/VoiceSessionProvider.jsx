// src/experience/voice/VoiceSessionProvider.jsx
// Phase 56: context provider for voice session. Mount once in ExperienceShell (gated).

import React, {createContext, useContext, useMemo} from "react";
import {useVoiceSession} from "./useVoiceSession.js";

const VoiceSessionContext = createContext(null);

export function useVoiceSessionContext() {
  const ctx = useContext(VoiceSessionContext);
  return ctx;
}

export function VoiceSessionProvider({children}) {
  const voice = useVoiceSession();
  const value = useMemo(() => voice, [voice.state, voice.error]);
  return (
    <VoiceSessionContext.Provider value={value}>
      {children}
    </VoiceSessionContext.Provider>
  );
}
