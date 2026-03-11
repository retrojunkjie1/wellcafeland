// src/components/interaction/DockWithVoice.jsx
// Phase 56: wires UnifiedInteractionDock mic to voice session + audio duck. Use inside AudioProvider + VoiceSessionProvider.

import React, {useCallback} from "react";
import {useNavigate} from "react-router-dom";
import UnifiedInteractionDock from "./UnifiedInteractionDock";
import {useVoiceSessionContext} from "@/experience/voice/VoiceSessionProvider";
import {useAudio} from "@/experience/audio/AudioProvider";

export default function DockWithVoice() {
  const navigate = useNavigate();
  const voice = useVoiceSessionContext();
  const audio = useAudio();

  const handleMic = useCallback(() => {
    if (!voice) return;
    const active = voice.state === "listening" || voice.state === "processing" || voice.state === "speaking";
    if (active) {
      voice.stop();
      audio?.duck?.(false);
      audio?.stopAll?.();
    } else {
      audio?.duck?.(true);
      try {
        audio?.play?.("cue_inhale");
      } catch (e) {}
      voice.start();
    }
  }, [voice, audio]);

  return (
    <UnifiedInteractionDock
      contextKey="shell"
      voiceState={voice?.state}
      onRetry={() => voice?.start?.()}
      onMicPress={handleMic}
      onToolsPress={() => navigate("/tools")}
      onSupportPress={() => navigate("/assistance")}
      showTools
      showSupport
      railMode
    />
  );
}
