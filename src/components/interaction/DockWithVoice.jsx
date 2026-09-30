// src/components/interaction/DockWithVoice.jsx
// Phase 56: wires UnifiedInteractionDock mic to voice session + audio duck. Use inside AudioProvider + VoiceSessionProvider.

import React, {useCallback} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import UnifiedInteractionDock from "./UnifiedInteractionDock";

export default function DockWithVoice() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMic = useCallback(() => {
    if (location.pathname.startsWith("/chat")) {
      window.dispatchEvent(new CustomEvent("wc:open-voice-composer"));
      return;
    }
    navigate("/chat?voice=1");
  }, [location.pathname, navigate]);

  return (
    <UnifiedInteractionDock
      contextKey="shell"
      voiceState="idle"
      onMicPress={handleMic}
      onToolsPress={() => navigate("/tools")}
      onSupportPress={() => navigate("/assistance")}
      showTools
      showSupport
      railMode
    />
  );
}
