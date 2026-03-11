// src/experience/audio/AudioProvider.jsx
// Phase 56: context provider exposing audio engine + helpers.

import React, {createContext, useContext, useEffect, useMemo, useRef} from "react";
import {AudioEngine} from "./AudioEngine.js";
import {SPOKEN_GUIDANCE_REGISTRY} from "./spokenGuidance.js";

const AudioContext = createContext(null);

export function useAudio() {
  const ctx = useContext(AudioContext);
  return ctx;
}

const DEFAULT_CUES = [
  ["cue_inhale", "/audio/cue_inhale.mp3"],
  ["cue_hold", "/audio/cue_hold.mp3"],
  ["cue_exhale", "/audio/cue_exhale.mp3"],
  ["ambience_soft", "/audio/ambience_soft.mp3"],
];

export function AudioProvider({children}) {
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = new AudioEngine();
  const engine = engineRef.current;

  useEffect(() => {
    DEFAULT_CUES.forEach(([id, src]) => {
      engine.register(id, src, {loop: id === "ambience_soft", volume: id === "ambience_soft" ? 0.2 : 0.5});
    });
    SPOKEN_GUIDANCE_REGISTRY.forEach((g) => {
      engine.register(`guidance_${g.id}`, g.src, {volume: 0.7});
    });
  }, [engine]);

  const value = useMemo(
    () => ({
      engine,
      play: (id, opts) => engine.play(id, opts),
      stop: (id) => engine.stop(id),
      stopAll: () => engine.stopAll(),
      setMasterVolume: (v) => engine.setMasterVolume(v),
      duck: (on) => engine.duck(on),
      playAsset: (path, opts) => engine.playAsset(path, opts),
    }),
    [engine]
  );

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}
