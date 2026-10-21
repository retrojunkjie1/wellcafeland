import { useContext } from "react";
import { AudioContext } from "./AudioContext.js";

export function useAudio() {
  return useContext(AudioContext);
}
