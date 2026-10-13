import { useCallback, useEffect, useRef, useState } from "react";
import { speakText } from "@/services/multimodalClient";

function audioContextConstructor() {
  if (typeof window === "undefined") return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

/** One-cue player for WellnessCafe's protected natural-voice service. */
export function useNaturalVoice(voice = "marin") {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const requestRef = useRef(0);
  const audioRef = useRef({ context: null, source: null, buffer: null, url: null, startedAt: null });

  const releaseAudio = useCallback((closeContext = true) => {
    const audio = audioRef.current;
    try { audio.source?.stop?.(); } catch { /* Source may already have ended. */ }
    audio.source = null;
    if (audio.url) URL.revokeObjectURL(audio.url);
    audio.url = null;
    audio.buffer = null;
    audio.startedAt = null;
    if (closeContext) audio.context?.close?.().catch(() => {});
    if (closeContext) audio.context = null;
  }, []);

  const stop = useCallback(() => {
    requestRef.current += 1;
    releaseAudio();
    setError("");
    setPlaybackProgress(0);
    setStatus("idle");
  }, [releaseAudio]);

  const play = useCallback(async (text) => {
    if (!text?.trim()) return false;
    requestRef.current += 1;
    const requestId = requestRef.current;
    releaseAudio();
    setError("");
    setPlaybackProgress(0);

    const AudioContextType = audioContextConstructor();
    if (!AudioContextType) {
      setError("Audio playback is unavailable in this browser.");
      setStatus("unavailable");
      return false;
    }

    let context;
    try {
      // Start/resume the context directly from the user's tap for mobile Safari.
      context = new AudioContextType();
      audioRef.current.context = context;
      const unlock = context.createBufferSource();
      unlock.buffer = context.createBuffer(1, 1, 22050);
      unlock.connect(context.destination);
      unlock.start(0);
      void context.resume().catch(() => {});
      setStatus("preparing");

      const result = await speakText(text, { voice });
      if (requestId !== requestRef.current) {
        if (result.audioUrl) URL.revokeObjectURL(result.audioUrl);
        return false;
      }
      audioRef.current.url = result.audioUrl || null;
      if (!result.ok || !result.audioBlob) throw new Error(result.error || "The spoken guide is unavailable right now.");

      const buffer = await context.decodeAudioData(await result.audioBlob.arrayBuffer());
      if (audioRef.current.url) URL.revokeObjectURL(audioRef.current.url);
      audioRef.current.url = null;
      if (requestId !== requestRef.current) return false;
      audioRef.current.buffer = buffer;

      if (context.state === "suspended") await context.resume();
      if (requestId !== requestRef.current) return false;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => {
        if (requestId !== requestRef.current) return;
        audioRef.current.source = null;
        releaseAudio();
        setPlaybackProgress(1);
        setStatus("finished");
      };
      audioRef.current.source = source;
      audioRef.current.startedAt = context.currentTime;
      setStatus("playing");
      source.start(0);
      return true;
    } catch (playError) {
      if (requestId === requestRef.current) {
        releaseAudio();
        setError(playError?.message || "The spoken guide could not play. Check your connection and try again.");
        setStatus("unavailable");
      }
      return false;
    }
  }, [releaseAudio, voice]);

  useEffect(() => {
    if (status !== "playing") return undefined;
    const interval = window.setInterval(() => {
      const audio = audioRef.current;
      const duration = audio.buffer?.duration || 0;
      if (!audio.context || !duration || audio.startedAt == null) return;
      setPlaybackProgress(Math.max(0, Math.min(1, (audio.context.currentTime - audio.startedAt) / duration)));
    }, 100);
    return () => window.clearInterval(interval);
  }, [status]);

  const pause = useCallback(async () => {
    const context = audioRef.current.context;
    if (!context || status !== "playing") return;
    try {
      await context.suspend();
      setStatus("paused");
    } catch {
      setError("The voice could not pause. You can stop it and replay the cue.");
      setStatus("unavailable");
    }
  }, [status]);

  const resume = useCallback(async () => {
    const context = audioRef.current.context;
    if (!context || status !== "paused") return;
    try {
      await context.resume();
      setStatus("playing");
    } catch {
      setError("The voice could not resume. Replay the cue to try again.");
      setStatus("unavailable");
    }
  }, [status]);

  useEffect(() => () => {
    requestRef.current += 1;
    releaseAudio();
  }, [releaseAudio]);

  return { status, error, playbackProgress, play, pause, resume, stop };
}
