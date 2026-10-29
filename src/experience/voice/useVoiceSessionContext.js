import { useContext } from "react";
import { VoiceSessionContext } from "./VoiceSessionContext.js";

export function useVoiceSessionContext() {
  return useContext(VoiceSessionContext);
}
