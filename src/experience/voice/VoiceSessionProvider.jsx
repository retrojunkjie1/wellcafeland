// src/experience/voice/VoiceSessionProvider.jsx
// Phase 56: context provider for voice session. Mount once in ExperienceShell (gated).

import React from "react";
import {useVoiceSession} from "./useVoiceSession.js";
import { VoiceSessionContext } from "./VoiceSessionContext.js";

export function VoiceSessionProvider({children}) {
  const voice = useVoiceSession();
  return (
    <VoiceSessionContext.Provider value={voice}>
      {children}
    </VoiceSessionContext.Provider>
  );
}
